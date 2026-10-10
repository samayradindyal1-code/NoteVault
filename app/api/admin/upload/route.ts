import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { v4 as uuidv4 } from "uuid";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Please log in first." },
        { status: 401 }
      );
    }
    
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

    const body = await request.json();
    const admin = createAdminClient();

    const semesterId = Number(body.semesterId);
    const subjectId = Number(body.subjectId);
    const title =
      typeof body.title === "string" ? body.title.trim() : "";

    if (
      !Number.isSafeInteger(semesterId) ||
      semesterId <= 0 ||
      !Number.isSafeInteger(subjectId) ||
      subjectId <= 0 ||
      !title
    ) {
      return NextResponse.json(
        { error: "Invalid semester, subject, or title." },
        { status: 400 }
      );
    }

    const { data: subject, error: subjectError } = await admin
      .from("subjects")
      .select("id, semester_id")
      .eq("id", subjectId)
      .single();

    if (
      subjectError ||
      !subject ||
      Number(subject.semester_id) !== semesterId
    ) {
      return NextResponse.json(
        { error: "Subject does not belong to this semester." },
        { status: 400 }
      );
    }

    // Phase 1: Create a signed URL for direct private storage upload.
    if (body.phase === "create-upload") {
      if (
        body.fileType !== "application/pdf" ||
        !Number.isFinite(body.fileSize) ||
        body.fileSize <= 0 ||
        body.fileSize > 50 * 1024 * 1024
      ) {
        return NextResponse.json(
          { error: "Choose a PDF up to 50 MB." },
          { status: 400 }
        );
      }

      const path = `${uuidv4()}.pdf`;

      const { data, error } = await admin.storage
        .from("notes-pdf")
        .createSignedUploadUrl(path);

      if (error || !data) {
        console.error("Signed upload URL error:", error);
        return NextResponse.json(
          { error: "Could not prepare PDF upload." },
          { status: 500 }
        );
      }

      return NextResponse.json({
        path,
        token: data.token,
      });
    }

    // Phase 2: Confirm the uploaded file exists, then save its note record.
    if (body.phase === "save-note") {
      const path = body.path;

      if (
        typeof path !== "string" ||
        !/^[0-9a-f-]{36}\.pdf$/i.test(path)
      ) {
        return NextResponse.json(
          { error: "Invalid uploaded file path." },
          { status: 400 }
        );
      }

      const { data: files, error: listError } = await admin.storage
        .from("notes-pdf")
        .list("", { search: path, limit: 100 });

      if (listError || !files?.some((item) => item.name === path)) {
        return NextResponse.json(
          { error: "Uploaded PDF was not found in private storage." },
          { status: 400 }
        );
      }

      const { error: insertError } = await admin
        .from("notes")
        .insert({
          subject_id: subjectId,
          title,
          pdf_url: path,
        });

      if (insertError) {
        console.error("Note database insert error:", insertError);
        return NextResponse.json(
          { error: "PDF uploaded, but note could not be saved." },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Notes uploaded successfully.",
      });
    }

    return NextResponse.json(
      { error: "Invalid upload operation." },
      { status: 400 }
    );
  } catch (error) {
    console.error("Admin upload API error:", error);

    return NextResponse.json(
      { error: "Something went wrong while uploading." },
      { status: 500 }
    );
  }
}
