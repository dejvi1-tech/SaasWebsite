"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import { MoreHorizontal, Eye, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { useTranslation } from "@/hooks/use-translation";
import { formatCurrency, formatDate, getInitials } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import type { Customer, CustomerStatus } from "@/types";

const STATUS_STYLES: Record<CustomerStatus, { label: string; variant: "success" | "warning" | "gray" | "destructive" }> = {
  active: { label: "Aktiv", variant: "success" },
  trial: { label: "Testphase", variant: "warning" },
  inactive: { label: "Inaktiv", variant: "gray" },
  churned: { label: "Abgewandert", variant: "destructive" },
};

const MOCK_CUSTOMERS: Customer[] = Array.from({ length: 10 }, (_, i) => ({
  id: String(i + 1),
  organization_id: "org1",
  name: ["Max Mustermann", "Anna Schmidt", "Peter Weber", "Lisa Braun", "Markus Hoffmann", "Sandra Fischer", "Thomas Wagner", "Karin Schulz", "Michael Becker", "Julia Meyer"][i],
  email: ["max@beispiel.de", "anna@tech.de", "peter@web.de", "lisa@startup.de", "markus@corp.de", "sandra@gmbh.de", "thomas@digital.de", "karin@solutions.de", "michael@cloud.de", "julia@data.de"][i],
  company: ["Mustermann GmbH", "TechVision AG", "WebPro GmbH", "StartupHub", "CorpSoft AG", "Fischer & Partner", "Digital Works", "Solutions GmbH", "CloudPeak AG", "DataFlow GmbH"][i],
  phone: null,
  status: (["active", "active", "trial", "active", "inactive", "active", "churned", "active", "trial", "active"] as CustomerStatus[])[i],
  plan: ["Enterprise", "Professional", "Starter", "Professional", "Starter", "Enterprise", "Starter", "Professional", "Starter", "Enterprise"][i],
  mrr: [1299, 799, 299, 799, 0, 1299, 0, 799, 299, 1299][i],
  avatar_url: null,
  notes: null,
  created_at: new Date(Date.now() - (i + 1) * 7 * 24 * 3600000).toISOString(),
  updated_at: new Date().toISOString(),
}));

interface Props {
  customers: Customer[];
  total: number;
  page: number;
  pageSize: number;
}

export function CustomerTable({ customers: serverCustomers, total, page, pageSize }: Props) {
  const { t, language } = useTranslation();
  const router = useRouter();
  const locale = language === "de" ? "de-DE" : "en-US";
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const customers = serverCustomers.length > 0 ? serverCustomers : MOCK_CUSTOMERS;
  const displayTotal = serverCustomers.length > 0 ? total : MOCK_CUSTOMERS.length;

  const columns: ColumnDef<Customer>[] = [
    {
      id: "name",
      header: t("customers.table.name"),
      cell: ({ row }) => {
        const c = row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">{getInitials(c.name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <Link href={`/dashboard/customers/${c.id}`} className="font-medium hover:text-primary transition-colors truncate block">
                {c.name}
              </Link>
              <p className="text-xs text-muted-foreground truncate">{c.email}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "company",
      header: t("customers.table.company"),
      cell: ({ getValue }) => (
        <span className="text-muted-foreground">{(getValue() as string) || "—"}</span>
      ),
    },
    {
      accessorKey: "plan",
      header: t("customers.table.plan"),
      cell: ({ getValue }) => (
        <span className="text-sm">{(getValue() as string) || "—"}</span>
      ),
    },
    {
      accessorKey: "status",
      header: t("customers.table.status"),
      cell: ({ getValue }) => {
        const status = getValue() as CustomerStatus;
        const style = STATUS_STYLES[status];
        return <Badge variant={style.variant}>{style.label}</Badge>;
      },
    },
    {
      accessorKey: "mrr",
      header: t("customers.table.mrr"),
      cell: ({ getValue }) => {
        const mrr = getValue() as number;
        return <span className="font-medium">{mrr > 0 ? formatCurrency(mrr) : "—"}</span>;
      },
    },
    {
      accessorKey: "created_at",
      header: t("customers.table.joinDate"),
      cell: ({ getValue }) => (
        <span className="text-muted-foreground text-sm">
          {formatDate(getValue() as string, locale)}
        </span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const c = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/customers/${c.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  {t("common.viewDetails")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Pencil className="mr-2 h-4 w-4" />
                {t("common.edit")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => setDeleteId(c.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {t("common.delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: customers,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const supabase = createClient();
    const { error } = await supabase.from("customers").delete().eq("id", deleteId);
    setDeleting(false);
    setDeleteId(null);
    if (error) {
      toast.error(t("errors.generic"));
    } else {
      toast.success("Kunde gelöscht");
      router.refresh();
    }
  };

  const totalPages = Math.ceil(displayTotal / pageSize);

  return (
    <>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/30">
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((header) => (
                    <th
                      key={header.id}
                      className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap"
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="text-center py-12 text-muted-foreground">
                    <p className="font-medium">{t("customers.noCustomers")}</p>
                    <p className="text-xs mt-1">{t("customers.noCustomersDesc")}</p>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="group border-b border-border/50 hover:bg-muted/30 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="py-3 px-4">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <p className="text-xs text-muted-foreground">
            {t("common.showing")} {Math.min((page - 1) * pageSize + 1, displayTotal)}–
            {Math.min(page * pageSize, displayTotal)} {t("common.of")} {displayTotal} {t("common.results")}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon-sm"
              disabled={page <= 1}
              onClick={() => router.push(`?page=${page - 1}`)}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <span className="text-xs text-muted-foreground px-2">
              {t("common.page")} {page} {t("common.of")} {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon-sm"
              disabled={page >= totalPages}
              onClick={() => router.push(`?page=${page + 1}`)}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("customers.deleteConfirm.title")}</AlertDialogTitle>
            <AlertDialogDescription>{t("customers.deleteConfirm.description")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              {deleting ? t("common.loading") : t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
