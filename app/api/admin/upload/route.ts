import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: Request) {
  try {
    // 1. Check logged-in user
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "You must be logged in." },
        { status: 401 }
      );
    }

    // 2. Check admin role
    const { data: dbUser, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (userError || dbUser?.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required." },
        { status: 403 }
      );
    }

    // 3. Read form data
    const formData = await request.formData();

    const semesterId = formData.get("semesterId");
    const subjectId = formData.get("subjectId");
    const title = formData.get("title");
    const file = formData.get("file");

    // 4. Validate fields
    if (!semesterId || !subjectId || !title || !file) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 }
      );
    }

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Invalid file." },
        { status: 400 }
      );
    }

    // 5. Only PDF allowed
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are allowed." },
        { status: 400 }
      );
    }

    // 6. Maximum 50 MB
    const MAX_FILE_SIZE = 50 * 1024 * 1024;

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "PDF size must be 50 MB or less." },
        { status: 400 }
      );
    }

    // 7. Verify subject belongs to selected semester
    const admin = createAdminClient();

    const { data: subject, error: subjectError } = await admin
      .from("subjects")
      .select("id, semester_id")
      .eq("id", Number(subjectId))
      .single();

    if (
      subjectError ||
      !subject ||
      subject.semester_id !== Number(semesterId)
    ) {
      return NextResponse.json(
        { error: "Invalid subject or semester." },
        { status: 400 }
      );
    }

    // 8. Generate private storage filename
    const fileName = `${uuidv4()}.pdf`;

    // 9. Upload using server-side secret client
    const { error: uploadError } = await admin.storage
      .from("notes-pdf")
      .upload(fileName, file, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);

      return NextResponse.json(
        { error: "PDF upload failed." },
        { status: 500 }
      );
    }

    // 10. Save note in database
    const { error: insertError } = await admin
      .from("notes")
      .insert({
        subject_id: Number(subjectId),
        title: String(title).trim(),
        pdf_url: fileName,
      });

    // 11. If DB insert fails, remove uploaded PDF
    if (insertError) {
      await admin.storage
        .from("notes-pdf")
        .remove([fileName]);

      console.error("Notes insert error:", insertError);

      return NextResponse.json(
        { error: "Note could not be saved." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Notes uploaded successfully.",
    });
  } catch (error) {
    console.error("Upload API error:", error);

    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}