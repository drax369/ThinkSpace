import Groq from "groq-sdk";

// ── Initialize Groq ───────────────────────────────────────────────────
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

// ── Model to use ──────────────────────────────────────────────────────
const MODEL = "llama-3.3-70b-versatile";

// ── Build system prompt ───────────────────────────────────────────────
export function buildSystemPrompt(
  documentContent: string,
  explainMode: "normal" | "simple" | "expert" = "normal"
): string {
  const modeInstruction =
    explainMode === "simple"
      ? "Explain everything in very simple terms, like explaining to a 5-year-old. Use analogies and avoid jargon."
      : explainMode === "expert"
      ? "Use technical terminology and provide deep expert-level analysis with nuance and detail."
      : "Use clear, professional language suitable for a general educated audience.";

  return `You are ThinkSpace AI, an intelligent knowledge assistant built to help users understand their documents deeply.

EXPLANATION STYLE: ${modeInstruction}

DOCUMENTS PROVIDED:
${documentContent}

INSTRUCTIONS:
- Answer questions based ONLY on the documents provided above
- Always cite sources using format [Doc: filename] when referencing specific content
- If the answer is not in the documents, clearly say "This information is not in your uploaded documents"
- Use markdown formatting (headers, bullet points, bold) for clarity
- Be thorough but concise
- Highlight key insights and important points`;
}

// ── Get chat response ─────────────────────────────────────────────────
export async function getChatResponse(
  userMessage: string,
  documentContent: string,
  history: { role: "user" | "assistant"; content: string }[] = [],
  explainMode: "normal" | "simple" | "expert" = "normal"
): Promise<string> {
  const systemPrompt = buildSystemPrompt(documentContent, explainMode);

  const messages: Groq.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    ...history.map((h) => ({
      role: h.role as "user" | "assistant",
      content: h.content,
    })),
    { role: "user", content: userMessage },
  ];

  const response = await groq.chat.completions.create({
    model: MODEL,
    messages,
    temperature: 0.7,
    max_tokens: 2048,
  });

  return response.choices[0]?.message?.content ?? "No response generated.";
}