import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Passwort vergessen — FlowPilot" };

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
