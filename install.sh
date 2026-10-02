#!/usr/bin/env bash
# ==============================================================================
# PasarGuard Auto Clean IP - Automated Installer
# Installs and enables the Clean IP Auto-Pilot extension on PasarGuard server.
# Compatible with both piped curl (`curl ... | sudo bash`) and git clone.
# ==============================================================================
set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}======================================================${NC}"
echo -e "${GREEN}     🛡️  PasarGuard Auto Clean IP Installer          ${NC}"
echo -e "${BLUE}======================================================${NC}"

if [[ "$(id -u)" -ne 0 ]]; then
  echo -e "${RED}Error: This installer must be run as root (sudo).${NC}" >&2
  exit 1
fi

INSTALL_DIR="/opt/pasarguard-cleanip"
DATA_DIR="/var/lib/pasarguard/cleanip"
PYTHON_DIR="/var/lib/pasarguard/cleanip/python"
PASARGUARD_DIR="/opt/pasarguard"
ENV_FILE="${PASARGUARD_DIR}/.env"
RAW_BASE="https://raw.githubusercontent.com/RaMiNZer0/pasarguard-cleanip/main"

echo -e "\n${YELLOW}[1/5] Checking environment and preparing directories...${NC}"
mkdir -p "${INSTALL_DIR}/backend" "${INSTALL_DIR}/plugin" "${INSTALL_DIR}/systemd" "${DATA_DIR}" "${PYTHON_DIR}"

# Helper to download or copy file
fetch_file() {
  local rel_path="$1"
  local dest_path="$2"
  local local_source=""

  # Check if running from cloned repository
  if [[ -n "${BASH_SOURCE[0]:-}" && -f "$(dirname "${BASH_SOURCE[0]}")/${rel_path}" ]]; then
    local_source="$(dirname "${BASH_SOURCE[0]}")/${rel_path}"
    cp -f "${local_source}" "${dest_path}"
  else
    # Download from GitHub repository
    curl -fsSL "${RAW_BASE}/${rel_path}" -o "${dest_path}"
  fi
}

echo -e "${YELLOW}[2/5] Fetching and installing extension files...${NC}"
fetch_file "backend/cleanip_engine.py" "${INSTALL_DIR}/backend/cleanip_engine.py"
fetch_file "backend/cleanip_router.py" "${INSTALL_DIR}/backend/cleanip_router.py"
fetch_file "plugin/cleanip-panel.js" "${INSTALL_DIR}/plugin/cleanip-panel.js"
fetch_file "plugin/integrate-dashboard.sh" "${INSTALL_DIR}/plugin/integrate-dashboard.sh"
fetch_file "systemd/pasarguard-cleanip-watcher.service" "${INSTALL_DIR}/systemd/pasarguard-cleanip-watcher.service"
fetch_file "systemd/pasarguard-cleanip-watcher.path" "${INSTALL_DIR}/systemd/pasarguard-cleanip-watcher.path"

fetch_file "version.json" "${INSTALL_DIR}/version.json"
cp -f "${INSTALL_DIR}/version.json" "${DATA_DIR}/version.json" 2>/dev/null || true

chmod +x "${INSTALL_DIR}/plugin/integrate-dashboard.sh"

# Copy python modules directly to shared volume mounted in PasarGuard container
cp -f "${INSTALL_DIR}/backend/cleanip_engine.py" "${PYTHON_DIR}/cleanip_engine.py"
cp -f "${INSTALL_DIR}/backend/cleanip_router.py" "${PYTHON_DIR}/cleanip_router.py"
mkdir -p "${DATA_DIR}/plugin"
cp -f "${INSTALL_DIR}/plugin/cleanip-panel.js" "${DATA_DIR}/plugin/cleanip-panel.js"

# Default settings if not already existing
SETTINGS_FILE="${DATA_DIR}/settings.json"
if [[ ! -f "${SETTINGS_FILE}" ]]; then
  cat << 'EOF' > "${SETTINGS_FILE}"
{
  "target_host_ids": [],
  "enabled_isps": ["mci", "mtn", "wifi"],
  "limit_per_isp": 2,
  "auto_pilot": true,
  "auto_interval_hours": 3,
  "custom_ips": []
}
EOF
fi

echo -e "${YELLOW}[3/5] Configuring PasarGuard Backend (FastAPI)...${NC}"
# Setup sitecustomize.py hook for persistent Python bootstrapping inside container
cat << 'EOF' > "${PYTHON_DIR}/sitecustomize.py"
"""
PasarGuard Clean IP Bootstrapper
"""
import sys
import os
from pathlib import Path

# 1. Chain Zomorod or any other sitecustomize if present
try:
    zomorod_sc = "/var/lib/pasarguard/zomorod/python/sitecustomize.py"
    if os.path.exists(zomorod_sc) and os.path.abspath(zomorod_sc) != os.path.abspath(__file__):
        import importlib.util
        spec = importlib.util.spec_from_file_location("zomorod_sitecustomize", zomorod_sc)
        if spec and spec.loader:
            mod = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(mod)
except Exception:
    pass

# 2. Register Clean IP router
try:
    if os.path.basename(sys.argv[0] or "") == "main.py":
        cleanip_dir = "/var/lib/pasarguard/cleanip/python"
        if cleanip_dir not in sys.path:
            sys.path.insert(0, cleanip_dir)

        # Make sure PasarGuard app is importable
        candidates = [Path.cwd(), Path("/code"), Path("/app"), Path("/opt/pasarguard")]
        for cand in candidates:
            if (cand / "main.py").is_file() and (cand / "app").is_dir():
                cand_str = str(cand.resolve())
                if cand_str not in sys.path:
                    sys.path.insert(0, cand_str)
                break

        from cleanip_router import router as cleanip_router
        from app.routers import api_router

        if not any(getattr(r, "prefix", None) == "/api/cleanip" for r in api_router.routes):
            api_router.include_router(cleanip_router)
            sys.stderr.write("[CleanIP] Router successfully registered in PasarGuard API\n")
except Exception as e:
    sys.stderr.write(f"[CleanIP] Bootstrap notice: {e}\n")
EOF

# Ensure PYTHONPATH in /opt/pasarguard/.env includes cleanip python directory
if [[ -f "${ENV_FILE}" ]]; then
  python3 - "${ENV_FILE}" "${PYTHON_DIR}" << 'PY'
import sys, re
from pathlib import Path

env_file = Path(sys.argv[1])
python_dir = sys.argv[2]
content = env_file.read_text(encoding="utf-8")

pattern = re.compile(r'(?m)^\s*PYTHONPATH\s*=\s*["\']?(.*?)["\']?\s*$')
match = pattern.search(content)
if match:
    existing = match.group(1).strip()
    parts = [p for p in existing.split(":") if p and p != python_dir]
    parts.append(python_dir)
    new_val = ":".join(parts)
    content = pattern.sub(f'PYTHONPATH="{new_val}"', content, count=1)
else:
    content = content.rstrip() + f'\nPYTHONPATH="{python_dir}"\n'

env_file.write_text(content, encoding="utf-8")
print("[CleanIP] Updated PYTHONPATH in /opt/pasarguard/.env")
PY
fi

echo -e "${YELLOW}[4/5] Applying configuration and restarting panel...${NC}"
if [[ -f "${PASARGUARD_DIR}/docker-compose.yml" ]] && command -v docker >/dev/null 2>&1; then
  echo -e "Restarting PasarGuard container via Docker..."
  docker compose -f "${PASARGUARD_DIR}/docker-compose.yml" restart pasarguard 2>/dev/null || \
  docker restart pasarguard-pasarguard-1 2>/dev/null || true
elif command -v pasarguard >/dev/null 2>&1; then
  echo -e "Restarting PasarGuard via CLI..."
  timeout 10 pasarguard restart >/dev/null 2>&1 || true
fi

echo -e "${YELLOW}[5/5] Injecting web UI into PasarGuard Dashboard...${NC}"
# Wait a moment for container to finish startup before patching
sleep 3
export PASARGUARD_ROOT="${PASARGUARD_DIR}"
export CLEANIP_ROOT="${INSTALL_DIR}"
bash "${INSTALL_DIR}/plugin/integrate-dashboard.sh" || true

# Setup systemd path watcher for container rebuilds
if command -v systemctl >/dev/null 2>&1; then
  cp -f "${INSTALL_DIR}/systemd/pasarguard-cleanip-watcher.service" /etc/systemd/system/
  cp -f "${INSTALL_DIR}/systemd/pasarguard-cleanip-watcher.path" /etc/systemd/system/
  systemctl daemon-reload
  systemctl enable --now pasarguard-cleanip-watcher.path 2>/dev/null || true
fi

# Setup automated cron job for background scanning every 3 hours
CRON_CMD="0 */3 * * * curl -s -X POST http://127.0.0.1:8000/api/cleanip/scan-and-apply >/dev/null 2>&1"
(crontab -l 2>/dev/null | grep -v "cleanip/scan-and-apply" ; echo "${CRON_CMD}") | crontab - || true

echo -e "\n${GREEN}======================================================${NC}"
echo -e "${GREEN}  ✅ PasarGuard Auto Clean IP successfully installed! ${NC}"
echo -e "${GREEN}======================================================${NC}"
echo -e "1. Open your PasarGuard Web Dashboard."
echo -e "2. Look for the '${GREEN}🛡️ Clean IP Auto-Pilot${NC}' button in the navigation."
echo -e "3. Select your Cloudflare/CDN Host and click '${GREEN}Scan & Apply Now${NC}'."
echo -e "======================================================\n"
