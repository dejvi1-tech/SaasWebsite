"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Plus, Search, Filter, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CustomerTable } from "@/components/customers/customer-table";
import { AddCustomerDialog } from "@/components/customers/add-customer-dialog";
import { useTranslation } from "@/hooks/use-translation";
import type { Customer } from "@/types";

interface Props {
  customers: Customer[];
  total: number;
  page: number;
  pageSize: number;
}

export function CustomersPage({ customers, total, page, pageSize }: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [addOpen, setAddOpen] = useState(false);
  const [searchValue, setSearchValue] = useState(searchParams.get("search") ?? "");

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSearch = (value: string) => {
    setSearchValue(value);
    updateParam("search", value);
  };

  const statusOptions = [
    { value: "all", label: t("common.all") },
    { value: "active", label: t("customers.status.active") },
    { value: "inactive", label: t("customers.status.inactive") },
    { value: "trial", label: t("customers.status.trial") },
    { value: "churned", label: t("customers.status.churned") },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("customers.title")}</h1>
          <p className="text-muted-foreground text-sm mt-1">{t("customers.subtitle")}</p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="shrink-0">
          <Plus className="h-4 w-4 mr-1.5" />
          {t("customers.addCustomer")}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Input
          placeholder={`${t("common.search")}...`}
          leftIcon={<Search className="h-3.5 w-3.5" />}
          value={searchValue}
          onChange={(e) => handleSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select
          value={searchParams.get("status") || "all"}
          onValueChange={(v) => updateParam("status", v === "all" ? "" : v)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder={t("common.filter")} />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-3.5 w-3.5 mr-1.5" />
            {t("common.export")}
          </Button>
        </div>
      </div>

      {/* Table */}
      <CustomerTable
        customers={customers}
        total={total}
        page={page}
        pageSize={pageSize}
      />

      <AddCustomerDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
}
