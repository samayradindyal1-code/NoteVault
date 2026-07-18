"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function AddSubjectPage() {
  const supabase = createClient();
  const router = useRouter();

  const [semesters, setSemesters] = useState<any[]>([]);
  const [semesterId, setSemesterId] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSemesters();
  }, []);

  async function fetchSemesters() {
    const { data } = await supabase
      .from("semesters")
      .select("*")
      .order("id");

    setSemesters(data || []);
  }

  async function handleAdd() {
    if (!semesterId) {
      alert("Select Semester");
      return;
    }

    if (!subjectName.trim()) {
      alert("Enter Subject Name");
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from("subjects")
      .insert({
        semester_id: Number(semesterId),
        subject_name: subjectName,
      });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Subject Added Successfully");

    router.push("/admin/subjects");
    router.refresh();
  }

  return (
    <main className="max-w-3xl mx-auto p-10">

      <h1 className="text-4xl font-bold text-blue-700">
        Add Subject
      </h1>

      <div className="mt-10 rounded-xl bg-white shadow p-8">

        <div className="mb-5">
          <label className="block mb-2 font-medium">
            Semester
          </label>

          <select
            className="w-full rounded-lg border p-3"
            value={semesterId}
            onChange={(e) => setSemesterId(e.target.value)}
          >
            <option value="">Select Semester</option>

            {semesters.map((semester) => (
              <option
                key={semester.id}
                value={semester.id}
              >
                {semester.name}
              </option>
            ))}

          </select>
        </div>

        <div className="mb-5">

          <label className="block mb-2 font-medium">
            Subject Name
          </label>

          <input
            value={subjectName}
            onChange={(e) => setSubjectName(e.target.value)}
            className="w-full rounded-lg border p-3"
            placeholder="Operating System"
          />

        </div>

        <button
          onClick={handleAdd}
          disabled={loading}
          className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? "Adding..." : "Add Subject"}
        </button>

      </div>

    </main>
  );
}