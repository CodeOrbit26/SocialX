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

    const reporterId = (session.user as any).id;
    const { reportedUserId, reason } = await req.json();

    if (!reportedUserId || !reason) {
      return NextResponse.json(
        { message: "Missing required fields (reportedUserId or reason)" },
        { status: 400 }
      );
    }

    if (reporterId === reportedUserId) {
      return NextResponse.json(
        { message: "You cannot report yourself." },
        { status: 400 }
      );
    }

    // Verify reported user exists
    const reportedUser = await db.user.findUnique({
      where: { id: reportedUserId },
    });

    if (!reportedUser) {
      return NextResponse.json(
        { message: "Reported user not found" },
        { status: 404 }
      );
    }

    const report = await db.report.create({
      data: {
        reporterId,
        reportedUserId,
        reason,
        status: "PENDING",
      },
    });

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    console.error("Submit report error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
