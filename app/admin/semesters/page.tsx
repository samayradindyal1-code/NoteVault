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
    <main className="max-w-7xl mx-auto p-10">

      <div className="flex items-center justify-between">

        <h1 className="text-4xl font-bold text-blue-700">
          Manage Semesters
        </h1>

        <Link
          href="/admin/semesters/add"
          className="rounded-lg bg-blue-600 px-5 py-3 text-white hover:bg-blue-700"
        >
          + Add Semester
        </Link>

      </div>

      <div className="mt-10 overflow-hidden rounded-xl bg-white shadow">

        <table className="w-full">

          <thead className="bg-slate-100">

            <tr>

              <th className="p-4 text-left">ID</th>

              <th className="p-4 text-left">Semester</th>

              <th className="p-4 text-left">Price</th>

              <th className="p-4 text-left">Status</th>

              <th className="p-4 text-left">Route</th>

              <th className="p-4 text-left">Action</th>

            </tr>

          </thead>

          <tbody>

            {semesters?.map((semester: any) => (

              <tr
                key={semester.id}
                className="border-t"
              >

                <td className="p-4">
                  {semester.id}
                </td>

                <td className="p-4">
                  {semester.name}
                </td>

                <td className="p-4">
                  ₹{semester.price}
                </td>

                <td className="p-4 capitalize">
                  {semester.status}
                </td>

                <td className="p-4">
                  {semester.route}
                </td>

                <td className="p-4">

                  <Link
                    href={`/admin/semesters/edit/${semester.id}`}
                    className="rounded bg-yellow-500 px-4 py-2 text-white"
                  >
                    Edit
                  </Link>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </main>
  );
}