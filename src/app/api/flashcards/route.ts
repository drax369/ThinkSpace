import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

export async function POST(req: NextRequest) {
  try {
    const { documentContent } = await req.json();

    if (!documentContent) {
      return NextResponse.json({ error: "No document content" }, { status: 400 });
    }

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are an expert educator. Create flashcards from the document.
Return ONLY valid JSON in this exact format:
{
  "flashcards": [
    {
      "id": "1",
      "front": "Question or term",
      "back": "Answer or definition",
      "category": "category name",
      "difficulty": "easy" | "medium" | "hard"
    }
  ]
}
Generate 10-15 flashcards. Cover key concepts, definitions, dates, and facts.
Return ONLY valid JSON, no markdown, no extra text.`,
        },
        {
          role: "user",
          content: `Create flashcards from this document:\n\n${documentContent.slice(0, 15000)}`,
        },
      ],
      temperature: 0.5,
      max_tokens: 2048,
    });

    const raw = response.choices[0]?.message?.content ?? "{}";
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const data = JSON.parse(cleaned);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Flashcards error:", error);
    return NextResponse.json(
      { error: "Failed to generate flashcards." },
      { status: 500 }
    );
  }
}