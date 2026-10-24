
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function UploadPage() {
  const [semesters, setSemesters] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSemester, setSelectedSemester] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    async function initialize() {
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
        return;
      }

      const { data: semesterData, error } = await supabase
        .from("semesters")
        .select("*")
        .eq("status", "available")
        .order("id");

      if (error) {
        console.error(error);
        alert("Could not load semesters.");
        return;
      }

      setSemesters(semesterData || []);
    }

    void initialize();
  }, []);

  async function fetchSubjects(semesterId: string) {
    setSubjects([]);

    if (!semesterId) return;

    const supabase = createClient();
    const { data, error } = await supabase
      .from("subjects")
      .select("*")
      .eq("semester_id", Number(semesterId))
      .order("subject_name");

    if (error) {
      console.error(error);
      alert("Could not load subjects.");
      return;
    }

    setSubjects(data || []);
  }

  async function handleUpload() {
    if (!selectedSemester || !selectedSubject || !title.trim() || !file) {
      alert("Please select a semester, subject, title and PDF.");
      return;
    }

    if (
      file.type !== "application/pdf" ||
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      alert("Please choose a valid PDF file.");
      return;
    }

    if (file.size <= 0 || file.size > 50 * 1024 * 1024) {
      alert("PDF size must be between 1 byte and 50 MB.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      // Phase 1: Ask the authenticated server for an upload token.
      const prepareResponse = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phase: "create-upload",
          semesterId: selectedSemester,
          subjectId: selectedSubject,
          title: title.trim(),
          fileType: file.type,
          fileSize: file.size,
        }),
      });

      const prepare = await prepareResponse.json();

      if (!prepareResponse.ok) {
        throw new Error(prepare.error || "Could not prepare upload.");
      }

      if (!prepare.path || !prepare.token) {
        throw new Error("Upload details were not returned by the server.");
      }

      // Phase 2: Upload the file directly to private Supabase Storage.
      const { error: storageError } = await supabase.storage
        .from("notes-pdf")
        .uploadToSignedUrl(prepare.path, prepare.token, file, {
          contentType: "application/pdf",
          upsert: false,
        });

      if (storageError) {
        throw new Error(`PDF upload failed: ${storageError.message}`);
      }

      // Phase 3: Save only metadata through the server API.
      const saveResponse = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phase: "save-note",
          semesterId: selectedSemester,
          subjectId: selectedSubject,
          title: title.trim(),
          path: prepare.path,
        }),
      });

      const saveResult = await saveResponse.json();

      if (!saveResponse.ok) {
        throw new Error(
          saveResult.error || "PDF uploaded but note could not be saved."
        );
      }

      alert("Notes uploaded successfully.");

      setSelectedSemester("");
      setSelectedSubject("");
      setSubjects([]);
      setTitle("");
      setFile(null);

      const fileInput = document.getElementById(
        "pdf-file"
      ) as HTMLInputElement | null;

      if (fileInput) fileInput.value = "";
    } catch (error) {
      console.error("Upload error:", error);
      alert(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 p-10">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="text-3xl font-bold text-blue-700">Upload Notes</h1>

        <p className="mt-2 text-gray-500">
          Upload a new PDF for students.
        </p>

        <div className="mt-8 space-y-6">
          <div>
            <label className="mb-2 block font-medium">Semester</label>
            <select
              className="w-full rounded-lg border p-3"
              value={selectedSemester}
              disabled={loading}
              onChange={(e) => {
                const value = e.target.value;
                setSelectedSemester(value);
                setSelectedSubject("");
                void fetchSubjects(value);
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
            <label className="mb-2 block font-medium">Subject</label>
            <select
              className="w-full rounded-lg border p-3"
              value={selectedSubject}
              disabled={loading}
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
            <label className="mb-2 block font-medium">Notes Title</label>
            <input
              type="text"
              value={title}
              disabled={loading}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Complete Notes"
              className="w-full rounded-lg border p-3"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">Choose PDF</label>
            <input
              id="pdf-file"
              type="file"
              accept="application/pdf,.pdf"
              disabled={loading}
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full rounded-lg border p-3"
            />
            <p className="mt-2 text-sm text-gray-500">
              PDF only · Maximum 50 MB
            </p>
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
