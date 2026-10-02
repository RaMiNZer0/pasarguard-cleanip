#!/usr/bin/env bash
# ==============================================================================
# PasarGuard Auto Clean IP - Uninstaller
# Cleanly removes all extension files, dashboard injections, and services.
# ==============================================================================
set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Uninstalling PasarGuard Auto Clean IP...${NC}"

if [[ "$(id -u)" -ne 0 ]]; then
  echo -e "${RED}Error: This uninstaller must be run as root (sudo).${NC}" >&2
  exit 1
fi

# 1. Stop and remove systemd service & path
if command -v systemctl >/dev/null 2>&1; then
  systemctl stop pasarguard-cleanip-watcher.path pasarguard-cleanip-watcher.service 2>/dev/null || true
  systemctl disable pasarguard-cleanip-watcher.path pasarguard-cleanip-watcher.service 2>/dev/null || true
  rm -f /etc/systemd/system/pasarguard-cleanip-watcher.path
  rm -f /etc/systemd/system/pasarguard-cleanip-watcher.service
  systemctl daemon-reload
fi

# 2. Remove cron job
(crontab -l 2>/dev/null | grep -v "cleanip/scan-and-apply") | crontab - || true

# 3. Clean dashboard HTML injection
for html in /opt/pasarguard/dashboard/build/index.html /opt/pasarguard/panel/dashboard/build/index.html; do
  if [[ -f "${html}" ]]; then
    python3 - "${html}" << 'PY' || true
import sys, re
from pathlib import Path
p = Path(sys.argv[1])
content = p.read_text(encoding="utf-8")
cleaned = re.sub(r'\s*<script\s+id=["\']pg-cleanip-loader["\'][^>]*></script>\s*', '\n', content, flags=re.I)
if cleaned != content:
    p.write_text(cleaned, encoding="utf-8")
    print(f"Reverted injection in {p}")
PY
  fi
done

# 4. Remove directories
rm -rf /opt/pasarguard-cleanip
rm -rf /var/lib/pasarguard/cleanip/python
rm -f /opt/pasarguard/dashboard/build/statics/cleanip-panel.js 2>/dev/null || true

# 5. Restart panel if pasarguard CLI exists
if command -v pasarguard >/dev/null 2>&1; then
  pasarguard restart || true
fi

echo -e "${GREEN}✅ PasarGuard Auto Clean IP has been completely uninstalled.${NC}"
