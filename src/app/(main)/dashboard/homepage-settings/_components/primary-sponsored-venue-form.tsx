"use client";

import * as React from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useVenues } from "@/hooks/use-venues";

import { primarySponsoredVenueSchema, type PrimarySponsoredVenueFormValues } from "./schema";

// Video Upload Box Component
interface VideoUploadBoxProps {
  accept?: string;
  onChange: (file: File | null) => void;
}

function VideoUploadBox({ accept = "video/*", onChange }: VideoUploadBoxProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file) {
      onChange(file);
      // Reset input so same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <>
      <input ref={fileInputRef} type="file" accept={accept} onChange={handleFileChange} className="hidden" />
      <button
        type="button"
        onClick={handleClick}
        className="hover:border-primary focus-visible:ring-ring group flex h-[180px] w-[275px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none dark:border-gray-700 dark:bg-gray-900"
      >
        <div className="text-muted-foreground group-hover:text-primary flex flex-col items-center gap-2 transition-colors">
          <Plus className="h-8 w-8" />
          <span className="text-sm font-medium">Click to upload</span>
          <span className="text-xs">or drag and drop</span>
        </div>
      </button>
    </>
  );
}

export function PrimarySponsoredVenueForm() {
  const { data: venuesData, isLoading } = useVenues();
  const venues = venuesData?.data ?? [];
  const [videoPreview, setVideoPreview] = React.useState<string>("");
  const videoRef = React.useRef<HTMLVideoElement>(null);

  const form = useForm<PrimarySponsoredVenueFormValues>({
    resolver: zodResolver(primarySponsoredVenueSchema),
    defaultValues: {
      venueId: "",
      video: undefined,
    },
  });

  const handleVideoChange = (file: File | null) => {
    if (file) {
      // Validate video file type
      if (!file.type.startsWith("video/")) {
        toast.error("Please select a valid video file");
        return;
      }

      // Clean up previous URL if exists
      if (videoPreview) {
        URL.revokeObjectURL(videoPreview);
      }

      // Use URL.createObjectURL instead of FileReader for better video support
      const videoUrl = URL.createObjectURL(file);
      setVideoPreview(videoUrl);
      form.setValue("video", file);
    }
  };

  const handleRemoveVideo = () => {
    // Clean up object URL
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }
    setVideoPreview("");
    form.setValue("video", undefined);
  };

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (videoPreview) {
        URL.revokeObjectURL(videoPreview);
      }
    };
  }, [videoPreview]);

  const onSubmit = async (data: PrimarySponsoredVenueFormValues) => {
    try {
      // TODO: Implement API call to save primary sponsored venue settings
      console.log("Primary Sponsored Venue data:", data);
      toast.success("Primary sponsored venue settings saved successfully");
    } catch (error) {
      toast.error("Failed to save primary sponsored venue settings");
      console.error(error);
    }
  };

  const selectedVenueId = form.watch("venueId");
  const selectedVenue = venues.find((venue) => venue.id === selectedVenueId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Primary Sponsored Venue</CardTitle>
        <CardDescription>Select a venue and upload its promotional video</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="venueId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Venue</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                    <FormControl>
                      <SelectTrigger className="cursor-pointer">
                        <SelectValue placeholder={isLoading ? "Loading venues..." : "Select a venue"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {venues.map((venue) => (
                        <SelectItem key={venue.id} value={venue.id} className="cursor-pointer">
                          {venue.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedVenue && (
                    <p className="text-muted-foreground text-sm">
                      Selected: <span className="font-medium">{selectedVenue.name}</span>
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="video"
              render={() => (
                <FormItem>
                  <FormLabel>Venue Video</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      {videoPreview ? (
                        <div className="relative h-[180px] w-[275px] overflow-hidden rounded-md border-2 bg-black">
                          <video
                            ref={videoRef}
                            key={videoPreview}
                            src={videoPreview}
                            controls
                            className="h-full w-full object-contain"
                            preload="metadata"
                            playsInline
                            onLoadedMetadata={() => {
                              if (videoRef.current) {
                                videoRef.current.currentTime = 0;
                              }
                            }}
                          >
                            Your browser does not support the video tag.
                          </video>
                          <button
                            type="button"
                            onClick={handleRemoveVideo}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 absolute top-2 right-2 z-10 cursor-pointer rounded-full p-1.5 shadow-md"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <VideoUploadBox accept="video/*" onChange={handleVideoChange} />
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="cursor-pointer">
              Save Primary Sponsored Venue
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
