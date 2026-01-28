"use client";

import * as React from "react";

import Image from "next/image";

import { zodResolver } from "@hookform/resolvers/zod";
import { Star } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
import { Textarea } from "@/components/ui/textarea";
import { Review, ReviewCreateInput } from "@/types/review";

const reviewFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  location: z.string().min(1, "Location is required"),
  rating: z.number().min(1).max(5),
  text: z.string().min(10, "Review must be at least 10 characters"),
  isActive: z.boolean(),
});

type ReviewFormValues = z.infer<typeof reviewFormSchema>;

interface ReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  review?: Review | null;
  onSubmit: (data: ReviewCreateInput, avatarFile?: File | null) => void;
  isLoading?: boolean;
}

export function ReviewDialog({ open, onOpenChange, review, onSubmit, isLoading }: ReviewDialogProps) {
  const [avatarPreview, setAvatarPreview] = React.useState<string>("");
  const [avatarFile, setAvatarFile] = React.useState<File | null>(null);
  const [hoverRating, setHoverRating] = React.useState<number>(0);

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      name: "",
      location: "",
      rating: 5,
      text: "",
      isActive: true,
    },
  });

  React.useEffect(() => {
    if (review) {
      form.reset({
        name: review.name,
        location: review.location,
        rating: review.rating,
        text: review.text,
        isActive: review.isActive ?? true,
      });

      if (review.avatar) {
        const avatarUrl = review.avatar.startsWith("http")
          ? review.avatar
          : `${process.env.NEXT_PUBLIC_API_URL}${review.avatar}`;
        setAvatarPreview(avatarUrl);
      }
    } else {
      form.reset({
        name: "",
        location: "",
        rating: 5,
        text: "",
        isActive: true,
      });
      setAvatarPreview("");
      setAvatarFile(null);
    }
  }, [review, form, open]);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onFormSubmit = (data: ReviewFormValues) => {
    const reviewData: ReviewCreateInput = {
      name: data.name,
      location: data.location,
      rating: data.rating,
      text: data.text,
      isActive: data.isActive,
      avatar: avatarFile ?? review?.avatar,
    };

    onSubmit(reviewData, avatarFile);
  };

  const currentRating = form.watch("rating");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{review ? "Edit Review" : "Create Review"}</DialogTitle>
          <DialogDescription>
            {review ? "Update the review details below." : "Add a new customer review."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center gap-2">
                <div className="relative size-20 overflow-hidden rounded-full border">
                  {avatarPreview ? (
                    <Image src={avatarPreview} alt="Avatar preview" fill className="object-cover" unoptimized />
                  ) : (
                    <div className="bg-muted flex size-full items-center justify-center">
                      <span className="text-muted-foreground text-2xl">
                        {form.watch("name")?.charAt(0)?.toUpperCase() ?? "?"}
                      </span>
                    </div>
                  )}
                </div>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="w-[100px] cursor-pointer text-xs"
                />
              </div>

              <div className="flex-1 space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="New York, NY" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rating</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          className="cursor-pointer p-0.5"
                          onMouseEnter={() => setHoverRating(i + 1)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => field.onChange(i + 1)}
                        >
                          <Star
                            className={`size-6 transition-colors ${
                              i < (hoverRating || currentRating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                            }`}
                          />
                        </button>
                      ))}
                      <span className="text-muted-foreground ml-2 text-sm">{currentRating} out of 5</span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Review Text</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Write the review content..."
                      className="min-h-[100px] resize-none"
                      {...field}
                    />
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
                    <div className="text-muted-foreground text-sm">Show this review on the homepage</div>
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
              <Button type="submit" disabled={isLoading} className="cursor-pointer">
                {review ? "Update Review" : "Create Review"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
