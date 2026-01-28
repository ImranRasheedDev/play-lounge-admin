// File size limits in bytes
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB
const MAX_IMAGE_SIZE = 20 * 1024 * 1024; // 20MB

/**
 * Upload a file to S3 via the API route
 * @param file - File to upload
 * @param folder - Folder path (e.g., 'categories/images' or 'categories/icons')
 * @returns Public URL of the uploaded file
 */
export async function uploadFile(file: File, folder: string): Promise<string> {
  // Validate file object
  if (!file || !(file instanceof File)) {
    throw new Error("Invalid file object provided");
  }

  if (!file.size || file.size === 0) {
    throw new Error("File is empty");
  }

  if (!file.type) {
    throw new Error("File type is missing");
  }

  // Check file size BEFORE uploading
  const isVideo = file.type.startsWith("video/");
  const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
  const maxSizeMB = maxSize / (1024 * 1024);

  if (file.size > maxSize) {
    throw new Error(`File size exceeds ${maxSizeMB}MB limit. Please choose a smaller file.`);
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error ?? `Upload failed with status ${response.status}`);
  }

  const data = await response.json();
  return data.url;
}
