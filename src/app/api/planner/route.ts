import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

export async function POST(req: NextRequest) {
  try {
    const { documentContent, examDate, hoursPerDay } = await req.json();
    if (!documentContent) {
      return NextResponse.json({ error: "No document content" }, { status: 400 });
    }

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are an expert study coach. Create a detailed, realistic study plan.
Return ONLY valid JSON in this exact format:
{
  "title": "Study plan title",
  "totalDays": 7,
  "dailyHours": 2,
  "overview": "Brief overview of the study approach",
  "days": [
    {
      "day": 1,
      "theme": "Day theme/focus",
      "tasks": [
        { "task": "Task description", "duration": "30 mins", "type": "read" | "practice" | "review" | "test" }
      ],
      "goal": "What to achieve by end of this day"
    }
  ],
  "tips": ["Study tip 1", "Study tip 2", "Study tip 3"],
  "topics": [
    { "name": "Topic name", "priority": "high" | "medium" | "low", "estimatedTime": "2 hours" }
  ]
}
Return ONLY valid JSON, no markdown.`,
        },
        {
          role: "user",
          content: `Create a study plan for this document.
Exam/deadline in: ${examDate || "7 days"}
Available hours per day: ${hoursPerDay || "2"}
Document: ${documentContent.slice(0, 15000)}`,
        },
      ],
      temperature: 0.5,
      max_tokens: 2048,
    });

    const raw = response.choices[0]?.message?.content ?? "{}";
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const plan = JSON.parse(cleaned);
    return NextResponse.json({ plan });
  } catch (error) {
    console.error("Planner error:", error);
    return NextResponse.json({ error: "Failed to generate study plan." }, { status: 500 });
  }
}