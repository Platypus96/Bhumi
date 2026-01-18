
"use client";

import { CheckCircle, Clock, XCircle, Globe } from "lucide-react";
import { PropertyStatusFilter } from "@/app/dashboard/page";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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
  const statItems = [
    {
      title: "All",
      value: stats.pending + stats.verified + stats.rejected,
      icon: Globe,
      filter: "all" as PropertyStatusFilter,
      activeColor: "text-primary",
    },
    {
      title: "Pending",
      value: stats.pending,
      icon: Clock,
      filter: "pending" as PropertyStatusFilter,
      activeColor: "text-amber-600 dark:text-amber-500",
    },
    {
      title: "Verified",
      value: stats.verified,
      icon: CheckCircle,
      filter: "verified" as PropertyStatusFilter,
      activeColor: "text-green-600 dark:text-green-500",
    },
    {
      title: "Rejected",
      value: stats.rejected,
      icon: XCircle,
      filter: "rejected" as PropertyStatusFilter,
      activeColor: "text-red-600 dark:text-red-500",
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg bg-card p-1.5 border shadow-sm">
      {statItems.map((item) => (
        <Button
          key={item.title}
          variant="ghost"
          className={cn(
            "flex-grow justify-center md:justify-start h-auto px-4 py-2 text-sm font-medium transition-all duration-200 rounded-md",
            currentFilter === item.filter
              ? `bg-secondary shadow-sm ${item.activeColor}`
              : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
          )}
          onClick={() => onFilterChange(item.filter)}
        >
          <item.icon className={cn("h-5 w-5 mr-2")} />
          <span>{item.title}</span>
          <span
            className={cn(
              "ml-2.5 rounded-full px-2 py-0.5 text-xs font-semibold",
              currentFilter === item.filter
                ? "bg-primary/20 text-primary"
                : "bg-muted-foreground/10"
            )}
          >
            {item.value}
          </span>
        </Button>
      ))}
    </div>
  );
}
