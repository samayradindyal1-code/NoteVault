"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);
    };

    getUser();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto flex max-w-7xl flex-col items-center px-6 py-20 text-center">
        <h1 className="max-w-4xl text-4xl font-bold leading-tight text-slate-900 md:text-5xl">
          One Platform for All Your
          <span className="text-blue-600"> Engineering Notes</span>
        </h1>

        <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
          Access semester-wise subjects notes PDFs in one organized platform
          designed for Computer Science students.
        </p>

        {user && (
          <p className="mt-4 text-lg font-semibold text-green-600">
            👋 Welcome {user.user_metadata.full_name}
          </p>
        )}

        <div className="mt-8 flex gap-4">
          <Link
            href={user ? "/semester" : "/login"}
            className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700"
          >
            Explore Notes
          </Link>

          {!user && (
            <Link
              href="/login"
              className="rounded-lg border border-slate-300 px-6 py-3 font-medium transition hover:bg-slate-100"
            >
              Login
            </Link>
          )}
        </div>
      </section>
    </main>
  );
}