import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { message: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const ownerId = (session.user as any).id;
    const { completionId, action } = await req.json(); // action can be "APPROVE" or "REJECT"

    if (!completionId || !action || !["APPROVE", "REJECT"].includes(action)) {
      return NextResponse.json(
        { message: "Invalid fields. completionId and action (APPROVE/REJECT) are required." },
        { status: 400 }
      );
    }

    // Fetch completion along with the task to check ownership
    const completion = await db.taskCompletion.findUnique({
      where: { id: completionId },
      include: {
        task: true,
        worker: true,
      },
    });

    if (!completion) {
      return NextResponse.json(
        { message: "Completion submission not found" },
        { status: 404 }
      );
    }

    if (completion.task.ownerId !== ownerId) {
      return NextResponse.json(
        { message: "Unauthorized. You do not own this task." },
        { status: 403 }
      );
    }

    if (completion.status !== "PENDING") {
      return NextResponse.json(
        { message: "This submission has already been processed." },
        { status: 400 }
      );
    }

    const reward = completion.task.reward;
    const workerId = completion.workerId;

    if (action === "APPROVE") {
      await db.$transaction(async (tx) => {
        // 1. Update completion status
        await tx.taskCompletion.update({
          where: { id: completionId },
          data: { status: "APPROVED" },
        });

        // 2. Increment task completedCount
        const updatedTask = await tx.task.update({
          where: { id: completion.taskId },
          data: {
            completedCount: {
              increment: 1,
            },
          },
        });

        // If task reached quantity, update status to COMPLETED
        if (updatedTask.completedCount >= updatedTask.quantity) {
          await tx.task.update({
            where: { id: completion.taskId },
            data: { status: "COMPLETED" },
          });
        }

        // 3. Pay worker
        await tx.user.update({
          where: { id: workerId },
          data: {
            credits: {
              increment: reward,
            },
            // Boost reputation slightly for good work (max 100)
            reputationScore: {
              increment: 0.5,
            },
          },
        });

        // Ensure reputation score doesn't exceed 100
        const updatedWorker = await tx.user.findUnique({
          where: { id: workerId },
          select: { reputationScore: true },
        });
        if (updatedWorker && updatedWorker.reputationScore > 100) {
          await tx.user.update({
            where: { id: workerId },
            data: { reputationScore: 100.0 },
          });
        }

        // 4. Log transaction
        await tx.transaction.create({
          data: {
            userId: workerId,
            amount: reward,
            type: "EARN",
            description: `Earned ${reward} credits by completing ${completion.task.taskType} task for ${completion.task.targetUsername}`,
          },
        });
      });

      return NextResponse.json({ message: "Completion approved and credits transferred successfully." });
    } else {
      // action === "REJECT"
      await db.$transaction(async (tx) => {
        // 1. Update completion status
        await tx.taskCompletion.update({
          where: { id: completionId },
          data: { status: "REJECTED" },
        });

        // 2. Deduct worker reputation score (anti-abuse)
        await tx.user.update({
          where: { id: workerId },
          data: {
            reputationScore: {
              decrement: 5.0, // Deduct 5 points for bad/fake proof
            },
          },
        });

        // Ensure reputation score doesn't drop below 0
        const updatedWorker = await tx.user.findUnique({
          where: { id: workerId },
          select: { reputationScore: true },
        });
        if (updatedWorker && updatedWorker.reputationScore < 0) {
          await tx.user.update({
            where: { id: workerId },
            data: { reputationScore: 0.0 },
          });
        }
      });

      return NextResponse.json({ message: "Submission rejected and reputation penalty applied." });
    }
  } catch (error) {
    console.error("Manage completion error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
