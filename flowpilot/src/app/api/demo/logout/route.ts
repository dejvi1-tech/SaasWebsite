import { NextResponse } from "next/server";
import { DEMO_COOKIE } from "@/lib/demo-auth";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(DEMO_COOKIE);
  return response;
}
