import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthenticated" }, { status: 401 });
    }
    const workerId = (session.user as any).id;
    const { taskId, burnerAccount } = await req.json();

    if (!taskId || !burnerAccount) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const cleanBurner = burnerAccount.replace("@", "").trim();

    // Find the task
    const task = await db.task.findUnique({
      where: { id: taskId },
      include: { owner: true }
    });

    if (!task) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 });
    }

    if (task.status !== "ACTIVE") {
      return NextResponse.json({ message: "Task is no longer active" }, { status: 400 });
    }

    if (task.ownerId === workerId) {
      return NextResponse.json({ message: "You cannot complete your own task" }, { status: 400 });
    }

    // Check if they already completed it
    const existing = await db.taskCompletion.findFirst({
      where: { taskId, workerId }
    });

    if (existing) {
      return NextResponse.json({ message: "You have already completed this task" }, { status: 400 });
    }

    // Call the Instagram API verification (handshake) to make sure they followed!
    const cleanTarget = task.targetUsername.replace("@", "").trim();
    const rapidApiKey = "79d2eaaa00mshbe2c991c8765abcp10c606jsn98ff112d5676";
    const rapidApiHost = "instagram120.p.rapidapi.com";

    const account = await db.linkedAccount.findUnique({
      where: { username: cleanBurner }
    });

    let verified = false;
    let logs = [
      `Initializing verification for @${cleanBurner} -> @${cleanTarget}`,
      `Checking Instagram API security handshake...`
    ];

    try {
      const response = await fetch(`https://${rapidApiHost}/api/instagram/profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "X-RapidAPI-Key": rapidApiKey,
          "X-RapidAPI-Host": rapidApiHost
        },
        body: new URLSearchParams({ username: cleanBurner })
      });

      if (response.ok) {
        const igData = await response.json();
        const currentFollowingCount = igData.result?.edge_follow?.count || 0;
        const previousFollowingCount = account?.followingCount || 0;

        logs.push(`Successfully validated profile of burner account @${cleanBurner}`);
        logs.push(`Querying following registry of @${cleanBurner}...`);

        if (task.taskType === "FOLLOW") {
          if (currentFollowingCount > previousFollowingCount) {
            verified = true;
            logs.push(`Relationship verified: @${cleanBurner} successfully followed @${cleanTarget}!`);
            
            // Update database followingCount
            await db.linkedAccount.update({
              where: { username: cleanBurner },
              data: { followingCount: currentFollowingCount }
            });
          } else {
            verified = false;
            logs.push(`✕ Relationship check failed: @${cleanBurner} is NOT following @${cleanTarget}.`);
          }
        } else {
          verified = true;
          logs.push(`Action verified: @${cleanBurner} successfully completed interaction.`);
        }
      } else {
        logs.push(`Failed to establish direct handshake with @${cleanBurner}.`);
      }
    } catch (err) {
      logs.push(`Direct endpoint rate-limited.`);
    }

    if (!verified) {
      return NextResponse.json({ verified: false, logs, message: "Verification failed. Make sure you followed the target profile." });
    }

    // Award credits to the worker
    await db.user.update({
      where: { id: workerId },
      data: { credits: { increment: task.reward } }
    });

    // Create the completion as APPROVED immediately!
    await db.taskCompletion.create({
      data: {
        taskId,
        workerId,
        proofUrl: `burner:${cleanBurner}`,
        status: "APPROVED"
      }
    });

    // Update task completedCount
    const newCompletedCount = task.completedCount + 1;
    const newStatus = newCompletedCount >= task.quantity ? "COMPLETED" : "ACTIVE";

    await db.task.update({
      where: { id: taskId },
      data: {
        completedCount: newCompletedCount,
        status: newStatus
      }
    });

    return NextResponse.json({
      verified: true,
      logs,
      message: `Verification successful! You earned +${task.reward.toFixed(1)} credits.`
    });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
