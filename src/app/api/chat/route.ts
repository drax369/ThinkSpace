import { NextRequest, NextResponse } from "next/server";
import { getChatResponse } from "@/lib/ai/groq";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, documentContent, history, explainMode } = body;

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    if (!documentContent || documentContent.trim() === "") {
      return NextResponse.json(
        { error: "Please upload a document first before chatting." },
        { status: 400 }
      );
    }

    const response = await getChatResponse(
      message,
      documentContent,
      history ?? [],
      explainMode ?? "normal"
    );

    return NextResponse.json({ response });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to get AI response.",
      },
      { status: 500 }
    );
  }
}