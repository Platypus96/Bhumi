
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, XCircle, Globe } from "lucide-react";
import { PropertyStatusFilter } from "@/app/dashboard/page";
import { cn } from "@/lib/utils";

interface DashboardStatsProps {
  stats: {
    pending: number;
    verified: number;
    rejected: number;
  };
  currentFilter: PropertyStatusFilter;
  onFilterChange: (filter: PropertyStatusFilter) => void;
}

export function DashboardStats({ stats, currentFilter, onFilterChange }: DashboardStatsProps) {
  const statCards = [
    {
      title: "Pending Review",
      value: stats.pending,
      icon: Clock,
      color: "text-amber-500",
      bgColor: "bg-amber-50 dark:bg-amber-900/20",
      borderColor: "border-amber-200 dark:border-amber-800",
      filter: "pending" as PropertyStatusFilter,
    },
    {
      title: "Verified Lands",
      value: stats.verified,
      icon: CheckCircle,
      color: "text-green-500",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      borderColor: "border-green-200 dark:border-green-800",
      filter: "verified" as PropertyStatusFilter,
    },
     {
      title: "Rejected",
      value: stats.rejected,
      icon: XCircle,
      color: "text-red-500",
      bgColor: "bg-red-50 dark:bg-red-900/20",
      borderColor: "border-red-200 dark:border-red-800",
      filter: "rejected" as PropertyStatusFilter,
    },
    {
      title: "All",
      value: stats.pending + stats.verified + stats.rejected,
      icon: Globe,
      color: "text-gray-500",
      bgColor: "bg-gray-50 dark:bg-gray-900/20",
      borderColor: "border-gray-200 dark:border-gray-800",
      filter: "all" as PropertyStatusFilter,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((card) => (
        <Card
          key={card.title}
          className={cn(
            "cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1",
            card.bgColor,
            card.borderColor,
            currentFilter === card.filter ? `ring-2 ring-offset-2 ring-primary` : ''
          )}
          onClick={() => onFilterChange(card.filter)}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className={cn("h-4 w-4 text-muted-foreground", card.color)} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
