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
          content: `You are an expert at creating mind maps. Analyze the document and create a mind map structure.
Return ONLY valid JSON in this exact format:
{
  "central": "Main topic of the document",
  "branches": [
    {
      "id": "1",
      "label": "Main branch topic",
      "color": "#6366f1",
      "children": [
        { "id": "1-1", "label": "Sub topic" },
        { "id": "1-2", "label": "Sub topic" }
      ]
    }
  ]
}
Create 4-6 main branches, each with 2-4 children.
Use these colors for branches: #6366f1, #8b5cf6, #06b6d4, #10b981, #f59e0b, #ef4444
Return ONLY valid JSON, no markdown, no extra text.`,
        },
        {
          role: "user",
          content: `Create a mind map for:\n\n${documentContent.slice(0, 15000)}`,
        },
      ],
      temperature: 0.5,
      max_tokens: 2048,
    });

    const raw = response.choices[0]?.message?.content ?? "{}";
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const mindmap = JSON.parse(cleaned);

    return NextResponse.json({ mindmap });
  } catch (error) {
    console.error("Mindmap error:", error);
    return NextResponse.json(
      { error: "Failed to generate mind map." },
      { status: 500 }
    );
  }
}