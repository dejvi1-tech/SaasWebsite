/**
 * Demo mode — used when no real Supabase project is connected.
 * Credentials: admin@flowpilot.de / password123
 */

export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
export const DEMO_COOKIE = "fp_demo_session";

export const DEMO_USER = {
  id: "demo-user-id",
  email: "admin@flowpilot.de",
  full_name: "Klaus Müller",
  avatar_url: null as null,
  role: "admin" as const,
  organization_id: "demo-org-id",
  language: "de",
  theme: "system",
  created_at: "2025-06-01T00:00:00Z",
  updated_at: "2026-03-20T00:00:00Z",
};

export const DEMO_CREDENTIALS = {
  email: "admin@flowpilot.de",
  password: "password123",
};

export function isDemoCredentials(email: string, password: string): boolean {
  return (
    email === DEMO_CREDENTIALS.email && password === DEMO_CREDENTIALS.password
  );
}
