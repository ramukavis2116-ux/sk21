import { supabase } from "@/integrations/supabase/client";

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
      content: "You are an expert study assistant. Generate detailed, well-structured study notes. Format in clean markdown with proper headings and bullet points. IMPORTANT: Always present information as numbered or bulleted points. Add a blank line between each point for better readability and spacing. Use bold text for key terms."
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

export async function solveDoubt(question: string, context?: string): Promise<string> {
  return callAI([
    {
      role: "system",
      content: "You are a friendly and knowledgeable study assistant. Provide clear explanations with examples. Use simple language and markdown formatting."
    },
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
      content: "You are an expert study planner. Create personalized revision plans with tables where helpful. Format in clean markdown."
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
  const schoolSubjects: Record<string, string[]> = {
    "Class 1-5": ["Mathematics", "English", "Science", "Social Studies", "Hindi"],
    "Class 6-8": ["Mathematics", "English", "Science", "Social Studies", "Hindi", "Computer Science"],
    "Class 9-10": ["Mathematics", "Physics", "Chemistry", "Biology", "English", "Social Science", "Hindi", "Computer Applications"],
    "Class 11-12 Science": ["Physics", "Chemistry", "Mathematics", "Biology", "English", "Computer Science"],
    "Class 11-12 Commerce": ["Accountancy", "Business Studies", "Economics", "Mathematics", "English"],
    "Class 11-12 Arts": ["History", "Political Science", "Geography", "Economics", "English", "Psychology"],
  };

  const collegeSubjects: Record<string, Record<string, string[]>> = {
    "B.Tech": {
      "Computer Science": ["Data Structures", "Algorithms", "Database Management", "Operating Systems", "Computer Networks", "Software Engineering", "Machine Learning", "Web Development"],
      "Electronics": ["Circuit Theory", "Digital Electronics", "Signals & Systems", "Microprocessors", "Communication Systems", "VLSI Design"],
      "Mechanical": ["Thermodynamics", "Fluid Mechanics", "Machine Design", "Manufacturing", "Heat Transfer", "Dynamics of Machinery"],
      "Civil": ["Structural Analysis", "Geotechnical Engineering", "Fluid Mechanics", "Surveying", "Construction Management", "Environmental Engineering"],
    },
    "B.Sc": {
      "Physics": ["Classical Mechanics", "Quantum Mechanics", "Electrodynamics", "Thermodynamics", "Optics", "Nuclear Physics"],
      "Chemistry": ["Organic Chemistry", "Inorganic Chemistry", "Physical Chemistry", "Analytical Chemistry", "Biochemistry"],
      "Mathematics": ["Calculus", "Linear Algebra", "Real Analysis", "Abstract Algebra", "Differential Equations", "Probability & Statistics"],
    },
    "BCA": {
      "General": ["Programming in C", "Data Structures", "DBMS", "Operating Systems", "Java", "Web Technologies", "Python", "Software Engineering"],
    },
  };

  const competitiveSubjects: Record<string, string[]> = {
    "JEE": ["Physics", "Chemistry", "Mathematics"],
    "NEET": ["Physics", "Chemistry", "Biology (Botany)", "Biology (Zoology)"],
    "UPSC": ["General Studies", "Indian Polity", "Geography", "History", "Economics", "Science & Tech", "Ethics"],
    "CAT": ["Quantitative Aptitude", "Verbal Ability", "Data Interpretation", "Logical Reasoning"],
    "GATE": ["Engineering Mathematics", "General Aptitude", "Core Subject"],
  };

  if (level === "College" && degree && branch) {
    return collegeSubjects[degree]?.[branch] || [];
  }
  if (level === "Competitive") {
    return competitiveSubjects[degree || ""] || [];
  }
  return schoolSubjects[level] || [];
}

export function getLevels(): string[] {
  return ["Class 1-5", "Class 6-8", "Class 9-10", "Class 11-12 Science", "Class 11-12 Commerce", "Class 11-12 Arts", "College", "Competitive"];
}

export function getDegrees(): string[] {
  return ["B.Tech", "B.Sc", "BCA"];
}

export function getBranches(degree: string): string[] {
  const branches: Record<string, string[]> = {
    "B.Tech": ["Computer Science", "Electronics", "Mechanical", "Civil"],
    "B.Sc": ["Physics", "Chemistry", "Mathematics"],
    "BCA": ["General"],
  };
  return branches[degree] || [];
}

export function getCompetitiveExams(): string[] {
  return ["JEE", "NEET", "UPSC", "CAT", "GATE"];
}
