import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

export async function POST(req: NextRequest) {
  try {
    const { documentContent, topic } = await req.json();
    if (!documentContent) {
      return NextResponse.json({ error: "No document content" }, { status: 400 });
    }

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are a debate moderator. Generate a structured debate between two AI agents (Agent A and Agent B) about a topic from the document.
Return ONLY valid JSON in this exact format:
{
  "topic": "The debate topic",
  "agentA": { "name": "Agent Alpha", "stance": "Their position in one sentence" },
  "agentB": { "name": "Agent Beta", "stance": "Their opposing position in one sentence" },
  "rounds": [
    {
      "round": 1,
      "agentA": "Agent A's argument (2-3 sentences)",
      "agentB": "Agent B's counter-argument (2-3 sentences)"
    }
  ],
  "verdict": "Balanced conclusion acknowledging both sides",
  "keyTakeaway": "What the reader should take away"
}
Generate 3 debate rounds. Make arguments compelling and grounded in the document content.
Return ONLY valid JSON, no markdown.`,
        },
        {
          role: "user",
          content: `Create a debate about "${topic || "the main topic"}" based on:\n\n${documentContent.slice(0, 15000)}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 2048,
    });

    const raw = response.choices[0]?.message?.content ?? "{}";
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const debate = JSON.parse(cleaned);
    return NextResponse.json({ debate });
  } catch (error) {
    console.error("Debate error:", error);
    return NextResponse.json({ error: "Failed to generate debate." }, { status: 500 });
  }
}