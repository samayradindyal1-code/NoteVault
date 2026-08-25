import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function SemesterPage({
  params,
}: {
  params: Promise<{ semesterId: string }>;
}) {
  const { semesterId } = await params;

  const supabase = await createClient();

  const id = Number(semesterId);

  // Get semester
  const { data: semester } = await supabase
    .from("semesters")
    .select("*")
    .eq("id", id)
    .single();

  // Semester not found
  if (!semester) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-12">
        <div className="mx-auto max-w-5xl text-center">
          <h1 className="text-3xl font-bold text-slate-800">
            Semester Not Found
          </h1>

          <Link
            href="/semester"
            className="
              mt-6 inline-flex
              rounded-xl
              bg-indigo-600
              px-5 py-3
              font-semibold text-white
              transition hover:bg-indigo-700
            "
          >
            ← Back to Semesters
          </Link>
        </div>
      </main>
    );
  }

  // Unavailable
  if (semester.status === "unavailable") {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-12">
        <div className="mx-auto max-w-5xl">
          <Link
            href="/semester"
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-800"
          >
            ← Back to Semesters
          </Link>

          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-3xl">
              🔒
            </div>

            <h1 className="mt-6 text-3xl font-bold text-slate-800">
              {semester.name}
            </h1>

            <p className="mt-3 text-slate-500">
              Notes for this semester are currently unavailable.
            </p>
          </div>
        </div>
      </main>
    );
  }

  // Upcoming
  if (semester.status === "upcoming") {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-12">
        <div className="mx-auto max-w-5xl">
          <Link
            href="/semester"
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-800"
          >
            ← Back to Semesters
          </Link>

          <div className="mt-8 rounded-2xl border border-amber-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-3xl">
              🚀
            </div>

            <h1 className="mt-6 text-3xl font-bold text-slate-800">
              {semester.name}
            </h1>

            <p className="mt-3 text-slate-500">
              Notes for this semester are coming soon.
            </p>
          </div>
        </div>
      </main>
    );
  }

  // Get subjects
  const { data: subjects } = await supabase
    .from("subjects")
    .select("*")
    .eq("semester_id", id)
    .order("id");

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">

        {/* Back */}
        <Link
          href="/semester"
          className="
            inline-flex items-center gap-2
            text-sm font-semibold
            text-indigo-600
            transition-colors
            hover:text-indigo-800
          "
        >
          ← Back to Semesters
        </Link>

        {/* Header */}
        <div className="mt-6 mb-10">
          <p className="text-sm font-semibold uppercase tracking-wider text-indigo-500">
            NoteVault
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
            {semester.name}
          </h1>

          <p className="mt-3 text-slate-500">
            Select a subject to view its notes.
          </p>
        </div>

        {/* Subjects */}
        {subjects && subjects.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {subjects.map((subject) => (
              <Link
                key={subject.id}
                href={`/notes/${subject.id}`}
                className="
                  group
                  rounded-2xl
                  border border-slate-200
                  bg-white
                  p-6
                  shadow-sm
                  transition-all duration-300
                  hover:-translate-y-1
                  hover:border-indigo-300
                  hover:shadow-xl
                  cursor-pointer
                "
              >
                {/* Icon */}
                <div
                  className="
                    flex h-12 w-12
                    items-center justify-center
                    rounded-xl
                    bg-indigo-50
                    text-2xl
                    transition-all duration-300
                    group-hover:bg-indigo-100
                    group-hover:scale-105
                  "
                >
                  📘
                </div>

                {/* Subject */}
                <h2
                  className="
                    mt-6
                    text-xl font-bold
                    text-slate-800
                    transition-colors
                    group-hover:text-indigo-700
                  "
                >
                  {subject.subject_name}
                </h2>

                {/* Action */}
                <div
                  className="
                    mt-6
                    flex items-center justify-between
                    border-t border-slate-100
                    pt-4
                    text-sm font-semibold
                    text-indigo-600
                  "
                >
                  <span>View Notes</span>

                  <span
                    className="
                      text-lg
                      transition-transform duration-300
                      group-hover:translate-x-1
                    "
                  >
                    →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div
            className="
              rounded-2xl
              border border-slate-200
              bg-white
              p-10
              text-center
              shadow-sm
            "
          >
            <div className="text-4xl">📚</div>

            <h2 className="mt-4 text-xl font-bold text-slate-800">
              No Subjects Available
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Subjects for this semester have not been added yet.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}