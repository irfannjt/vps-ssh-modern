import Fastify from "fastify";
import jwt from "@fastify/jwt";
import rateLimit from "@fastify/rate-limit";
import { config } from "./config.js";
import { prisma } from "./db.js";
import { authRoutes } from "./routes/auth.js";
import { accountRoutes } from "./routes/accounts.js";
const app = Fastify({ logger: true, trustProxy: false });
await app.register(rateLimit, { max: 100, timeWindow: "1 minute" });
await app.register(jwt, { secret: config.JWT_SECRET });
app.get("/health", async () => ({ ok: true, service: "vps-ssh-modern-api" }));
await app.register(authRoutes, { prefix: "/api/auth" });
await app.register(accountRoutes, { prefix: "/api/accounts" });
app.addHook("onClose", async () => prisma.$disconnect());
try { await app.listen({ host: config.HOST, port: config.PORT }); }
catch (error) { app.log.error(error); process.exit(1); }
