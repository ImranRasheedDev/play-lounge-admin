import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";

import { getSiteSettings, updateSiteSettings, UpdateSiteSettingsInput } from "@/services/site-settings.service";

const QUERY_KEY = ["site-settings"];

export const useSiteSettings = () => {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: getSiteSettings,
    refetchOnWindowFocus: false,
    staleTime: 0,
  });
};

export const useUpdateSiteSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateSiteSettingsInput) => updateSiteSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Site settings updated successfully");
    },
    onError: (error: AxiosError<{ message?: string }> | Error) => {
      const message = axios.isAxiosError<{ message?: string }>(error)
        ? (error.response?.data?.message ?? error.message ?? "Failed to update site settings")
        : (error.message ?? "Failed to update site settings");
      toast.error(message);
    },
  });
};
