import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { link, type } = await req.json();

    if (!link) {
      return NextResponse.json({ message: "Link is required" }, { status: 400 });
    }

    // Since Instagram heavily blocks direct server scraping without an authenticated API key (like RapidAPI or Apify),
    // we parse the URL and simulate the return data structure.
    // To make this 100% real, you would replace the logic below with an axios fetch to a service like RapidAPI Instagram Data.

    let data = {};

    if (type === "FOLLOW") {
      // Extract username from profile link (e.g. https://instagram.com/username)
      // or if they just typed the username:
      let username = link;
      if (link.includes('instagram.com')) {
        const parts = link.split('/').filter(Boolean);
        username = parts.pop() || "user";
      }
      
      const rapidApiKey = "79d2eaaa00mshbe2c991c8765abcp10c606jsn98ff112d5676";
      const rapidApiHost = "instagram120.p.rapidapi.com";

      const igRes = await fetch("https://instagram120.p.rapidapi.com/api/instagram/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "X-RapidAPI-Key": rapidApiKey,
          "X-RapidAPI-Host": rapidApiHost
        },
        body: new URLSearchParams({ username })
      });

      if (!igRes.ok) {
         throw new Error("Failed to fetch from Instagram API");
      }

      const igData = await igRes.json();
      
      if (!igData.result) {
         throw new Error("Profile not found");
      }

      const result = igData.result;
      
      data = {
        type: "profile",
        username: result.username,
        followers: (result.edge_followed_by?.count || 0).toLocaleString(),
        thumbnail: result.profile_pic_url_hd || result.profile_pic_url,
        isPrivate: result.is_private
      };
    } else {
      // Extract post ID from post/reel link (e.g. https://instagram.com/p/12345/)
      const parts = link.split('/').filter(Boolean);
      let postId = "post";
      if (parts.length > 0) {
        postId = parts[parts.length - 1];
        if (postId === "p" || postId === "reel") {
          postId = "unknown";
        }
      }

      // For posts, we simulate it for now as the exact payload for post endpoint is tricky without docs,
      // but the API connection is real for profiles!
      data = {
        type: "post",
        postId: postId,
        caption: `Public post/reel (${postId})`,
        thumbnail: `https://picsum.photos/seed/${postId}/200`
      };
    }

    return NextResponse.json({ success: true, data });

  } catch (error: any) {
    console.error("Verification error:", error);
    return NextResponse.json({ message: "Failed to verify link" }, { status: 500 });
  }
}
