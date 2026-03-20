"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  User,
  Building,
  Bell,
  Shield,
  Languages,
  Palette,
  Upload,
  Sun,
  Moon,
  Monitor,
  Check,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTranslation } from "@/hooks/use-translation";
import { useLanguageStore } from "@/stores/language-store";
import { getInitials } from "@/lib/utils";
import type { Profile } from "@/types";
import type { Language } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";
import { DEMO_MODE } from "@/lib/demo-auth";

interface Props {
  profile: Profile | null;
}

export function SettingsPage({ profile }: Props) {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useLanguageStore();

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("settings.title")}</h1>
        <p className="text-muted-foreground text-sm mt-1">{t("settings.subtitle")}</p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="flex-wrap h-auto gap-1 bg-muted p-1">
          {[
            { value: "profile", icon: User, label: t("settings.tabs.profile") },
            { value: "company", icon: Building, label: t("settings.tabs.company") },
            { value: "notifications", icon: Bell, label: t("settings.tabs.notifications") },
            { value: "security", icon: Shield, label: t("settings.tabs.security") },
            { value: "language", icon: Languages, label: t("settings.tabs.language") },
            { value: "theme", icon: Palette, label: t("settings.tabs.theme") },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger key={tab.value} value={tab.value} className="gap-1.5">
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="profile" className="mt-4">
          <ProfileTab profile={profile} t={t} />
        </TabsContent>

        <TabsContent value="company" className="mt-4">
          <CompanyTab t={t} />
        </TabsContent>

        <TabsContent value="notifications" className="mt-4">
          <NotificationsTab t={t} />
        </TabsContent>

        <TabsContent value="security" className="mt-4">
          <SecurityTab t={t} />
        </TabsContent>

        <TabsContent value="language" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("settings.language.title")}</CardTitle>
              <CardDescription>{t("settings.language.selectLanguage")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {([
                { lang: "de" as Language, label: `🇩🇪 ${t("settings.language.german")}` },
                { lang: "en" as Language, label: `🇬🇧 ${t("settings.language.english")}` },
              ]).map((option) => (
                <button
                  key={option.lang}
                  onClick={() => {
                    setLanguage(option.lang);
                    toast.success(t("settings.language.languageChanged"));
                  }}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all text-sm font-medium ${
                    language === option.lang
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border hover:border-muted-foreground/30"
                  }`}
                >
                  {option.label}
                  {language === option.lang && (
                    <span className="h-2 w-2 rounded-full bg-primary" />
                  )}
                </button>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="theme" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("settings.theme.title")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {([
                { value: "light", label: t("settings.theme.light"), icon: Sun },
                { value: "dark", label: t("settings.theme.dark"), icon: Moon },
                { value: "system", label: t("settings.theme.system"), icon: Monitor },
              ] as const).map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    onClick={() => {
                      setTheme(option.value);
                      toast.success(t("settings.theme.themeChanged"));
                    }}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-sm font-medium ${
                      theme === option.value
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border hover:border-muted-foreground/30"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {option.label}
                    {theme === option.value && (
                      <span className="ml-auto h-2 w-2 rounded-full bg-primary" />
                    )}
                  </button>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

const profileSchema = z.object({
  full_name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
});

function ProfileTab({ profile, t }: { profile: Profile | null; t: (k: string) => string }) {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile?.full_name ?? "",
      email: profile?.email ?? "",
      phone: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof profileSchema>) => {
    if (DEMO_MODE) {
      await new Promise((r) => setTimeout(r, 500));
      toast.success(t("settings.profile.profileUpdated"));
      return;
    }
    const supabase = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from("profiles")
      .update({ full_name: data.full_name })
      .eq("id", profile?.id ?? "");
    if (error) toast.error(t("toasts.saveError"));
    else toast.success(t("settings.profile.profileUpdated"));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("settings.profile.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile?.avatar_url ?? undefined} />
              <AvatarFallback className="text-lg">
                {getInitials(profile?.full_name ?? profile?.email ?? "FP")}
              </AvatarFallback>
            </Avatar>
            <div>
              <Button type="button" variant="outline" size="sm">
                <Upload className="h-3.5 w-3.5 mr-1.5" />
                {t("settings.profile.uploadAvatar")}
              </Button>
              <p className="text-xs text-muted-foreground mt-1">{t("settings.profile.avatarHint")}</p>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>{t("settings.profile.fullName")}</Label>
              <Input {...register("full_name")} />
            </div>
            <div className="space-y-1.5">
              <Label>{t("settings.profile.email")}</Label>
              <Input type="email" disabled {...register("email")} className="opacity-60" />
            </div>
            <div className="space-y-1.5">
              <Label>{t("settings.profile.phone")}</Label>
              <Input {...register("phone")} />
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" loading={isSubmitting}>
              {t("settings.profile.saveChanges")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

const companySchema = z.object({
  name: z.string().optional(),
  website: z.string().optional(),
  industry: z.string().optional(),
  size: z.string().optional(),
  address: z.string().optional(),
});

function CompanyTab({ t }: { t: (k: string) => string }) {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    resolver: zodResolver(companySchema),
    defaultValues: { name: "", website: "", industry: "", size: "", address: "" },
  });

  const onSubmit = async () => {
    await new Promise((r) => setTimeout(r, 500));
    toast.success(t("toasts.settingsSaved"));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("settings.company.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>{t("settings.company.name")}</Label>
              <Input placeholder="FlowPilot GmbH" {...register("name")} />
            </div>
            <div className="space-y-1.5">
              <Label>{t("settings.company.website")}</Label>
              <Input placeholder="https://flowpilot.de" {...register("website")} />
            </div>
            <div className="space-y-1.5">
              <Label>{t("settings.company.industry")}</Label>
              <Input placeholder="Software / SaaS" {...register("industry")} />
            </div>
            <div className="space-y-1.5">
              <Label>{t("settings.company.size")}</Label>
              <Input placeholder={t("settings.company.sizePlaceholder")} {...register("size")} />
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <Label>{t("settings.company.address")}</Label>
              <Input placeholder="Musterstr. 1, 10115 Berlin" {...register("address")} />
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit" loading={isSubmitting}>{t("common.save")}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function NotificationsTab({ t }: { t: (k: string) => string }) {
  const [settings, setSettings] = useState({
    newCustomer: true,
    paymentReceived: true,
    subscriptionCanceled: true,
    newTicket: true,
    teamInvite: false,
    weeklyReport: true,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    setSaving(false);
    toast.success(t("toasts.settingsSaved"));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("settings.notifications.title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(settings).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium">{t(`settings.notifications.${key}`)}</p>
            </div>
            <Switch
              checked={value}
              onCheckedChange={(v) => setSettings((s) => ({ ...s, [key]: v }))}
            />
          </div>
        ))}
        <Separator />
        <div className="flex justify-end">
          <Button onClick={handleSave} loading={saving}>
            <Check className="h-3.5 w-3.5 mr-1.5" />
            {t("common.save")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
  confirmPassword: z.string().min(8),
}).refine((d) => d.newPassword === d.confirmPassword, {
  path: ["confirmPassword"],
});

function SecurityTab({ t }: { t: (k: string) => string }) {
  const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const onSubmit = async () => {
    if (DEMO_MODE) {
      await new Promise((r) => setTimeout(r, 500));
      toast.success(t("toasts.settingsSaved"));
      reset();
      return;
    }
    const supabase = createClient();
    // In production, call supabase.auth.updateUser({ password })
    await new Promise((r) => setTimeout(r, 500));
    toast.success(t("toasts.settingsSaved"));
    reset();
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("settings.security.changePassword")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div className="space-y-1.5">
              <Label>{t("settings.security.currentPassword")}</Label>
              <Input type="password" placeholder="••••••••" {...register("currentPassword")} error={!!errors.currentPassword} />
            </div>
            <div className="space-y-1.5">
              <Label>{t("settings.security.newPassword")}</Label>
              <Input type="password" placeholder="••••••••" {...register("newPassword")} error={!!errors.newPassword} />
            </div>
            <div className="space-y-1.5">
              <Label>{t("settings.security.confirmPassword")}</Label>
              <Input type="password" placeholder="••••••••" {...register("confirmPassword")} error={!!errors.confirmPassword} />
              {errors.confirmPassword && (
                <p className="text-xs text-destructive">{t("auth.errors.passwordMismatch")}</p>
              )}
            </div>
            <div className="flex justify-end">
              <Button type="submit" loading={isSubmitting}>{t("settings.security.changePassword")}</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("settings.security.twoFactor")}</CardTitle>
          <CardDescription>{t("settings.security.twoFactorDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline">{t("settings.security.enable2FA")}</Button>
        </CardContent>
      </Card>
    </div>
  );
}
