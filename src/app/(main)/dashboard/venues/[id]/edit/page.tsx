"use client";

import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useVenues } from "@/hooks/use-venues";

import { VenueForm } from "../../_components/venue-form";

export default function EditVenuePage() {
  const params = useParams();
  const router = useRouter();
  const venueId = params.id as string;
  const { data: venues, isLoading } = useVenues();

  const venue = venues?.find((v) => v.id === venueId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div>Loading venue...</div>
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h2 className="text-2xl font-bold">Venue not found</h2>
        <p className="text-muted-foreground mt-2">The venue you&apos;re looking for doesn&apos;t exist.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Edit Venue</h1>
          <p className="text-muted-foreground mt-1">Update venue details</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.push("/dashboard/venues")}>
            Cancel
          </Button>
          <Button type="submit" form="venue-form">
            Update Venue
          </Button>
        </div>
      </div>
      <VenueForm venue={venue} mode="edit" />
    </div>
  );
}
