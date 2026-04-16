import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const PROFESSIONAL_ONLY = ["/app/usuarios", "/app/avaliacoes", "/app/prescricoes"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const protectedRoutes = ["/app"];
  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));

  if (!isProtected) return NextResponse.next();

  // Verifica presença do cookie (rápido, sem I/O)
  const sessionToken =
    request.cookies.get("authjs.session-token")?.value ||
    request.cookies.get("__Secure-authjs.session-token")?.value;

  if (!sessionToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Verifica role para rotas de profissional
  const isProfessionalRoute = PROFESSIONAL_ONLY.some((p) => pathname.startsWith(p));
  if (isProfessionalRoute) {
    try {
      const token = await getToken({ req: request, secret: process.env.AUTH_SECRET });
      if (token?.role === "CLIENT") {
        return NextResponse.redirect(new URL("/app", request.url));
      }
    } catch (err) {
      // Token inválido — deixa passar (auth de sessão já garantiu presença do cookie)
      console.error("[proxy] getToken error:", err);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js).*)"],
};
