# Architecture

- Fastify API: authentication, authorization, validation, HTTP interface.
- PostgreSQL + Prisma: users, reseller ownership, SSH accounts and expiry.
- Linux account adapter: isolated OS operations.
- Restricted helper: narrow privileged command surface; API remains unprivileged.
- Future adapters: OpenVPN, WireGuard, Dropbear, Squid, BadVPN.

Roles: Admin (global), Reseller (owned accounts), User (self-service future).
Lifecycle: create -> active -> renewed/expired -> disabled/deleted. A database-driven worker will reconcile expiry.

CentOS Linux 8 is an EOL compatibility target only. Use supported EL-compatible OS for production.
