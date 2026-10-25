
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Please log in first." },
        { status: 401 }
      );
    }

    const admin = createAdminClient();

    const { data: profile, error: profileError } = await admin
      .from("users")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError || profile?.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const id = Number(body.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
      return NextResponse.json(
        { error: "Invalid note ID." },
        { status: 400 }
      );
    }

    const { data: note, error: noteError } = await admin
      .from("notes")
      .select("id, pdf_url")
      .eq("id", id)
      .maybeSingle();

    if (noteError) {
      return NextResponse.json(
        { error: "Could not find the note." },
        { status: 500 }
      );
    }

    if (!note) {
      return NextResponse.json(
        { error: "Note not found." },
        { status: 404 }
      );
    }

    const { error: deleteError } = await admin
      .from("notes")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Note deletion failed:", deleteError.message);

      return NextResponse.json(
        { error: "Could not delete the note." },
        { status: 500 }
      );
    }

    // Remove the PDF from private storage after deleting its record.
    if (note.pdf_url) {
      const { error: storageError } = await admin.storage
        .from("notes-pdf")
        .remove([note.pdf_url]);

      if (storageError) {
        console.error("PDF cleanup failed:", storageError.message);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete-note API error:", error);

    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}
