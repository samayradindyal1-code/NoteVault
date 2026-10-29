
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const supabase = createClient();
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function getUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);

      if (user) {
        const { data } = await supabase
          .from("users")
          .select("role")
          .eq("id", user.id)
          .single();

        setRole(data?.role ?? null);
        setIsAdmin(data?.role === "admin");
      } else {
        setRole(null);
        setIsAdmin(false);
      }
    }

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const linkClass =
    "whitespace-nowrap text-sm font-medium text-gray-700 transition-colors hover:text-blue-600 sm:text-base";

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 md:flex-row md:items-center md:justify-between md:gap-5 lg:px-8">
        {/* Logo */}
        <Link href="/" className="w-fit shrink-0">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-blue-700 sm:text-3xl">
              📚 NoteVault
            </h1>
            <p className="text-xs font-medium text-gray-500">
              by Samayra
            </p>
          </div>
        </Link>

        {/* Navigation and account actions */}
        <div className="flex w-full flex-wrap items-center gap-x-4 gap-y-3 md:w-auto md:justify-end md:gap-x-5 lg:gap-x-6">
          <Link href="/" className={linkClass}>
            Home
          </Link>

          <Link href="/semester" className={linkClass}>
            Notes
          </Link>

          {user && (
            <Link href="/dashboard" className={linkClass}>
              Dashboard
            </Link>
          )}

          {isAdmin && (
            <Link
              href="/admin"
              className="whitespace-nowrap text-sm font-semibold text-blue-700 hover:text-blue-800 sm:text-base"
            >
              Admin
            </Link>
          )}

          {user ? (
            <>
              <span className="max-w-full break-words text-sm font-medium text-gray-700">
                Hi, {user.user_metadata?.full_name || user.email}
              </span>

              <button
                onClick={handleLogout}
                className="shrink-0 rounded-lg bg-red-500 px-4 py-2 text-sm text-white transition-colors hover:bg-red-600"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className={linkClass}>
                Login
              </Link>

              <Link
                href="/login"
                className="whitespace-nowrap rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
