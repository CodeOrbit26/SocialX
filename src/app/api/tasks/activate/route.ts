import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { taskId } = await req.json();

    if (!taskId) {
      return NextResponse.json({ message: "Missing taskId" }, { status: 400 });
    }

    const task = await db.task.update({
      where: { id: taskId },
      data: { status: "ACTIVE" }
    });

    return NextResponse.json({ success: true, task });
  } catch (error) {
    console.error("Activate task error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
