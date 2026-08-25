import { createClient } from "@/lib/supabase/server";
import SemesterCard from "@/components/SemesterCard";

export default async function SemesterList() {
  const supabase = await createClient();

  const { data: semesters } = await supabase
    .from("semesters")
    .select("*")
    .order("id");

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 sm:px-8 lg:px-12">
      
      {/* Header */}
      <div className="mx-auto max-w-7xl">
        <div className="mb-10">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-indigo-600">
            NoteVault
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Select Your Semester
          </h1>

          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-500">
            Choose a semester to access Computer Science Engineering
            notes and study materials.
          </p>
        </div>

        {/* Semester Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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