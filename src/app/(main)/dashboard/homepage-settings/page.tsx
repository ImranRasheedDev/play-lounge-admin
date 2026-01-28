"use client";

import { HomepageSettingsForm } from "./_components/homepage-settings-form";

export default function HomepageSettingsPage() {
  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Homepage Settings</h1>
      </div>
      <HomepageSettingsForm />
    </div>
  );
}
