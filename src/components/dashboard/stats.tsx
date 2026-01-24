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
      title: "All Properties",
      value: stats.pending + stats.verified + stats.rejected,
      icon: Globe,
      filter: "all" as PropertyStatusFilter,
      activeColor: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Pending Verification",
      value: stats.pending,
      icon: Clock,
      filter: "pending" as PropertyStatusFilter,
      activeColor: "text-amber-600 dark:text-amber-500",
      bgColor: "bg-amber-100/50 dark:bg-amber-500/10",
    },
    {
      title: "Verified",
      value: stats.verified,
      icon: CheckCircle,
      filter: "verified" as PropertyStatusFilter,
      activeColor: "text-green-600 dark:text-green-500",
      bgColor: "bg-green-100/50 dark:bg-green-500/10",
    },
    {
      title: "Rejected",
      value: stats.rejected,
      icon: XCircle,
      filter: "rejected" as PropertyStatusFilter,
      activeColor: "text-red-600 dark:text-red-500",
      bgColor: "bg-red-100/50 dark:bg-red-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fadeIn">
      {statItems.map((item, index) => (
        <Button
          key={item.title}
          variant="ghost"
          className={cn(
            "h-auto p-6 flex flex-col items-start text-left hover-lift transition-smooth animate-fadeInUp",
            currentFilter === item.filter
              ? `${item.bgColor} ${item.activeColor} shadow-lg border-2 border-current`
              : "bg-card hover:bg-card/80 text-muted-foreground border border-border"
          )}
          onClick={() => onFilterChange(item.filter)}
          style={{animationDelay: `${index * 100}ms`}}
        >
          <div className="flex items-center justify-between w-full mb-3">
            <item.icon className={cn("h-8 w-8", currentFilter === item.filter ? item.activeColor : "text-muted-foreground")} />
            <span
              className={cn(
                "text-3xl font-bold",
                currentFilter === item.filter ? item.activeColor : "text-foreground"
              )}
            >
              {item.value}
            </span>
          </div>
          <span className={cn(
            "text-sm font-semibold",
            currentFilter === item.filter ? item.activeColor : "text-muted-foreground"
          )}>
            {item.title}
          </span>
        </Button>
      ))}
    </div>
  );
}
