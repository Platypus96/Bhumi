"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFirebase } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Trash2, Loader2, Building2 } from "lucide-react";
import type { Property } from "@/lib/types";
import { deletePropertyFromDb } from "@/lib/data";
import { format } from "date-fns";

interface PropertiesTableProps {
  properties: Property[];
}

export function PropertiesTable({ properties }: PropertiesTableProps) {
  const router = useRouter();
  const { firestore } = useFirebase();
  const { toast } = useToast();

  const [isDeleting, setIsDeleting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  const handleRowClick = (parcelId: string) => {
    router.push(`/dashboard/${parcelId}`);
  };

  const openDeleteDialog = (property: Property, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click event
    setSelectedProperty(property);
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedProperty || !firestore) return;

    setIsDeleting(true);
    try {
      await deletePropertyFromDb(firestore, selectedProperty.parcelId);
      toast({
        title: "Property Deleted",
        description: `Property "${selectedProperty.title}" has been permanently removed.`,
      });
      setDialogOpen(false);
      setSelectedProperty(null);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Deletion Failed",
        description: error.message || "Could not delete the property.",
      });
    } finally {
      setIsDeleting(false);
    }
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
                No properties match your filter.
            </h3>
            <p className="text-muted-foreground mt-2 max-w-md">
                Try adjusting your search or filter settings.
            </p>
        </div>
    );
  }

  return (
    <>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Property</TableHead>
              <TableHead className="hidden sm:table-cell">Owner</TableHead>
              <TableHead className="hidden md:table-cell text-center">Registered</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
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
                <TableCell className="font-mono text-xs hidden sm:table-cell">
                  {prop.owner.substring(0, 6)}...{prop.owner.substring(prop.owner.length - 4)}
                </TableCell>
                <TableCell className="text-center hidden md:table-cell">
                    {prop.registeredAt ? format(prop.registeredAt.toDate(), "dd MMM yyyy") : 'N/A'}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={getStatusVariant(prop.status)}>{prop.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => openDeleteDialog(prop, e)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
      
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the property
                    <span className="font-bold"> "{selectedProperty?.title}" </span> 
                    and remove its data from our servers.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                    {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                    Yes, delete property
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
