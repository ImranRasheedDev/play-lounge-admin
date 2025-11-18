"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

import { VenueForm } from "../_components/venue-form";

export default function NewVenuePage() {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Create New Venue</h1>
          <p className="text-muted-foreground mt-1">Add a new venue to your system</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.push("/dashboard/venues")}>
            Cancel
          </Button>
          <Button type="submit" form="venue-form">
            Create Venue
          </Button>
        </div>
      </div>
      <VenueForm mode="create" />
    </div>
  );
}
