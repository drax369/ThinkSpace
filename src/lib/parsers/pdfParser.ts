export async function parsePdf(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const PDFParser = require("pdf2json");
      const pdfParser = new PDFParser(null, 1);

      pdfParser.on("pdfParser_dataError", (err: { parserError: string }) => {
        console.error("PDF parse error:", err.parserError);
        reject(new Error("Could not parse PDF."));
      });

      pdfParser.on("pdfParser_dataReady", () => {
        try {
          const text = pdfParser.getRawTextContent()
            .replace(/\r\n/g, "\n")
            .replace(/\n{3,}/g, "\n\n")
            .trim()
            .slice(0, 50000);

          if (!text) {
            reject(new Error("No text found in PDF."));
            return;
          }
          resolve(text);
        } catch {
          reject(new Error("Failed to extract text from PDF."));
        }
      });

      pdfParser.parseBuffer(buffer);
    } catch (err) {
      console.error("PDF parser init error:", err);
      reject(new Error("Could not initialize PDF parser."));
    }
  });
}