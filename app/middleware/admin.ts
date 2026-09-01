export default defineNuxtRouteMiddleware(async () => {
  const session = await useRequestFetch()<{ authenticated: boolean }>("/api/admin/session");
  if (!session.authenticated) return navigateTo("/admin/login");
});
