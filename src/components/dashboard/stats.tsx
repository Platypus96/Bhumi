"use client";

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
      filter: "all" as PropertyStatusFilter,
    },
    {
      title: "Pending",
      value: stats.pending,
      filter: "pending" as PropertyStatusFilter,
    },
    {
      title: "Verified",
      value: stats.verified,
      filter: "verified" as PropertyStatusFilter,
    },
    {
      title: "Rejected",
      value: stats.rejected,
      filter: "rejected" as PropertyStatusFilter,
    },
  ];

  return (
    <div className="flex space-x-2 animate-fadeIn">
      {statItems.map((item) => (
        <Button
          key={item.filter}
          variant={currentFilter === item.filter ? "default" : "outline"}
          size="sm"
          className="rounded-full"
          onClick={() => onFilterChange(item.filter)}
        >
          {item.title}
          <span className={cn(
            "ml-2 text-xs rounded-full px-2 py-0.5",
            currentFilter === item.filter
              ? "bg-primary-foreground/20 text-primary-foreground"
              : "bg-muted text-muted-foreground"
          )}>
            {item.value}
          </span>
        </Button>
      ))}
    </div>
  );
}
