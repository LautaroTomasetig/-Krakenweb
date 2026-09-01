import { createError, getCookie, type H3Event } from "h3";
import { isAdminSession } from "./admin";

export function requireAdmin(event: H3Event) {
  if (!isAdminSession(getCookie(event, "kraken-admin-session"))) {
    throw createError({ statusCode: 401, statusMessage: "Autenticación requerida" });
  }
}
