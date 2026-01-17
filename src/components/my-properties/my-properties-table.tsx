"use client";

import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Building2 } from "lucide-react";
import type { Property } from "@/lib/types";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface MyPropertiesTableProps {
  properties: Property[];
}

export function MyPropertiesTable({ properties }: MyPropertiesTableProps) {
  const router = useRouter();

  const handleRowClick = (parcelId: string) => {
    router.push(`/property/${parcelId}`);
  };
  
  const getStatusVariant = (status: Property['status']) => {
    switch (status) {
      case 'verified':
        return 'secondary';
      case 'rejected':
        return 'destructive';
      case 'unverified':
      default:
        return 'default';
    }
  };

  if (properties.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center text-center py-20 bg-card/50 rounded-2xl border-2 border-dashed">
            <div className="bg-secondary p-4 rounded-full mb-6">
                <Building2 className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-semibold text-foreground font-headline">
                No properties match your filters.
            </h3>
            <p className="text-muted-foreground mt-2 max-w-md">
                Try adjusting your search or filter settings, or add a new property.
            </p>
        </div>
    );
  }

  return (
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Property</TableHead>
              <TableHead className="hidden sm:table-cell">Location</TableHead>
              <TableHead className="hidden md:table-cell">Area</TableHead>
              <TableHead className="text-center hidden sm:table-cell">Registered</TableHead>
              <TableHead className="text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {properties.map((prop) => (
              <TableRow
                key={prop.parcelId}
                onClick={() => handleRowClick(prop.parcelId)}
                className="cursor-pointer"
              >
                <TableCell className="font-medium">{prop.title}</TableCell>
                <TableCell className="hidden sm:table-cell">{prop.location}</TableCell>
                <TableCell className="hidden md:table-cell">{prop.area}</TableCell>
                <TableCell className="text-center hidden sm:table-cell">
                    {prop.registeredAt ? format(prop.registeredAt.toDate(), "dd MMM yyyy") : 'N/A'}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={getStatusVariant(prop.status)}>{prop.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
  );
}
