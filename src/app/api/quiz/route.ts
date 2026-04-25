import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

export async function POST(req: NextRequest) {
  try {
    const { documentContent, difficulty = "medium", previousWrong = [] } = await req.json();

    if (!documentContent) {
      return NextResponse.json({ error: "No document content" }, { status: 400 });
    }

    const wrongContext = previousWrong.length > 0
      ? `The user previously got these wrong: ${previousWrong.join(", ")}. Focus more questions on these areas.`
      : "";

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are an expert exam creator. Generate adaptive quiz questions from the document.
${wrongContext}
Return ONLY valid JSON in this exact format:
{
  "questions": [
    {
      "id": "1",
      "question": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 0,
      "explanation": "Why this answer is correct",
      "topic": "Topic this relates to",
      "difficulty": "easy" | "medium" | "hard"
    }
  ]
}
Generate 8 questions at ${difficulty} difficulty. Mix question types (factual, conceptual, application).
Return ONLY valid JSON, no markdown.`,
        },
        {
          role: "user",
          content: `Create exam questions from:\n\n${documentContent.slice(0, 15000)}`,
        },
      ],
      temperature: 0.6,
      max_tokens: 2048,
    });

    const raw = response.choices[0]?.message?.content ?? "{}";
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const data = JSON.parse(cleaned);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Quiz error:", error);
    return NextResponse.json({ error: "Failed to generate quiz." }, { status: 500 });
  }
}