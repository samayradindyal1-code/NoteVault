
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

interface Props {
  params: Promise<{
    subjectId: string;
  }>;
}

export default async function NotesPage({ params }: Props) {
  const { subjectId } = await params;

  const supabase = await createClient();

  // Get logged-in user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Login required
  if (!user) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-12">
        <div className="mx-auto max-w-5xl rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="text-4xl">🔐</div>
          <h1 className="mt-5 text-2xl font-bold text-slate-800">
            Login Required
          </h1>
          <p className="mt-2 text-slate-500">
            Please log in to access your study notes.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-flex rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700"
          >
            Login to Continue
          </Link>
        </div>
      </main>
    );
  }

  // Get subject details
  const { data: subject, error: subjectError } = await supabase
    .from("subjects")
    .select("id, subject_name, semester_id")
    .eq("id", subjectId)
    .single();

  if (subjectError || !subject) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-12">
        <div className="mx-auto max-w-5xl text-center">
          <h1 className="text-3xl font-bold text-slate-800">
            Subject Not Found
          </h1>
          <p className="mt-3 text-slate-500">
            The requested subject could not be found.
          </p>
          <Link
            href="/semester"
            className="mt-6 inline-flex rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700"
          >
            ← Back to Semesters
          </Link>
        </div>
      </main>
    );
  }

  // Get notes for all logged-in users
  const { data: notes, error: notesError } = await supabase
    .from("notes")
    .select("id, title, pdf_url, created_at")
    .eq("subject_id", subjectId)
    .order("id");

  if (notesError) {
    console.error("Notes fetch error:", notesError.message);
  }

  // Generate short-lived signed URLs
  const notesWithSignedUrl = await Promise.all(
    (notes || []).map(async (note) => {
      const { data, error } = await supabase.storage
        .from("notes-pdf")
        .createSignedUrl(note.pdf_url, 600);

      return {
        ...note,
        signedUrl: error ? "" : data?.signedUrl ?? "",
      };
    })
  );

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <Link
          href={`/semester/${subject.semester_id}`}
          className="text-sm font-semibold text-indigo-600 hover:text-indigo-800"
        >
          ← Back to Semester
        </Link>

        <div className="mt-8 mb-8">
          <h1 className="text-4xl font-bold text-slate-900">
            {subject.subject_name}
          </h1>
          <p className="mt-2 text-slate-500">
            Access your study notes for free.
          </p>
          <p className="mt-2 text-sm font-semibold text-green-700">
            ✓ Free access for all students
          </p>
        </div>

        {notesWithSignedUrl.length > 0 ? (
          <div className="space-y-5">
            {notesWithSignedUrl.map((note) => (
              <div
                key={note.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <h2 className="text-xl font-bold text-slate-800">
                  {note.title}
                </h2>

                {note.signedUrl ? (
                  <a
                    href={note.signedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700"
                  >
                    Open PDF →
                  </a>
                ) : (
                  <p className="mt-4 text-sm text-red-500">
                    Unable to open this PDF right now.
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="text-4xl">📚</div>
            <h2 className="mt-4 text-xl font-bold text-slate-800">
              No Notes Available
            </h2>
            <p className="mt-2 text-slate-500">
              Notes for this subject have not been uploaded yet.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
