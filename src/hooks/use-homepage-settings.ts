import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

import {
  getHomepageSettings,
  updateHomepageSettings,
  UpdateHomepageSettingsInput,
} from "@/services/homepage-settings.service";

const QUERY_KEY = ["homepage-settings"];

export const useHomepageSettings = () => {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: getHomepageSettings,
    refetchOnWindowFocus: false,
    staleTime: 0,
  });
};

export const useUpdateHomepageSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateHomepageSettingsInput) => updateHomepageSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Homepage settings updated successfully");
    },
    onError: (error: AxiosError<{ message?: string }> | Error) => {
      // Handle both Axios errors and regular errors (like file upload errors)
      const message =
        (error as AxiosError<{ message?: string }>).response?.data?.message ??
        error.message ??
        "Failed to update homepage settings";
      toast.error(message);
    },
  });
};
