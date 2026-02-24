"use client";

import { SiteSettingsForm } from "./_components/site-settings-form";

export default function SiteSettingsPage() {
  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Site Settings</h1>
      </div>
      <SiteSettingsForm />
    </div>
  );
}
