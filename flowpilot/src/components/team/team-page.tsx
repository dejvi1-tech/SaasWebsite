"use client";

import { useState } from "react";
import { Plus, Shield, User, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "@/hooks/use-translation";
import { getInitials, formatDate } from "@/lib/utils";
import type { UserRole } from "@/types";
import { toast } from "sonner";

const ROLE_META: Record<UserRole, { variant: "info" | "warning" | "gray"; icon: typeof Shield }> = {
  admin: { variant: "info", icon: Shield },
  manager: { variant: "warning", icon: Settings },
  member: { variant: "gray", icon: User },
};

const MOCK_MEMBERS = [
  { id: "1", user_id: "u1", role: "admin" as UserRole, joined_at: "2025-06-01", profiles: { id: "u1", full_name: "Klaus Müller", email: "klaus@flowpilot.de", avatar_url: null, role: "admin" as UserRole } },
  { id: "2", user_id: "u2", role: "manager" as UserRole, joined_at: "2025-07-15", profiles: { id: "u2", full_name: "Sandra Weber", email: "sandra@flowpilot.de", avatar_url: null, role: "manager" as UserRole } },
  { id: "3", user_id: "u3", role: "member" as UserRole, joined_at: "2025-09-01", profiles: { id: "u3", full_name: "Tobias Bauer", email: "tobias@flowpilot.de", avatar_url: null, role: "member" as UserRole } },
  { id: "4", user_id: "u4", role: "member" as UserRole, joined_at: "2025-10-15", profiles: { id: "u4", full_name: "Lisa Fischer", email: "lisa@flowpilot.de", avatar_url: null, role: "member" as UserRole } },
  { id: "5", user_id: "u5", role: "manager" as UserRole, joined_at: "2025-11-01", profiles: { id: "u5", full_name: "Markus Hoffmann", email: "markus@flowpilot.de", avatar_url: null, role: "manager" as UserRole } },
];

interface Props {
  members: unknown[];
}

export function TeamPage({ members: serverMembers }: Props) {
  const { t, language } = useTranslation();
  const locale = language === "de" ? "de-DE" : "en-US";
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<UserRole>("member");
  const [sending, setSending] = useState(false);

  const members = serverMembers.length > 0 ? serverMembers as typeof MOCK_MEMBERS : MOCK_MEMBERS;

  const handleInvite = async () => {
    if (!inviteEmail) return;
    setSending(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSending(false);
    toast.success(`${t("toasts.inviteSentTo")} ${inviteEmail}`);
    setInviteOpen(false);
    setInviteEmail("");
  };

  const roleCounts = members.reduce(
    (acc, m) => { acc[m.role] = (acc[m.role] ?? 0) + 1; return acc; },
    {} as Record<string, number>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("team.title")}</h1>
          <p className="text-muted-foreground text-sm mt-1">{t("team.subtitle")}</p>
        </div>
        <Button onClick={() => setInviteOpen(true)}>
          <Plus className="h-4 w-4 mr-1.5" />
          {t("team.inviteMember")}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {(["admin", "manager", "member"] as UserRole[]).map((role) => {
          const meta = ROLE_META[role];
          const Icon = meta.icon;
          return (
            <Card key={role}>
              <CardContent className="p-4 flex items-center gap-3">
                <Icon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">{t(`team.roles.${role}`)}</p>
                  <p className="text-2xl font-bold">{roleCounts[role] ?? 0}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Members table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/30">
              <tr>
                {[t("team.table.member"), t("team.table.role"), t("team.table.joinedAt")].map((h) => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {members.map((m) => {
                const profile = m.profiles;
                const meta = ROLE_META[m.role];
                const Icon = meta.icon;
                return (
                  <tr key={m.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {getInitials(profile?.full_name ?? "?")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{profile?.full_name}</p>
                          <p className="text-xs text-muted-foreground">{profile?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={meta.variant} className="gap-1">
                        <Icon className="h-3 w-3" />
                        {t(`team.roles.${m.role}`)}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {m.joined_at ? formatDate(m.joined_at, locale) : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Invite dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("team.invite.title")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>{t("team.invite.emailLabel")}</Label>
              <Input
                type="email"
                placeholder={t("team.invite.emailPlaceholder")}
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t("team.invite.roleLabel")}</Label>
              <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as UserRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">{t("team.roles.admin")}</SelectItem>
                  <SelectItem value="manager">{t("team.roles.manager")}</SelectItem>
                  <SelectItem value="member">{t("team.roles.member")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="mt-4 gap-2">
            <Button variant="outline" onClick={() => setInviteOpen(false)}>{t("common.cancel")}</Button>
            <Button onClick={handleInvite} loading={sending}>{t("team.invite.sendInvite")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
