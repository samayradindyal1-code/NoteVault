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

  // ---------------------------------
  // 1. Get logged-in user
  // ---------------------------------

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ---------------------------------
  // 2. Get subject details first
  // ---------------------------------

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

  // ---------------------------------
  // 3. Check payment access
  // ---------------------------------

  let hasAccess = false;

  if (user) {
    const { data: purchase } = await supabase
      .from("purchases")
      .select("id, expiry_date")
      .eq("user_id", user.id)
      .eq("semester_id", subject.semester_id)
      .eq("paid", true)
      .gt("expiry_date", new Date().toISOString())
      .order("expiry_date", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (purchase) {
      hasAccess = true;
    }
  }

  // ---------------------------------
  // 4. Only fetch notes AFTER access
  // ---------------------------------

  const { data: notes } = hasAccess
    ? await supabase
        .from("notes")
        .select("id, title, pdf_url, created_at")
        .eq("subject_id", subjectId)
        .order("id")
    : { data: [] };

  // ---------------------------------
  // 5. Generate short-lived signed URLs
  // ---------------------------------

  const notesWithSignedUrl = hasAccess
    ? await Promise.all(
        (notes || []).map(async (note) => {
          const { data, error } = await supabase.storage
            .from("notes-pdf")
            .createSignedUrl(note.pdf_url, 600); // 10 minutes

          if (error) {
            return {
              ...note,
              signedUrl: "",
            };
          }

          return {
            ...note,
            signedUrl: data?.signedUrl ?? "",
          };
        })
      )
    : [];

  // ---------------------------------
  // 6. Page UI
  // ---------------------------------

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
            Notes
          </p>
        </div>

        {!hasAccess ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-2xl">
              🔒
            </div>

            <h2 className="mt-5 text-2xl font-bold text-slate-800">
              Notes Locked
            </h2>

            <p className="mt-2 text-slate-500">
              {user
                ? "Purchase access to view these notes."
                : "Please login and purchase access to view these notes."}
            </p>

            <Link
              href={`/payment?semesterId=${subject.semester_id}`}
              className="mt-6 inline-flex rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700"
            >
              {user
                ? "🔄 Unlock Notes ₹50"
                : "🔒 Login & Unlock ₹50"}
            </Link>

          </div>
        ) : notesWithSignedUrl.length > 0 ? (
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