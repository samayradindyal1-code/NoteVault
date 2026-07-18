import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DeleteButton from "./DeleteButton";

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

      <div className="flex items-center justify-between">

  <h1 className="text-4xl font-bold text-blue-700">
    Manage Subjects
  </h1>

  <Link
    href="/admin/subjects/add"
    className="rounded-lg bg-blue-600 px-5 py-3 text-white hover:bg-blue-700"
  >
    + Add Subject
  </Link>

</div>

      <div className="mt-10 rounded-xl bg-white shadow overflow-hidden">

        <table className="w-full">

          <thead className="bg-slate-100">

  <tr>
    <th className="p-4 text-left">ID</th>
    <th className="p-4 text-left">Subject</th>
    <th className="p-4 text-left">Semester</th>
    <th className="p-4 text-left">Action</th>
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

  <td className="p-4">

  <div className="flex gap-2">

    <Link
      href={`/admin/subjects/edit/${subject.id}`}
      className="rounded bg-yellow-500 px-4 py-2 text-white hover:bg-yellow-600"
    >
      Edit
    </Link>

    <DeleteButton id={subject.id} />

  </div>

</td>

</tr>

            ))}

          </tbody>

        </table>

      </div>

    </main>
  );
}