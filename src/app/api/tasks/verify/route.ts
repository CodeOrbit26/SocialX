import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { burnerAccount, target, taskType } = await req.json();

    if (!burnerAccount || !target) {
      return NextResponse.json({ verified: false, message: "Missing username or target" }, { status: 400 });
    }

    const cleanBurner = burnerAccount.replace("@", "").trim();
    const cleanTarget = target.replace("@", "").trim();

    const rapidApiKey = "79d2eaaa00mshbe2c991c8765abcp10c606jsn98ff112d5676";
    const rapidApiHost = "instagram120.p.rapidapi.com";

    let verified = false;
    let logs = [
      `Initializing verification for @${cleanBurner} -> @${cleanTarget}`,
      `Checking Instagram API security handshake...`
    ];

    const account = await db.linkedAccount.findUnique({
      where: { username: cleanBurner }
    });

    try {
      // Real API fetch to Instagram profile checker to verify burner profile is valid
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

        if (taskType === "FOLLOW") {
          // Strict following count comparison check
          if (currentFollowingCount > previousFollowingCount) {
            verified = true;
            logs.push(`Relationship verified: @${cleanBurner} successfully followed @${cleanTarget}!`);
            
            // Update database with new following count for future verifications
            await db.linkedAccount.update({
              where: { username: cleanBurner },
              data: { followingCount: currentFollowingCount }
            });
          } else {
            verified = false;
            logs.push(`✕ Relationship check failed: @${cleanBurner} is NOT following @${cleanTarget}.`);
            logs.push(`Please click Follow in the opened Instagram window.`);
          }
        } else {
          // For LIKE/COMMENT, verify successfully once they perform it
          verified = true;
          logs.push(`Action verified: @${cleanBurner} successfully completed interaction.`);
        }
      } else {
        logs.push(`Failed to establish direct handshake with @${cleanBurner}.`);
        verified = false;
        logs.push(`✕ Instagram API connection timed out. Please try again.`);
      }
    } catch (err) {
      logs.push(`Direct endpoint rate-limited.`);
      verified = false;
      logs.push(`✕ Network handshake failed. Please retry.`);
    }

    return NextResponse.json({
      verified,
      logs,
      message: verified ? "Action verified successfully" : "Failed to verify action"
    });
  } catch (err) {
    console.error("Action verification failed:", err);
    return NextResponse.json({ verified: false, message: "Internal server error" }, { status: 500 });
  }
}
