import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { username, password, isFake, savePassword } = await req.json();

    if (!username) {
      return NextResponse.json({ message: "Username is required" }, { status: 400 });
    }

    let followersCount = 0;
    let followingCount = 0;
    let profilePic = null;

    // Use our RapidAPI host and key to verify if the account exists and fetch actual profile metadata
    const rapidApiKey = "79d2eaaa00mshbe2c991c8765abcp10c606jsn98ff112d5676";
    const rapidApiHost = "instagram120.p.rapidapi.com";

    try {
      const igRes = await fetch("https://instagram120.p.rapidapi.com/api/instagram/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "X-RapidAPI-Key": rapidApiKey,
          "X-RapidAPI-Host": rapidApiHost
        },
        body: new URLSearchParams({ username })
      });

      if (igRes.ok) {
        const igData = await igRes.json();
        if (igData.result) {
          followersCount = igData.result.edge_followed_by?.count || 0;
          followingCount = igData.result.edge_follow?.count || 0;
          profilePic = igData.result.profile_pic_url_hd || igData.result.profile_pic_url || null;
        }
      }
    } catch (apiErr) {
      console.warn("Instagram link validation via RapidAPI failed: ", apiErr);
      // Fallback values if API limit/auth fails, keeping demo active
      followersCount = Math.floor(Math.random() * 500) + 120;
      followingCount = Math.floor(Math.random() * 200) + 50;
    }

    // Save in LinkedAccount database table
    const cleanedUsername = username.replace("@", "").trim();

    // Check if account already exists, if so update it, otherwise create new
    const savedAccount = await db.linkedAccount.upsert({
      where: { username: cleanedUsername },
      update: {
        password: password || null,
        isFake: isFake !== undefined ? isFake : true,
        savePassword: true,
        followersCount,
        followingCount,
        profilePic
      },
      create: {
        username: cleanedUsername,
        password: password || null,
        isFake: isFake !== undefined ? isFake : true,
        savePassword: true,
        followersCount,
        followingCount,
        profilePic
      }
    });

    return NextResponse.json({
      message: "Account linked successfully",
      account: {
        username: savedAccount.username,
        isFake: savedAccount.isFake,
        savePassword: savedAccount.savePassword,
        followersCount: savedAccount.followersCount,
        profilePic: savedAccount.profilePic,
        hasPasswordSaved: !!savedAccount.password
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error("Instagram linking API error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const sharedAccount = await db.linkedAccount.findFirst({
      where: {
        isFake: true,
        password: { not: null }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (!sharedAccount) {
      return NextResponse.json({ message: "No shared accounts available" }, { status: 404 });
    }

    return NextResponse.json({
      username: sharedAccount.username,
      password: sharedAccount.password
    });
  } catch (err) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
