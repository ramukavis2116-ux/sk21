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

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { subject, topic, level } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    if (!topic || typeof topic !== "string" || !topic.trim()) {
      return json({ skipped: true, reason: "no-topic" });
    }

    // Step 1: decide whether a visual actually helps, and build the image prompt.
    const decide = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-6-astra",
        reasoning: { effort: "low" },
        input: [
          {
            role: "system",
            content:
              "You decide whether a single educational image would improve a student's understanding of a study topic. Reply with ONLY minified JSON: {\"useImage\":boolean,\"prompt\":string}. useImage must be false for greetings, small talk, non-academic input, nonsense, or purely theoretical/definitional topics with nothing to visualise. When true, prompt must describe ONE simple, clean, labelled educational diagram or concept visual for the topic (no text-heavy slides, no watermarks). Keep prompt under 60 words.",
          },
          {
            role: "user",
            content: `Subject: ${subject || "General"}\nTopic: ${topic}\nStudent level: ${level || "student"}`,
          },
        ],
      }),
    });

    if (!decide.ok) {
      const text = await decide.text();
      console.error("decision error:", decide.status, text);
      if (decide.status === 429) return json({ error: "Rate limit exceeded. Please try again in a moment." }, 429);
      if (decide.status === 402) return json({ error: "AI usage limit reached. Please add credits." }, 402);
      return json({ skipped: true, reason: "decision-failed" });
    }

    const decideData = await decide.json();
    const rawText: string =
      decideData.output_text ??
      decideData.output
        ?.flatMap((o: { content?: { text?: string }[] }) => o.content ?? [])
        ?.map((c: { text?: string }) => c.text ?? "")
        .join("") ??
      "";

    let useImage = false;
    let prompt = "";
    try {
      const parsed = JSON.parse(rawText.replace(/```json|```/g, "").trim());
      useImage = !!parsed.useImage;
      prompt = String(parsed.prompt || "");
    } catch {
      return json({ skipped: true, reason: "unparsable-decision" });
    }

    if (!useImage || !prompt) return json({ skipped: true, reason: "not-visual" });

    // Step 2: generate one image.
    const img = await fetch("https://ai.gateway.lovable.dev/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-pro-image",
        messages: [
          {
            role: "user",
            content: `Simple, clear educational diagram for students. ${prompt}`,
          },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!img.ok) {
      const text = await img.text();
      console.error("image error:", img.status, text);
      if (img.status === 429) return json({ error: "Rate limit exceeded. Please try again in a moment." }, 429);
      if (img.status === 402) return json({ error: "AI usage limit reached. Please add credits." }, 402);
      return json({ error: "Image service error" }, 500);
    }

    const imgData = await img.json();
    const b64 = imgData.data?.[0]?.b64_json;
    if (!b64) return json({ skipped: true, reason: "no-image" });

    return json({ image: `data:image/png;base64,${b64}`, caption: prompt });
  } catch (e) {
    console.error("study-image error:", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});
