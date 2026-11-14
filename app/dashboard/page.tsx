
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: dbUser } = await supabase
    .from("users")
    .select("name, email")
    .eq("id", user.id)
    .maybeSingle();

  const displayName =
    dbUser?.name ||
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    "Student";

  const email = dbUser?.email || user.email;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-indigo-500">
            NoteVault
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
            My Dashboard
          </h1>

          <p className="mt-3 text-gray-500">
            Welcome, {displayName} 👋
          </p>
        </div>

        {/* Dashboard Cards */}
        <div className="mt-10 grid gap-6 md:grid-cols-2">

          {/* Free Access */}
          <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-2xl">
              📚
            </div>

            <h2 className="mt-5 text-lg font-semibold text-gray-700">
              Notes Access
            </h2>

            <p className="mt-2 text-2xl font-bold text-emerald-600">
              Free Access
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Access available study notes without any payment.
            </p>
          </div>

          {/* Email */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-2xl">
              ✉️
            </div>

            <h2 className="mt-5 text-lg font-semibold text-gray-700">
              Email Address
            </h2>

            <p className="mt-2 break-all text-base font-medium text-slate-800">
              {email || "Email not available"}
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Your registered account email.
            </p>
          </div>

        </div>

        {/* Notes Section */}
        <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="text-4xl">🎓</div>

          <h2 className="mt-4 text-2xl font-bold text-slate-800">
            Keep Learning with NoteVault
          </h2>

          <p className="mt-3 text-gray-500">
            Explore your semester-wise subjects and access available notes.
          </p>

          <a
            href="/semester"
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700"
          >
            Explore Notes →
          </a>
        </div>

      </div>
    </main>
  );
}
