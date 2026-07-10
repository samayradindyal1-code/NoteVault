"use client";
import { v4 as uuidv4 } from "uuid";
import { createClient } from "@/lib/supabase/client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditNotePage() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();

  const id = Number(params.id);

  const [title, setTitle] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    loadNote();
  }, []);

  async function loadNote() {
    const { data } = await supabase
      .from("notes")
      .select("*")
      .eq("id", id)
      .single();

    if (data) {
      setTitle(data.title);
      setPdfUrl(data.pdf_url);
    }
  }

  async function updateNote() {

  let newPdfUrl = pdfUrl;
  const oldPdf = pdfUrl;

  // New PDF selected
  if (file) {

    const fileName = `${uuidv4()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("notes-pdf")
      .upload(fileName, file);

    if (uploadError) {
      alert("PDF Upload Failed");
      return;
    }

    newPdfUrl = fileName;

    // Delete old PDF from Storage

if (oldPdf) {
  const { error: deleteStorageError } = await supabase.storage
    .from("notes-pdf")
    .remove([oldPdf]);

  if (deleteStorageError) {
    console.log(deleteStorageError);
  }
}
  }

  const { error } = await supabase
    .from("notes")
    .update({
      title: title,
      pdf_url: newPdfUrl,
    })
    .eq("id", id);

  if (error) {
    console.log(error);
    alert("Update Failed");
    return;
  }

  alert("Updated Successfully 🎉");

  router.push("/admin/notes");
  router.refresh();
}

  return (
    <main className="max-w-3xl mx-auto p-10">

      <h1 className="text-4xl font-bold text-blue-700">
        Edit Note
      </h1>

      <div className="mt-8 space-y-6">

        <div>

          <label className="font-medium">
            Title
          </label>

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-2 w-full rounded border p-3"
          />

        </div>

        <div>

          <label className="font-medium">
            Current PDF
          </label>
          <div className="mt-5">

  <label className="font-medium">
    Replace PDF (Optional)
  </label>

  <input
    type="file"
    accept=".pdf"
    className="mt-2 w-full rounded border p-3"
    onChange={(e) => {
      if (e.target.files?.length) {
        setFile(e.target.files[0]);
      }
    }}
  />

</div>
          <br />

          <a
            href={pdfUrl}
            target="_blank"
            className="text-blue-600 underline"
          >
            View Current PDF
          </a>

        </div>

        <button
          onClick={updateNote}
          className="rounded bg-blue-600 px-6 py-3 text-white"
        >
          Save Changes
        </button>

      </div>

    </main>
  );
}