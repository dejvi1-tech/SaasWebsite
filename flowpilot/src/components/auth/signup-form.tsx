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

export function SignupForm() {
  const { t } = useTranslation();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const schema = z.object({
    full_name: z.string().min(2, t("auth.errors.nameRequired")),
    email: z.string().email(t("auth.errors.invalidEmail")),
    password: z.string().min(8, t("auth.errors.passwordTooShort")),
    confirm_password: z.string(),
  }).refine((d) => d.password === d.confirm_password, {
    message: t("auth.errors.passwordMismatch"),
    path: ["confirm_password"],
  });

  type FormValues = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormValues) => {
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { full_name: data.full_name },
      },
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Konto erstellt! Bitte bestätigen Sie Ihre E-Mail.");
    router.push("/dashboard");
  };

  return (
    <div className="space-y-6">
      <div className="flex lg:hidden items-center gap-2 mb-8">
        <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <span className="text-lg font-bold">FlowPilot</span>
      </div>

      <div className="space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight">{t("auth.createAccount")}</h1>
        <p className="text-muted-foreground text-sm">{t("auth.signUpSubtitle")}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="full_name">{t("auth.fullName")}</Label>
          <Input
            id="full_name"
            placeholder="Max Mustermann"
            error={!!errors.full_name}
            {...register("full_name")}
          />
          {errors.full_name && (
            <p className="text-xs text-destructive">{errors.full_name.message}</p>
          )}
        </div>

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
          <Label htmlFor="password">{t("auth.password")}</Label>
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Min. 8 Zeichen"
            error={!!errors.password}
            rightIcon={
              <button type="button" onClick={() => setShowPassword((v) => !v)}>
                {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            }
            {...register("password")}
          />
          {errors.password && (
            <p className="text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirm_password">{t("auth.confirmPassword")}</Label>
          <Input
            id="confirm_password"
            type={showPassword ? "text" : "password"}
            placeholder="Passwort wiederholen"
            error={!!errors.confirm_password}
            {...register("confirm_password")}
          />
          {errors.confirm_password && (
            <p className="text-xs text-destructive">{errors.confirm_password.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
          {t("auth.signUp")}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        {t("auth.hasAccount")}{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          {t("auth.signIn")}
        </Link>
      </p>
    </div>
  );
}
