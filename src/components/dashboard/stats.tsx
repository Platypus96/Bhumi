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
      color: "text-primary",
      borderColor: "border-primary",
      badgeColor: "bg-primary/10 text-primary",
    },
    {
      title: "Pending",
      value: stats.pending,
      filter: "pending" as PropertyStatusFilter,
      icon: Clock,
      color: "text-amber-600 dark:text-amber-400",
      borderColor: "border-amber-600 dark:border-amber-400",
      badgeColor: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
    },
    {
      title: "Verified",
      value: stats.verified,
      filter: "verified" as PropertyStatusFilter,
      icon: CheckCircle,
      color: "text-green-600 dark:text-green-500",
      borderColor: "border-green-600 dark:border-green-500",
      badgeColor: "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300",
    },
    {
      title: "Rejected",
      value: stats.rejected,
      filter: "rejected" as PropertyStatusFilter,
      icon: XCircle,
      color: "text-red-600 dark:text-red-500",
      borderColor: "border-red-600 dark:border-red-500",
      badgeColor: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
    },
  ];

  return (
    <div className="border-b border-border">
      <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
        {statItems.map((item) => (
          <button
            key={item.filter}
            onClick={() => onFilterChange(item.filter)}
            className={cn(
              'group inline-flex shrink-0 items-center whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors',
              currentFilter === item.filter
                ? `${item.borderColor} ${item.color}`
                : 'border-transparent text-muted-foreground hover:border-gray-300 hover:text-foreground'
            )}
          >
            <item.icon className={cn('mr-2 h-5 w-5', currentFilter !== item.filter && 'text-muted-foreground group-hover:text-foreground')} />
            {item.title}
            <span
              className={cn(
                'ml-3 hidden rounded-full py-0.5 px-2.5 text-xs font-medium md:inline-block',
                currentFilter === item.filter
                  ? item.badgeColor
                  : 'bg-muted text-muted-foreground'
              )}
            >
              {item.value}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
}
