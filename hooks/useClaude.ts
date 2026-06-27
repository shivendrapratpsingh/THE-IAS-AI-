import { useCallback, useRef, useState } from "react";
import axios from "axios";
import {
  CLAUDE_API_URL,
  CLAUDE_HEADERS,
  CLAUDE_MODEL,
  isApiKeyConfigured,
} from "../config/api";

const DEBOUNCE_MS = 1000;

export interface AskClaudeOptions {
  /** Max tokens for the completion. */
  maxTokens?: number;
  /** Optional system prompt. */
  system?: string;
  /** Temperature 0-1. */
  temperature?: number;
}

interface UseClaudeResult {
  /** Send a prompt to Claude. Returns the raw text response, or null on failure. */
  askClaude: (prompt: string, options?: AskClaudeOptions) => Promise<string | null>;
  /** Same as askClaude, but parses the response as JSON. Returns null on failure/parse error. */
  askClaudeJSON: <T = any>(prompt: string, options?: AskClaudeOptions) => Promise<T | null>;
  loading: boolean;
  error: string | null;
  /** True if a usable API key has been configured in config/api.js */
  apiAvailable: boolean;
}

/**
 * Hook for calling the Claude API with built-in debouncing (1s), loading
 * state, and graceful error handling. If no API key is configured, calls
 * resolve to `null` immediately so screens can fall back to offline content.
 */
export function useClaude(): UseClaudeResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastCallRef = useRef<number>(0);
  const pendingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const apiAvailable = isApiKeyConfigured();

  const rawCall = useCallback(
    async (prompt: string, options?: AskClaudeOptions): Promise<string | null> => {
      if (!apiAvailable) {
        setError("AI unavailable: no API key configured.");
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await axios.post(
          CLAUDE_API_URL,
          {
            model: CLAUDE_MODEL,
            max_tokens: options?.maxTokens ?? 1024,
            temperature: options?.temperature ?? 0.7,
            ...(options?.system ? { system: options.system } : {}),
            messages: [{ role: "user", content: prompt }],
          },
          { headers: CLAUDE_HEADERS, timeout: 45000 }
        );

        const text: string | undefined = response.data?.content?.[0]?.text;
        if (!text) {
          throw new Error("Empty response from Claude");
        }
        return text;
      } catch (e: any) {
        console.warn("useClaude: request failed", e?.message ?? e);
        setError("AI unavailable, try again.");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [apiAvailable]
  );

  /**
   * Debounce: if called again within DEBOUNCE_MS, the previous pending call
   * is cancelled and only the latest call resolves.
   */
  const askClaude = useCallback(
    (prompt: string, options?: AskClaudeOptions): Promise<string | null> => {
      return new Promise((resolve) => {
        if (pendingTimer.current) {
          clearTimeout(pendingTimer.current);
        }
        pendingTimer.current = setTimeout(async () => {
          lastCallRef.current = Date.now();
          const result = await rawCall(prompt, options);
          resolve(result);
        }, DEBOUNCE_MS);
      });
    },
    [rawCall]
  );

  const askClaudeJSON = useCallback(
    async <T = any>(prompt: string, options?: AskClaudeOptions): Promise<T | null> => {
      const text = await askClaude(prompt, options);
      if (!text) return null;
      try {
        // Strip markdown code fences if Claude wraps JSON in ```json ... ```
        const cleaned = text
          .trim()
          .replace(/^```(json)?/i, "")
          .replace(/```$/i, "")
          .trim();
        // Extract the first {...} or [...] block as a safety net
        const match = cleaned.match(/[\{\[][\s\S]*[\}\]]/);
        const jsonStr = match ? match[0] : cleaned;
        return JSON.parse(jsonStr) as T;
      } catch (e) {
        console.warn("useClaude: failed to parse JSON response", e, text);
        setError("AI returned an unexpected response.");
        return null;
      }
    },
    [askClaude]
  );

  return { askClaude, askClaudeJSON, loading, error, apiAvailable };
}
