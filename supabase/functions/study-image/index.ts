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

const TEXT_MODEL = "gemini-3.6-flash";
// Ordered fallbacks; availability is verified at runtime against the key's model list.
const IMAGE_MODELS = [
  "gemini-3.1-flash-image",
  "gemini-3-pro-image",
  "gemini-2.5-flash-image",
];

const GEMINI = "https://generativelanguage.googleapis.com/v1beta";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { subject, topic, level } = await req.json();

    // Server-side only secret. Never returned to the client.
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") || Deno.env.get("GOOGLE_API_KEY");
    if (!GEMINI_API_KEY) return json({ skipped: true, reason: "no-key" });

    if (!topic || typeof topic !== "string" || !topic.trim()) {
      return json({ skipped: true, reason: "no-topic" });
    }

    // Step 1: decide whether a visual actually helps, and build the diagram prompt.
    const decide = await fetch(`${GEMINI}/models/${TEXT_MODEL}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": GEMINI_API_KEY },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{
            text:
              "You decide whether a single educational diagram would improve a student's understanding of a study topic. Reply with ONLY minified JSON: {\"useImage\":boolean,\"prompt\":string}. useImage must be false for greetings, small talk, non-academic input, nonsense, or purely definitional topics with nothing to visualise. When true, prompt must request ONE simple, clean, clearly labelled educational diagram in textbook/classroom style — a flowchart, block diagram, architecture diagram, timeline, or concept diagram, whichever fits the topic. No artistic decoration, no watermarks, no text-heavy slides. Keep prompt under 60 words.",
          }],
        },
        contents: [{
          role: "user",
          parts: [{ text: `Subject: ${subject || "General"}\nTopic: ${topic}\nStudent level: ${level || "student"}` }],
        }],
        generationConfig: { temperature: 0.4, maxOutputTokens: 300 },
      }),
    });

    if (!decide.ok) {
      const text = await decide.text();
      console.error("decision error:", decide.status, text);
      return json({ skipped: true, reason: "decision-failed" });
    }

    const decideData = await decide.json();
    const rawText: string =
      decideData?.candidates?.[0]?.content?.parts
        ?.map((p: { text?: string }) => p?.text || "")
        .join("") || "";

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

    // Step 2: find an image model this key actually supports.
    let available: string[] = [];
    try {
      const listRes = await fetch(`${GEMINI}/models?pageSize=200`, {
        headers: { "x-goog-api-key": GEMINI_API_KEY },
      });
      if (listRes.ok) {
        const list = await listRes.json();
        available = (list?.models || [])
          .map((m: { name?: string }) => (m.name || "").replace("models/", ""));
      }
    } catch (e) {
      console.error("model list error:", e);
    }

    const candidates = available.length
      ? IMAGE_MODELS.filter((m) => available.includes(m))
      : IMAGE_MODELS;
    if (candidates.length === 0) return json({ skipped: true, reason: "no-image-model" });

    // Step 3: generate one image.
    const fullPrompt = `Simple, clean, clearly labelled educational diagram for students, textbook style, white background, no watermark. ${prompt}`;

    for (const model of candidates) {
      const img = await fetch(`${GEMINI}/models/${model}:generateContent`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": GEMINI_API_KEY },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
          generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
        }),
      });

      if (!img.ok) {
        console.error("image error:", model, img.status, await img.text());
        continue;
      }

      const imgData = await img.json();
      const parts = imgData?.candidates?.[0]?.content?.parts || [];
      const inline = parts.find(
        (p: { inlineData?: { data?: string; mimeType?: string } }) => p?.inlineData?.data
      )?.inlineData;
      if (inline?.data) {
        return json({
          image: `data:${inline.mimeType || "image/png"};base64,${inline.data}`,
          caption: prompt,
        });
      }
    }

    return json({ skipped: true, reason: "no-image" });
  } catch (e) {
    console.error("study-image error:", e);
    return json({ skipped: true, reason: "error" });
  }
});
