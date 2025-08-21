import { GoogleGenAI } from "@google/genai";

// Basic client initialization
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

function stripCodeFences(possiblyFenced: string): string {
  const trimmed = possiblyFenced.trim();
  if (trimmed.startsWith("```")) {
    // Remove ```json ... ``` fences
    return trimmed.replace(/^```[a-zA-Z]*\n/, "").replace(/\n```$/, "");
  }
  return trimmed;
}

function safeParseJson<T = any>(raw: string): T {
  const text = stripCodeFences(raw);
  try {
    return JSON.parse(text);
  } catch {
    // Try to extract the first JSON object substring
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start !== -1 && end !== -1 && end > start) {
      const candidate = text.slice(start, end + 1);
      return JSON.parse(candidate);
    }
    throw new Error("Model did not return valid JSON");
  }
}

export async function generateNotesFromText(text: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error("Gemini API key is not configured. Set GEMINI_API_KEY or GOOGLE_API_KEY.");
  }
  try {
    const prompt = `You are an expert educational content creator. Analyze the following text from a presentation/document and create comprehensive, visually appealing study notes.

Return ONLY HTML (no markdown code fences). Requirements:
1. Semantic HTML with headings (h1, h2, h3)
2. Inline styles for color coding and highlighting
3. Use color scheme: headings #1e3a8a on #fef3c7; key concepts #ea580c on #fed7aa; important points #16a34a on #dcfce7; definitions #9333ea on #f3e8ff; examples #2563eb on #dbeafe
4. Use lists where appropriate, highlight important terms with <mark>
5. Make it scannable and easy to review

Text to analyze:
${text}`;

    const response = await ai.models.generateContent({
      // Use widely available stable models
      model: "gemini-2.0-flash-001",
      contents: prompt,
    });

    return response.text || "Unable to generate notes at this time.";
  } catch (error) {
    console.error("Error generating notes with Gemini:", error);
    throw new Error("Failed to generate notes");
  }
}

export async function generateQuizFromText(text: string): Promise<any> {
  if (!GEMINI_API_KEY) {
    throw new Error("Gemini API key is not configured. Set GEMINI_API_KEY or GOOGLE_API_KEY.");
  }
  try {
    const prompt = `You are an expert quiz creator. Analyze the given text and create a comprehensive multiple-choice quiz.

Return ONLY valid JSON with this structure:
{
  "title": "Short quiz title",
  "questions": [
    {
      "question": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Why this answer is correct"
    }
  ]
}

Requirements:
1. Create 5-8 questions covering key concepts
2. Each question should have 4 options
3. Include a mix of difficulty levels
4. Focus on understanding, not memorization
5. Provide clear explanations for correct answers

Text:
${text}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-pro-001",
      contents: prompt,
    });

    const raw = response.text || "";
    if (!raw.trim()) {
      throw new Error("Empty response from model");
    }
    const quizData = safeParseJson<any>(raw);
    // Ensure presence of required fields
    if (!quizData.title) quizData.title = "Generated Quiz";
    if (!Array.isArray(quizData.questions)) quizData.questions = [];
    return quizData;
  } catch (error) {
    console.error("Error generating quiz with Gemini:", error);
    throw new Error("Failed to generate quiz");
  }
}

export async function tryGeminiHtmlNotes(text: string): Promise<string | null> {
  try {
    return await generateNotesFromText(text);
  } catch {
    return null;
  }
}

export async function tryGeminiQuiz(text: string): Promise<any | null> {
  try {
    return await generateQuizFromText(text);
  } catch {
    return null;
  }
}