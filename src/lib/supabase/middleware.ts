import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getServerSupabaseKey } from "./keys";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    getServerSupabaseKey(),
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  const authPages = path === "/login" || path === "/signup";
  if (authPages && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/student";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (path.startsWith("/student") || path.startsWith("/admin")) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirect", path);
      return NextResponse.redirect(url);
    }
  }

  if (path.startsWith("/admin") && user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("auth_id", user.id)
      .maybeSingle();

    if (profile?.role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/student";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
