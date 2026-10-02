#!/usr/bin/env bash
# ==============================================================================
# PasarGuard Clean IP - Dashboard Integrator
# Safely injects the Clean IP web interface into PasarGuard's React build
# (both inside Docker container and on host if available).
# Idempotent and safe to run repeatedly.
# ==============================================================================
set -euo pipefail

PASARGUARD_ROOT="${PASARGUARD_ROOT:-/opt/pasarguard}"
INSTALL_DIR="${CLEANIP_ROOT:-/opt/pasarguard-cleanip}"
SCRIPT_SRC="${INSTALL_DIR}/plugin/cleanip-panel.js"
MARKER="pg-cleanip-loader"

log() { printf '[CleanIP] %s\n' "$*"; }
warn() { printf '[CleanIP] WARNING: %s\n' "$*" >&2; }

if [[ ! -f "${SCRIPT_SRC}" ]]; then
  # Fallback to shared volume directory if not found in /opt
  if [[ -f "/var/lib/pasarguard/cleanip/plugin/cleanip-panel.js" ]]; then
    SCRIPT_SRC="/var/lib/pasarguard/cleanip/plugin/cleanip-panel.js"
  else
    warn "cleanip-panel.js not found at ${SCRIPT_SRC}"
    exit 1
  fi
fi

VERSION="$(sha256sum "${SCRIPT_SRC}" | awk '{print substr($1,1,8)}')"

patch_html_file() {
  local html_file="$1"
  [[ -f "${html_file}" ]] || return 0

  python3 - "${html_file}" "${MARKER}" "${VERSION}" << 'PY'
import sys, re
from pathlib import Path

html_path = Path(sys.argv[1])
marker = sys.argv[2]
version = sys.argv[3]
content = html_path.read_text(encoding="utf-8")

tag = f'<script id="{marker}" src="/statics/cleanip-panel.js?v={version}" defer></script>'
pattern = re.compile(rf'<script\b[^>]*\bid=["\']{re.escape(marker)}["\'][^>]*>.*?</script>', re.I | re.S)

if pattern.search(content):
    new_content = pattern.sub(tag, content, count=1)
elif '</body>' in content:
    new_content = content.replace('</body>', f'  {tag}\n</body>', 1)
else:
    new_content = content + f'\n{tag}\n'

if new_content != content:
    html_path.write_text(new_content, encoding="utf-8")
    print(f"[CleanIP] Successfully patched {html_path}")
else:
    print(f"[CleanIP] {html_path} already up to date")
PY
}

# 1. Integration on Host (if dashboard build exists on host)
find_host_dashboard_build() {
  local candidate
  for candidate in "${PASARGUARD_ROOT}/dashboard/build" "${PASARGUARD_ROOT}/panel/dashboard/build"; do
    if [[ -f "${candidate}/index.html" ]]; then
      printf '%s\n' "${candidate}"
      return 0
    fi
  done
  find "${PASARGUARD_ROOT}" -maxdepth 5 -type f -path '*/dashboard/build/index.html' -print -quit 2>/dev/null | sed 's#/index.html$##'
}

HOST_DASHBOARD="$(find_host_dashboard_build || true)"
if [[ -n "${HOST_DASHBOARD}" && -f "${HOST_DASHBOARD}/index.html" ]]; then
  mkdir -p "${HOST_DASHBOARD}/statics"
  cp -f "${SCRIPT_SRC}" "${HOST_DASHBOARD}/statics/cleanip-panel.js"
  patch_html_file "${HOST_DASHBOARD}/index.html"
  log "Host dashboard patched successfully."
fi

# 2. Integration into Docker container (if running)
detect_container() {
  local cid=""
  if command -v docker >/dev/null 2>&1; then
    # Try exact match for pasarguard-pasarguard-1 or docker compose
    cid="$(docker ps -q --filter "name=pasarguard-pasarguard-1" 2>/dev/null || true)"
    if [[ -z "${cid}" && -f "${PASARGUARD_ROOT}/docker-compose.yml" ]]; then
      cid="$(docker compose -f "${PASARGUARD_ROOT}/docker-compose.yml" ps -q pasarguard 2>/dev/null || true)"
    fi
    if [[ -z "${cid}" ]]; then
      cid="$(docker ps -q --filter "ancestor=pasarguard/panel:latest" 2>/dev/null || true)"
    fi
  fi
  printf '%s\n' "${cid}"
}

CID="$(detect_container)"
if [[ -n "${CID}" ]]; then
  log "Detected active PasarGuard container: ${CID}"

  # Find container build dir
  CONTAINER_BUILD=""
  for candidate in /code/dashboard/build /app/dashboard/build; do
    if docker exec "${CID}" test -f "${candidate}/index.html" >/dev/null 2>&1; then
      CONTAINER_BUILD="${candidate}"
      break
    fi
  done

  if [[ -n "${CONTAINER_BUILD}" ]]; then
    # Ensure statics directory exists in container
    docker exec "${CID}" mkdir -p "${CONTAINER_BUILD}/statics"
    # Copy JS script into container
    docker cp "${SCRIPT_SRC}" "${CID}:${CONTAINER_BUILD}/statics/cleanip-panel.js"
    log "Copied cleanip-panel.js to container ${CONTAINER_BUILD}/statics/"

    # Patch container index.html
    docker exec -i "${CID}" python3 - "${CONTAINER_BUILD}/index.html" "${MARKER}" "${VERSION}" << 'PY'
import sys, re
from pathlib import Path

html_path = Path(sys.argv[1])
marker = sys.argv[2]
version = sys.argv[3]
content = html_path.read_text(encoding="utf-8")

tag = f'<script id="{marker}" src="/statics/cleanip-panel.js?v={version}" defer></script>'
pattern = re.compile(rf'<script\b[^>]*\bid=["\']{re.escape(marker)}["\'][^>]*>.*?</script>', re.I | re.S)

if pattern.search(content):
    new_content = pattern.sub(tag, content, count=1)
elif '</body>' in content:
    new_content = content.replace('</body>', f'  {tag}\n</body>', 1)
else:
    new_content = content + f'\n{tag}\n'

if new_content != content:
    html_path.write_text(new_content, encoding="utf-8")
    print(f"[CleanIP] Successfully patched container {html_path}")
else:
    print(f"[CleanIP] Container {html_path} already up to date")
PY
    log "Container dashboard patched successfully."
  else
    warn "Dashboard index.html not found in container paths (/code/dashboard/build or /app/dashboard/build)."
  fi
fi

log "Dashboard integration completed successfully."
