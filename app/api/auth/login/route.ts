import { NextResponse } from "next/server";
import { z } from "zod";

import { authCookieConfig } from "@/lib/auth";
import { env } from "@/lib/env";

const loginSchema = z.object({
  password: z.string().min(1),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Password is required" }, { status: 400 });
  }

  if (parsed.data.password !== env.appPassword) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(authCookieConfig);

  return response;
}
