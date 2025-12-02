"use client";

import * as React from "react";

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
import { VenueType } from "@/types/venue-type";

interface DeleteAlertProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  venueType: VenueType | null;
  onConfirm: () => void;
}

export function DeleteAlert({ open, onOpenChange, venueType, onConfirm }: DeleteAlertProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete venue type?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the venue type
            <span className="text-foreground font-semibold">&quot;{venueType?.name}&quot;</span>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
