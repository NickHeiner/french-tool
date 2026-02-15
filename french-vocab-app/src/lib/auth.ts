import { cookies } from "next/headers";

const AUTH_COOKIE = "french-vocab-auth";

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;
  return token === process.env.APP_PASSWORD;
}

export function getAuthCookieName(): string {
  return AUTH_COOKIE;
}
