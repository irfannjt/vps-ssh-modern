import { z } from "zod";
const schema = z.object({
 NODE_ENV: z.enum(["development","test","production"]).default("development"),
 HOST: z.string().default("127.0.0.1"),
 PORT: z.coerce.number().int().min(1).max(65535).default(3000),
 DATABASE_URL: z.string().min(1),
 JWT_SECRET: z.string().min(32),
 SYSTEM_ACCOUNT_MANAGEMENT: z.coerce.boolean().default(false),
 ACCOUNT_HELPER_PATH: z.string().default("/usr/local/sbin/vpsssh-accountctl")
});
export const config = schema.parse(process.env);
