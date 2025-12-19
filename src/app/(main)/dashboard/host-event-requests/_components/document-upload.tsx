"use client";

import * as React from "react";

import { FileText, Image, Trash2, Upload, File } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { uploadFile } from "@/lib/upload-utils";
import { EventRequestDocument } from "@/types/host-event-request";

// Accepted MIME types
const ACCEPTED_TYPES: Record<string, string[]> = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/gif": [".gif"],
  "image/webp": [".webp"],
  "application/pdf": [".pdf"],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES = 10;

interface DocumentUploadProps {
  documents: EventRequestDocument[];
  onDocumentsChange: (documents: EventRequestDocument[]) => void;
  disabled?: boolean;
}

export function DocumentUpload({ documents, onDocumentsChange, disabled }: DocumentUploadProps) {
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // File validation
  const validateFile = (file: File): string | null => {
    if (!Object.keys(ACCEPTED_TYPES).includes(file.type)) {
      return `${file.name}: Invalid file type. Allowed: images, PDF, DOC, DOCX`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `${file.name}: File size exceeds 10MB limit`;
    }
    return null;
  };

  // Handle file selection
  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const remainingSlots = MAX_FILES - documents.length;
    if (remainingSlots <= 0) {
      toast.error("Maximum 10 documents allowed");
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);

    // Validate all files first
    const errors: string[] = [];
    filesToUpload.forEach((file) => {
      const error = validateFile(file);
      if (error) errors.push(error);
    });

    if (errors.length > 0) {
      errors.forEach((err) => toast.error(err));
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const newDocuments: EventRequestDocument[] = [];

      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i];
        const url = await uploadFile(file, "host-event-requests/documents");

        newDocuments.push({
          url,
          filename: file.name,
          mimeType: file.type,
          size: file.size,
          uploadedAt: new Date().toISOString(),
        });

        setUploadProgress(((i + 1) / filesToUpload.length) * 100);
      }

      onDocumentsChange([...documents, ...newDocuments]);
      toast.success(`${newDocuments.length} document(s) uploaded successfully`);
    } catch (error) {
      toast.error("Failed to upload documents");
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Handle document removal
  const handleRemoveDocument = (index: number) => {
    const newDocuments = documents.filter((_, i) => i !== index);
    onDocumentsChange(newDocuments);
  };

  // Get file icon based on type
  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return <Image className="h-5 w-5 text-green-500" />;
    if (mimeType === "application/pdf") return <FileText className="h-5 w-5 text-red-500" />;
    return <File className="h-5 w-5 text-blue-500" />;
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div className="space-y-2">
        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx"
          multiple
          onChange={(e) => handleFileSelect(e.target.files)}
          disabled={(disabled ?? false) || isUploading || documents.length >= MAX_FILES}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={(disabled ?? false) || isUploading || documents.length >= MAX_FILES}
          className="hover:border-primary flex w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
        >
          <Upload className="mb-2 h-8 w-8 text-gray-400" />
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Click to upload documents</p>
          <p className="text-xs text-gray-500">
            Images, PDF, DOC, DOCX (max 10MB each, {MAX_FILES - documents.length} slots remaining)
          </p>
        </button>

        {isUploading && (
          <div className="space-y-1">
            <Progress value={uploadProgress} className="h-2" />
            <p className="text-center text-xs text-gray-500">Uploading... {Math.round(uploadProgress)}%</p>
          </div>
        )}
      </div>

      {/* Document List */}
      {documents.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">
            Uploaded Documents ({documents.length}/{MAX_FILES})
          </p>
          <div className="divide-y rounded-lg border">
            {documents.map((doc, index) => (
              <div key={index} className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3">
                  {getFileIcon(doc.mimeType)}
                  <div className="min-w-0 flex-1">
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block truncate text-sm font-medium hover:underline"
                    >
                      {doc.filename}
                    </a>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(doc.size)} - {new Date(doc.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveDocument(index)}
                  disabled={disabled}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
