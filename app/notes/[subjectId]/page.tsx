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

  // Current logged in user

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get notes

  const { data: notes } = await supabase
    .from("notes")
    .select("*")
    .eq("subject_id", subjectId);


  // Get subject details

  const { data: subject } = await supabase
    .from("subjects")
    .select("*")
    .eq("id", subjectId)
    .single();

  // Payment access check

  let hasAccess = false;

  if(user && subject)
  {

    const { data: purchase } = await supabase
.from("purchases")
.select("*")
.eq("user_id", user.id)
.eq("semester_id", subject.semester_id)
.eq("paid", true)
.gt("expiry_date", new Date().toISOString())
.single();

    if(purchase)
    {
      hasAccess = true;
    }

  }
const notesWithSignedUrl = hasAccess
  ? await Promise.all(
      (notes || []).map(async (note) => {
        const { data, error } = await supabase.storage
          .from("notes-pdf")
          .createSignedUrl(note.pdf_url, 60);

          console.log("FILE NAME:", note.pdf_url);
console.log("SIGNED URL DATA:", data);
console.log("SIGNED URL ERROR:", error);

        if (error) {
          console.error(error);
        }

        return {
          ...note,
          signedUrl: data?.signedUrl ?? "",
        };
      })
    )
  : (notes || []).map((note) => ({
      ...note,
      signedUrl: "",
    }));
  return (

    <main className="max-w-6xl mx-auto px-6 py-10">

      <h1 className="text-4xl font-bold mb-3">
        {subject?.subject_name}
      </h1>
      <p className="text-gray-600 mb-8">
        Notes
      </p>

      <div className="space-y-5">

        {
          notesWithSignedUrl.map((note) => (

            <div
              key={note.id}
              className="rounded-xl border p-6 bg-white shadow"
            >
              <h2 className="text-2xl font-semibold">
                {note.title}
              </h2>
              {
                hasAccess ?
                (
                  <a
  href={note.signedUrl}
  target="_blank"
  className="mt-5 inline-block rounded-lg bg-green-600 px-5 py-2 text-white"
>
  Open PDF
</a>

                ):
                (
            <Link
  href={`/payment?semesterId=${subject.semester_id}`}
  className="mt-5 inline-block rounded-lg bg-yellow-500 px-5 py-2 text-white hover:bg-yellow-600"
>
  {user ? "🔄 Renew / Unlock Notes ₹50" : "🔒 Login & Unlock ₹50"}
</Link>
                )

              }
            </div>
          ))
        }
      </div>
    </main>
  );
}