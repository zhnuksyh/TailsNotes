import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || "sk-placeholder-key"
});

export interface GeneratedNotes {
  title: string;
  sections: {
    heading: string;
    content: string;
    keyPoints: string[];
  }[];
  summary: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface GeneratedQuiz {
  title: string;
  questions: QuizQuestion[];
}

export async function generateNotesFromText(content: string, fileName: string): Promise<GeneratedNotes> {
  try {
    const prompt = `
    You are an AI assistant that creates comprehensive, structured notes from presentation content. 
    Analyze the following slide content and generate well-organized, annotative notes that would help university students learn effectively.

    Content from "${fileName}":
    ${content}

    Please create structured notes in JSON format with the following structure:
    {
      "title": "Main topic/title for the notes",
      "sections": [
        {
          "heading": "Section heading",
          "content": "Detailed explanation of the section content",
          "keyPoints": ["Important point 1", "Important point 2", "Important point 3"]
        }
      ],
      "summary": "Brief summary of the main concepts covered"
    }

    Guidelines:
    - Create clear, concise sections that break down complex information
    - Include key points that students should remember
    - Use educational language appropriate for university level
    - Focus on understanding and comprehension
    - Make the notes comprehensive but digestible
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return result as GeneratedNotes;
  } catch (error) {
    console.error('Error generating notes:', error);
    throw new Error("Failed to generate notes from content");
  }
}

export async function generateQuizFromText(content: string, fileName: string): Promise<GeneratedQuiz> {
  try {
    const prompt = `
    You are an AI assistant that creates educational quiz questions from presentation content.
    Analyze the following slide content and generate multiple-choice quiz questions that test understanding of key concepts.

    Content from "${fileName}":
    ${content}

    Please create quiz questions in JSON format with the following structure:
    {
      "title": "Quiz title based on the content",
      "questions": [
        {
          "id": "unique_id",
          "question": "Clear, specific question",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctAnswer": 0,
          "explanation": "Explanation of why this answer is correct"
        }
      ]
    }

    Guidelines:
    - Create 5-10 questions depending on content length
    - Make questions test understanding, not just memorization
    - Ensure all options are plausible
    - Provide clear explanations for correct answers
    - Cover different difficulty levels from basic to advanced
    - Focus on key concepts and important details
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    // Ensure each question has a unique ID
    if (result.questions && Array.isArray(result.questions)) {
      result.questions = result.questions.map((q: any, index: number) => ({
        ...q,
        id: q.id || `question_${index + 1}`
      }));
    }

    return result as GeneratedQuiz;
  } catch (error) {
    console.error('Error generating quiz:', error);
    throw new Error("Failed to generate quiz from content");
  }
}
