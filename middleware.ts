// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicPaths = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Cho phép các đường công khai
  if (publicPaths.includes(pathname)) return NextResponse.next();

  // Đọc token từ cookie
  const token = request.cookies.get('token')?.value;
  const hasToken = request.cookies.get('hasToken')?.value === 'true';

  // Nếu không có token → redirect về login
  if (!token && !hasToken) {
    const url = new URL('/login', request.url);
    // ⬇ Gắn đường dẫn gốc đầy đủ sau domain
    url.searchParams.set('from', request.nextUrl.href.replace(request.nextUrl.origin, ''));
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Áp dụng middleware cho tất cả route trừ các static assets/api
export const config = {
  matcher: [
    '/((?!api|_next|fonts|examples|[\\w-]+\\.\\w+).*)',
  ],
};
