// lib/apiClient.ts
import axios from 'axios';
import { ApiResponse } from '@/app/types/models';

const API_URL = `${process.env.NEXT_PUBLIC_STRAPI_URL}/api`;

// Hàm lấy token và tạo header Authorization
const getAuthToken = (): string | null =>
  typeof window !== 'undefined'
    ? localStorage.getItem('jwt') || sessionStorage.getItem('jwt') || null
    : null;

const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// GET toàn bộ bản ghi
export const getAll = async <T>(
  collection: string,
  page = 1,
  pageSize = 10,
  sort?: string
): Promise<ApiResponse<T[]>> => {
  let url = `${API_URL}/${collection}?pagination[page]=${page}&pagination[pageSize]=${pageSize}`;
  if (sort) url += `&sort=${encodeURIComponent(sort)}`;

  const { data } = await axios.get<ApiResponse<T[]>>(url, {
    headers: getAuthHeaders(),
  });

  return data;
};

// GET bản ghi theo ID
export const getOne = async <T>(
  collection: string,
  id: number | string
): Promise<ApiResponse<T>> => {
  const url = `${API_URL}/${collection}/${id}`;
  const { data } = await axios.get<ApiResponse<T>>(url, {
    headers: getAuthHeaders(),
  });
  return data;
};

// POST tạo bản ghi
export const create = async <T>(
  collection: string,
  payload: T
): Promise<ApiResponse<T>> => {
  const url = `${API_URL}/${collection}`;
  const { data } = await axios.post<ApiResponse<T>>(url, { data: payload }, {
    headers: getAuthHeaders(),
  });
  return data;
};

// PUT cập nhật bản ghi
export const update = async <T>(
  collection: string,
  id: number | string,
  payload: Partial<T>
): Promise<ApiResponse<T>> => {
  const url = `${API_URL}/${collection}/${id}`;
  const { data } = await axios.put<ApiResponse<T>>(url, { data: payload }, {
    headers: getAuthHeaders(),
  });
  return data;
};

// DELETE xóa bản ghi
export const remove = async (
  collection: string,
  id: number | string
): Promise<ApiResponse<null>> => {
  const url = `${API_URL}/${collection}/${id}`;
  const { data } = await axios.delete<ApiResponse<null>>(url, {
    headers: getAuthHeaders(),
  });
  return data;
};

// Đăng nhập
export const login = async (
  username: string,
  password: string
): Promise<ApiResponse<{ jwt: string; user: any }>> => {
  const url = `${API_URL}/auth/login`;
  const { data } = await axios.post<ApiResponse<{ jwt: string; user: any }>>(
    url,
    { username, password },
    { headers: { 'Content-Type': 'application/json' } }
  );

  if (data.data.jwt) {
    localStorage.setItem('jwt', data.data.jwt);
  }
  return data;
};

export const deleteDocument = async (key: string): Promise<{ success: boolean; message: string }> => {
  const res = await fetch(`/api/multipart-upload/delete`, {
    method: 'POST',
    body: JSON.stringify({ key }),
    headers: { accept: 'application/json', 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`Failed to delete document: ${res.status} - ${await res.text()}`);
  }
  return res.json();
};
