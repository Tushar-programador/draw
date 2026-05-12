import { useCallback, useState } from "react";
import type { AISketchRequest, AIResponse } from "@zenith/shared";

interface UseAIOptions {
  token: string;
}

interface AIState {
  loading: boolean;
  result: AIResponse | null;
  error: string | null;
}

/**
 * Hook for the Sketch-to-Code AI feature.
 * Sends a base64 canvas snapshot to the server and returns generated code.
 */
export function useAI({ token }: UseAIOptions) {
  const [state, setState] = useState<AIState>({ loading: false, result: null, error: null });

  const sketchToCode = useCallback(
    async (payload: Omit<AISketchRequest, "documentId"> & { documentId: string }) => {
      setState({ loading: true, result: null, error: null });

      const res = await fetch("/api/ai/sketch-to-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = (await res.json()) as { error?: string };
        setState({ loading: false, result: null, error: err.error ?? "AI request failed" });
        return;
      }

      const data = (await res.json()) as AIResponse;
      setState({ loading: false, result: data, error: null });
    },
    [token]
  );

  return { ...state, sketchToCode };
}
