import { createClient } from "@/lib/supabase/server";
import SemesterCard from "@/components/SemesterCard";

export default async function SemesterList() {
  const supabase = await createClient();

  const { data: semesters } = await supabase
    .from("semesters")
    .select("*")
    .order("id");

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-7xl">

        {/* Heading */}
        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-500">
            BTech CSE
          </p>

          <h1 className="mt-2 text-4xl font-bold text-slate-800">
            Select Semester
          </h1>

          <p className="mt-2 text-slate-500">
            Choose a semester to access your notes.
          </p>
        </div>

        {/* Semester Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {semesters?.map((semester) => (
            <SemesterCard
              key={semester.id}
              id={semester.id}
              name={semester.name}
              status={semester.status}
              route={`/semester/${semester.id}`}
            />
          ))}
        </div>

      </div>
    </main>
  );
}