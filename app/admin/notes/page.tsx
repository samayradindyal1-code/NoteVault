
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import DeleteButton from "@/app/admin/DeleteButton";

export default async function AdminNotesPage() {
  const supabase = await createClient();

  // Check login
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check admin role
  const admin = createAdminClient();

  const { data: profile, error: profileError } = await admin
    .from("users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || profile?.role !== "admin") {
    redirect("/");
  }

  // Fetch notes
  const { data: notes, error } = await admin
    .from("notes")
    .select(`
      id,
      title,
      pdf_url,
      subjects (
        subject_name
      )
    `)
    .order("id", { ascending: false });

  if (error) {
    console.error("Notes fetch error:", error.message);

    return (
      <main className="mx-auto max-w-7xl p-10">
        <h1 className="text-3xl font-bold text-red-600">
          Could not load notes
        </h1>
      </main>
    );
  }

  // Generate temporary PDF links
  const notesWithUrls = await Promise.all(
    (notes || []).map(async (note: any) => {
      const { data, error: urlError } = await admin.storage
        .from("notes-pdf")
        .createSignedUrl(note.pdf_url, 60);

      return {
        ...note,
        signedUrl: urlError ? null : data?.signedUrl ?? null,
      };
    })
  );

  return (
    <main className="mx-auto max-w-7xl p-10">
      <h1 className="text-4xl font-bold text-blue-700">
        Manage Notes
      </h1>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-3">Title</th>
              <th className="border p-3">Subject</th>
              <th className="border p-3">PDF</th>
              <th className="border p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {notesWithUrls.map((note: any) => (
              <tr key={note.id}>
                <td className="border p-3">
                  {note.title}
                </td>

                <td className="border p-3">
                  {Array.isArray(note.subjects)
                    ? note.subjects
                        .map((subject: any) => subject.subject_name)
                        .join(", ")
                    : note.subjects?.subject_name || "Unknown"}
                </td>

                <td className="border p-3">
                  {note.signedUrl ? (
                    <a
                      href={note.signedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      View PDF
                    </a>
                  ) : (
                    <span className="text-gray-500">
                      PDF unavailable
                    </span>
                  )}
                </td>

                <td className="border p-3">
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/admin/edit/${note.id}`}
                      className="rounded bg-blue-600 px-4 py-2 text-white"
                    >
                      Edit
                    </Link>

                    <DeleteButton id={note.id} />
                  </div>
                </td>
              </tr>
            ))}

            {notesWithUrls.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="border p-6 text-center text-gray-500"
                >
                  No notes have been uploaded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
