// File: components/MultipartFileUploader.tsx
import React from "react";
import Uppy, { type UploadResult, UppyFile, SuccessResponse } from "@uppy/core";
import { Dashboard } from "@uppy/react";
import AwsS3Multipart, { AwsS3Part } from "@uppy/aws-s3-multipart";
import { create } from "@/lib/strapiClient";

// Import Uppy styles
import '@uppy/core/dist/style.min.css';
import '@uppy/dashboard/dist/style.min.css';

interface UploadApiRequest {
  file?: { name: string };
  contentType?: string;
  key?: string;
  uploadId?: string;
  partNumber?: number;
  parts?: AwsS3Part[];
}

interface ExtendedUppyFile extends UppyFile {
  uploadId?: string;
  response?: {
    body: {
      Key?: string;
      Bucket?: string;
      VersionId?: string;
      ETag?: string;
      ChecksumCRC32?: string;
    };
    status: number;
    uploadURL: string;
  };
  uploadURL?: string;
}

interface StorageBucketData {
  data: {
    fileName: string;
    key: string;
    bucket: string;
    uploadId: string | null;
    versionId: string | null;
    etag: string | null;
    checksumCRC32: string | null;
    url: string;
    size: number;
    mimeType: string;
    statusUpload: "completed" | "pending" | "failed";
  };
}

export interface ExtendedUploadResult extends UploadResult {
  documentId?: string;
}

const fetchUploadApiEndpoint = async (endpoint: string, data: UploadApiRequest) => {
  const res = await fetch(`/api/multipart-upload/${endpoint}`, {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API error: ${res.status} - ${err}`);
  }

  return res.json();
};

const createStorageBucket = async (data: StorageBucketData) => {
  try {
    // Format data according to Strapi's expected structure
    const strapiData = {
      data: {
        fileName: data.data.fileName,
        key: data.data.key,
        bucket: data.data.bucket,
        uploadId: data.data.uploadId,
        versionId: data.data.versionId,
        etag: data.data.etag,
        checksumCRC32: data.data.checksumCRC32,
        url: data.data.url,
        size: data.data.size,
        mimeType: data.data.mimeType,
        statusUpload: data.data.statusUpload
      }
    };
    console.log('Sending data to Strapi:', strapiData);
    const response = await create('storage-buckets', strapiData);
    console.log('Strapi response:', response);
    return response;
  } catch (error) {
    console.error('Error saving to Strapi:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      if ('response' in error) {
        console.error('Strapi error response:', (error as any).response?.data);
      }
    }
    throw error;
  }
};

export function MultipartFileUploader({
  onUploadSuccess,
  theme = "dark",
}: {
  onUploadSuccess: (result: UploadResult) => void;
  theme?: "light" | "dark";
}) {
  const uppyRef = React.useRef<Uppy | null>(null);

  if (!uppyRef.current) {
    uppyRef.current = new Uppy({ autoProceed: true }).use(AwsS3Multipart, {
      createMultipartUpload: async (file) => {
        const contentType = file.type;
        return fetchUploadApiEndpoint("create-multipart-upload", {
          file: { name: file.name },
          contentType,
        });
      },
      listParts: (file, props) =>
        fetchUploadApiEndpoint("list-parts", {
          key: props.key,
          uploadId: props.uploadId,
        }),
      signPart: (file, props) =>
        fetchUploadApiEndpoint("sign-part", {
          key: props.key,
          uploadId: props.uploadId,
          partNumber: props.partNumber,
        }),
      completeMultipartUpload: (file, props) =>
        fetchUploadApiEndpoint("complete-multipart-upload", {
          key: props.key,
          uploadId: props.uploadId,
          parts: props.parts,
        }),
      abortMultipartUpload: (file, props) =>
        fetchUploadApiEndpoint("abort-multipart-upload", {
          key: props.key,
          uploadId: props.uploadId,
        }),
    });
  }

  const uppy = uppyRef.current;

  React.useEffect(() => {
    const onComplete = async (result: UploadResult) => {
      try {
        const uploadedFile = result.successful[0] as ExtendedUppyFile;
        if (!uploadedFile.response?.body?.Key || !uploadedFile.response.body.Bucket) {
          throw new Error('MultipartFileUploader.tsx Missing required file data');
        }

        const strapiData: StorageBucketData = {
          data: {
            fileName: uploadedFile.name,
            key: uploadedFile.response.body.Key,
            bucket: uploadedFile.response.body.Bucket,
            uploadId: uploadedFile.uploadId || null,
            versionId: uploadedFile.response.body.VersionId || null,
            etag: (uploadedFile.response.body.ETag || '').replace(/"/g, '') || null,
            checksumCRC32: uploadedFile.response.body.ChecksumCRC32 || null,
            url: uploadedFile.uploadURL || '',
            size: uploadedFile.size,
            mimeType: uploadedFile.type || 'application/octet-stream',
            statusUpload: "completed"
          }
        };

        const response = await createStorageBucket(strapiData);
        console.log('MultipartFileUploader.tsx Successfully saved to Strapi:', response);
        if (response?.documentId) {
          onUploadSuccess({ ...result, documentId: response.documentId } as ExtendedUploadResult);
        } else {
          console.error('MultipartFileUploader.tsx Missing documentId in response:', response);
          onUploadSuccess(result);
        }
      } catch (error) {
        console.error('MultipartFileUploader.tsx Error in upload completion:', error);
      }
    };

    const onUploadSuccessHandler = (file: UppyFile | undefined, response: SuccessResponse) => {
      if (!file) return;
      const key = response.body?.Key;
      const publicBaseURL = "https://document.truediting.com";
      const publicURL = `${publicBaseURL}/${key}`;

      console.log('MultipartFileUploader.tsx R2 Upload Response:', response);

      uppy.setFileState(file.id, {
        ...uppy.getState().files[file.id],
        uploadURL: publicURL,
        response,
      });
    };

    uppy.on("complete", onComplete);
    uppy.on("upload-success", onUploadSuccessHandler);

    return () => {
      uppy.off("complete", onComplete);
      uppy.off("upload-success", onUploadSuccessHandler);
    };
  }, [onUploadSuccess, uppy]);

  return (
    <Dashboard
      uppy={uppy}
      showLinkToFileUploadResult={true}
      theme={theme}
      className="!border-none shadow-none"
    />
  );
}

