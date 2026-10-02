"""
Clean IP Engine for Cloudflare and CDN Proxies in Iran.
Handles multi-feed fetching, latency verification, custom IPs, and filtering per ISP.
"""
from __future__ import annotations

import asyncio
import json
import logging
import re
import ssl
import time
import urllib.request
import urllib.error
from typing import Dict, List, Optional, Any

logger = logging.getLogger("cleanip-engine")

# Fallback verified clean IPs for each ISP (MCI, Irancell, Mokhaberat/Wifi)
FALLBACK_IPS: Dict[str, List[str]] = {
    "mci": [
        "104.16.24.11",
        "104.16.25.11",
        "172.67.112.5",
        "104.17.150.10",
        "104.18.2.161",
        "172.64.155.20",
    ],
    "mtn": [
        "172.64.155.20",
        "104.18.2.161",
        "104.17.150.10",
        "104.16.132.22",
        "172.67.74.88",
        "104.19.143.10",
    ],
    "wifi": [
        "104.19.143.10",
        "104.16.132.22",
        "172.67.74.88",
        "104.16.24.11",
        "104.18.45.67",
        "162.159.192.1",
    ],
}

COMMUNITY_FEED_URL = "https://raw.githubusercontent.com/vfarid/cf-clean-ips/main/list.json"
IPV4_REGEX = re.compile(r"^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$")


async def check_ip_latency(
    ip: str,
    port: int = 443,
    timeout: float = 2.0,
    sni: Optional[str] = "cloudflare.com"
) -> float:
    """
    Measures the TCP connection + TLS handshake latency in milliseconds.
    Returns:
        Latency in milliseconds (float > 0) if successful, or -1.0 if connection failed / timed out.
    """
    start_time = time.time()
    try:
        ssl_ctx = ssl.create_default_context()
        ssl_ctx.check_hostname = False
        ssl_ctx.verify_mode = ssl.CERT_NONE

        reader, writer = await asyncio.wait_for(
            asyncio.open_connection(ip, port, ssl=ssl_ctx, server_hostname=sni),
            timeout=timeout,
        )
        try:
            writer.close()
            await writer.wait_closed()
        except Exception:
            pass
        latency_ms = round((time.time() - start_time) * 1000, 1)
        return latency_ms
    except Exception as exc:
        logger.debug(f"Testing {ip}:{port} failed: {exc}")
        return -1.0


# Backward compatibility alias
test_ip_latency = check_ip_latency


def fetch_community_ips(timeout: float = 3.5) -> Dict[str, List[Dict[str, Any]]]:
    """
    Fetches the latest community-verified clean IPs.
    Supports both structured operator items (vfarid/ircf.space) and flat key lists.
    Falls back to hardcoded FALLBACK_IPS if offline or request fails.
    """
    result: Dict[str, List[Dict[str, Any]]] = {
        "mci": [],
        "mtn": [],
        "wifi": []
    }

    try:
        req = urllib.request.Request(
            COMMUNITY_FEED_URL,
            headers={"User-Agent": "PasarGuard-CleanIP/1.5", "Accept": "application/json"},
        )
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            data = json.loads(resp.read().decode("utf-8"))

            # 1. Parse vfarid/ircf format with ipv4 list
            if isinstance(data, dict) and "ipv4" in data and isinstance(data["ipv4"], list):
                for item in data["ipv4"]:
                    ip = item.get("ip")
                    if not ip or not IPV4_REGEX.match(ip):
                        continue
                    
                    op = (item.get("operator") or "").upper()
                    provider = item.get("provider") or "community"

                    record = {"ip": ip, "provider": provider, "source": "IRCF/vfarid"}

                    if op == "MCI":
                        result["mci"].append(record)
                    elif op == "MTN":
                        result["mtn"].append(record)
                    elif op in ("MKH", "AST", "SHT", "PRS", "HWB", "MBT", "RTL", "ZTL", "WIFI"):
                        result["wifi"].append(record)

            # 2. Parse flat dictionary format (fallback format)
            elif isinstance(data, dict):
                for isp in ["mci", "mtn", "wifi"]:
                    for ip in data.get(isp, []):
                        if isinstance(ip, str) and IPV4_REGEX.match(ip):
                            result[isp].append({"ip": ip, "provider": "feed", "source": "community"})

    except Exception as e:
        logger.warning(f"Failed to fetch community clean IP feed, falling back: {e}")

    # Ensure fallbacks if any ISP list is empty
    for isp, fallback_list in FALLBACK_IPS.items():
        if not result[isp]:
            for ip in fallback_list:
                result[isp].append({"ip": ip, "provider": "fallback", "source": "system"})

    return result


async def scan_and_rank_ips(
    isps: Optional[List[str]] = None,
    limit_per_isp: int = 2,
    max_concurrency: int = 10,
    timeout_per_ip: float = 1.8,
    custom_ips: Optional[List[str]] = None,
) -> Dict[str, List[dict]]:
    """
    Tests and ranks clean IPs for requested ISPs.
    Custom IPs supplied by the user are given top priority if verified.
    Returns:
        Dict mapping ISP code -> list of {"ip": str, "latency_ms": float, "source": str, "quality": str}
    """
    if not isps:
        isps = ["mci", "mtn", "wifi"]

    raw_candidates = fetch_community_ips()
    semaphore = asyncio.Semaphore(max_concurrency)

    async def _test_with_limit(candidate: dict) -> dict:
        target_ip = candidate["ip"]
        async with semaphore:
            lat = await test_ip_latency(target_ip, timeout=timeout_per_ip)
            return {
                "ip": target_ip,
                "latency_ms": lat,
                "provider": candidate.get("provider", "community"),
                "source": candidate.get("source", "verified"),
                "quality": candidate.get("quality", "gold")
            }

    # Clean and validate custom user IPs if provided
    valid_custom_ips: List[str] = []
    if custom_ips:
        for ip in custom_ips:
            cleaned = str(ip).strip()
            if IPV4_REGEX.match(cleaned) and cleaned not in valid_custom_ips:
                valid_custom_ips.append(cleaned)

    # Test custom IPs first if available
    tested_custom_results: List[dict] = []
    if valid_custom_ips:
        custom_candidates = [{"ip": ip, "provider": "user", "source": "custom", "quality": "custom"} for ip in valid_custom_ips]
        custom_tasks = [_test_with_limit(c) for c in custom_candidates]
        custom_test_results = await asyncio.gather(*custom_tasks)
        tested_custom_results = [r for r in custom_test_results if r["latency_ms"] > 0]
        tested_custom_results.sort(key=lambda x: x["latency_ms"])

    ranked_results: Dict[str, List[dict]] = {}

    for isp in isps:
        isp_candidates = raw_candidates.get(isp, [])
        # Deduplicate candidates while preserving order
        seen_ips = set()
        deduped_candidates = []
        for c in isp_candidates:
            if c["ip"] not in seen_ips:
                seen_ips.add(c["ip"])
                deduped_candidates.append(c)

        # Cap candidates to test to prevent slow scans
        test_pool = deduped_candidates[:12]
        tasks = [_test_with_limit(c) for c in test_pool]
        test_results = await asyncio.gather(*tasks)

        # Filter out unreachable IPs (latency == -1.0)
        healthy = [r for r in test_results if r["latency_ms"] > 0]
        healthy.sort(key=lambda x: x["latency_ms"])

        # Prepend tested custom IPs to the top of the pool
        combined_pool = tested_custom_results + healthy

        if combined_pool:
            ranked_results[isp] = combined_pool[:limit_per_isp]
        else:
            # Fallback to the first available if all simulated tests fail
            first_ip = isp_candidates[0]["ip"] if isp_candidates else "104.16.24.11"
            ranked_results[isp] = [{"ip": first_ip, "latency_ms": 120.0, "source": "fallback", "quality": "standard"}]

    return ranked_results


def get_candidate_probe_list(limit: int = 15) -> List[Dict[str, Any]]:
    """
    Returns candidate clean IPs categorized by operator for browser-side testing.
    """
    feed_data = fetch_community_ips()
    candidates = []
    seen = set()

    for isp, items in feed_data.items():
        for item in items:
            ip = item["ip"]
            if ip not in seen:
                seen.add(ip)
                candidates.append({
                    "ip": ip,
                    "isp": isp,
                    "provider": item.get("provider", "IRCF"),
                    "source": item.get("source", "community"),
                    "quality": "gold" if item.get("provider") in ("ircf.space", "vfarid") else "standard"
                })
            if len(candidates) >= limit:
                break
        if len(candidates) >= limit:
            break

    return candidates
