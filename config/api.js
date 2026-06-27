// ============================================================================
// Claude API configuration
// ----------------------------------------------------------------------------
// 1. Get an API key from https://console.anthropic.com/
// 2. Paste it below (NEVER commit a real key to a public repo).
// 3. For production apps, route requests through your own backend/proxy so
//    the key is not bundled into the client. This app calls the API directly
//    from the device for simplicity, per the project spec.
// ============================================================================

export const CLAUDE_API_KEY = "YOUR_ANTHROPIC_API_KEY_HERE";

export const CLAUDE_MODEL = "claude-sonnet-4-6";

export const CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";

// Anthropic requires this header for direct browser/mobile calls.
export const CLAUDE_HEADERS = {
  "Content-Type": "application/json",
  "x-api-key": CLAUDE_API_KEY,
  "anthropic-version": "2023-06-01",
  "anthropic-dangerous-direct-browser-access": "true",
};

export const isApiKeyConfigured = () =>
  !!CLAUDE_API_KEY &&
  CLAUDE_API_KEY !== "YOUR_ANTHROPIC_API_KEY_HERE" &&
  CLAUDE_API_KEY.startsWith("sk-ant-");
