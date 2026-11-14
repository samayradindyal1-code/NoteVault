
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=auth`);
  }

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );

  const { data, error } =
    await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(`${origin}/login?error=auth`);
  }

  const user = data.user;
  const admin = createAdminClient();

  const { data: existingUser, error: lookupError } = await admin
    .from("users")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (lookupError) {
    console.error("Profile lookup error:", lookupError);
    return NextResponse.redirect(`${origin}/login?error=profile`);
  }

  const profile = {
    id: user.id,
    name:
      user.user_metadata?.full_name ??
      user.user_metadata?.name ??
      "",
    email: user.email ?? "",
    photo: user.user_metadata?.avatar_url ?? "",
  };

  if (existingUser) {
    const { error: updateError } = await admin
      .from("users")
      .update(profile)
      .eq("id", user.id);

    if (updateError) {
      console.error("Profile update error:", updateError);
      return NextResponse.redirect(`${origin}/login?error=profile`);
    }
  } else {
    const { error: insertError } = await admin
      .from("users")
      .insert({
        ...profile,
        role: "student",
      });

    if (insertError) {
      console.error("Profile insert error:", insertError);
      return NextResponse.redirect(`${origin}/login?error=profile`);
    }
  }

  return NextResponse.redirect(`${origin}/semester`);
}
