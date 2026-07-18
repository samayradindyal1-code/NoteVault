import DeleteButton from "@/app/admin/DeleteButton";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminPage() {
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

  const [
  { count: totalUsers },
  { count: totalNotes },
  { count: totalPurchases },
  { count: totalSubjects },
  { count: totalSemesters },
] = await Promise.all([
  supabase.from("users").select("*", { count: "exact", head: true }),
  supabase.from("notes").select("*", { count: "exact", head: true }),
  supabase.from("purchases").select("*", { count: "exact", head: true }),
  supabase.from("subjects").select("*", { count: "exact", head: true }),
  supabase.from("semesters").select("*", { count: "exact", head: true }),
]);

    const { data: notes } = await supabase
  .from("notes")
  .select(`
    id,
    title,
    subjects (
      subject_name,
      semester_id
    )
  `)
  .order("id");

  return (
    <main className="max-w-7xl mx-auto p-10">

      <h1 className="text-4xl font-bold text-blue-700">
        Admin Dashboard
      </h1>

      <p className="text-gray-500 mt-2">
        Welcome back, Admin 👋
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mt-10">

        <div className="rounded-xl bg-white shadow p-6">
          <h2 className="text-lg text-gray-500">
            Total Users
          </h2>

          <p className="text-4xl font-bold mt-3">
            {totalUsers ?? 0}
          </p>
        </div>

        <div className="rounded-xl bg-white shadow p-6">
          <h2 className="text-lg text-gray-500">
            Total Notes
          </h2>

          <p className="text-4xl font-bold mt-3">
            {totalNotes ?? 0}
          </p>
        </div>

        <div className="rounded-xl bg-white shadow p-6">
          <h2 className="text-lg text-gray-500">
            Total Purchases
          </h2>
          <p className="text-4xl font-bold mt-3">
            {totalPurchases ?? 0}
          </p>
        </div>

        <div className="rounded-xl bg-white shadow p-6">
  <h2 className="text-lg text-gray-500">
    Total Subjects
  </h2>

  <p className="text-4xl font-bold mt-3">
    {totalSubjects ?? 0}
  </p>
</div>

<div className="rounded-xl bg-white shadow p-6">
  <h2 className="text-lg text-gray-500">
    Total Semesters
  </h2>

  <p className="text-4xl font-bold mt-3">
    {totalSemesters ?? 0}
  </p>
</div>

      </div>

      <div className="mt-10 flex gap-4">

  <Link
    href="/admin/upload"
    className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
  >
    Upload New Notes
  </Link>

  <Link
    href="/admin/notes"
    className="rounded-lg bg-green-600 px-6 py-3 text-white hover:bg-green-700"
  >
    Manage Notes
  </Link>

  <Link
  href="/admin/subjects"
  className="rounded-lg bg-purple-600 px-5 py-3 text-white hover:bg-purple-700"
>
  Manage Subjects
</Link>

</div>
<div className="mt-14">

  <h2 className="text-3xl font-bold mb-6">
    All Notes
  </h2>

  <div className="space-y-4">

    {notes?.map((note: any) => (

      <div
        key={note.id}
        className="flex items-center justify-between rounded-xl bg-white p-5 shadow"
      >

        <div>

          <h3 className="text-xl font-semibold">
            {note.title}
          </h3>

          <p className="text-gray-500">
            {note.subjects.subject_name}
          </p>

        </div>

        <div className="flex gap-3">

          <Link
            href={`/admin/edit/${note.id}`}
            className="rounded bg-yellow-500 px-4 py-2 text-white"
          >
            Edit
          </Link>

          <DeleteButton id={note.id} />

        </div>

      </div>

    ))}

  </div>

</div>

    </main>
  );
}