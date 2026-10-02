"""
Clean IP FastAPI Router for PasarGuard.
Safely integrates with PasarGuard host management without modifying database schemas.
"""
from __future__ import annotations

import json
import logging
import os
from pathlib import Path
from typing import Any, Dict, List, Optional
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

try:
    from .cleanip_engine import scan_and_rank_ips, check_ip_latency
except (ImportError, ValueError):
    from cleanip_engine import scan_and_rank_ips, check_ip_latency

logger = logging.getLogger("cleanip-router")

router = APIRouter(prefix="/api/cleanip", tags=["CleanIP"])

DATA_DIR = Path(os.getenv("CLEANIP_DATA_DIR", "/var/lib/pasarguard/cleanip"))
SETTINGS_FILE = DATA_DIR / "settings.json"
HISTORY_FILE = DATA_DIR / "history.json"

# Check if running inside PasarGuard environment
try:
    from app.db import AsyncSession, get_db
    from app.routers.authentication import require_permission, get_current
    from app.models.admin import AdminDetails
    from app.operation import OperatorType
    from app.operation.host import HostOperation
    from app.models.host import BaseHost, CreateHost
    PASARGUARD_NATIVE = True
    host_operator = HostOperation(operator_type=OperatorType.API)
except ImportError:
    # Standalone mode / testing fallback
    PASARGUARD_NATIVE = False
    logger.info("PasarGuard native modules not detected, running in standalone/test mode.")

    async def get_db():
        yield None

    def require_permission(resource: str, action: str):
        def _dummy_perm():
            return {"username": "admin", "is_sudo": True}
        return _dummy_perm


class CleanIPSettings(BaseModel):
    target_host_ids: List[int] = Field(default_factory=list, description="List of target Host IDs to update in PasarGuard")
    enabled_isps: List[str] = Field(default=["mci", "mtn", "wifi"], description="Enabled ISPs")
    limit_per_isp: int = Field(default=2, ge=1, le=5)
    auto_pilot: bool = Field(default=True, description="Enable automated updates")
    auto_interval_hours: int = Field(default=3, ge=1, le=48)
    custom_ips: List[str] = Field(default_factory=list, description="Custom IP list to prioritize")


def _load_json(file_path: Path, default_factory=dict) -> Any:
    if file_path.is_file():
        try:
            return json.loads(file_path.read_text(encoding="utf-8"))
        except Exception as e:
            logger.warning(f"Error reading {file_path}: {e}")
    return default_factory()


def _save_json(file_path: Path, data: Any) -> None:
    file_path.parent.mkdir(parents=True, exist_ok=True)
    temp_file = file_path.with_suffix(".tmp")
    temp_file.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
    temp_file.replace(file_path)


def get_current_settings() -> CleanIPSettings:
    raw = _load_json(SETTINGS_FILE, CleanIPSettings().model_dump)
    return CleanIPSettings.model_validate(raw)


CURRENT_VERSION = "1.3.0"
RAW_BASE_URL = "https://raw.githubusercontent.com/RaMiNZer0/pasarguard-cleanip/main"


def _fetch_remote_text(url: str, timeout: int = 10) -> str:
    import urllib.request
    import ssl
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    req = urllib.request.Request(
        url,
        headers={"User-Agent": "PasarGuard-CleanIP/AutoUpdater", "Cache-Control": "no-cache"}
    )
    with urllib.request.urlopen(req, context=ctx, timeout=timeout) as resp:
        return resp.read().decode("utf-8")


@router.get("/status")
async def get_status(_=Depends(require_permission("hosts", "read"))):
    """Returns current extension status, active settings, and last update info."""
    settings = get_current_settings()
    history = _load_json(HISTORY_FILE, list)
    latest_event = history[-1] if history else None
    return {
        "status": "active",
        "version": CURRENT_VERSION,
        "settings": settings.model_dump(),
        "latest_update": latest_event,
        "is_native": PASARGUARD_NATIVE,
    }


@router.get("/check-update")
async def check_update(_=Depends(require_permission("hosts", "read"))):
    """Checks GitHub for new Clean IP releases and changelog."""
    import time
    try:
        url = f"{RAW_BASE_URL}/version.json?t={int(time.time())}"
        data_text = _fetch_remote_text(url, timeout=6)
        info = json.loads(data_text)
        remote_version = info.get("version", CURRENT_VERSION)
        has_update = remote_version.strip() != CURRENT_VERSION.strip()
        return {
            "has_update": has_update,
            "current_version": CURRENT_VERSION,
            "latest_version": remote_version,
            "changelog": info.get("changelog", "بهینه‌سازی و بهبود کارایی"),
        }
    except Exception as e:
        logger.warning(f"Failed to check updates from GitHub: {e}")
        return {
            "has_update": False,
            "current_version": CURRENT_VERSION,
            "latest_version": CURRENT_VERSION,
            "changelog": "",
            "error": str(e),
        }


@router.post("/self-update")
async def self_update(
    _=Depends(require_permission("hosts", "update"))
):
    """Downloads latest release files and applies in-place update without SSH."""
    import time, re
    timestamp = int(time.time())
    updated_files = []

    try:
        # 1. Fetch version info
        ver_text = _fetch_remote_text(f"{RAW_BASE_URL}/version.json?t={timestamp}", timeout=8)
        remote_info = json.loads(ver_text)
        new_version = remote_info.get("version", "latest")

        # 2. Download and update Python backend in shared volume
        python_dir = DATA_DIR / "python"
        python_dir.mkdir(parents=True, exist_ok=True)

        for mod_name in ["cleanip_router.py", "cleanip_engine.py"]:
            code = _fetch_remote_text(f"{RAW_BASE_URL}/backend/{mod_name}?t={timestamp}")
            (python_dir / mod_name).write_text(code, encoding="utf-8")
            updated_files.append(mod_name)

        # 3. Download and update Frontend plugin
        plugin_code = _fetch_remote_text(f"{RAW_BASE_URL}/plugin/cleanip-panel.js?t={timestamp}")
        
        # Save to shared volume plugin dir
        (DATA_DIR / "plugin").mkdir(parents=True, exist_ok=True)
        (DATA_DIR / "plugin" / "cleanip-panel.js").write_text(plugin_code, encoding="utf-8")

        # Copy directly to container web statics if running inside container
        container_statics = Path("/code/dashboard/build/statics/cleanip-panel.js")
        if container_statics.parent.exists():
            container_statics.write_text(plugin_code, encoding="utf-8")
            updated_files.append("cleanip-panel.js (container)")

        # Update index.html cache-buster
        container_index = Path("/code/dashboard/build/index.html")
        if container_index.exists():
            html_content = container_index.read_text(encoding="utf-8")
            marker = "pg-cleanip-loader"
            tag = f'<script id="{marker}" src="/statics/cleanip-panel.js?v={timestamp}" defer></script>'
            pattern = re.compile(rf'<script\b[^>]*\bid=["\']{re.escape(marker)}["\'][^>]*>.*?</script>', re.I | re.S)
            if pattern.search(html_content):
                html_content = pattern.sub(tag, html_content, count=1)
            elif '</body>' in html_content:
                html_content = html_content.replace('</body>', f'  {tag}\n</body>', 1)
            container_index.write_text(html_content, encoding="utf-8")

        return {
            "success": True,
            "message": f"افزونه Clean IP با موفقیت به نسخه {new_version} بروزرسانی شد.",
            "version": new_version,
            "updated_files": updated_files,
        }
    except Exception as exc:
        logger.error(f"Self-update failed: {exc}")
        raise HTTPException(
            status_code=500,
            detail=f"خطا در دریافت و اعمال آپدیت: {str(exc)}"
        )


def _resolve_port(port: Optional[int], inbound_tag: Optional[str]) -> Optional[int]:
    if port:
        return port
    if inbound_tag:
        import re
        match = re.search(r'\b(20[589][0-9]|8443|8080|443|80|8880|\d{2,5})\b', inbound_tag)
        if match:
            try:
                return int(match.group(1))
            except ValueError:
                pass
    return None


@router.get("/hosts")
async def get_hosts_list(db=Depends(get_db), _=Depends(require_permission("hosts", "read"))):
    """Returns all available hosts in PasarGuard for UI selection."""
    if not PASARGUARD_NATIVE:
        # Mock hosts for testing and standalone dev
        return [
            {"id": 1, "remark": "Direct VLESS", "address": ["example.com"], "port": 443},
            {"id": 2, "remark": "Cloudflare CDN VLESS", "address": ["104.16.24.11"], "port": 2053},
        ]

    from app.models.host import HostListQuery
    query = HostListQuery()
    hosts = await host_operator.get_hosts(db=db, query=query)
    return [
        {
            "id": h.id,
            "remark": h.remark,
            "address": list(h.address) if isinstance(h.address, (set, list)) else [str(h.address)],
            "port": _resolve_port(h.port, h.inbound_tag),
            "inbound_tag": h.inbound_tag,
        }
        for h in hosts
    ]


@router.post("/settings")
async def update_settings(payload: CleanIPSettings, _=Depends(require_permission("hosts", "update"))):
    """Saves Clean IP settings without touching PasarGuard DB."""
    _save_json(SETTINGS_FILE, payload.model_dump())
    return {"success": True, "message": "Settings saved successfully", "settings": payload.model_dump()}


@router.post("/scan-and-apply")
async def scan_and_apply(
    payload: Optional[CleanIPSettings] = None,
    db=Depends(get_db),
    admin=Depends(require_permission("hosts", "update")),
):
    """
    Executes live scan across requested ISPs, extracts top healthy IPs,
    and updates all selected target hosts in PasarGuard via the official Host API.
    """
    if payload and payload.target_host_ids:
        _save_json(SETTINGS_FILE, payload.model_dump())
        settings = payload
    else:
        settings = get_current_settings()

    if not settings.target_host_ids:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="هیچ هاست هدفی انتخاب نشده است (No target hosts selected). لطفاً ابتدا حداقل یک هاست را تیک بزنید.",
        )

    # 1. Scan and rank clean IPs
    ranked = await scan_and_rank_ips(
        isps=settings.enabled_isps,
        limit_per_isp=settings.limit_per_isp,
    )

    all_clean_ips = []
    for isp_items in ranked.values():
        for item in isp_items:
            if item["ip"] not in all_clean_ips:
                all_clean_ips.append(item["ip"])

    # 2. Update each target host in PasarGuard safely
    updated_hosts = []
    for host_id in settings.target_host_ids:
        host_remark = f"Host #{host_id}"
        if PASARGUARD_NATIVE:
            try:
                current_host = await host_operator.get_validated_host(db=db, host_id=host_id)
                host_remark = getattr(current_host, "remark", f"Host #{host_id}")

                host_model = BaseHost.model_validate(current_host)
                host_dict = host_model.model_dump()
                host_dict["address"] = set(all_clean_ips)

                modified_host = CreateHost(**host_dict)
                await host_operator.modify_host(
                    db=db,
                    host_id=host_id,
                    modified_host=modified_host,
                    admin=admin,
                )
                updated_hosts.append(host_remark)
            except Exception as exc:
                logger.error(f"Failed to update host #{host_id} in PasarGuard: {exc}")
        else:
            logger.info(f"[Standalone] Mock update host #{host_id} with IPs: {all_clean_ips}")
            updated_hosts.append(host_remark)

    # 3. Log history
    event = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "target_host_ids": settings.target_host_ids,
        "updated_hosts": updated_hosts,
        "applied_ips": all_clean_ips,
        "details": ranked,
    }
    history = _load_json(HISTORY_FILE, list)
    history.append(event)
    _save_json(HISTORY_FILE, history[-50:])

    return {
        "success": True,
        "message": f"Successfully updated {len(updated_hosts)} host(s) with {len(all_clean_ips)} clean IPs",
        "updated_hosts": updated_hosts,
        "applied_ips": all_clean_ips,
        "isp_results": ranked,
    }


@router.post("/test-single")
async def test_single_ip(ip: str, port: int = 443, _=Depends(require_permission("hosts", "read"))):
    """Tests a single IP latency in real-time."""
    lat = await check_ip_latency(ip, port=port)
    return {
        "ip": ip,
        "port": port,
        "latency_ms": lat,
        "reachable": lat > 0,
    }
