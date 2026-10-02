#!/usr/bin/env bash
# ==============================================================================
# PasarGuard Auto Clean IP - Automated Installer
# Installs and enables the Clean IP Auto-Pilot extension on PasarGuard server.
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
PASARGUARD_DIR="/opt/pasarguard"

echo -e "\n${YELLOW}[1/5] Checking environment...${NC}"
if [[ ! -d "/var/lib/pasarguard" && ! -d "${PASARGUARD_DIR}" ]]; then
  echo -e "${RED}Warning: PasarGuard installation directory was not detected.${NC}"
  echo -e "Proceeding anyway. Files will be placed in ${INSTALL_DIR}."
fi

mkdir -p "${INSTALL_DIR}" "${DATA_DIR}"

echo -e "${YELLOW}[2/5] Copying extension files...${NC}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cp -rf "${SCRIPT_DIR}/backend" "${INSTALL_DIR}/"
cp -rf "${SCRIPT_DIR}/plugin" "${INSTALL_DIR}/"
cp -rf "${SCRIPT_DIR}/systemd" "${INSTALL_DIR}/"

# Default settings if not already existing
SETTINGS_FILE="${DATA_DIR}/settings.json"
if [[ ! -f "${SETTINGS_FILE}" ]]; then
  cat << 'EOF' > "${SETTINGS_FILE}"
{
  "target_host_id": null,
  "enabled_isps": ["mci", "mtn", "wifi"],
  "limit_per_isp": 2,
  "auto_pilot": true,
  "auto_interval_hours": 3,
  "custom_ips": []
}
EOF
fi

echo -e "${YELLOW}[3/5] Integrating with PasarGuard Backend (FastAPI)...${NC}"
# Setup sitecustomize.py hook for persistent Python bootstrapping
PYTHON_HOOK_DIR="/var/lib/pasarguard/cleanip/python"
mkdir -p "${PYTHON_HOOK_DIR}"

cat << 'EOF' > "${PYTHON_HOOK_DIR}/sitecustomize.py"
"""
PasarGuard Clean IP Bootstrapper
"""
try:
    import sys
    sys.path.insert(0, "/opt/pasarguard-cleanip")
    from backend.cleanip_router import router as cleanip_router
    from app.routers import api_router

    # Register router if not already registered
    if not any(getattr(r, "prefix", None) == "/api/cleanip" for r in api_router.routes):
        api_router.include_router(cleanip_router)
        sys.stderr.write("[CleanIP] Router successfully registered in PasarGuard API\n")
except Exception as e:
    sys.stderr.write(f"[CleanIP] Bootstrap notice: {e}\n")
EOF

echo -e "${YELLOW}[4/5] Injecting web UI into PasarGuard Dashboard...${NC}"
export PASARGUARD_ROOT="${PASARGUARD_DIR}"
export CLEANIP_ROOT="${INSTALL_DIR}"
bash "${INSTALL_DIR}/plugin/integrate-dashboard.sh" || true

# Setup systemd path watcher for rebuilds
if command -v systemctl >/dev/null 2>&1; then
  cp -f "${INSTALL_DIR}/systemd/pasarguard-cleanip-watcher.service" /etc/systemd/system/
  cp -f "${INSTALL_DIR}/systemd/pasarguard-cleanip-watcher.path" /etc/systemd/system/
  systemctl daemon-reload
  systemctl enable --now pasarguard-cleanip-watcher.path || true
fi

echo -e "${YELLOW}[5/5] Finalizing and restarting panel...${NC}"
# Setup automated cron job for background scanning every 3 hours
CRON_CMD="0 */3 * * * curl -s -X POST http://127.0.0.1:8000/api/cleanip/scan-and-apply >/dev/null 2>&1"
(crontab -l 2>/dev/null | grep -v "cleanip/scan-and-apply" ; echo "${CRON_CMD}") | crontab - || true

if command -v pasarguard >/dev/null 2>&1; then
  echo -e "Restarting PasarGuard safely via official CLI..."
  pasarguard restart || true
fi

echo -e "\n${GREEN}======================================================${NC}"
echo -e "${GREEN}  ✅ PasarGuard Auto Clean IP successfully installed! ${NC}"
echo -e "${GREEN}======================================================${NC}"
echo -e "1. Open your PasarGuard Web Dashboard."
echo -e "2. Look for the '${GREEN}🛡️ Clean IP Auto-Pilot${NC}' button in the navigation."
echo -e "3. Select your Cloudflare/CDN Host and click '${GREEN}Scan & Apply Now${NC}'."
echo -e "======================================================\n"
