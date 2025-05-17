import React from "react";
import Uppy, { type UploadResult, UppyFile } from "@uppy/core";
import AwsS3, { type AwsS3UploadParameters } from "@uppy/aws-s3";
import { Dashboard } from "@uppy/react";

// Uppy styles
import "@uppy/core/dist/style.min.css";
import "@uppy/dashboard/dist/style.min.css";

interface StorageBucketData {
  data: {
    fileName: string;
    key: string;
    bucket: string;
    uploadId: string;
    versionId: string;
    etag: string;
    checksumCRC32: string;
    url: string;
    size: number;
    mimeType: string;
    statusUpload: "completed" | "pending" | "failed";
  };
}

interface S3MultipartData {
  key?: string;
  uploadId?: string;
}

interface ExtendedUppyFile extends UppyFile {
  s3Multipart?: S3MultipartData;
  response?: {
    body: Record<string, unknown>;
    status: number;
    uploadURL: string;
  };
  uploadURL?: string;
}

const createStorageBucket = async (data: StorageBucketData): Promise<unknown> => {
  try {
    const response = await fetch('http://localhost:1337/api/storage-buckets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    return await response.json();
  } catch (error) {
    console.error('Error saving to Strapi:', error);
    throw error;
  }
};

export async function getUploadParameters(file: UppyFile): Promise<AwsS3UploadParameters> {
  const response = await fetch("/api/upload", {
    method: "POST",
    headers: {
      accept: "application/json",
    },
    body: JSON.stringify({
      filename: file.name,
      contentType: file.type,
    }),
  });
  if (!response.ok) throw new Error("Unsuccessful request");

  const data = await response.json() as { url: string; method: "PUT" };

  return {
    method: data.method,
    url: data.url,
    fields: {},
    headers: {
      "Content-Type": file.type || "application/octet-stream",
    },
  };
}

export function FileUploader({
  onUploadSuccess,
}: {
  onUploadSuccess: (result: UploadResult) => void;
}): React.ReactElement {
  const uppy = React.useMemo(() => {
    return new Uppy({
      autoProceed: true,
      restrictions: {
        maxNumberOfFiles: 3,
      },
    }).use(AwsS3, {
      id: "AwsS3",
      getUploadParameters,
    });
  }, []);

  uppy.on("complete", async (result) => {
    try {
      const uploadedFile = result.successful[0] as ExtendedUppyFile;
      if (!uploadedFile.response?.body || !uploadedFile.uploadURL) {
        throw new Error('Missing required upload data');
      }
      
      const strapiData: StorageBucketData = {
        data: {
          fileName: uploadedFile.name,
          key: uploadedFile.s3Multipart?.key ?? '',
          bucket: (uploadedFile.response.body.Bucket as string) ?? '',
          uploadId: uploadedFile.s3Multipart?.uploadId ?? '',
          versionId: (uploadedFile.response.body.VersionId as string) ?? '',
          etag: ((uploadedFile.response.body.ETag as string) ?? '').replace(/"/g, ''),
          checksumCRC32: (uploadedFile.response.body.ChecksumCRC32 as string) ?? '',
          url: uploadedFile.uploadURL,
          size: uploadedFile.size,
          mimeType: uploadedFile.type ?? 'application/octet-stream',
          statusUpload: "completed"
        }
      };

      await createStorageBucket(strapiData);
      onUploadSuccess(result);
    } catch (error) {
      console.error('Error in upload completion:', error);
    }
  });

  return <Dashboard uppy={uppy} showLinkToFileUploadResult={true} />;
}
