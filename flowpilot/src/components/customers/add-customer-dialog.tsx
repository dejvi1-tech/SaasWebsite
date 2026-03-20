"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "@/hooks/use-translation";
import { createClient } from "@/lib/supabase/client";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  company: z.string().optional(),
  phone: z.string().optional(),
  status: z.enum(["active", "inactive", "trial", "churned"]),
  plan: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editData?: Partial<FormValues & { id: string }>;
}

export function AddCustomerDialog({ open, onOpenChange, editData }: Props) {
  const { t } = useTranslation();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(
      z.object({
        name: z.string().min(2, t("customers.form.errors.nameRequired")),
        email: z.string().email(t("customers.form.errors.emailInvalid")),
        company: z.string().optional(),
        phone: z.string().optional(),
        status: z.enum(["active", "inactive", "trial", "churned"]),
        plan: z.string().optional(),
        notes: z.string().optional(),
      })
    ),
    defaultValues: editData ?? { status: "active" },
  });

  const onSubmit = async (data: FormValues) => {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profileData } = await supabase
      .from("profiles")
      .select("organization_id")
      .eq("id", user.id)
      .single();

    const profile = profileData as { organization_id: string | null } | null;

    const payload = {
      ...data,
      organization_id: profile?.organization_id ?? "demo-org",
      mrr: 0,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = supabase as any;
    const { error } = editData?.id
      ? await sb.from("customers").update(payload).eq("id", editData.id)
      : await sb.from("customers").insert(payload);

    if (error) {
      toast.error(t("errors.generic"));
      return;
    }

    toast.success(editData?.id ? t("toasts.customerUpdated") : t("toasts.customerAdded"));
    reset();
    onOpenChange(false);
    router.refresh();
  };

  const statusValue = watch("status");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editData?.id ? t("customers.editCustomer") : t("customers.addCustomer")}
          </DialogTitle>
          <DialogDescription>
            {editData?.id
              ? t("customers.form.editDescription")
              : t("customers.form.addDescription")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label>{t("customers.form.name")}</Label>
              <Input placeholder={t("customers.form.namePlaceholder")} {...register("name")} error={!!errors.name} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="col-span-2 space-y-1.5">
              <Label>{t("customers.form.email")}</Label>
              <Input type="email" placeholder={t("customers.form.emailPlaceholder")} {...register("email")} error={!!errors.email} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>{t("customers.form.company")}</Label>
              <Input placeholder={t("customers.form.companyPlaceholder")} {...register("company")} />
            </div>

            <div className="space-y-1.5">
              <Label>{t("customers.form.phone")}</Label>
              <Input placeholder={t("customers.form.phonePlaceholder")} {...register("phone")} />
            </div>

            <div className="space-y-1.5">
              <Label>{t("customers.form.status")}</Label>
              <Select value={statusValue} onValueChange={(v) => setValue("status", v as FormValues["status"])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">{t("customers.status.active")}</SelectItem>
                  <SelectItem value="inactive">{t("customers.status.inactive")}</SelectItem>
                  <SelectItem value="trial">{t("customers.status.trial")}</SelectItem>
                  <SelectItem value="churned">{t("customers.status.churned")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>{t("customers.form.plan")}</Label>
              <Select onValueChange={(v) => setValue("plan", v)}>
                <SelectTrigger>
                  <SelectValue placeholder={t("customers.form.selectPlan")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Starter">Starter</SelectItem>
                  <SelectItem value="Professional">Professional</SelectItem>
                  <SelectItem value="Enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2 space-y-1.5">
              <Label>{t("customers.form.notes")}</Label>
              <Textarea
                placeholder={t("customers.form.notesPlaceholder")}
                rows={3}
                {...register("notes")}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" loading={isSubmitting}>
              {editData?.id ? t("common.save") : t("customers.addCustomer")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
