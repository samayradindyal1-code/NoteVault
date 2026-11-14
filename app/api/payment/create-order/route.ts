
import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Payments are no longer required. NoteVault is free." },
    { status: 410 }
  );
}
