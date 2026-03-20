"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/hooks/use-translation";
import { createClient } from "@/lib/supabase/client";
import { DEMO_MODE, isDemoCredentials, DEMO_COOKIE } from "@/lib/demo-auth";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

type FormValues = z.infer<typeof schema>;

export function LoginForm() {
  const { t } = useTranslation();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(
      z.object({
        email: z
          .string()
          .min(1, t("auth.errors.emailRequired"))
          .email(t("auth.errors.invalidEmail")),
        password: z.string().min(1, t("auth.errors.passwordRequired")),
      })
    ),
  });

  const onSubmit = async (data: FormValues) => {
    // Demo mode: bypass Supabase when no real project is connected
    if (DEMO_MODE) {
      if (!isDemoCredentials(data.email, data.password)) {
        toast.error(t("auth.errors.invalidCredentials"));
        return;
      }
      // Set a demo session cookie via API route
      await fetch("/api/demo/login", { method: "POST" });
      router.push("/dashboard");
      router.refresh();
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      toast.error(t("auth.errors.invalidCredentials"));
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {/* Mobile logo */}
      <div className="flex lg:hidden items-center gap-2 mb-8">
        <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <span className="text-lg font-bold">FlowPilot</span>
      </div>

      <div className="space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight">{t("auth.welcomeBack")}</h1>
        <p className="text-muted-foreground text-sm">{t("auth.signInSubtitle")}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">{t("auth.email")}</Label>
          <Input
            id="email"
            type="email"
            placeholder="max@beispiel.de"
            error={!!errors.email}
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">{t("auth.password")}</Label>
            <Link
              href="/forgot-password"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {t("auth.forgotPasswordLink")}
            </Link>
          </div>
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            error={!!errors.password}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="hover:text-foreground transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-3.5 w-3.5" />
                ) : (
                  <Eye className="h-3.5 w-3.5" />
                )}
              </button>
            }
            {...register("password")}
          />
          {errors.password && (
            <p className="text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
          {t("auth.signIn")}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        {t("auth.noAccount")}{" "}
        <Link href="/signup" className="font-medium text-primary hover:underline">
          {t("auth.createAccount")}
        </Link>
      </p>

      {/* Demo credentials hint */}
      <div className="rounded-xl border border-dashed p-3 bg-muted/30">
        <p className="text-xs text-muted-foreground text-center">
          <span className="font-medium">Demo:</span> admin@flowpilot.de / password123
        </p>
      </div>
    </div>
  );
}
