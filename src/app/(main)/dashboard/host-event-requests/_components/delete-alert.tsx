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
import { HostEventRequest } from "@/types/host-event-request";

interface DeleteAlertProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: HostEventRequest | null;
  onConfirm: () => void;
}

export function DeleteAlert({ open, onOpenChange, request, onConfirm }: DeleteAlertProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Host Event Request</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this request from {request?.name ?? "this user"}? This action cannot be
            undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-destructive text-destructive-foreground cursor-pointer">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
