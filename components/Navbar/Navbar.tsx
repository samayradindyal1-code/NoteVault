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

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 shadow-md backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-4">

        {/* Logo */}

        <Link href="/">
          <div>
            <h1 className="text-3xl font-extrabold text-blue-700 tracking-wide">
              📚 NoteVault
            </h1>

            <p className="text-xs font-medium text-gray-500">
              by Samayra
            </p>
          </div>
        </Link>

        {/* Menu */}

        <div className="flex items-center gap-6">

          <Link
            href="/"
            className="hover:text-blue-600"
          >
            Home
          </Link>

          <Link
            href="/semester"
            className="hover:text-blue-600"
          >
            Notes
          </Link>
          {user && (
  <Link
    href="/dashboard"
    className="hover:text-blue-600"
  >
    Dashboard
  </Link>
)}
          {isAdmin && (
  <Link
    href="/admin"
    className="hover:text-blue-600 font-semibold"
  >
    Admin
  </Link>
)}

          {user ? (
            <>
              <span className="text-sm font-medium text-gray-700">
                Hi, {user.user_metadata.full_name}
              </span>

              <button
                onClick={handleLogout}
                className="rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="cursor-pointer transition-all duration-300 hover:text-blue-600 hover:scale-105"
              >
                Login
              </Link>

              <Link
                href="/login"
                className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
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