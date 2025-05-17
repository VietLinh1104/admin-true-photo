const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL;

const API_URL = `${STRAPI_URL}/api`;

const headers = {
  'Content-Type': 'application/json',
  // Authorization: `Bearer ${token}`, // Nếu có auth token
};

// Lấy toàn bộ bản ghi
export const getAll = async (collection: string, populate = '*') => {
  const res = await fetch(`${API_URL}/${collection}?populate=${populate}`, {
    method: 'GET',
    headers,
    cache: 'no-store',
  });
  const data = await res.json();
  return data.data;
};

// Lấy một bản ghi theo ID
export const getOne = async (collection: string, id: number | string, populate = '*') => {
  const res = await fetch(`${API_URL}/${collection}/${id}?populate=${populate}`, {
    method: 'GET',
    headers,
    cache: 'no-store',
  });
  const data = await res.json();
  return data.data;
};

// Tạo bản ghi mới
export const create = async (collection: string, payload: object) => {
  const res = await fetch(`${API_URL}/${collection}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ data: payload }),
  });
  const data = await res.json();
  return data.data;
};

// Cập nhật bản ghi
export const update = async (collection: string, id: number | string, payload: object) => {
  const res = await fetch(`${API_URL}/${collection}/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ data: payload }),
  });
  const data = await res.json();
  return data.data;
};

// Xóa bản ghi
export const remove = async (collection: string, id: number | string) => {
  const res = await fetch(`${API_URL}/${collection}/${id}`, {
    method: 'DELETE',
    headers,
  });
  const data = await res.json();
  return data.data;
};
