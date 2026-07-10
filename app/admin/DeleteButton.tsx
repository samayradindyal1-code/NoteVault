"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function DeleteButton({ id }: { id: number }) {

  const supabase = createClient();
  const router = useRouter();

  async function deleteNote() {

    const ok = confirm("Delete this note?");

    if (!ok) return;

    const { error } = await supabase
      .from("notes")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Delete Failed");
      return;
    }

    alert("Deleted");

    router.refresh();
  }

  return (

    <button
      onClick={deleteNote}
      className="rounded bg-red-600 px-4 py-2 text-white"
    >
      Delete
    </button>

  );

}