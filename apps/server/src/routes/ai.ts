import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { AISketchRequestSchema } from "@zenith/shared";

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function aiRoutes(app: FastifyInstance) {
  app.addHook("preHandler", app.authenticate);

  /**
   * POST /api/ai/sketch-to-code
   * Converts a canvas snapshot image to code via Gemini (cloud) or
   * Ollama (local), depending on the `useLocal` flag.
   */
  app.post("/sketch-to-code", async (request, reply) => {
    const body = AISketchRequestSchema.safeParse(request.body);
    if (!body.success) return reply.code(400).send({ error: body.error.flatten() });

    const { imageData, targetFormat, useLocal } = body.data;

    const formatPrompts: Record<string, string> = {
      "react-component": "Convert this whiteboard sketch into a production-ready React TypeScript component with Tailwind CSS.",
      terraform: "Convert this infrastructure diagram sketch into valid Terraform HCL configuration.",
      mermaid: "Convert this diagram sketch into a valid Mermaid.js diagram definition.",
      css: "Convert this UI layout sketch into clean, responsive CSS with custom properties.",
    };

    const prompt = formatPrompts[targetFormat] ?? "Describe this sketch.";

    if (useLocal) {
      // Ollama local inference
      const ollamaUrl = process.env["OLLAMA_BASE_URL"] ?? "http://localhost:11434";
      const response = await fetch(`${ollamaUrl}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "llava",
          prompt,
          images: [imageData],
          stream: false,
        }),
      });

      if (!response.ok) {
        return reply.code(502).send({ error: "Ollama inference failed" });
      }

      const data = (await response.json()) as { response: string };
      return reply.send({
        code: data.response,
        language: targetFormat,
        model: "ollama/llava",
      });
    }

    // Cloud Gemini inference
    const apiKey = process.env["GEMINI_API_KEY"];
    if (!apiKey) return reply.code(500).send({ error: "Gemini API key not configured" });

    const genai = new GoogleGenerativeAI(apiKey);
    const model = genai.getGenerativeModel({ model: "gemini-2.0-flash" });

    const result = await model.generateContent([
      prompt,
      { inlineData: { mimeType: "image/png", data: imageData } },
    ]);

    return reply.send({
      code: result.response.text(),
      language: targetFormat,
      model: "gemini-2.0-flash",
    });
  });
}
