require("../config");
const { getEnv, requireEnv } = require("../config");

const API_ROOT = "https://integrate.api.nvidia.com/v1";
const FALLBACK_MESSAGE = "I couldn't find that information in our knowledge base. Please contact our team at info@sharpkode.com.";

function getApiKey() {
  return requireEnv("NVIDIA_API_KEY");
}

function getModel() {
  return getEnv("NVIDIA_MODEL", "meta/llama-3.3-70b-instruct");
}

function formatMessages({ question, contexts, history }) {
  const contextText = contexts?.length
    ? contexts.map((ctx, index) => `Context ${index + 1} (${ctx.source}):\n${ctx.text}`).join("\n\n---\n\n")
    : "No high-confidence retrieved chunks were found. Continue as SharpKode's AI Project Consultant using safe company-level knowledge and ask a helpful follow-up when scope is unclear.";

  const messages = [];

  // Add older messages summary if present
  if (history && history.length > 5) {
    const older = history.slice(0, history.length - 5);
    const topics = older
      .filter(m => m.role === 'user')
      .map(m => m.content)
      .join(", ");
    if (topics) {
      messages.push({
        role: "user",
        content: `Summary of previous discussion: User asked about: ${topics.slice(0, 150)}...`
      });
      messages.push({
        role: "assistant",
        content: "Understood. I will keep that context in mind for our consulting session."
      });
    }
  }

  // Add last 5 messages
  const recent = history ? history.slice(-5) : [];
  for (const msg of recent) {
    messages.push({
      role: msg.role === "assistant" ? "assistant" : "user",
      content: msg.content
    });
  }

  // Add current user message with RAG context
  messages.push({
    role: "user",
    content: `Use the following context to answer: \n\n${contextText}\n\nQuestion: ${question}`
  });

  return messages;
}

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

async function generateAnswer({ question, contexts }) {
  const model = getModel();
  const apiKey = getApiKey();
  
  const contextText = contexts?.length
    ? contexts.map((ctx, index) => `Context ${index + 1} (${ctx.source}):\n${ctx.text}`).join("\n\n---\n\n")
    : "No high-confidence retrieved chunks were found. Continue as SharpKode's AI Project Consultant using safe company-level knowledge and ask a helpful follow-up when scope is unclear.";

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: `Use the following context to answer:\n\n${contextText}\n\nQuestion:\n${question}` }
  ];

  console.info("[SharpAI:NVIDIA] Calling NVIDIA NIM", { model, contextCount: contexts?.length || 0 });
  
  const response = await fetch(`${API_ROOT}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.3,
      max_tokens: 1024,
      stream: false
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`NVIDIA completions API error ${response.status}: ${errorText}`);
  }

  const payload = await response.json();
  const text = payload?.choices?.[0]?.message?.content;
  console.info("[SharpAI:NVIDIA] NVIDIA responded", { hasText: Boolean(text) });
  return text || FALLBACK_MESSAGE;
}

async function* generateAnswerStream({ question, contexts, history }) {
  const model = getModel();
  const apiKey = getApiKey();
  const messages = [
    { role: "system", content: systemPrompt },
    ...formatMessages({ question, contexts, history })
  ];

  console.info("[SharpAI:NVIDIA] Calling NVIDIA NIM Stream", { model, contextCount: contexts?.length || 0 });

  const response = await fetch(`${API_ROOT}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.3,
      max_tokens: 1024,
      stream: true
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`NVIDIA stream API error ${response.status}: ${errorText}`);
  }

  const reader = response.body.getReader();
  let buffer = "";
  const decoder = new TextDecoder("utf-8");

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += typeof value === "string" ? value : decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop();

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith("data: ")) continue;
      const dataStr = trimmed.slice(6).trim();
      if (dataStr === "[DONE]") break;

      try {
        const parsed = JSON.parse(dataStr);
        const text = parsed?.choices?.[0]?.delta?.content;
        if (text) {
          yield text;
        }
      } catch (err) {
        console.error("Failed to parse SSE line:", err, trimmed);
      }
    }
  }
}

module.exports = {
  FALLBACK_MESSAGE,
  generateAnswer,
  generateAnswerStream
};
