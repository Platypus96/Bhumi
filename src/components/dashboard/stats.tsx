"use client";

import { PropertyStatusFilter } from "@/app/dashboard/page";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Globe, Clock, CheckCircle, XCircle } from "lucide-react";

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
      icon: Globe,
    },
    {
      title: "Pending",
      value: stats.pending,
      filter: "pending" as PropertyStatusFilter,
      icon: Clock,
    },
    {
      title: "Verified",
      value: stats.verified,
      filter: "verified" as PropertyStatusFilter,
      icon: CheckCircle,
    },
    {
      title: "Rejected",
      value: stats.rejected,
      filter: "rejected" as PropertyStatusFilter,
      icon: XCircle,
    },
  ];

  return (
    <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/60 w-full sm:w-auto">
      {statItems.map((item) => (
        <Button
          key={item.filter}
          variant={currentFilter === item.filter ? "secondary" : "ghost"}
          size="sm"
          className={cn(
              "w-full justify-start sm:w-auto sm:justify-center transition-all duration-200 rounded-md",
              currentFilter === item.filter && "shadow-sm"
          )}
          onClick={() => onFilterChange(item.filter)}
        >
          <item.icon className="mr-2 h-4 w-4" />
          {item.title}
          <span className={cn(
            "ml-2 text-xs font-semibold rounded-full px-2 py-0.5",
            currentFilter === item.filter
              ? "bg-primary/20 text-primary"
              : "bg-muted-foreground/10 text-muted-foreground"
          )}>
            {item.value}
          </span>
        </Button>
      ))}
    </div>
  );
}
