import { createError, readBody, setCookie } from "h3";
import { authenticateAdmin, createAdminSession } from "../../utils/admin";

export default defineEventHandler(async (event) => {
  const body = await readBody<{ email?: string; password?: string }>(event);
  if (!body?.email || !body.password || !authenticateAdmin(body.email, body.password)) {
    throw createError({ statusCode: 401, statusMessage: "Credenciales inválidas" });
  }
  setCookie(event, "kraken-admin-session", createAdminSession(), { httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 8, path: "/" });
  return { authenticated: true };
});
