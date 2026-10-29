
"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function saveUser() {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) throw authError;

        if (!user) {
          if (active) setCheckingSession(false);
          return;
        }

        const { data: existingUser, error: lookupError } =
          await supabase
            .from("users")
            .select("id")
            .eq("id", user.id)
            .maybeSingle();

        if (lookupError) throw lookupError;

        const profile = {
          id: user.id,
          name:
            user.user_metadata?.full_name ??
            user.user_metadata?.name ??
            "",
          email: user.email ?? "",
          photo: user.user_metadata?.avatar_url ?? "",
        };

        if (!existingUser) {
          const { error } = await supabase.from("users").insert({
            ...profile,
            role: "student",
          });

          if (error) throw error;
        } else {
          const { error } = await supabase
            .from("users")
            .update({
              name: profile.name,
              email: profile.email,
              photo: profile.photo,
            })
            .eq("id", user.id);

          if (error) throw error;
        }

        if (active) {
          router.replace("/semester");
          router.refresh();
        }
      } catch (error) {
        console.error("Login profile error:", error);

        if (active) {
          setErrorMessage(
            "We couldn't finish setting up your account. Please try again."
          );
          setCheckingSession(false);
        }
      }
    }

    saveUser();

    return () => {
      active = false;
    };
  }, [router, supabase]);

  async function loginWithGoogle() {
    setLoading(true);
    setErrorMessage("");

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo:
            process.env.NODE_ENV === "development"
              ? "http://localhost:3000/auth/callback"
              : "https://note-vault-sandy.vercel.app/auth/callback",
        },
      });

      if (error) throw error;
    } catch (error) {
      console.error("Google login error:", error);
      setErrorMessage("Google login couldn't start. Please try again.");
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-xl sm:p-10">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-blue-700 sm:text-4xl">
            NoteVault
          </h1>

          <p className="mt-2 text-gray-500">Welcome back 👋</p>
        </div>

        <p className="mb-8 text-gray-600">
          Access your BTech CSE notes semester wise.
        </p>

        {errorMessage && (
          <p
            role="alert"
            className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700"
          >
            {errorMessage}
          </p>
        )}

        <button
          type="button"
          onClick={loginWithGoogle}
          disabled={loading || checkingSession}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 px-5 py-3 text-base font-medium shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-gray-50 hover:shadow-md active:translate-y-0 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 sm:text-lg"
        >
          {loading || checkingSession ? (
            <>
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              {checkingSession ? "Checking login..." : "Connecting to Google..."}
            </>
          ) : (
            <>
              <span className="text-xl">🌐</span>
              Continue with Google
            </>
          )}
        </button>

        <p className="mt-8 text-sm text-gray-400">
          Secure notes • Semester wise access • Affordable learning
        </p>
      </div>
    </main>
  );
}
