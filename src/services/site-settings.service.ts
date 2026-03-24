import apiClient from "@/lib/api-client";
import { uploadFile } from "@/lib/upload-utils";
import { SiteSettings, SiteSettingsResponse } from "@/types/site-settings";

type JsonLike = unknown;

export type UpdateSiteSettingsInput = Record<string, JsonLike>;

export const getSiteSettings = async (): Promise<SiteSettings> => {
  const response = await apiClient.get<SiteSettingsResponse>("/site-settings");
  return response.data.data;
};

const resolveUploadsDeep = async (value: JsonLike, folder: string): Promise<JsonLike> => {
  if (value instanceof File) {
    return uploadFile(value, folder);
  }

  if (Array.isArray(value)) {
    const resolved = await Promise.all(value.map((entry) => resolveUploadsDeep(entry, folder)));
    return resolved as JsonLike;
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    const resolvedEntries = await Promise.all(
      entries.map(async ([key, entry]) => [key, await resolveUploadsDeep(entry, folder)] as const),
    );
    return Object.fromEntries(resolvedEntries);
  }

  return value;
};

export const updateSiteSettings = async (data: UpdateSiteSettingsInput): Promise<SiteSettings> => {
  const payload = await resolveUploadsDeep(data, "site-settings");
  const response = await apiClient.put<SiteSettingsResponse>("/site-settings", payload);
  return response.data.data;
};
