// lib/strapiClient.ts

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
const API_URL = `${STRAPI_URL}/api`;

// Hàm kiểm tra phản hồi từ API
const checkResponse = async (res: Response) => {
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`API error: ${res.status} - ${error}`);
  }
  return res.json();
};

// Hàm lấy JWT token từ localStorage hoặc sessionStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('jwt') || sessionStorage.getItem('jwt') || null;
};

// Hàm tạo headers với JWT token
const getAuthHeaders = (): HeadersInit => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// GET toàn bộ bản ghi
export const getAll = async (collection: string, populate = '*') => {
  const res = await fetch(`${API_URL}/${collection}?populate=${populate}`, {
    method: 'GET',
    headers: getAuthHeaders(),
    cache: 'no-store',
  });
  const data = await checkResponse(res);
  return data.data;
};

// GET bản ghi theo ID
export const getOne = async (collection: string, id: number | string, populate = '*') => {
  const res = await fetch(`${API_URL}/${collection}/${id}?populate=${populate}`, {
    method: 'GET',
    headers: getAuthHeaders(),
    cache: 'no-store',
  });
  const data = await checkResponse(res);
  return data.data;
};

// POST tạo bản ghi
export const create = async (collection: string, payload: object) => {
  try {
    const res = await fetch(`${API_URL}/${collection}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ data: payload }),
    });
    const data = await checkResponse(res);
    return data.data;
  } catch (error) {
    throw error;
  }
};

// PUT cập nhật bản ghi
export const update = async (collection: string, id: number | string, payload: object) => {
  const res = await fetch(`${API_URL}/${collection}/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ data: payload }),
  });
  const data = await checkResponse(res);
  return data.data;
};

// DELETE xóa bản ghi
export const remove = async (collection: string, id: number | string) => {
  const res = await fetch(`${API_URL}/${collection}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  const data = await checkResponse(res);
  return data.data;
};

// Đăng nhập người dùng
export const login = async (username: string, password: string) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });
  const data = await checkResponse(res);
  // Lưu JWT token vào localStorage
  if (data.jwt) {
    localStorage.setItem('jwt', data.jwt);
  }
  return data;
};
