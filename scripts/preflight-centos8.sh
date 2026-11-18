#!/usr/bin/env bash
set -euo pipefail
[[ -r /etc/os-release ]] || { echo "Cannot identify operating system" >&2; exit 1; }
. /etc/os-release
printf 'Detected: %s (%s)\\n' "${PRETTY_NAME:-unknown}" "${ID:-unknown}"
if [[ "${ID:-}" != "centos" || "${VERSION_ID%%.*}" != "8" ]]; then echo "This preflight targets CentOS Linux 8 only." >&2; exit 2; fi
echo "WARNING: CentOS Linux 8 is EOL. Do not use for production internet-facing workloads."
for cmd in systemctl useradd visudo; do command -v "$cmd" >/dev/null || { echo "Missing required command: $cmd" >&2; exit 3; }; done
echo "Preflight checks passed. No system changes were made."
