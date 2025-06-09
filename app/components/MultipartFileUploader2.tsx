import React from "react";
import Uppy, { UploadResult, UppyFile } from "@uppy/core";
import { Dashboard } from "@uppy/react";
import AwsS3Multipart, { AwsS3Part } from "@uppy/aws-s3-multipart";
import {create} from "@/lib/apiClient"
import '@uppy/core/dist/style.min.css';
import '@uppy/dashboard/dist/style.min.css';

// Định nghĩa interface cho payload của API
interface UploadApiRequest {
  file?: { name: string };
  contentType?: string;
  key?: string;
  uploadId?: string;
  partNumber?: number;
  parts?: AwsS3Part[];
}

// Định nghĩa interface mở rộng cho UppyFile
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

// Định nghĩa props cho component
interface Props {
  onUploadSuccess: (result: string) => void;
  theme?: "light" | "dark";
  triggerUploadRef: React.MutableRefObject<(() => Promise<string>) | null>;
  onUploadComplete?: () => void;
  idRequestClient?: string | null; // Thêm idRequestClient vào Props
  idDeliverablesDocument?: string | null; // Thêm idDeliverablesDocument vào Props
}

// Hàm gọi API chung
const fetchUploadApiEndpoint = async (endpoint: string, data: UploadApiRequest) => {
  const res = await fetch(`/api/multipart-upload/${endpoint}`, {
    method: "POST",
    body: JSON.stringify(data),
    headers: { accept: "application/json", "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(`Lỗi API: ${res.status} - ${await res.text()}`);
  return res.json();
};

// Hàm tạo tên file duy nhất
const generateUniqueFileName = (originalName: string): string => {
  const timestamp = Date.now();
  const sanitizedOriginalName = originalName.replace(/[^a-zA-Z0-9.]/g, "-"); // Thay thế ký tự đặc biệt bằng '-'
  return `${timestamp}-${sanitizedOriginalName}`;
};

// Component tải file lên sử dụng Uppy
export function MultipartFileUploader({ onUploadSuccess, theme = "dark", triggerUploadRef, onUploadComplete, idRequestClient = null, idDeliverablesDocument = null }: Props) {
  // Khởi tạo Uppy với plugin AWS S3 Multipart
  const uppy = React.useRef(new Uppy({
    autoProceed: false,
    restrictions: { maxNumberOfFiles: 1 },
  }).use(AwsS3Multipart, {
    createMultipartUpload: (file) => {
      // ✅ Tạo tên file duy nhất
      const uniqueName = generateUniqueFileName(file.name);

      // ✅ Gán lại tên file đã xử lý vào file.meta để dùng lại trong các bước tiếp theo
      file.meta.name = uniqueName;

      return fetchUploadApiEndpoint("create-multipart-upload", {
        file: { name: uniqueName },
        contentType: file.type,
        key: uniqueName, // 🟢 Truyền key duy nhất tại đây
      });
    },
    listParts: (file, { key, uploadId }) => fetchUploadApiEndpoint("list-parts", { key, uploadId }),
    signPart: (file, { key, uploadId, partNumber }) => fetchUploadApiEndpoint("sign-part", { key, uploadId, partNumber }),
    completeMultipartUpload: (file, { key, uploadId, parts }) => fetchUploadApiEndpoint("complete-multipart-upload", { key, uploadId, parts }),
    abortMultipartUpload: (file, { key, uploadId }) => fetchUploadApiEndpoint("abort-multipart-upload", { key, uploadId }),
  })).current;

  const documentIdRef = React.useRef<string | null>(null);
  const resolveUploadRef = React.useRef<((id: string) => void) | null>(null);

  // Xử lý khi upload hoàn tất
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

        // Chỉ thêm nếu có giá trị
        if (idRequestClient) {
          dataUpload.id_request_client = idRequestClient;
        }
        if (idDeliverablesDocument) {
          dataUpload.id_deliverables_document = idDeliverablesDocument;
        }

        console.log("Payload gửi lên API:", dataUpload); // Log payload để kiểm tra

        const res = await create<UploadData>("documents", dataUpload);
        const documentId = res.data.id_document; // Extract id_document from the response
        if (!documentId) {
          throw new Error("Không thể lưu dữ liệu upload");
        }

        console.log("Dữ liệu upload đã được lưu:", res);

        // ✅ Gọi resolveUploadRef tại đây khi đã có id_document
        resolveUploadRef.current?.(documentId);
      } catch (error) {
        console.error('Lỗi khi hoàn tất upload:', error);
        resolveUploadRef.current?.(""); // hoặc reject nếu muốn bắt lỗi ở nơi gọi
      } finally {
        onUploadComplete?.();
      }
    };

    uppy.on("complete", onComplete);
    return () => {
      uppy.off("complete", onComplete);
    };
  }, [onUploadComplete, uppy, idRequestClient]);



  // Thiết lập hàm trigger upload
  React.useEffect(() => {
    triggerUploadRef.current = () =>
      new Promise<string>(async (resolve, reject) => {
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

          // ✅ Việc resolve đã được xử lý bên trong `onComplete`
          // Không cần resolve ở đây nữa

        } catch (error) {
          reject(error);
        }
      });

    return () => {
      triggerUploadRef.current = null;
    };
  }, [triggerUploadRef, uppy]);

  // Render giao diện Uppy Dashboard
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