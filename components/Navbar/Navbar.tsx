"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const supabase = createClient();
  const router = useRouter();

  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function getUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);
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
    <nav className="w-full bg-white shadow-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

        {/* Logo */}

        <Link href="/">
          <div>
            <h1 className="text-2xl font-bold text-blue-700">
              📚 NoteVault
            </h1>

            <p className="text-xs text-gray-500">
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
                className="hover:text-blue-600"
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