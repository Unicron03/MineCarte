import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
    // Vérifier la session
    const session = request.cookies.get("better-auth.session_token");
    
    // Pages protégées
    const protectedPaths = ["/home", "/decks", "/collection", "/profile"];
    const isProtectedPath = protectedPaths.some(path => 
        request.nextUrl.pathname.startsWith(path)
    );
    
    // Rediriger vers / si pas de session et page protégée
    if (isProtectedPath && !session) {
        return NextResponse.redirect(new URL("/", request.url));
    }
    
    // Rediriger vers /home si session et sur /
    if (request.nextUrl.pathname === "/" && session) {
        return NextResponse.redirect(new URL("/home", request.url));
    }
    
    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};