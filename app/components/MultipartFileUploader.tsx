// File: components/MultipartFileUploader.tsx
import React from "react";
import Uppy, { type UploadResult, UppyFile } from "@uppy/core";
import { Dashboard } from "@uppy/react";
import AwsS3Multipart, { AwsS3Part } from "@uppy/aws-s3-multipart";
import { create } from "@/lib/strapiClient";

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
    const response = await create('storage-buckets', data.data);
    return response;
  } catch (error) {
    console.error('Error saving to Strapi:', error);
    throw error;
  }
};

export function MultipartFileUploader({
  onUploadSuccess,
}: {
  onUploadSuccess: (result: UploadResult) => void;
}) {
  const uppy = React.useMemo(() => {
    const uppy = new Uppy({
      autoProceed: true,
    }).use(AwsS3Multipart, {
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

    return uppy;
  }, []);

  React.useEffect(() => {
    uppy.on("complete", async (result) => {
      try {
        const uploadedFile = result.successful[0] as ExtendedUppyFile;
        
        if (!uploadedFile.response?.body?.Key || !uploadedFile.response.body.Bucket) {
          throw new Error('Missing required file data');
        }
        
        const strapiData: StorageBucketData = {
          data: {
            fileName: uploadedFile.name,
            key: uploadedFile.response.body.Key,
            bucket: uploadedFile.response.body.Bucket,
            uploadId: uploadedFile.uploadId ?? '',
            versionId: uploadedFile.response.body.VersionId ?? '',
            etag: (uploadedFile.response.body.ETag ?? '').replace(/"/g, ''),
            checksumCRC32: uploadedFile.response.body.ChecksumCRC32 ?? '',
            url: uploadedFile.uploadURL ?? '',
            size: uploadedFile.size,
            mimeType: uploadedFile.type ?? 'application/octet-stream',
            statusUpload: "completed"
          }
        };

        await createStorageBucket(strapiData);
        console.log('Saved to Strapi:', strapiData);
        onUploadSuccess(result);
      } catch (error) {
        console.error('Error in upload completion:', error);
      }
    });

    uppy.on("upload-success", (file, response) => {
      if (!file) return;
    
      const key = response.body?.Key;
      const publicBaseURL = "https://document.truediting.com";
      const publicURL = `${publicBaseURL}/${key}`;
    
      uppy.setFileState(file.id, {
        ...uppy.getState().files[file.id],
        uploadURL: publicURL,
        response,
      });
    });
    
    return () => uppy.close();
  }, [uppy, onUploadSuccess]);

  return <Dashboard 
    uppy={uppy} 
    showLinkToFileUploadResult={true} 
    theme="dark"
    className="!border-none shadow-none"
  />;
}
