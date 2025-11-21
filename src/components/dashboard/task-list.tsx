
"use client";

import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Loader2, Search } from "lucide-react";
import type { Property } from "@/lib/types";
import { PropertyStatusFilter } from "@/app/dashboard/page";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Badge } from "../ui/badge";

interface TaskListProps {
  properties: Property[];
  selectedProperty: Property | null;
  onSelectProperty: (property: Property) => void;
  filter: PropertyStatusFilter;
  onFilterChange: (filter: PropertyStatusFilter) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  isLoading: boolean;
}

export function TaskList({
  properties,
  selectedProperty,
  onSelectProperty,
  filter,
  onFilterChange,
  searchTerm,
  onSearchChange,
  isLoading
}: TaskListProps) {
    
  return (
    <Card className="h-full flex flex-col shadow-lg">
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filter by Parcel ID or Owner..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
      <ScrollArea className="flex-grow">
        <div className="p-2 space-y-1">
          {isLoading && properties.length === 0 ? (
             <div className="flex items-center justify-center p-16 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mr-3"/>
                <span>Loading...</span>
            </div>
          ) : properties.length > 0 ? (
            properties.map((prop) => (
              <button
                key={prop.parcelId}
                onClick={() => onSelectProperty(prop)}
                className={cn(
                  "w-full text-left p-3 rounded-lg transition-colors",
                  selectedProperty?.parcelId === prop.parcelId
                    ? "bg-primary/10"
                    : "hover:bg-muted"
                )}
              >
                <div className="flex justify-between items-start">
                    <p className="font-semibold text-sm line-clamp-1">{prop.title}</p>
                     <Badge variant="secondary" className="text-xs shrink-0">{prop.parcelId.substring(0, 10)}...</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1 truncate">{prop.owner}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {prop.registeredAt ? format(prop.registeredAt.toDate(), "dd MMM, yyyy") : 'N/A'}
                </p>
              </button>
            ))
          ) : (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No properties match your filter.</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}
