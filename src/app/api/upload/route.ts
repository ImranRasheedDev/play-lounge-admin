import { NextRequest, NextResponse } from "next/server";

import { uploadFileToS3 } from "@/lib/s3-upload";

// Increase body size limit for video uploads (100MB)
export const config = {
  api: {
    bodyParser: {
      sizeLimit: "100mb",
    },
  },
};

// File size limits in bytes
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

// eslint-disable-next-line complexity -- Folder mapping requires multiple conditional checks
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    let folder = formData.get("folder") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!folder) {
      return NextResponse.json({ error: "No folder provided" }, { status: 400 });
    }

    // Check file size based on type
    const isVideo = file.type.startsWith("video/");
    const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
    const maxSizeMB = maxSize / (1024 * 1024);

    if (file.size > maxSize) {
      return NextResponse.json({ error: `File size exceeds the maximum limit of ${maxSizeMB}MB` }, { status: 400 });
    }

    // Map folder names to environment variables if they exist
    if (folder === "categories/images" && process.env.AWS_S3_CATEGORIES_IMAGE_PATH) {
      folder = process.env.AWS_S3_CATEGORIES_IMAGE_PATH;
    } else if (folder === "categories/icons" && process.env.AWS_S3_CATEGORIES_ICON_PATH) {
      folder = process.env.AWS_S3_CATEGORIES_ICON_PATH;
    } else if (folder === "venues/thumbnails" && process.env.AWS_S3_VENUES_THUMBNAIL_PATH) {
      folder = process.env.AWS_S3_VENUES_THUMBNAIL_PATH;
    } else if (folder === "venues/images" && process.env.AWS_S3_VENUES_IMAGES_PATH) {
      folder = process.env.AWS_S3_VENUES_IMAGES_PATH;
    } else if (folder === "venues/experiences" && process.env.AWS_S3_VENUES_EXPERIENCES_PATH) {
      folder = process.env.AWS_S3_VENUES_EXPERIENCES_PATH;
    } else if (folder === "venues/videos" && process.env.AWS_S3_VENUES_VIDEOS_PATH) {
      folder = process.env.AWS_S3_VENUES_VIDEOS_PATH;
    } else if (folder === "users/avatars" && process.env.AWS_S3_USERS_AVATARS_PATH) {
      folder = process.env.AWS_S3_USERS_AVATARS_PATH;
    }

    // Upload file to S3
    const publicUrl = await uploadFileToS3(file, folder);

    return NextResponse.json({
      success: true,
      url: publicUrl,
    });
  } catch (error) {
    console.error("Error uploading file to S3:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to upload file" },
      { status: 500 },
    );
  }
}
