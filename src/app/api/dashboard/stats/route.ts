import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { message: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;

    // Fetch user details
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        credits: true,
        reputationScore: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Active tasks created by user
    const activeTasks = await db.task.findMany({
      where: { ownerId: userId, status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
    });

    // Completed tasks (created by user)
    const completedTasksCreated = await db.task.findMany({
      where: { ownerId: userId, status: "COMPLETED" },
      orderBy: { createdAt: "desc" },
    });

    // Submissions waiting for user's approval
    const pendingApprovals = await db.taskCompletion.findMany({
      where: {
        task: {
          ownerId: userId,
        },
        status: "PENDING",
      },
      include: {
        task: true,
        worker: {
          select: {
            username: true,
            reputationScore: true,
          },
        },
      },
      orderBy: { submittedAt: "desc" },
    });

    // Tasks completed by current user (as worker)
    const completionsSubmitted = await db.taskCompletion.findMany({
      where: { workerId: userId },
      include: {
        task: true,
      },
      orderBy: { submittedAt: "desc" },
    });

    // Transactions list
    const transactions = await db.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    // Aggregate statistics
    const totalEarned = await db.transaction.aggregate({
      where: {
        userId,
        amount: { gt: 0 },
      },
      _sum: {
        amount: true,
      },
    });

    const totalSpent = await db.transaction.aggregate({
      where: {
        userId,
        amount: { lt: 0 },
      },
      _sum: {
        amount: true,
      },
    });

    return NextResponse.json({
      credits: user.credits,
      reputationScore: user.reputationScore,
      role: user.role,
      activeTasks,
      completedTasksCreated,
      pendingApprovals,
      completionsSubmitted,
      transactions,
      stats: {
        totalEarned: totalEarned._sum.amount || 0,
        totalSpent: Math.abs(totalSpent._sum.amount || 0),
        tasksCompletedCount: completionsSubmitted.filter(c => c.status === "APPROVED").length,
        tasksCreatedCount: activeTasks.length + completedTasksCreated.length,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
