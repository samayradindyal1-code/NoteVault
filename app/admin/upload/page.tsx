"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

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

    if (file.type !== "application/pdf") {
      alert("Only PDF files are allowed.");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      alert("PDF size must be 50 MB or less.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("semesterId", selectedSemester);
      formData.append("subjectId", selectedSubject);
      formData.append("title", title.trim());
      formData.append("file", file);

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Upload failed.");
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

      if (fileInput) {
        fileInput.value = "";
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      alert(error.message || "Something went wrong.");
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
              onChange={(e) =>
                setSelectedSubject(e.target.value)
              }
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
              id="pdf-file"
              type="file"
              accept="application/pdf,.pdf"
              onChange={(e) => {
                if (e.target.files?.length) {
                  setFile(e.target.files[0]);
                }
              }}
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