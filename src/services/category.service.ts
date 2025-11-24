import apiClient from "@/lib/api-client";
import { Category } from "@/types/category";

export interface CategoryResponse {
  status: boolean;
  message: string;
  data: Category[];
}

export interface CategoryCreateInput {
  title: string;
  slug: string;
  image: File;
  icon: File;
}

export interface CategoryUpdateInput {
  title: string;
  slug: string;
  image?: File;
  icon?: File;
  isActive: boolean;
}

// Get all categories
export const getCategories = async (): Promise<Category[]> => {
  const response = await apiClient.get<CategoryResponse>("/categories/all");
  return response.data.data;
};

// Create a new category
export const createCategory = async (data: CategoryCreateInput): Promise<Category> => {
  const formData = new FormData();
  formData.append("title", data.title);
  formData.append("slug", data.slug);
  formData.append("image", data.image);
  formData.append("icon", data.icon);

  const response = await apiClient.post<{ data: Category }>("/categories", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data.data;
};

// Update an existing category
export const updateCategory = async (id: string, data: CategoryUpdateInput): Promise<Category> => {
  const formData = new FormData();
  formData.append("title", data.title);
  formData.append("slug", data.slug);
  formData.append("isActive", data.isActive.toString());

  if (data.image) {
    formData.append("image", data.image);
  }
  if (data.icon) {
    formData.append("icon", data.icon);
  }

  const response = await apiClient.patch<{ data: Category }>(`/categories/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data.data;
};

// Delete a category
export const deleteCategory = async (id: string): Promise<void> => {
  await apiClient.delete(`/categories/${id}`);
};
