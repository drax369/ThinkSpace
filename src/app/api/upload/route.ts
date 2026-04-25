import { NextRequest, NextResponse } from "next/server";
import { parsePdf } from "@/lib/parsers/pdfParser";

async function extractFromUrl(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; ThinkSpace/1.0)" },
  });
  if (!res.ok) throw new Error(`Failed to fetch URL: ${res.statusText}`);
  const html = await res.text();
  const text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s{2,}/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
  return text.slice(0, 50000);
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const type = formData.get("type") as string;

    if (type === "url") {
      const url = formData.get("url") as string;
      if (!url) return NextResponse.json({ error: "No URL provided" }, { status: 400 });
      const content = await extractFromUrl(url);
      const name = new URL(url).hostname;
      return NextResponse.json({ content, name, type: "url" });
    }

    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const fileName = file.name;
    const fileType = file.type;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (fileType === "application/pdf" || fileName.endsWith(".pdf")) {
      const content = await parsePdf(buffer);
      return NextResponse.json({ content, name: fileName, type: "pdf" });
    }

    if (
      fileType === "text/plain" ||
      fileName.endsWith(".txt") ||
      fileName.endsWith(".md")
    ) {
      const content = new TextDecoder().decode(buffer).trim().slice(0, 50000);
      return NextResponse.json({ content, name: fileName, type: "text" });
    }

    return NextResponse.json({ error: "Unsupported file type." }, { status: 415 });

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Something went wrong." },
      { status: 500 }
    );
  }
}