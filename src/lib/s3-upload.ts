import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION ?? "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
  },
});

/**
 * Upload a file to S3
 * @param file - File to upload
 * @param folder - Folder path in S3 bucket (e.g., 'categories/images' or 'categories/icons')
 * @returns Public URL of the uploaded file
 */
export async function uploadFileToS3(file: File, folder: string): Promise<string> {
  if (!process.env.AWS_S3_BUCKET_NAME) {
    throw new Error("AWS_S3_BUCKET_NAME is not configured");
  }

  // Generate unique filename
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const fileExtension = file.name.split(".").pop();
  const fileName = `${timestamp}-${randomString}.${fileExtension}`;

  // Construct S3 key (path)
  const key = `${folder}/${fileName}`;

  // Convert File to Buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Upload to S3
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: file.type,
  });

  await s3Client.send(command);

  // Construct and return public URL
  const region = process.env.AWS_REGION ?? "us-east-1";
  const bucketName = process.env.AWS_S3_BUCKET_NAME;

  // URL format: https://{bucket}.s3.{region}.amazonaws.com/{key}
  // Note: If using CloudFront or custom domain, update this accordingly
  const publicUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;

  return publicUrl;
}
