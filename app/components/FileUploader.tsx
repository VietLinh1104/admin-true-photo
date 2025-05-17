import React from "react";
import Uppy, { type UploadResult, UppyFile } from "@uppy/core";
import AwsS3, { type AwsS3UploadParameters } from "@uppy/aws-s3";
import { Dashboard } from "@uppy/react";
import { sha256 } from "crypto-hash";

// Uppy styles
import "@uppy/core/dist/style.min.css";
import "@uppy/dashboard/dist/style.min.css";

const createStorageBucket = async (data: any) => {
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

export async function getUploadParameters(file: UppyFile) {
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

  // Parse the JSON response.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const data: { url: string; method: "PUT" } = await response.json();

  // Return an object in the correct shape.
  const object: AwsS3UploadParameters = {
    method: data.method,
    url: data.url,
    fields: {}, // For presigned PUT uploads, this should be left empty.
    // Provide content type header required by S3
    headers: {
      "Content-Type": file.type ? file.type : "application/octet-stream",
    },
  };
  return object;
}

export function FileUploader({
  onUploadSuccess,
}: {
  onUploadSuccess: (result: UploadResult) => void;
}) {
  const uppy = React.useMemo(() => {
    const uppy = new Uppy({
      autoProceed: true,
      restrictions: {
        maxNumberOfFiles: 3,
      },
    }).use(AwsS3, {
      id: "AwsS3",
      getUploadParameters: (file: UppyFile) => getUploadParameters(file),
    });
    return uppy;
  }, []);
  uppy.on("complete", async (result) => {
    try {
      const uploadedFile = result.successful[0];
      
      const strapiData = {
        data: {
          fileName: uploadedFile.name,
          key: (uploadedFile as any).s3Multipart?.key || '',
          bucket: uploadedFile.response?.body?.Bucket || '',
          uploadId: (uploadedFile as any).s3Multipart?.uploadId || '',
          versionId: uploadedFile.response?.body?.VersionId || '',
          etag: ((uploadedFile.response?.body?.ETag as string) || '').replace(/"/g, ''),
          checksumCRC32: uploadedFile.response?.body?.ChecksumCRC32 || '',
          url: uploadedFile.uploadURL || '',
          size: uploadedFile.size,
          mimeType: uploadedFile.type,
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
