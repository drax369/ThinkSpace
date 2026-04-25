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
          content: `You are an expert analyst. Deeply analyze documents to find non-obvious insights.
Return ONLY valid JSON in this exact format:
{
  "patterns": [
    { "title": "Pattern title", "description": "Detailed description", "confidence": 85 }
  ],
  "contradictions": [
    { "title": "Contradiction title", "description": "What contradicts what", "severity": "high" | "medium" | "low" }
  ],
  "keyInsights": [
    { "title": "Insight title", "description": "Why this matters", "type": "opportunity" | "risk" | "fact" | "trend" }
  ],
  "hiddenConnections": [
    { "concept1": "First concept", "concept2": "Second concept", "connection": "How they relate" }
  ]
}
Generate 3-4 items per category. Return ONLY valid JSON, no markdown.`,
        },
        {
          role: "user",
          content: `Analyze this document deeply:\n\n${documentContent.slice(0, 6000)}`,
        },
      ],
      temperature: 0.6,
      max_tokens: 2048,
    });

    const raw = response.choices[0]?.message?.content ?? "{}";
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const insights = JSON.parse(cleaned);
    return NextResponse.json({ insights });
  } catch (error) {
    console.error("Insights error:", error);
    return NextResponse.json({ error: "Failed to generate insights." }, { status: 500 });
  }
}