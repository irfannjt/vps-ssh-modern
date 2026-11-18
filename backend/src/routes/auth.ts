import type { FastifyInstance } from "fastify";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "../db.js";
export async function authRoutes(app: FastifyInstance) {
 app.post("/login", async (request, reply) => {
  const parsed = z.object({ username: z.string().min(3).max(32), password: z.string().min(1).max(128) }).safeParse(request.body);
  if (!parsed.success) return reply.code(400).send({ error: "Invalid input" });
  const user = await prisma.user.findUnique({ where: { username: parsed.data.username } });
  if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) return reply.code(401).send({ error: "Invalid credentials" });
  const token = app.jwt.sign({ sub: user.id, role: user.role }, { expiresIn: "15m" });
  return { token, user: { id: user.id, username: user.username, role: user.role } };
 });
}
