"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function EditSemesterPage() {
  const supabase = createClient();

  const router = useRouter();
  const params = useParams();

  const id = params.id as string;

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState("available");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSemester();
  }, []);

  async function fetchSemester() {
    const { data, error } = await supabase
      .from("semesters")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      alert(error.message);
      return;
    }

    setName(data.name);
    setPrice(String(data.price));
    setStatus(data.status);
  }

  async function handleSave() {
  setLoading(true);

  const { data, error } = await supabase
    .from("semesters")
    .update({
      name,
      price: Number(price),
      status,
    })
    .eq("id", id)
    .select();

  setLoading(false);

  console.log("UPDATE DATA =", data);
  console.log("UPDATE ERROR =", error);

  if (error) {
    alert(error.message);
    return;
  }

  alert("Update successful!");

  router.push("/admin/semesters");
  router.refresh();
}

  return (
    <main className="max-w-3xl mx-auto p-10">

      <h1 className="text-4xl font-bold text-blue-700">
        Edit Semester
      </h1>

      <div className="mt-10 rounded-xl bg-white shadow p-8">

        <div className="mb-5">
          <label className="block mb-2 font-medium">
            Semester Name
          </label>

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border p-3"
          />
        </div>

        <div className="mb-5">
          <label className="block mb-2 font-medium">
            Price
          </label>

          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full rounded-lg border p-3"
          />
        </div>

        <div className="mb-5">
          <label className="block mb-2 font-medium">
            Status
          </label>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-lg border p-3"
          >
            <option value="available">Available</option>
            <option value="upcoming">Upcoming</option>
            <option value="unavailable">Unavailable</option>
          </select>
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>

      </div>

    </main>
  );
}