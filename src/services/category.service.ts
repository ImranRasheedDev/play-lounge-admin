import apiClient from "@/lib/api-client";
import { uploadFile } from "@/lib/upload-utils";
import { Category } from "@/types/category";
import { PaginationParams, PaginationMeta } from "@/types/pagination";

export interface CategoryResponse {
  status: boolean;
  message: string;
  data: Category[];
  meta: PaginationMeta;
}

export interface CategoryListResult {
  data: Category[];
  meta: PaginationMeta;
}

export interface CategoryCreateInput {
  title: string;
  slug: string;
  image: File;
  icon: File;
  isFeatured: boolean;
}

export interface CategoryUpdateInput {
  title: string;
  slug: string;
  image?: File | string; // Can be File (new) or string (existing URL)
  icon?: File | string; // Can be File (new) or string (existing URL)
  isActive: boolean;
  isFeatured: boolean;
}

// Get all categories with pagination (including inactive)
export const getAllCategories = async (params: PaginationParams): Promise<CategoryListResult> => {
  const response = await apiClient.get<CategoryResponse>("/categories/all", {
    params: { page: params.page, limit: params.limit },
  });
  return { data: response.data.data, meta: response.data.meta };
};

// Get active categories only
export const getActiveCategories = async (): Promise<Category[]> => {
  const response = await apiClient.get<CategoryResponse>("/categories");
  return response.data.data;
};

// Create a new category
export const createCategory = async (data: CategoryCreateInput): Promise<Category> => {
  // Upload files to S3 first
  // API route will map these to env variables if configured
  const [imageUrl, iconUrl] = await Promise.all([
    uploadFile(data.image, "categories/images"),
    uploadFile(data.icon, "categories/icons"),
  ]);

  // Send URLs to backend as JSON
  const response = await apiClient.post<{ data: Category }>(
    "/categories",
    {
      title: data.title,
      slug: data.slug,
      image: imageUrl,
      icon: iconUrl,
      isFeatured: data.isFeatured,
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  return response.data.data;
};

// Update an existing category
export const updateCategory = async (id: string, data: CategoryUpdateInput): Promise<Category> => {
  // Upload new files to S3 if they are File objects
  // API route will map these to env variables if configured
  const uploadPromises: Promise<string | undefined>[] = [];

  if (data.image instanceof File) {
    uploadPromises.push(uploadFile(data.image, "categories/images"));
  } else {
    uploadPromises.push(Promise.resolve(data.image));
  }

  if (data.icon instanceof File) {
    uploadPromises.push(uploadFile(data.icon, "categories/icons"));
  } else {
    uploadPromises.push(Promise.resolve(data.icon));
  }

  const [imageUrl, iconUrl] = await Promise.all(uploadPromises);

  // Prepare update payload
  const payload: {
    title: string;
    slug: string;
    isActive: boolean;
    isFeatured: boolean;
    image?: string;
    icon?: string;
  } = {
    title: data.title,
    slug: data.slug,
    isActive: data.isActive,
    isFeatured: data.isFeatured,
  };

  // Only include image/icon if they were provided
  if (imageUrl) {
    payload.image = imageUrl;
  }
  if (iconUrl) {
    payload.icon = iconUrl;
  }

  // Send URLs to backend as JSON
  const response = await apiClient.patch<{ data: Category }>(`/categories/${id}`, payload, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.data.data;
};

// Delete a category
export const deleteCategory = async (id: string): Promise<void> => {
  await apiClient.delete(`/categories/${id}`);
};
