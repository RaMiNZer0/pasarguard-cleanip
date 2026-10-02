#!/usr/bin/env bash
# ==============================================================================
# PasarGuard Clean IP - Dashboard Integrator
# Safely injects the Clean IP web interface into PasarGuard's React build.
# Idempotent and safe to run repeatedly.
# ==============================================================================
set -euo pipefail

PASARGUARD_ROOT="${PASARGUARD_ROOT:-/opt/pasarguard}"
INSTALL_DIR="${CLEANIP_ROOT:-/opt/pasarguard-cleanip}"
SCRIPT_SRC="${INSTALL_DIR}/plugin/cleanip-panel.js"
MARKER="pg-cleanip-loader"

log() { printf '[CleanIP] %s\n' "$*"; }
warn() { printf '[CleanIP] WARNING: %s\n' "$*" >&2; }

find_dashboard_build() {
  local candidate
  for candidate in "${PASARGUARD_ROOT}/dashboard/build" "${PASARGUARD_ROOT}/panel/dashboard/build"; do
    if [[ -f "${candidate}/index.html" ]]; then
      printf '%s\n' "${candidate}"
      return 0
    fi
  done
  find "${PASARGUARD_ROOT}" -maxdepth 5 -type f -path '*/dashboard/build/index.html' -print -quit 2>/dev/null | sed 's#/index.html$##'
}

DASHBOARD_DIR="$(find_dashboard_build || true)"

if [[ -z "${DASHBOARD_DIR}" || ! -f "${DASHBOARD_DIR}/index.html" ]]; then
  warn "PasarGuard dashboard build not found under ${PASARGUARD_ROOT}. Integration skipped."
  exit 0
fi

HTML_FILE="${DASHBOARD_DIR}/index.html"
STATIC_DIR="${DASHBOARD_DIR}/statics"

mkdir -p "${STATIC_DIR}"

if [[ -f "${SCRIPT_SRC}" ]]; then
  cp -f "${SCRIPT_SRC}" "${STATIC_DIR}/cleanip-panel.js"
  log "Copied cleanip-panel.js to ${STATIC_DIR}"
else
  warn "Source script not found at ${SCRIPT_SRC}"
  exit 1
fi

# Compute version hash to bypass browser cache
VERSION="$(sha256sum "${SCRIPT_SRC}" | awk '{print substr($1,1,8)}')"

# Inject script tag safely into HTML
python3 - "${HTML_FILE}" "${MARKER}" "${VERSION}" << 'PY'
import sys, re
from pathlib import Path

html_path = Path(sys.argv[1])
marker = sys.argv[2]
version = sys.argv[3]
content = html_path.read_text(encoding="utf-8")

tag = f'<script id="{marker}" src="/statics/cleanip-panel.js?v={version}" defer></script>'
pattern = re.compile(rf'<script\s+id=["\']{re.escape(marker)}["\'][^>]*>\s*</script>', re.I)

if pattern.search(content):
    new_content = pattern.sub(tag, content, count=1)
elif '</body>' in content:
    new_content = content.replace('</body>', f'  {tag}\n</body>', 1)
else:
    new_content = content + f'\n{tag}\n'

if new_content != content:
    html_path.write_text(new_content, encoding="utf-8")
    print("[CleanIP] Successfully patched index.html")
else:
    print("[CleanIP] index.html already up to date")
PY

log "Dashboard integration completed successfully."
