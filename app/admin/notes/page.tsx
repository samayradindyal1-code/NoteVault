import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import DeleteButton from "@/app/admin/DeleteButton";

export default async function AdminNotesPage() {
  const supabase = await createClient();

  const { data: notes } = await supabase
  .from("notes")
  .select(`
    id,
    title,
    pdf_url,
    subjects (
      subject_name
    )
  `);

const notesWithUrls = await Promise.all(
  (notes || []).map(async (note) => {
    const { data } = await supabase.storage
      .from("notes-pdf")
      .createSignedUrl(note.pdf_url, 60);

    return {
      ...note,
      signedUrl: data?.signedUrl,
    };
  })
);

console.log("NOTES =", notes);
console.log("NOTES WITH URLs =", notesWithUrls);

  return (
    <main className="max-w-7xl mx-auto p-10">

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

              <th className="border p-3">Delete</th>

            </tr>

          </thead>

          <tbody>
  <tr>
    <td className="border p-3">TEST</td>
    <td className="border p-3">TEST</td>
    <td className="border p-3">TEST</td>
    <td className="border p-3">TEST</td>
  </tr>

  {notesWithUrls.map((note: any) => (
    <tr key={note.id}>
      <td className="border p-3">{note.title}</td>
      <td className="border p-3">
  {note.subjects?.subject_name}
</td>
      <td className="border p-3">
        <a
  href={note.signedUrl}
  target="_blank"
  className="text-blue-600 underline"
>
  View PDF
</a>
      </td>
      <td className="border p-3 space-x-2">

  <Link
    href={`/admin/edit/${note.id}`}
    className="rounded bg-blue-600 px-4 py-2 text-white"
  >
    Edit
  </Link>

  <DeleteButton id={note.id} />

</td>
    </tr>
  ))}
  
</tbody>

        </table>

      </div>

    </main>
  );
}