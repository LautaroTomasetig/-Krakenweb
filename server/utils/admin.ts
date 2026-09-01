import { createHmac, timingSafeEqual } from "node:crypto";

function sameSecret(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export function adminCredentials() {
  const config = useRuntimeConfig();
  return { email: String(config.adminEmail || ""), password: String(config.adminPassword || "") };
}

export function authenticateAdmin(email: string, password: string) {
  const credentials = adminCredentials();
  if (!credentials.email || !credentials.password) return false;
  return sameSecret(email, credentials.email) && sameSecret(password, credentials.password);
}

export function createAdminSession() {
  const expires = Date.now() + 1000 * 60 * 60 * 8;
  const payload = `${expires}`;
  return `${payload}.${sign(payload)}`;
}

export function isAdminSession(token: string | undefined) {
  if (!token) return false;
  const [expires, signature] = token.split(".");
  return Boolean(expires && signature && Number(expires) > Date.now() && sameSecret(signature, sign(expires)));
}

function sign(payload: string) {
  const { password } = adminCredentials();
  return createHmac("sha256", password).update(payload).digest("hex");
}
