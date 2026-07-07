import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// Helper to check if current user is an admin
async function isAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user && (session.user as any).role === "ADMIN";
}

// GET all admin dashboard stats, users, and reports
export async function GET(req: Request) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json(
        { message: "Access denied. Admins only." },
        { status: 403 }
      );
    }

    const users = await db.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        credits: true,
        reputationScore: true,
        role: true,
        isSuspended: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const reports = await db.report.findMany({
      include: {
        reporter: {
          select: { username: true },
        },
        reportedUser: {
          select: { username: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const totalSystemCredits = await db.user.aggregate({
      _sum: {
        credits: true,
      },
    });

    const activeTasksCount = await db.task.count({
      where: { status: "ACTIVE" },
    });

    const totalCompletionsCount = await db.taskCompletion.count();

    return NextResponse.json({
      users,
      reports,
      stats: {
        totalUsers: users.length,
        totalSystemCredits: totalSystemCredits._sum.credits || 0,
        activeTasksCount,
        totalCompletionsCount,
      },
    });
  } catch (error) {
    console.error("Admin GET error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST admin actions: toggle-suspend, update-credits, resolve-report
export async function POST(req: Request) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json(
        { message: "Access denied. Admins only." },
        { status: 403 }
      );
    }

    const { action, userId, reportId, creditsChange } = await req.json();

    if (!action) {
      return NextResponse.json(
        { message: "Action type is required" },
        { status: 400 }
      );
    }

    if (action === "toggle-suspend") {
      if (!userId) {
        return NextResponse.json({ message: "userId is required" }, { status: 400 });
      }

      const user = await db.user.findUnique({ where: { id: userId } });
      if (!user) {
        return NextResponse.json({ message: "User not found" }, { status: 404 });
      }

      const updatedUser = await db.user.update({
        where: { id: userId },
        data: { isSuspended: !user.isSuspended },
        select: { id: true, username: true, isSuspended: true },
      });

      return NextResponse.json({
        message: `User ${updatedUser.username} is now ${updatedUser.isSuspended ? "suspended" : "active"}.`,
        user: updatedUser,
      });
    }

    if (action === "update-credits") {
      if (!userId || creditsChange === undefined) {
        return NextResponse.json({ message: "userId and creditsChange are required" }, { status: 400 });
      }

      const parsedChange = parseFloat(creditsChange);
      if (isNaN(parsedChange)) {
        return NextResponse.json({ message: "Invalid credit adjustment value" }, { status: 400 });
      }

      const updatedUser = await db.$transaction(async (tx) => {
        const user = await tx.user.update({
          where: { id: userId },
          data: {
            credits: {
              increment: parsedChange,
            },
          },
        });

        await tx.transaction.create({
          data: {
            userId,
            amount: parsedChange,
            type: "ADMIN_ADJUST",
            description: `Admin manual balance adjustment: ${parsedChange > 0 ? "+" : ""}${parsedChange} credits`,
          },
        });

        return user;
      });

      return NextResponse.json({
        message: `Adjusted user balance. New balance is ${updatedUser.credits} credits.`,
        credits: updatedUser.credits,
      });
    }

    if (action === "resolve-report") {
      if (!reportId) {
        return NextResponse.json({ message: "reportId is required" }, { status: 400 });
      }

      const updatedReport = await db.report.update({
        where: { id: reportId },
        data: { status: "RESOLVED" },
      });

      return NextResponse.json({
        message: "Report resolved successfully.",
        report: updatedReport,
      });
    }

    return NextResponse.json(
      { message: "Unknown action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Admin POST error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
