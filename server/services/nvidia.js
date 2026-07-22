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
- For objections such as "too expensive", "need time", "already have a website", or "need approval", respond calmly, reduce risk, and suggest a path.
- Cross-sell only when it genuinely helps: website to SEO, SEO to Google Business Profile or ads, ads to landing pages, AI to automation, restaurant to reviews, dental to booking, real estate to CRM.

Style:
Professional, friendly, confident, premium, human, concise but complete. Avoid robotic phrasing, repeated company name drops, keyword stuffing, and long markdown dumps. Use headings or bullets only when they improve readability.

Safety and accuracy:
Do not invent exact prices, client names, guarantees, timelines, legal claims, or policies that are not in the retrieved context. If details are missing, say what usually affects the answer and ask one follow-up question. If you truly cannot help, say: "${FALLBACK_MESSAGE}"`;

async function generateAnswer({ question, contexts, history }) {
  const model = getModel();
  const apiKey = getApiKey();
  const messages = [
    { role: "system", content: systemPrompt },
    ...formatMessages({ question, contexts, history })
  ];

  console.info("[SharpAI:NVIDIA] Calling NVIDIA NIM", { model, contextCount: contexts?.length || 0 });

  console.time("NVIDIA TOTAL");
  let response;
  try {
    console.log("1. Before fetch");
    response = await fetch(`${API_ROOT}/chat/completions`, {
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
    console.log("2. Fetch returned");
  } catch (error) {
    console.error("FAILED AT STEP 1 (fetch)");
    console.error(error);
    console.timeEnd("NVIDIA TOTAL");
    throw error;
  }

  console.log("Status:", response.status);

  if (!response.ok) {
    let errorText;
    try {
      console.log("2a. Before response.text()");
      errorText = await response.text();
      console.log("2b. text() returned");
    } catch (error) {
      console.error("FAILED AT STEP 2a (response.text)");
      console.error(error);
      console.timeEnd("NVIDIA TOTAL");
      throw error;
    }
    console.error("NVIDIA ERROR RESPONSE:", errorText);
    console.timeEnd("NVIDIA TOTAL");
    throw new Error(`NVIDIA API error ${response.status}: ${errorText}`);
  }

  console.log("3. Before response.json()");
  let data;
  try {
    data = await response.json();
    console.log("4. JSON parsed");
  } catch (error) {
    console.error("FAILED AT STEP 3 (response.json)");
    console.error(error);
    console.timeEnd("NVIDIA TOTAL");
    throw error;
  }

  console.log("5. Before extracting answer");
  const answer = data.choices?.[0]?.message?.content;
  console.log("6. Answer extracted");

  console.timeEnd("NVIDIA TOTAL");
  return answer || FALLBACK_MESSAGE;
}

module.exports = {
  FALLBACK_MESSAGE,
  generateAnswer
};
