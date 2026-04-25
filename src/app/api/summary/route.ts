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
          content: `You are an expert summarizer. Create a comprehensive, well-structured summary.
Return your response in this exact JSON format:
{
  "title": "Document title or topic",
  "overview": "2-3 sentence high-level overview",
  "keyPoints": ["point 1", "point 2", "point 3", "point 4", "point 5"],
  "sections": [
    { "heading": "Section name", "content": "Section summary in 2-3 sentences" }
  ],
  "conclusion": "1-2 sentence conclusion",
  "readingTime": "estimated reading time in minutes as a number"
}
Return ONLY valid JSON, no markdown, no extra text.`,
        },
        {
          role: "user",
          content: `Summarize this document:\n\n${documentContent.slice(0, 15000)}`,
        },
      ],
      temperature: 0.5,
      max_tokens: 2048,
    });

    const raw = response.choices[0]?.message?.content ?? "{}";
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const summary = JSON.parse(cleaned);

    return NextResponse.json({ summary });
  } catch (error) {
    console.error("Summary error:", error);
    return NextResponse.json(
      { error: "Failed to generate summary." },
      { status: 500 }
    );
  }
}