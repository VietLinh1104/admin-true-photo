// lib/strapiClient.ts

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL;
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
export const getAll = async (
  collection: string,
  populate = '*',
  page = 1,
  pageSize = 10,
  sort?: string
) => {
  let url = `${API_URL}/${collection}?populate=${populate}&pagination[page]=${page}&pagination[pageSize]=${pageSize}`;
  if (sort) {
    url += `&sort=${encodeURIComponent(sort)}`;
  }
  const res = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
    cache: 'no-store',
  });
  const data = await checkResponse(res);
  return {
    data: data.data,
    meta: data.meta
  };
};

// GET bản ghi theo ID
export const getOne = async (collection: string, id: number | string, populate = '*') => {
  console.log(`GET Request to: ${API_URL}/${collection}/${id}`);
  const res = await fetch(`${API_URL}/${collection}/${id}?populate=${populate}`, {
    method: 'GET',
    headers: getAuthHeaders(),
    cache: 'no-store',
  });
  const data = await checkResponse(res);
  return data;
};

// POST tạo bản ghi
export const create = async (collection: string, payload: object) => {
  try {
    console.log(`strapiClient.tsx POST Request to: ${API_URL}/${collection}`);
    console.log('Payload being sent:', JSON.stringify(payload, null, 2));

    const res = await fetch(`${API_URL}/${collection}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ data: payload }),
    });
    const data = await checkResponse(res);
    return data.data;
  } catch (error) {
    console.error('Error in create request:', error);
    throw error;
  }
};

// PUT cập nhật bản ghi
export const update = async (collection: string, id: number | string, payload: object) => {
  console.log(`PUT Request to: ${API_URL}/${collection}/${id}`);
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
  console.log(`DELETE Request to: ${API_URL}/${collection}/${id}`);
  const res = await fetch(`${API_URL}/${collection}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  const data = await checkResponse(res);
  return data;
};

// Đăng nhập người dùng
export const login = async (username: string, password: string) => {
  console.log(`POST Request to: ${API_URL}/auth/login`);
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
