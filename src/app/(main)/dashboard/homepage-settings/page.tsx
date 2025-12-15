"use client";

import { BannerForm } from "./_components/banner-form";
import { EventConciergeForm } from "./_components/event-concierge-form";
import { HomepageCardsForm } from "./_components/homepage-cards-form";
import { PrimarySponsoredVenueForm } from "./_components/primary-sponsored-venue-form";

export default function HomepageSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Homepage Settings</h1>
        <p className="text-muted-foreground text-sm">Manage your homepage content and settings</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <BannerForm />
        <PrimarySponsoredVenueForm />
        <HomepageCardsForm />
        <EventConciergeForm />
      </div>
    </div>
  );
}
