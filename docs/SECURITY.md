# Security baseline

- Never run API as root.
- Keep privileged account management disabled until reviewed/tested.
- Use dedicated service identity and narrow sudoers allowlist.
- Validate usernames; never interpolate input into shell commands.
- Never store plaintext passwords or log credentials.
- Hash API passwords; use short-lived signed tokens and role/ownership checks.
- Generate unique VPN PKI per server; never reuse legacy private keys.
- Protect/rotate secrets; use firewall defaults-deny and rate limiting.
- CentOS Linux 8 is EOL; do not deploy on public production traffic.
