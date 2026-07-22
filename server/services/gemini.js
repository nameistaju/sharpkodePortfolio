require("../config");
const { getEnv, requireEnv } = require("../config");

const API_ROOT = "https://generativelanguage.googleapis.com/v1beta/models";
const FALLBACK_MESSAGE = "I couldn't find that information in our knowledge base. Please contact our team at info@sharpkode.com.";

function getApiKey() {
  return requireEnv("GEMINI_API_KEY");
}

async function postGemini(path, body) {
  const apiKey = getApiKey();
  const response = await fetch(`${API_ROOT}/${path}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${errorText}`);
  }

  return response.json();
}

async function embedText(text) {
  const model = getEnv("GEMINI_EMBEDDING_MODEL", "gemini-embedding-001");
  const payload = await postGemini(`${model}:embedContent`, {
    content: {
      parts: [{ text: String(text || "").slice(0, 8000) }]
    }
  });
  const embeddingData = payload.embedding;
  return Array.isArray(embeddingData) ? embeddingData : embeddingData?.values || [];
}

async function generateAnswer({ question, contexts }) {
  const model = getEnv("GEMINI_MODEL", "gemini-2.5-flash");
  const contextText = contexts?.length
    ? contexts.map((ctx, index) => `Context ${index + 1} (${ctx.source}):\n${ctx.text}`).join("\n\n---\n\n")
    : "No high-confidence retrieved chunks were found. Continue as SharpKode's AI Project Consultant using safe company-level knowledge and ask a helpful follow-up when scope is unclear.";

  const systemPrompt = `You are SharpAI, the premium AI Business Consultant for SharpKode Tech Solutions, a Digital Marketing and Technology Company.
Your role is not to behave like an FAQ bot. You advise visitors like a senior consultant who understands business growth, websites, software architecture, AI automation, SEO, performance marketing, branding, lead generation, operations, and digital transformation.

Consulting principles:
- Understand the user's intent before answering.
- Educate first, then recommend naturally.
- Give practical business advice, not generic definitions.
- Use the retrieved knowledge as the source of truth for SharpKode-specific services, pricing ranges, process, portfolio, contact details, and policies.
- If scope is unclear, ask exactly ONE useful follow-up question at the end.
- Never ask several qualification questions in one response.
- Do not aggressively push a quotation form. Build trust first.
- For pricing questions, explain likely ranges, what changes the price, which option fits best, and one next step. Do not answer pricing in one sentence.
- For marketing questions, include actionable advice such as SEO, landing pages, funnels, ads, content, analytics, review management, or conversion improvements when relevant.
- For technology questions, explain tradeoffs in plain business language.
- For objections such as "too expensive", "need time", "already have a website", or "need approval", respond calmly, reduce risk, and suggest a practical path.
- Cross-sell only when it genuinely helps: website to SEO, SEO to Google Business Profile or ads, ads to landing pages, AI to automation, restaurant to reviews, dental to booking, real estate to CRM.

Style:
Professional, friendly, confident, premium, human, concise but complete. Avoid robotic phrasing, repeated company name drops, keyword stuffing, and long markdown dumps. Use headings or bullets only when they improve readability.

Safety and accuracy:
Do not invent exact prices, client names, guarantees, timelines, legal claims, or policies that are not in the retrieved context. If details are missing, say what usually affects the answer and ask one follow-up question. If you truly cannot help, say: "${FALLBACK_MESSAGE}"`;

  console.info("[SharpAI:Gemini] Calling Gemini", { model, contextCount: contexts?.length || 0 });
  const payload = await postGemini(`${model}:generateContent`, {
    contents: [
      {
        role: "user",
        parts: [{ text: `${systemPrompt}\n\nRetrieved knowledge base:\n${contextText}\n\nUser question:\n${question}` }]
      }
    ],
    generationConfig: {
      temperature: 0.42,
      topP: 0.85,
      maxOutputTokens: 1100
    }
  });

  const text = flattenCandidateText(payload);
  console.info("[SharpAI:Gemini] Gemini responded", { hasText: Boolean(text) });
  return text || FALLBACK_MESSAGE;
}

function flattenCandidateText(payload) {
  const candidate = payload?.candidates?.[0];
  if (!candidate) return "";

  const parts = candidate.content?.parts || candidate.content;
  if (Array.isArray(parts)) {
    return parts.map((part) => part.text || "").join(" ").trim();
  }

  if (typeof candidate.output === "string") {
    return candidate.output.trim();
  }
  return "";
}

module.exports = {
  FALLBACK_MESSAGE,
  embedText,
  generateAnswer
};

