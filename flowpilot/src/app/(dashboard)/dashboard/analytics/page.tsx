import { AnalyticsPage } from "@/components/analytics/analytics-page";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Analytik — FlowPilot" };

export default function AnalyticsDashboardPage() {
  return <AnalyticsPage />;
}
