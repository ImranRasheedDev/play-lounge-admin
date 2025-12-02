"use client";

import * as React from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { VenueType } from "@/types/venue-type";

import { type VenueTypeFormValues, venueTypeFormSchema } from "./schema";

interface VenueTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  venueType?: VenueType | null;
  onSubmit: (data: VenueType) => void;
}

export function VenueTypeDialog({ open, onOpenChange, venueType, onSubmit }: VenueTypeDialogProps) {
  const form = useForm<VenueTypeFormValues>({
    resolver: zodResolver(venueTypeFormSchema),
    defaultValues: {
      name: "",
      isActive: true,
    },
  });

  React.useEffect(() => {
    if (venueType) {
      form.reset({
        name: venueType.name,
        isActive: venueType.isActive ?? true,
      });
    } else {
      form.reset({
        name: "",
        isActive: true,
      });
    }
  }, [venueType, form, open]);

  const onFormSubmit = (data: VenueTypeFormValues) => {
    const payload: VenueType = {
      id: venueType?.id ?? "",
      name: data.name,
      isActive: data.isActive,
      createdAt: venueType?.createdAt ?? new Date().toISOString(),
    };

    onSubmit(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>{venueType ? "Edit Venue Type" : "Add Venue Type"}</DialogTitle>
          <DialogDescription>
            {venueType ? "Update the venue type name." : "Create a new venue type that can be assigned to venues."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter venue type" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Active Status</FormLabel>
                    <div className="text-muted-foreground text-sm">Enable or disable this venue type</div>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="cursor-pointer">
                Cancel
              </Button>
              <Button type="submit" className="cursor-pointer">
                {venueType ? "Save changes" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
