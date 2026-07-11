import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SUPPORTED_LOCALES = ["ru", "en"];

export function middleware(request: NextRequest) {
  const localeCookie = request.cookies.get("locale")?.value;

  if (!localeCookie || !SUPPORTED_LOCALES.includes(localeCookie)) {
    const acceptLanguage = request.headers.get("Accept-Language") ?? "";
    const preferred =
      acceptLanguage.split(",")[0]?.split("-")[0]?.toLowerCase() ?? "";
    const locale = SUPPORTED_LOCALES.includes(preferred) ? preferred : "ru";

    const response = NextResponse.next();
    response.cookies.set("locale", locale, {
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
