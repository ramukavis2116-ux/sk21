import { supabase } from "@/integrations/supabase/client";
import { collegeCatalog, competitiveCatalog, schoolCatalog, legacyBranchAliases } from "@/lib/education-catalog";


async function callAI(messages: { role: string; content: string }[]): Promise<string> {
  const { data, error } = await supabase.functions.invoke('study-ai', {
    body: { messages },
  });

  if (error) throw new Error(error.message || 'AI request failed');
  if (data?.error) throw new Error(data.error);
  return data.content;
}

export async function generateNotes(subject: string, topic: string, level: string): Promise<string> {
  return callAI([
    {
      role: "system",
      content: "You are an expert study assistant. RELEVANCE RULE (highest priority): First decide whether the requested topic is a genuine academic/study topic (school, college, or competitive-exam syllabus, or a clear educational concept). If it is NOT clearly academic (for example small talk, jokes, personal chit-chat, gossip, entertainment, shopping, random words, or nonsense), do NOT generate any notes. Instead reply with only one short, friendly line politely redirecting the student to ask about a study topic in this subject, and nothing else. Otherwise, generate detailed, well-structured study notes. Format in clean markdown with proper headings and bullet points. IMPORTANT: Always present information as numbered or bulleted points. Add a blank line between each point for better readability and spacing. Use bold text for key terms. CRITICAL: Never use LaTeX or raw LaTeX syntax like \\frac, \\sqrt, \\sum, $, $$, \\( \\), \\[ \\] for mathematical formulas. Instead, write all math formulas in plain readable text using normal symbols like ×, ÷, √, ², ³, π, ≤, ≥, ≠, →, ∞, Σ, ∫, Δ, θ, α, β. For example write 'a² + b² = c²' not '$a^2 + b^2 = c^2$', write 'F = m × a' not '$F = ma$', write '√(b² - 4ac)' not '$\\sqrt{b^2-4ac}$'."
    },
    {
      role: "user",
      content: `Generate detailed study notes for a ${level} student.

Subject: ${subject}
Topic: ${topic}

Please provide:
1. **Key Headings** - Important headings related to this topic
2. **Simple Notes** - Clear, easy-to-understand notes under each heading
3. **Key Points to Remember** - Bullet points of the most important concepts
4. **Quick Summary** - A brief summary at the end`
    }
  ]);
}

export async function solveDoubt(
  question: string,
  context?: string,
  history: { role: string; content: string }[] = []
): Promise<string> {
  return callAI([
    {
      role: "system",
      content: "You are a friendly and knowledgeable study assistant in an ongoing conversation. ALWAYS use the full conversation history as context — never treat the latest message as a standalone query. Resolve references like 'it', 'this', 'the previous example', or follow-up questions using earlier messages. RELEVANCE RULE (highest priority): Answer only if the message is a study/academic question, OR a follow-up connected to the current session's topic or earlier messages (including short references like 'explain more', 'example?', 'why'). If the message is clearly unrelated to studies and not a follow-up on the ongoing topic (small talk, jokes, gossip, entertainment, shopping, personal chatter, random words), do NOT explain it or generate study content — reply with only one short, polite line inviting the student back to their study topic, and nothing else. Provide clear explanations with examples. Use simple language and markdown formatting. IMPORTANT: Always structure your answer in numbered or bulleted points. Add a blank line between each point for better readability and spacing. Use bold text for key terms. CRITICAL: Never use LaTeX or raw LaTeX syntax like \\frac, \\sqrt, \\sum, $, $$, \\( \\), \\[ \\] for mathematical formulas. Instead, write all math formulas in plain readable text using normal symbols like ×, ÷, √, ², ³, π, ≤, ≥, ≠, →, ∞, Σ, ∫, Δ, θ, α, β. For example write 'a² + b² = c²' not '$a^2 + b^2 = c^2$', write 'F = m × a' not '$F = ma$', write '√(b² - 4ac)' not '$\\sqrt{b^2-4ac}$'."
    },
    ...history,
    {
      role: "user",
      content: `Question: ${question}${context ? `\nContext/Subject: ${context}` : ''}

Please provide:
1. A clear, step-by-step explanation
2. Examples if applicable
3. Tips to remember the concept`
    }
  ]);
}

export async function generateRevisionPlan(
  subjects: string[],
  examDate: string,
  studyLevel: string
): Promise<string> {
  const daysLeft = Math.ceil((new Date(examDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return callAI([
    {
      role: "system",
      content: "You are an expert study planner. Create personalized revision plans with tables where helpful. Format in clean markdown. IMPORTANT: Always present information as numbered or bulleted points. Add a blank line between each point for better readability and spacing. CRITICAL: Never use LaTeX or raw LaTeX syntax for mathematical formulas. Write all math in plain readable text using symbols like ×, ÷, √, ², ³, π, ≤, ≥, ≠, →, ∞."
    },
    {
      role: "user",
      content: `Create a personalized revision plan.

Student Level: ${studyLevel}
Subjects: ${subjects.join(', ')}
Days until exam: ${daysLeft}
Exam Date: ${examDate}

Please provide:
1. **Analysis** - How many topics can be covered in ${daysLeft} days
2. **Daily Schedule** - A day-by-day revision plan
3. **Priority Topics** - Most important topics to focus on first
4. **Study Tips** - Time management and revision strategies
5. **Break Schedule** - When to take breaks for optimal retention`
    }
  ]);
}

export function getSubjectsForLevel(level: string, degree?: string, branch?: string): string[] {
  if (level === "College" && degree && branch) {
    const branches = collegeCatalog[degree];
    if (!branches) return [];
    return branches[branch] || branches[legacyBranchAliases[branch] || ""] || [];
  }
  if (level === "Competitive") {
    return competitiveCatalog[degree || ""] || [];
  }
  return schoolCatalog[level] || [];
}

export function getLevels(): string[] {
  return [...Object.keys(schoolCatalog), "College", "Competitive"];
}

export function getDegrees(): string[] {
  return Object.keys(collegeCatalog);
}

export function getBranches(degree: string): string[] {
  return Object.keys(collegeCatalog[degree] || {});
}

export function getCompetitiveExams(): string[] {
  return Object.keys(competitiveCatalog);
}

