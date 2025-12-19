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
import { DietaryNeed } from "@/types/dietary-need";

import { type DietaryNeedFormValues, dietaryNeedFormSchema } from "./schema";

interface DietaryNeedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dietaryNeed?: DietaryNeed | null;
  onSubmit: (data: DietaryNeed) => void;
}

export function DietaryNeedDialog({ open, onOpenChange, dietaryNeed, onSubmit }: DietaryNeedDialogProps) {
  const form = useForm<DietaryNeedFormValues>({
    resolver: zodResolver(dietaryNeedFormSchema),
    defaultValues: {
      name: "",
      isActive: true,
    },
  });

  React.useEffect(() => {
    if (dietaryNeed) {
      form.reset({
        name: dietaryNeed.name,
        isActive: dietaryNeed.isActive ?? true,
      });
    } else {
      form.reset({
        name: "",
        isActive: true,
      });
    }
  }, [dietaryNeed, form, open]);

  const onFormSubmit = (data: DietaryNeedFormValues) => {
    const payload: DietaryNeed = {
      id: dietaryNeed?.id ?? "",
      name: data.name,
      isActive: data.isActive,
      createdAt: dietaryNeed?.createdAt ?? new Date().toISOString(),
    };

    onSubmit(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>{dietaryNeed ? "Edit Dietary Need" : "Add Dietary Need"}</DialogTitle>
          <DialogDescription>
            {dietaryNeed
              ? "Update the dietary need name."
              : "Create a new dietary need that can be assigned to guests."}
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
                    <Input placeholder="Enter dietary need (e.g., Vegetarian, Gluten-Free)" {...field} />
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
                    <div className="text-muted-foreground text-sm">Enable or disable this dietary need</div>
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
                {dietaryNeed ? "Save changes" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
