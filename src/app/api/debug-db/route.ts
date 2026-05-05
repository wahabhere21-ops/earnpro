import { NextResponse } from "next/server";

export async function GET() {
  // Return all env vars that have DB or Neon related keys
  const envVars = {};
  for (const [key, value] of Object.entries(process.env)) {
    if (key.includes("DATABASE") || key.includes("NEON") || key.includes("POSTGRES") || key.includes("PRISMA")) {
      envVars[key] = value || "empty";
    }
  }
  return NextResponse.json(envVars);
}