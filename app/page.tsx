
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    let active = true;

    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (active) {
        setUser(user);
      }
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <main className="min-h-[calc(100vh-80px)] overflow-hidden bg-gradient-to-b from-white via-slate-50 to-blue-50/60">
      <section className="mx-auto flex w-full max-w-7xl flex-col items-center px-4 py-16 text-center sm:px-6 sm:py-20 md:py-28">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-2 text-xs font-semibold text-blue-700 shadow-sm sm:text-sm">
          <span className="h-2 w-2 rounded-full bg-blue-500" />
          Your semester-wise study companion
        </div>

        <h1 className="max-w-4xl text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl md:text-5xl lg:text-6xl">
          One Platform for All Your
          <span className="mt-1 block text-blue-600">
            Engineering Notes
          </span>
        </h1>

        <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base md:text-lg">
          Access semester-wise subject notes and PDFs in one organized
          platform designed for Computer Science students.
        </p>

        {user && (
          <p className="mt-5 max-w-full break-words text-base font-semibold text-green-700 sm:text-lg">
            👋 Welcome{" "}
            {user.user_metadata?.full_name ||
              user.user_metadata?.name ||
              user.email}
          </p>
        )}

        <div className="mt-8 flex w-full max-w-sm flex-col gap-3 sm:w-auto sm:max-w-none sm:flex-row sm:justify-center sm:gap-4">
          <Link
            href={user ? "/semester" : "/login"}
            className="inline-flex min-h-12 items-center justify-center rounded-xl bg-blue-600 px-7 py-3 font-semibold text-white shadow-md shadow-blue-600/20 transition duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg active:translate-y-0 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
          >
            Explore Notes
            <span className="ml-2 transition-transform duration-200 group-hover:translate-x-1">
              →
            </span>
          </Link>

          {!user && (
            <Link
              href="/login"
              className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-7 py-3 font-semibold text-slate-700 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 active:translate-y-0 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
            >
              Login
            </Link>
          )}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-xs text-slate-500 sm:gap-x-7 sm:text-sm">
          <span className="inline-flex items-center gap-2">
            <span className="text-green-600">✓</span>
            Semester-wise notes
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="text-green-600">✓</span>
            Organized subjects
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="text-green-600">✓</span>
            Easy access
          </span>
        </div>
      </section>
    </main>
  );
}
