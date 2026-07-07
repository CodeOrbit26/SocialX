import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    let workerId: string;

    if (session?.user) {
      workerId = (session.user as any).id;
    } else {
      let guestUser = await db.user.findFirst({
        where: { email: "guest@socialx.io" }
      });
      if (!guestUser) {
        guestUser = await db.user.create({
          data: {
            username: "guest",
            email: "guest@socialx.io",
            passwordHash: "guestpassword123",
            credits: 10000.0,
            reputationScore: 100
          }
        });
      }
      workerId = guestUser.id;
    }
    const { taskId, proofUrl } = await req.json();

    if (!taskId || !proofUrl) {
      return NextResponse.json(
        { message: "Missing required fields (taskId or proofUrl)" },
        { status: 400 }
      );
    }

    // Verify task exists and is active
    const task = await db.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return NextResponse.json(
        { message: "Task not found" },
        { status: 404 }
      );
    }

    if (task.status !== "ACTIVE") {
      return NextResponse.json(
        { message: "This task is no longer accepting submissions." },
        { status: 400 }
      );
    }

    if (task.ownerId === workerId && session?.user) {
      return NextResponse.json(
        { message: "You cannot complete your own task." },
        { status: 400 }
      );
    }

    // Check if worker already submitted a completion
    const existingCompletion = await db.taskCompletion.findFirst({
      where: {
        taskId,
        workerId,
      },
    });

    if (existingCompletion && session?.user) {
      return NextResponse.json(
        { message: "You have already submitted proof for this task." },
        { status: 400 }
      );
    }

    // Create completion in PENDING state
    const completion = await db.taskCompletion.create({
      data: {
        taskId,
        workerId,
        proofUrl,
        status: "PENDING",
      },
    });

    return NextResponse.json(completion, { status: 201 });
  } catch (error) {
    console.error("Task completion submit error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
