const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
const API_URL = `${STRAPI_URL}/api`;

// Kiểm tra response
const checkResponse = async (res: Response) => {
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`API error: ${res.status} - ${error}`);
  }
  return res.json();
};

// GET toàn bộ bản ghi
export const getAll = async (collection: string, populate = '*') => {
  console.log(`strapiClient.tsx GET Request to: ${API_URL}/${collection}`);
  const res = await fetch(`${API_URL}/${collection}?populate=${populate}`, {
    method: 'GET',
    cache: 'no-store',
  });
  const data = await res.json();
  return data.data;
};

// GET bản ghi theo ID
export const getOne = async (collection: string, id: number | string, populate = '*') => {
  console.log(`strapiClient.tsx GET Request to: ${API_URL}/${collection}/${id}`);
  const res = await fetch(`${API_URL}/${collection}/${id}?populate=${populate}`, {
    method: 'GET',
    cache: 'no-store',
  });
  const data = await res.json();
  return data.data;
};

// POST tạo bản ghi
export const create = async (collection: string, payload: object) => {
  try {
    console.log(`strapiClient.tsx POST Request to: ${API_URL}/${collection}`);
    
    const res = await fetch(`${API_URL}/${collection}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await checkResponse(res);
    return data.data;
  } catch (error) {
    console.error('strapiClient.tsx Error in create request:', error);
    throw error;
  }
};

// PUT cập nhật bản ghi
export const update = async (collection: string, id: number | string, payload: object) => {
  console.log(`strapiClient.tsx PUT Request to: ${API_URL}/${collection}/${id}`);
  const res = await fetch(`${API_URL}/${collection}/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ data: payload }),
  });
  const data = await res.json();
  return data.data;
};

// DELETE xóa bản ghi
export const remove = async (collection: string, id: number | string) => {
  console.log(`strapiClient.tsx DELETE Request to: ${API_URL}/${collection}/${id}`);
  const res = await fetch(`${API_URL}/${collection}/${id}`, {
    method: 'DELETE',
  });
  const data = await res.json();
  return data.data;
};

// Đăng nhập (admin)
export const login = async (email: string, password: string) => {
  console.log(`strapiClient.tsx POST Request to: ${STRAPI_URL}/admin/login`);
  const res = await fetch(`${STRAPI_URL}/admin/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  return data;
};
