import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// GET tasks available to complete (excluding user's own tasks and already completed ones)
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user ? (session.user as any).id : null;

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    // Build query conditions
    const whereCondition: any = {
      status: "ACTIVE",
      quantity: {
        gt: db.task.fields.completedCount,
      },
    };

    if (userId) {
      whereCondition.ownerId = { not: userId };
      // Exclude tasks already completed/submitted by this user
      whereCondition.completions = {
        none: {
          workerId: userId,
        },
      };
    }

    if (type && ["FOLLOW", "LIKE", "VIEW", "COMMENT"].includes(type)) {
      whereCondition.taskType = type;
    }

    const tasks = await db.task.findMany({
      where: whereCondition,
      include: {
        owner: {
          select: {
            username: true,
            reputationScore: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Fetch tasks error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { taskType, targetUsername, targetUrl, reward, quantity } = await req.json();
    const session = await getServerSession(authOptions);
    let ownerId: string;

    if (session?.user) {
      ownerId = (session.user as any).id;
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
      ownerId = guestUser.id;
    }

    if (!taskType || !targetUsername || !targetUrl || !reward || !quantity) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!["FOLLOW", "LIKE", "VIEW", "COMMENT"].includes(taskType)) {
      return NextResponse.json(
        { message: "Invalid task type" },
        { status: 400 }
      );
    }

    const totalCost = parseFloat(reward) * parseInt(quantity);
    if (isNaN(totalCost) || totalCost <= 0) {
      return NextResponse.json(
        { message: "Invalid reward or quantity" },
        { status: 400 }
      );
    }

    // Execute atomic transaction for deducting credits and creating task
    const result = await db.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: ownerId },
      });

      if (!user) {
        throw new Error("User not found");
      }

      if (user.isSuspended) {
        throw new Error("Account suspended");
      }

      if (user.credits < totalCost) {
        throw new Error("Insufficient credits");
      }

      // Deduct credits
      const updatedUser = await tx.user.update({
        where: { id: ownerId },
        data: {
          credits: {
            decrement: totalCost,
          },
        },
      });

      // Log transaction
      await tx.transaction.create({
        data: {
          userId: ownerId,
          amount: -totalCost,
          type: "SPEND",
          description: `Created ${taskType} task for ${targetUsername} (${quantity} qty)`,
        },
      });

      // Create task
      const task = await tx.task.create({
        data: {
          ownerId,
          taskType,
          targetUsername,
          targetUrl,
          reward: parseFloat(reward),
          quantity: parseInt(quantity),
          status: session?.user ? "ACTIVE" : "PENDING",
        },
      });

      return { task, updatedUser };
    });

    return NextResponse.json(result.task, { status: 201 });
  } catch (error: any) {
    console.error("Create task error:", error);
    if (error.message === "Insufficient credits") {
      return NextResponse.json(
        { message: "Insufficient credits for this task configuration." },
        { status: 400 }
      );
    }
    if (error.message === "Account suspended") {
      return NextResponse.json(
        { message: "Your account is suspended. You cannot perform this action." },
        { status: 403 }
      );
    }
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
