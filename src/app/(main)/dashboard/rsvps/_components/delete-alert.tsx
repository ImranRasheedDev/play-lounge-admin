"use client";

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
import { Rsvp } from "@/types/rsvp";

interface DeleteAlertProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rsvp: Rsvp | null;
  onConfirm: () => void;
}

export function DeleteAlert({ open, onOpenChange, rsvp, onConfirm }: DeleteAlertProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete RSVP?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the RSVP for{" "}
            <span className="text-foreground font-semibold">
              {rsvp?.firstName} {rsvp?.lastName}
            </span>{" "}
            ({rsvp?.email}).
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
