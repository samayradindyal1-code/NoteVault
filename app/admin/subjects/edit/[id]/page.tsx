"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useParams, useRouter } from "next/navigation";

export default function EditSubjectPage() {

  const supabase = createClient();
  const router = useRouter();
  const params = useParams();

  const id = params.id as string;

  const [subjectName, setSubjectName] = useState("");
  const [semesterId, setSemesterId] = useState("");

  const [semesters, setSemesters] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSemesters();
    fetchSubject();
  }, []);

  async function fetchSemesters() {

    const { data } = await supabase
      .from("semesters")
      .select("*")
      .order("id");

    setSemesters(data || []);
  }

  async function fetchSubject() {

    const { data } = await supabase
      .from("subjects")
      .select("*")
      .eq("id", id)
      .single();

    if (data) {
      setSubjectName(data.subject_name);
      setSemesterId(data.semester_id.toString());
    }
  }

  async function handleSave() {

    if (!subjectName.trim()) {
      alert("Enter Subject Name");
      return;
    }

    if (!semesterId) {
      alert("Select Semester");
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from("subjects")
      .update({
        subject_name: subjectName,
        semester_id: Number(semesterId),
      })
      .eq("id", id);

console.log("Subject ID:", id);
console.log("Subject Name:", subjectName);
console.log("Semester ID:", semesterId);
console.log("Update Error:", error);

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Subject Updated Successfully");

    router.push("/admin/subjects");
    router.refresh();
  }

  return (

    <main className="max-w-3xl mx-auto p-10">

      <h1 className="text-4xl font-bold text-blue-700">
        Edit Subject
      </h1>

      <div className="mt-10 rounded-xl bg-white p-8 shadow">

        <div className="mb-5">

          <label className="mb-2 block font-medium">
            Subject Name
          </label>

          <input
            value={subjectName}
            onChange={(e) => setSubjectName(e.target.value)}
            className="w-full rounded-lg border p-3"
          />

        </div>

        <div className="mb-5">

          <label className="mb-2 block font-medium">
            Semester
          </label>

          <select
            value={semesterId}
            onChange={(e) => setSemesterId(e.target.value)}
            className="w-full rounded-lg border p-3"
          >

            <option value="">
              Select Semester
            </option>

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

        <button
          onClick={handleSave}
          disabled={loading}
          className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>

      </div>

    </main>

  );
}