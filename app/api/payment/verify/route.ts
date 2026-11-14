
import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Payments are no longer supported. NoteVault is free." },
    { status: 410 }
  );
}
