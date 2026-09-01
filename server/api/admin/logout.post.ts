import { deleteCookie } from "h3";

export default defineEventHandler((event) => {
  deleteCookie(event, "kraken-admin-session", { path: "/" });
  return { authenticated: false };
});
