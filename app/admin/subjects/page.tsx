import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function SubjectsPage() {

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

  const { data: subjects } = await supabase
    .from("subjects")
    .select(`
      *,
      semesters(name)
    `)
    .order("semester_id")
    .order("subject_name");

  return (
    <main className="max-w-7xl mx-auto p-10">

      <h1 className="text-4xl font-bold text-blue-700">
        Manage Subjects
      </h1>

      <div className="mt-10 rounded-xl bg-white shadow overflow-hidden">

        <table className="w-full">

          <thead className="bg-slate-100">

            <tr>
              <th className="p-4 text-left">ID</th>
              <th className="p-4 text-left">Subject</th>
              <th className="p-4 text-left">Semester</th>
            </tr>

          </thead>

          <tbody>

            {subjects?.map((subject: any) => (

              <tr
                key={subject.id}
                className="border-t"
              >
                <td className="p-4">{subject.id}</td>

                <td className="p-4">
                  {subject.subject_name}
                </td>

                <td className="p-4">
                  {subject.semesters?.name}
                </td>
              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </main>
  );
}