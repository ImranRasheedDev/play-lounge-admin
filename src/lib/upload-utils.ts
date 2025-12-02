/**
 * Upload a file to S3 via the API route
 * @param file - File to upload
 * @param folder - Folder path (e.g., 'categories/images' or 'categories/icons')
 * @returns Public URL of the uploaded file
 */
export async function uploadFile(file: File, folder: string): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error ?? "Failed to upload file");
  }

  const data = await response.json();
  return data.url;
}
