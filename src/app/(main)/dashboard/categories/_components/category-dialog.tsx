"use client";

import * as React from "react";

import Image from "next/image";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

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
import { Category } from "@/types/category";

import { categoryFormSchema, type CategoryFormValues } from "./schema";

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category | null;
  onSubmit: (data: Category, iconFile?: File | null, imageFile?: File | null) => void;
}

export function CategoryDialog({ open, onOpenChange, category, onSubmit }: CategoryDialogProps) {
  const [imagePreview, setImagePreview] = React.useState<string>("");
  const [iconPreview, setIconPreview] = React.useState<string>("");
  const [iconFileState, setIconFileState] = React.useState<File | null>(null);
  const [imageFileState, setImageFileState] = React.useState<File | null>(null);

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      title: "",
      icon: undefined,
      image: undefined,
      isActive: true,
      isFeatured: false,
    },
  });

  const watchedTitle = form.watch("title");

  // eslint-disable-next-line complexity -- useEffect with category logic has necessary complexity
  React.useEffect(() => {
    if (category) {
      const iconValue = category.icon ?? "";
      const imageValue = category.image ?? "";

      form.reset({
        title: category.title,
        icon: iconValue,
        image: imageValue,
        isActive: category.isActive ?? true,
        isFeatured: category.isFeatured ?? false,
      });

      // For existing categories, set preview from backend URL
      if (imageValue) {
        const imageUrl = imageValue.startsWith("http") ? imageValue : `${process.env.NEXT_PUBLIC_API_URL}${imageValue}`;
        setImagePreview(imageUrl);
      }

      if (iconValue) {
        const iconUrl =
          iconValue.startsWith("http") || iconValue.startsWith("data:image/")
            ? iconValue
            : `${process.env.NEXT_PUBLIC_API_URL}${iconValue}`;
        setIconPreview(iconUrl);
      }
    } else {
      form.reset({
        title: "",
        icon: undefined,
        image: undefined,
        isActive: true,
        isFeatured: false,
      });
      setImagePreview("");
      setIconPreview("");
      setIconFileState(null);
      setImageFileState(null);
    }
  }, [category, form, open]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFileState(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleIconChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!["image/svg+xml", "image/png"].includes(file.type)) {
        toast.error("Only SVG or PNG icons are supported.");
        return;
      }
      setIconFileState(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setIconPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setIconPreview("");
      setIconFileState(null);
    }
  };

  // eslint-disable-next-line complexity -- Form submission logic is inherently complex
  const onFormSubmit = (data: CategoryFormValues) => {
    // Generate slug from title
    const slug = data.title.toLowerCase().replace(/\s+/g, "-");

    // Generate unique ID for new categories
    const id = category?.id ?? `cat-${Date.now()}`;

    // Prepare image (use preview if new file, otherwise existing)
    const imageUrl = imagePreview || (category?.image ?? "");
    const iconValue =
      data.icon instanceof File ? iconPreview : typeof data.icon === "string" ? data.icon : (category?.icon ?? "");

    const categoryData: Category = {
      id,
      title: data.title,
      slug,
      image: imageUrl,
      icon: iconValue,
      isActive: data.isActive,
      isFeatured: data.isFeatured,
      createdAt: category?.createdAt ?? new Date().toISOString(),
    };

    onSubmit(categoryData, iconFileState, imageFileState);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{category ? "Edit Category" : "Create Category"}</DialogTitle>
          <DialogDescription>
            {category ? "Update category details below." : "Add a new category to your system."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter category title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Icon (SVG or PNG)</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <Input
                        type="file"
                        accept=".svg,.png"
                        onChange={(event) => {
                          handleIconChange(event);
                          field.onChange(event.target.files?.[0] ?? undefined);
                        }}
                        className="cursor-pointer"
                      />
                      {iconPreview && (
                        <div className="bg-muted/40 relative size-16 overflow-hidden rounded-md border">
                          <Image src={iconPreview} alt="Icon preview" fill className="object-contain p-3" unoptimized />
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          handleImageChange(e);
                          field.onChange(e.target.files?.[0] ?? undefined);
                        }}
                        className="cursor-pointer"
                      />
                      {imagePreview && (
                        <div className="relative size-32 overflow-hidden rounded-md border">
                          <Image src={imagePreview} alt="Preview" fill className="object-cover" unoptimized />
                        </div>
                      )}
                    </div>
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
                    <div className="text-muted-foreground text-sm">Enable or disable this category</div>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isFeatured"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Featured</FormLabel>
                    <div className="text-muted-foreground text-sm">Mark this category as featured on home page</div>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>Slug (Auto-generated)</FormLabel>
              <Input
                value={watchedTitle ? watchedTitle.toLowerCase().replace(/\s+/g, "-") : ""}
                disabled
                className="bg-muted"
              />
            </FormItem>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="cursor-pointer">
                Cancel
              </Button>
              <Button type="submit" className="cursor-pointer">
                {category ? "Update Category" : "Create Category"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
