export interface Document {
  id_document: string;
  id_request_client: string | null;
  id_deliverables_document: string | null;
  file_name: string;
  key: string;
  bucket_name: string;
  document_url: string;
  size: string;
  mine_type: string;
  status_upload: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id_user: string;
  username: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface RequestClient {
  id_request_client: string;
  id_user: string | null;
  fullname: string;
  email: string;
  phone_number: string;
  address: string;
  processing_request_details: string;
  request_status: string;
  created_at: string;
  updated_at: string;
  Documents: Document[];
  User: User | null;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  meta?: any;
}