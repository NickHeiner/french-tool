import { cookies } from "next/headers";

export const AUTH_COOKIE_NAME = "french_vocab_session";
const AUTH_COOKIE_VALUE = "authenticated";

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get(AUTH_COOKIE_NAME);

  return authCookie?.value === AUTH_COOKIE_VALUE;
}

export const authCookieConfig = {
  name: AUTH_COOKIE_NAME,
  value: AUTH_COOKIE_VALUE,
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
};
