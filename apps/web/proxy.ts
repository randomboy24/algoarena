import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { prisma } from "@repo/database";
import { auth as clerkAuth } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/api/v1/submissions(.*)",
  "/api/v1/problems/(.*)",
]);

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  // 🔐 Protect admin routes
  if (isAdminRoute(req)) {
    console.log("admin route hit");

    const { userId } = await auth.protect(); // use THIS, not clerkAuth()

    const user = await prisma.user.findUnique({
      where: {
        id: userId!, // ⚠️ fix this too
      },
    });

    if (user?.role !== "ADMIN") {
      return new Response("Unauthorized", { status: 403 });
    }
  }

  // 🔐 Protect API routes
  if (isProtectedRoute(req)) {
    console.log("protected route got it");
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
