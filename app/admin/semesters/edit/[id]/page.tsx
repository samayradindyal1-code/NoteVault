import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditSemesterPage({
  params,
}: Props) {
  const { id } = await params;

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

  const { data: semester } = await supabase
    .from("semesters")
    .select("*")
    .eq("id", id)
    .single();

  return (
    <main className="max-w-3xl mx-auto p-10">

      <h1 className="text-4xl font-bold text-blue-700">
        Edit Semester
      </h1>

      <div className="mt-10 rounded-xl bg-white shadow p-8">

        <div className="mb-5">
          <label className="block mb-2 font-medium">
            Semester Name
          </label>

          <input
            defaultValue={semester?.name}
            className="w-full rounded-lg border p-3"
          />
        </div>

        <div className="mb-5">
          <label className="block mb-2 font-medium">
            Price
          </label>

          <input
            defaultValue={semester?.price}
            className="w-full rounded-lg border p-3"
          />
        </div>

        <div className="mb-5">
          <label className="block mb-2 font-medium">
            Status
          </label>

          <select
            defaultValue={semester?.status}
            className="w-full rounded-lg border p-3"
          >
            <option value="available">Available</option>
            <option value="upcoming">Upcoming</option>
            <option value="unavailable">Unavailable</option>
          </select>
        </div>

        <button className="rounded-lg bg-blue-600 px-6 py-3 text-white">
          Save Changes
        </button>

      </div>

    </main>
  );
}