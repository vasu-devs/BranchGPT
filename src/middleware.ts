import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { v4 as uuidv4 } from "uuid";

export function middleware(request: NextRequest) {
    const response = NextResponse.next();

    // Check for existing session cookie
    const userId = request.cookies.get("branchgpt-userid");

    if (!userId) {
        // Generate new session ID
        const newUserId = uuidv4();

        // Set cookie
        response.cookies.set("branchgpt-userid", newUserId, {
            path: "/",
            maxAge: 60 * 60 * 24 * 365, // 1 year
            sameSite: "strict"
        });
    }

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
