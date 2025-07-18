import axios from 'axios';
import { ApiResponse, User } from '@/app/types/models';

const API_URL = `${process.env.NEXT_PUBLIC_API}/api`;

export const getAuthToken = (): string | null => {
  if (typeof document === 'undefined') return null;

  const match = document.cookie.match(/(^| )token=([^;]+)/);
  return match ? match[2] : null;
};

const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

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

export const create = async <T, P = Partial<T>>(
  collection: string,
  payload: P
): Promise<ApiResponse<T>> => {
  const url = `${API_URL}/${collection}`;
  const { data } = await axios.post<ApiResponse<T>>(url, { data: payload }, {
    headers: getAuthHeaders(),
  });
  return data;
};

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

export const login = async (
  username: string,
  password: string
): Promise<ApiResponse<{ token: string; user: User }>> => {
  const url = `${API_URL}/auth/login`;
  const { data } = await axios.post<ApiResponse<{ token: string; user: User }>>(
    url,
    { username, password },
    { headers: { 'Content-Type': 'application/json' } }
  );
  return data;
};

export const register = async (
  username: string,
  password: string
): Promise<ApiResponse<{ token: string; user: User }>> => {
  const url = `${API_URL}/auth/register`;
  const { data } = await axios.post<ApiResponse<{ token: string; user: User }>>(
    url,
    { username, password },
    { headers: { 'Content-Type': 'application/json' } }
  );
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
