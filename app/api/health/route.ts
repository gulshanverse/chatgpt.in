import { NextResponse } from "next/server";

export const runtime = "nodejs";

export function GET() {
  return NextResponse.json({
    status: "ok",
    service: "chatgpt.in",
    version: process.env.npm_package_version || "0.2.0",
    timestamp: new Date().toISOString(),
  });
}
