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
import { DietaryNeed } from "@/types/dietary-need";

interface DeleteAlertProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dietaryNeed: DietaryNeed | null;
  onConfirm: () => void;
}

export function DeleteAlert({ open, onOpenChange, dietaryNeed, onConfirm }: DeleteAlertProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete dietary need?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the dietary need
            <span className="text-foreground font-semibold">&quot;{dietaryNeed?.name}&quot;</span>.
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
