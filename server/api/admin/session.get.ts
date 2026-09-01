import { getCookie } from "h3";
import { isAdminSession } from "../../utils/admin";

export default defineEventHandler((event) => ({ authenticated: isAdminSession(getCookie(event, "kraken-admin-session")) }));
