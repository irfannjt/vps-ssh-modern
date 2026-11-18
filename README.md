# VPS SSH Modern

Modern rebuild inspired by the uploaded INDOWORX VPS SSH scripts (2018). Clean implementation; legacy scripts and bundled keys are reference-only.

## Decisions
- Roles: Admin, Reseller, User
- UI: Dark + Light themes (Phase 4)
- Backend: Node.js 20+, TypeScript, Fastify, Prisma, PostgreSQL
- OS target: CentOS Linux 8 compatibility only. CentOS 8 is EOL; do not expose it to production. Prefer supported Rocky Linux or AlmaLinux.
- API runs unprivileged; Linux account operations use a restricted helper.

## Legacy mapping
- create-user.sh -> SSH account API
- user-delete.sh -> safe account deletion
- user-renew.sh -> expiry update
- user-trial.sh -> trial workflow
- user-list.sh -> account inventory
- user-login.sh/user-limit.sh/autokill.sh -> future session manager
- autoexpire.sh -> future database-driven expiry worker
- centos-kvm.sh -> replaced by preflight/deployment automation
- bundled OpenVPN keys -> per-server PKI; never reuse shared private keys
- Dropbear/Squid/BadVPN -> future service adapters

## Development
Requirements: Node.js 20+, PostgreSQL 14+.
```bash
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```
Keep SYSTEM_ACCOUNT_MANAGEMENT=false during development. Do not enable privileged account changes before reviewing helper, sudoers, service identity, and disposable-VM tests.

## Initial endpoints
- GET /health
- POST /api/auth/login
- GET /api/accounts (Admin/Reseller)
- POST /api/accounts (Admin/Reseller)
- POST /api/accounts/:username/renew (Admin/Reseller)
- DELETE /api/accounts/:username (Admin only)

No public self-registration. Admin bootstrap command is planned.

## Security
Never run the legacy installer or reuse its private keys. Do not store passwords in database/logs. CentOS Linux 8 reached EOL on 2021-12-31.