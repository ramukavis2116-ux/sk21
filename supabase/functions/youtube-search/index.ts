import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const BLOCKED = /\b(song|songs|lyrics|meme|memes|funny|comedy|prank|remix|dance|movie|trailer|status|whatsapp status|reaction|vlog|shorts)\b/i;

interface Video {
  videoId: string;
  title: string;
  thumbnail: string;
  channelName: string;
  url: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { topic, subject, category } = await req.json();

    // Server-side only. Never returned to the client.
    const KEY = Deno.env.get("YOUTUBE_API_KEY") || Deno.env.get("GOOGLE_API_KEY");
    if (!KEY) return json({ videos: [], skipped: true, reason: "no-key" });

    if (!topic || typeof topic !== "string" || !topic.trim()) {
      return json({ videos: [], skipped: true, reason: "no-topic" });
    }

    const ctx = [subject, category].filter(Boolean).join(" ");
    const queries = [
      `${topic} ${ctx} explanation`.trim(),
      `${topic} ${ctx} tutorial for students`.trim(),
      `${topic} ${ctx} diagram explanation lecture`.trim(),
    ];

    const seen = new Set<string>();
    const videos: Video[] = [];

    for (const q of queries) {
      if (videos.length >= 3) break;

      const url = new URL("https://www.googleapis.com/youtube/v3/search");
      url.searchParams.set("key", KEY);
      url.searchParams.set("part", "snippet");
      url.searchParams.set("type", "video");
      url.searchParams.set("maxResults", "8");
      url.searchParams.set("videoEmbeddable", "true");
      url.searchParams.set("videoDuration", "medium");
      url.searchParams.set("safeSearch", "strict");
      url.searchParams.set("relevanceLanguage", "en");
      url.searchParams.set("videoCategoryId", "27"); // Education
      url.searchParams.set("q", q);

      const res = await fetch(url.toString());
      if (!res.ok) {
        // Never leak provider error details to the client.
        console.error("youtube search error:", res.status, await res.text());
        continue;
      }

      const data = await res.json();
      for (const item of data?.items || []) {
        const videoId = item?.id?.videoId;
        const sn = item?.snippet;
        if (!videoId || !sn || seen.has(videoId)) continue;
        const title: string = sn.title || "";
        if (BLOCKED.test(title)) continue;
        seen.add(videoId);
        videos.push({
          videoId,
          title,
          thumbnail:
            sn.thumbnails?.medium?.url ||
            sn.thumbnails?.high?.url ||
            sn.thumbnails?.default?.url ||
            "",
          channelName: sn.channelTitle || "",
          url: `https://www.youtube.com/watch?v=${videoId}`,
        });
        if (videos.length >= 3) break;
      }
    }

    return json({ videos });
  } catch (e) {
    console.error("youtube-search error:", e);
    return json({ videos: [], skipped: true, reason: "error" });
  }
});
