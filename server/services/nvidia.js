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

/**
 * Response style guidance injected into the system prompt.
 * Keeps the LLM focused on the right depth and length for each query type.
 */
const STYLE_GUIDANCE = {
  greeting:          "Respond warmly in 1–2 sentences. No bullet points.",
  quick_answer:      "Answer directly in 2–4 sentences. No preamble.",
  informational:     "Give a clear, factual answer. Use a short bullet list only if it genuinely helps. 3–5 points max.",
  explanation:       "Explain the topic clearly in plain business language. Lead with the direct answer, then add context. Avoid long preambles.",
  recommendation:    "Lead with a concrete recommendation based on what the user described. Explain the reasoning briefly. Avoid generic lists.",
  comparison:        "Structure as a direct comparison. Name the key differences clearly. Be opinionated — tell the user which option suits them better based on context.",
  strategy:          "Think like a senior consultant. Outline a practical approach in logical steps. Be direct about tradeoffs and priorities.",
  troubleshooting:   "Diagnose first, then suggest the most likely fix. Be specific, not generic.",
  quotation:         "Acknowledge the request, summarise what you know about their scope, and invite them to share any missing details (budget, timeline, features)."
};

const systemPrompt = `You are SharpAI, the AI Business Consultant for SharpKode — a technology and digital marketing company.

Your job is to advise visitors like a senior consultant, not recite FAQs.

CORE RULES:
- Answer the question first. Context and caveats come after.
- Be concise. Match depth to what was actually asked.
- Do not repeat the company name more than once per response.
- Do not produce unsolicited essays, long bullet lists, or markdown tables.
- Ask at most ONE follow-up question — only when it meaningfully helps you give a better answer.
- Never say "Great question!", "Certainly!", or similar hollow phrasing.
- Use the retrieved context as your primary source of truth for SharpKode-specific facts.
- If you do not have enough information, say what typically affects the answer and ask one useful follow-up.

WHEN TO USE BULLETS:
- Use bullets only when listing 3+ parallel items (services, steps, options).
- Never use bullets for a single thought or a two-item list.

TONE:
Confident, warm, human. Like a knowledgeable friend who happens to run a tech agency — not a chatbot, not a salesperson.`;


async function generateAnswer({ question, contexts, history, style = "explanation", maxTokens = 300 }) {
  const model = getModel();
  const apiKey = getApiKey();

  // Build style instruction to append to system prompt
  const styleInstruction = STYLE_GUIDANCE[style] || STYLE_GUIDANCE.explanation;
  const fullSystemPrompt = `${systemPrompt}\n\nFOR THIS RESPONSE: ${styleInstruction}`;

  const messages = [
    { role: "system", content: fullSystemPrompt },
    ...formatMessages({ question, contexts, history })
  ];

  console.info("[SharpAI:NVIDIA] Calling NVIDIA NIM", { model, contextCount: contexts?.length || 0, style, maxTokens });

  const response = await fetch(`${API_ROOT}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.35,
      max_tokens: maxTokens,
      stream: false
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("NVIDIA ERROR RESPONSE:", errorText);
    throw new Error(`NVIDIA API error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const answer = data.choices?.[0]?.message?.content;
  return answer || FALLBACK_MESSAGE;
}

module.exports = {
  FALLBACK_MESSAGE,
  generateAnswer
};
