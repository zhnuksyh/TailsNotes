import { GoogleGenAI } from "@google/genai";

// the newest Gemini model series is "gemini-2.5-flash" or "gemini-2.5-pro"
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateNotesFromText(text: string): Promise<string> {
  try {
    const prompt = `
You are an expert educational content creator. Analyze the following text from a presentation/document and create comprehensive, visually appealing study notes.

Format the output as HTML with the following requirements:
1. Use semantic HTML structure with proper headings (h1, h2, h3)
2. Apply inline CSS styles for color coding and highlighting
3. Use these color schemes for better learning:
   - Main headings: Dark blue (#1e3a8a) with yellow highlight background (#fef3c7)
   - Key concepts: Orange text (#ea580c) with light orange background (#fed7aa)
   - Important points: Green text (#16a34a) with light green background (#dcfce7)
   - Definitions: Purple text (#9333ea) with light purple background (#f3e8ff)
   - Examples: Blue text (#2563eb) with light blue background (#dbeafe)
4. Use bullet points, numbered lists, and proper spacing
5. Highlight important terms with <mark> tags
6. Add visual separators and proper typography
7. Make it scannable and easy to review

Text to analyze:
${text}

Create engaging, colorful study notes that help with memorization and understanding.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text || "Unable to generate notes at this time.";
  } catch (error) {
    console.error("Error generating notes with Gemini:", error);
    throw new Error("Failed to generate notes");
  }
}

export async function generateQuizFromText(text: string): Promise<any> {
  try {
    const systemPrompt = `You are an expert quiz creator. Analyze the following text and create a comprehensive multiple-choice quiz.

Create a JSON response with this exact structure:
{
  "questions": [
    {
      "question": "Question text here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Explanation for the correct answer"
    }
  ]
}

Requirements:
1. Create 5-8 questions covering key concepts
2. Each question should have 4 options
3. Include a mix of difficulty levels
4. Focus on understanding, not just memorization
5. Provide clear explanations for correct answers
6. Questions should test comprehension, application, and analysis`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            questions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  question: { type: "string" },
                  options: {
                    type: "array",
                    items: { type: "string" }
                  },
                  correctAnswer: { type: "number" },
                  explanation: { type: "string" }
                },
                required: ["question", "options", "correctAnswer", "explanation"]
              }
            }
          },
          required: ["questions"]
        }
      },
      contents: `Text to create quiz from:\n\n${text}`,
    });

    const rawJson = response.text;
    
    if (rawJson) {
      const quizData = JSON.parse(rawJson);
      return quizData;
    } else {
      throw new Error("Empty response from model");
    }
  } catch (error) {
    console.error("Error generating quiz with Gemini:", error);
    throw new Error("Failed to generate quiz");
  }
}