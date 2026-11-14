
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function ManageSemestersPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: dbUser } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (dbUser?.role !== "admin") {
    redirect("/");
  }

  const { data: semesters } = await supabase
    .from("semesters")
    .select("*")
    .order("id");

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-8 sm:py-10">
      <div className="mx-auto max-w-7xl">

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold text-blue-700 sm:text-4xl">
            Manage Semesters
          </h1>

          <Link
            href="/admin/semesters/add"
            className="inline-flex justify-center rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            + Add Semester
          </Link>
        </div>

        <div className="mt-10 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[650px]">

            <thead className="bg-slate-100">
              <tr>
                <th className="p-4 text-left">ID</th>
                <th className="p-4 text-left">Semester</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Route</th>
                <th className="p-4 text-left">Action</th>
              </tr>
            </thead>

            <tbody>
              {semesters?.map((semester: any) => (
                <tr key={semester.id} className="border-t">
                  <td className="p-4">{semester.id}</td>

                  <td className="p-4 font-medium">
                    {semester.name}
                  </td>

                  <td className="p-4 capitalize">
                    {semester.status}
                  </td>

                  <td className="p-4 text-sm text-slate-600">
                    {semester.route}
                  </td>

                  <td className="p-4">
                    <Link
                      href={`/admin/semesters/edit/${semester.id}`}
                      className="inline-flex rounded-lg bg-yellow-500 px-4 py-2 font-medium text-white transition hover:bg-yellow-600"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}

              {!semesters?.length && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-500">
                    No semesters found.
                  </td>
                </tr>
              )}
            </tbody>

          </table>
        </div>
      </div>
    </main>
  );
}
