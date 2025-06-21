import { NextResponse } from "next/server";

export const config = {
  matcher: "/integrations/:path*",
};

export function middleware(request) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-createxyz-project-id", "b4a4853a-cee3-4e85-b983-dc82ae46f21c");
  requestHeaders.set("x-createxyz-project-group-id", "dae39f3a-50f2-43ed-b0e2-8d42e72adcc5");


  request.nextUrl.href = `https://www.create.xyz/${request.nextUrl.pathname}`;

  return NextResponse.rewrite(request.nextUrl, {
    request: {
      headers: requestHeaders,
    },
  });
}