import React from "react";
import Uppy, { UploadResult, UppyFile } from "@uppy/core";
import { Dashboard } from "@uppy/react";
import AwsS3Multipart, { AwsS3Part } from "@uppy/aws-s3-multipart";
import { create } from "@/lib/apiClient";
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
    body: { Key?: string; Bucket?: string };
    status: number;
    uploadURL: string;
  };
}

interface UploadData {
  id_document?: string;
  id_request_client?: string;
  id_deliverables_document?: string;
  file_name: string;
  key: string;
  bucket_name: string;
  document_url: string;
  size: number;
  mine_type: string;
  status_upload: "success" | "error";
}

interface Props {
  onUploadSuccess: (result: string) => void;
  onFileAdded?: (file: UppyFile) => void; // Updated to match Uppy's FileAddedCallback
  onFileRemoved?: (file: UppyFile) => void; // Updated to match Uppy's FileRemovedCallback
  theme?: "light" | "dark";
  triggerUploadRef: React.MutableRefObject<(() => Promise<UploadData>) | null>;
  onUploadComplete?: () => void;
  idRequestClient?: string | null;
  idDeliverablesDocument?: string | null;
}

const fetchUploadApiEndpoint = async (endpoint: string, data: UploadApiRequest) => {
  const res = await fetch(`/api/multipart-upload/${endpoint}`, {
    method: "POST",
    body: JSON.stringify(data),
    headers: { accept: "application/json", "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(`Lỗi API: ${res.status} - ${await res.text()}`);
  return res.json();
};

const generateUniqueFileName = (originalName: string): string => {
  const timestamp = Date.now();
  const sanitizedOriginalName = originalName.replace(/[^a-zA-Z0-9.]/g, "-");
  return `${timestamp}-${sanitizedOriginalName}`;
};

export function MultipartFileUploader({
  onUploadSuccess,
  onFileAdded,
  onFileRemoved,
  theme = "dark",
  triggerUploadRef,
  onUploadComplete,
  idRequestClient = null,
  idDeliverablesDocument = null,
}: Props) {
  const uppyRef = React.useRef(
    new Uppy({
      autoProceed: false,
      restrictions: { maxNumberOfFiles: 1 },
    }).use(AwsS3Multipart, {
      createMultipartUpload: (file) => {
        const uniqueName = generateUniqueFileName(file.name);
        file.meta.name = uniqueName;

        return fetchUploadApiEndpoint("create-multipart-upload", {
          file: { name: uniqueName },
          contentType: file.type,
          key: uniqueName,
        });
      },
      listParts: (file, { key, uploadId }) => fetchUploadApiEndpoint("list-parts", { key, uploadId }),
      signPart: (file, { key, uploadId, partNumber }) => fetchUploadApiEndpoint("sign-part", { key, uploadId, partNumber }),
      completeMultipartUpload: (file, { key, uploadId, parts }) => fetchUploadApiEndpoint("complete-multipart-upload", { key, uploadId, parts }),
      abortMultipartUpload: (file, { key, uploadId }) => fetchUploadApiEndpoint("abort-multipart-upload", { key, uploadId }),
    })
  );

  const uppy = uppyRef.current;
  const documentIdRef = React.useRef<string | null>(null);
  const resolveUploadRef = React.useRef<((data: UploadData) => void) | null>(null);

  React.useEffect(() => {
    const onComplete = async (result: UploadResult) => {
      try {
        const file = result.successful[0] as ExtendedUppyFile;
        if (!file.response?.body?.Key || !file.response.body.Bucket) {
          throw new Error('Thiếu dữ liệu file cần thiết');
        }

        const publicURL = `https://document.truediting.com/${file.response.body.Key}`;

        const dataUpload: UploadData = {
          file_name: file.name,
          key: file.response.body.Key,
          bucket_name: file.response.body.Bucket,
          document_url: publicURL,
          size: file.size,
          mine_type: file.type || "application/octet-stream",
          status_upload: "success",
        };

        if (idRequestClient) {
          dataUpload.id_request_client = idRequestClient;
        }
        if (idDeliverablesDocument) {
          dataUpload.id_deliverables_document = idDeliverablesDocument;
        }

        console.log("🔼 Payload gửi lên backend (documents):", dataUpload);


        const res = await create<UploadData>("documents", dataUpload);
        const documentId = res.data.id_document;
        if (!documentId) {
          throw new Error("Không thể lưu dữ liệu upload");
        }

        dataUpload.id_document = documentId;

        resolveUploadRef.current?.(dataUpload);
        onUploadSuccess(documentId);

        uppy.getFiles().forEach(file => uppy.removeFile(file.id));
      } catch (error) {
        console.error('Lỗi khi hoàn tất upload:', error);
        resolveUploadRef.current?.({
          file_name: '',
          key: '',
          bucket_name: '',
          document_url: '',
          size: 0,
          mine_type: '',
          status_upload: 'error',
        });
      } finally {
        onUploadComplete?.();
      }
    };

    const handleFileAdded = (file: UppyFile) => {
      onFileAdded?.(file);
    };

    const handleFileRemoved = (file: UppyFile) => {
      onFileRemoved?.(file);
    };

    uppy.on("file-added", handleFileAdded);
    uppy.on("file-removed", handleFileRemoved);
    uppy.on("complete", onComplete);

    return () => {
      uppy.off("file-added", handleFileAdded);
      uppy.off("file-removed", handleFileRemoved);
      uppy.off("complete", onComplete);
    };
  }, [onUploadComplete, uppy, idRequestClient, idDeliverablesDocument, onUploadSuccess, onFileAdded, onFileRemoved]);

  React.useEffect(() => {
    triggerUploadRef.current = () =>
      new Promise<UploadData>(async (resolve, reject) => {
        resolveUploadRef.current = resolve;

        try {
          const file = uppy.getFiles()[0];
          if (file) {
            documentIdRef.current = generateUniqueFileName(file.name);
          }

          const { successful, failed } = await uppy.upload();

          if (failed.length > 0) {
            reject(new Error("Upload thất bại"));
          }
        } catch (error) {
          reject(error);
        }
      });

    return () => {
      triggerUploadRef.current = null;
    };
  }, [triggerUploadRef, uppy]);

  return (
    <Dashboard
      uppy={uppy}
      showLinkToFileUploadResult={true}
      theme={theme}
      className="!border-none shadow-none"
      hideUploadButton={true}
    />
  );
}