/**
 * Global Axios Instance
 * Pre-configured with base URL and authentication
 */

import axios from "axios";
import { getSession, signOut } from "next-auth/react";

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 seconds
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const session = await getSession();
      if (session?.accessToken) {
        config.headers.Authorization = `Bearer ${session.accessToken}`;
      }
    } catch (error) {
      console.error("Error getting session:", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Unauthorized - token expired or invalid
      console.error("Unauthorized access - token expired, logging out...");

      // Clear localStorage
      if (typeof window !== "undefined") {
        localStorage.clear();
      }

      // Sign out and redirect to login
      await signOut({
        callbackUrl: "/auth/login",
        redirect: true,
      });

      return Promise.reject(error);
    } else if (error.response?.status === 403) {
      // Forbidden
      console.error("Access forbidden");
    } else if (error.response?.status === 500) {
      // Server error
      console.error("Server error occurred");
    }

    return Promise.reject(error);
  },
);

export default apiClient;
