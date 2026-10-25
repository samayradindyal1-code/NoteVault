
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteButton({ id }: { id: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function deleteNote() {
    const ok = confirm("Delete this note and its PDF permanently?");

    if (!ok || loading) return;

    setLoading(true);

    try {
      const response = await fetch("/api/admin/delete-note", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        alert(result.error || "Delete failed.");
        return;
      }

      alert("Note deleted successfully.");
      router.refresh();
    } catch (error) {
      console.error("Delete request failed:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={deleteNote}
      disabled={loading}
      className="rounded bg-red-600 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? "Deleting..." : "Delete"}
    </button>
  );
}
