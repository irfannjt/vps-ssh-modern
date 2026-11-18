import { spawn } from "node:child_process";
import { config } from "../config.js";
const USERNAME = /^[a-z_][a-z0-9_-]{2,31}$/;
function runHelper(args: string[], secret?: string): Promise<void> {
  if (!config.SYSTEM_ACCOUNT_MANAGEMENT) throw new Error("System account management is disabled");
  return new Promise((resolve, reject) => {
    const child = spawn("sudo", [config.ACCOUNT_HELPER_PATH, ...args], { shell: false, stdio: ["pipe", "ignore", "pipe"] });
    let stderr = "";
    child.stderr.setEncoding("utf8").on("data", chunk => { stderr += chunk; });
    child.on("error", reject);
    child.on("close", code => code === 0 ? resolve() : reject(new Error(stderr || \`helper exited \${code}\`)));
    if (secret !== undefined) child.stdin.end(secret + "\n");
    else child.stdin.end();
  });
}
export async function createLinuxAccount(username: string, password: string): Promise<void> {
  if (!USERNAME.test(username)) throw new Error("Invalid username");
  if (password.length < 12 || password.length > 128 || /[\r\n]/.test(password)) throw new Error("Password must be 12-128 characters without line breaks");
  await runHelper(["create", username], password);
}
export async function deleteLinuxAccount(username: string): Promise<void> {
  if (!USERNAME.test(username)) throw new Error("Invalid username");
  await runHelper(["delete", username]);
}
