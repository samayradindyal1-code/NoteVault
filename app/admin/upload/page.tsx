"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { v4 as uuidv4 } from "uuid";

export default function UploadPage() {
  const supabase = createClient();

  const [semesters, setSemesters] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);

  const [selectedSemester, setSelectedSemester] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");

  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);

useEffect(() => {
  checkAdmin();
  fetchSemesters();
}, []);

async function checkAdmin() {

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    window.location.href = "/login";
    return;
  }

  const { data } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (data?.role !== "admin") {
    window.location.href = "/";
  }
}

  async function fetchSemesters() {
    const { data, error } = await supabase
      .from("semesters")
      .select("*")
      .eq("status", "available")
      .order("id");

    if (error) {
      console.error(error);
      return;
    }

    setSemesters(data || []);
  }

  async function fetchSubjects(semesterId: string) {
    if (!semesterId) {
      setSubjects([]);
      return;
    }

    const { data, error } = await supabase
      .from("subjects")
      .select("*")
      .eq("semester_id", Number(semesterId))
      .order("subject_name");

    if (error) {
      console.error(error);
      return;
    }

    setSubjects(data || []);
  }

  async function handleUpload() {
    if (!selectedSemester) {
      alert("Please select a semester.");
      return;
    }

    if (!selectedSubject) {
      alert("Please select a subject.");
      return;
    }

    if (!title.trim()) {
      alert("Please enter notes title.");
      return;
    }

    if (!file) {
      alert("Please choose a PDF.");
      return;
    }

    try {
      setLoading(true);

      const fileName = `${uuidv4()}-${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("notes-pdf")
        .upload(fileName, file);

      if (uploadError) {
        throw uploadError;
      }

      const { error: insertError } = await supabase
  .from("notes")
  .insert({
    subject_id: Number(selectedSubject),
    title: title,
    pdf_url: fileName,
  });

if (insertError) {
  throw insertError;
} 

      alert("Notes uploaded successfully.");

      setSelectedSemester("");
      setSelectedSubject("");
      setSubjects([]);
      setTitle("");
      setFile(null);
    } catch (error: any) {
  console.log("FULL ERROR:", error);
  alert(JSON.stringify(error, null, 2));
} finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 p-10">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-lg">

        <h1 className="text-3xl font-bold text-blue-700">
          Upload Notes
        </h1>

        <p className="mt-2 text-gray-500">
          Upload a new PDF for students.
        </p>

        <div className="mt-8 space-y-6">

          <div>
            <label className="mb-2 block font-medium">
              Semester
            </label>

            <select
              className="w-full rounded-lg border p-3"
              value={selectedSemester}
              onChange={(e) => {
                setSelectedSemester(e.target.value);
                setSelectedSubject("");
                fetchSubjects(e.target.value);
              }}
            >
              <option value="">Select Semester</option>

              {semesters.map((semester) => (
                <option key={semester.id} value={semester.id}>
                  {semester.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Subject
            </label>

            <select
              className="w-full rounded-lg border p-3"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
            >
              <option value="">Select Subject</option>

              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.subject_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Notes Title
            </label>

            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Complete Notes"
              className="w-full rounded-lg border p-3"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Choose PDF
            </label>

            <input
              type="file"
              accept=".pdf"
              onChange={(e) => {
                if (e.target.files?.length) {
                  setFile(e.target.files[0]);
                }
              }}
              className="w-full rounded-lg border p-3"
            />
          </div>

          <button
            type="button"
            onClick={handleUpload}
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-3 text-white hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? "Uploading..." : "Upload PDF"}
          </button>

        </div>

      </div>
    </main>
  );
}