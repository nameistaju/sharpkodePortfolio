require("../config");
const fs = require("fs/promises");
const path = require("path");
const { getEnv } = require("../config");
const { generateAnswer, FALLBACK_MESSAGE } = require("./gemini");
const { createEmbedding } = require("./embedding");
const { loadKnowledgeChunks } = require("./knowledgeLoader");

const vectorDir = path.join(__dirname, "..", "vectorstore");
const vectorFile = path.join(vectorDir, "vectors.json");
const MIN_SCORE = 0.2;
let vectorCache = null;
let knowledgeCache = null;

function logStep(message, data) {
  if (data !== undefined) console.info(`[SharpAI:RAG] ${message}`, data);
  else console.info(`[SharpAI:RAG] ${message}`);
}

function cosineSimilarity(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length || a.length === 0) {
    return 0;
  }
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (!normA || !normB) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function readVectorFile() {
  try {
    const raw = await fs.readFile(vectorFile, "utf8");
    return JSON.parse(raw);
  } catch (_error) {
    return null;
  }
}

async function getKnowledgeChunks() {
  if (!knowledgeCache) knowledgeCache = await loadKnowledgeChunks();
  return knowledgeCache;
}

async function buildVectorStore() {
  await fs.mkdir(vectorDir, { recursive: true });
  const chunks = await getKnowledgeChunks();
  const entries = [];

  for (const chunk of chunks) {
    const embedding = await createEmbedding(`${chunk.source}\n${chunk.text}`);
    entries.push({ ...chunk, embedding });
  }

  const store = {
    createdAt: new Date().toISOString(),
    embeddingModel: getEnv("GEMINI_EMBEDDING_MODEL", "gemini-embedding-001"),
    entries
  };
  await fs.writeFile(vectorFile, JSON.stringify(store, null, 2));
  vectorCache = store;
  return store;
}

async function ensureVectorStore() {
  const existing = await readVectorFile();
  if (existing?.entries?.length) {
    vectorCache = existing;
    return existing;
  }

  console.warn("Vector store missing. Run npm run build:vectors");
  vectorCache = { createdAt: null, entries: [] };
  return vectorCache;
}

function expandQuery(question) {
  const normalized = String(question || "").toLowerCase();
  const expansions = [];
  if (/website|web site|landing page|redesign/.test(normalized)) expansions.push("website development conversion optimization SEO landing page business website hosting maintenance");
  if (/seo|rank|google|local|map|business profile|gbp/.test(normalized)) expansions.push("SEO local SEO Google Business Profile technical SEO content marketing reviews lead generation");
  if (/ads|marketing|lead|instagram|facebook|meta|campaign/.test(normalized)) expansions.push("Google Ads Meta Ads performance marketing funnels landing pages analytics conversion optimization");
  if (/ai|chatbot|agent|automation|machine learning/.test(normalized)) expansions.push("AI chatbot AI agent automation workflow machine learning business process automation");
  if (/erp|crm|software|dashboard|admin|portal/.test(normalized)) expansions.push("custom software ERP CRM admin panel integrations workflow automation reporting");
  if (/price|pricing|cost|budget|package|estimate|quotation|quote/.test(normalized)) expansions.push("pricing packages timeline scope factors payment maintenance support quotation");
  return [question, ...expansions].filter(Boolean).join("\n");
}

async function retrieve(question, limit = 8) {
  logStep("Loading relevant knowledge");
  if (!vectorCache) await ensureVectorStore();
  if (!vectorCache?.entries?.length) {
    logStep("Vector store empty; skipping vector search");
    return [];
  }

  const queryEmbedding = await createEmbedding(expandQuery(question));
  const ranked = vectorCache.entries
    .map((entry) => ({ ...entry, score: cosineSimilarity(queryEmbedding, entry.embedding) }))
    .filter((entry) => entry.score >= MIN_SCORE)
    .sort((a, b) => b.score - a.score);

  const contexts = [];
  const sourceCounts = new Map();
  for (const entry of ranked) {
    const count = sourceCounts.get(entry.source) || 0;
    if (count >= 3 && contexts.length < Math.ceil(limit / 2)) continue;
    contexts.push(entry);
    sourceCounts.set(entry.source, count + 1);
    if (contexts.length >= limit) break;
  }

  logStep(`Retrieved ${contexts.length} context chunks`, contexts.map(({ source, score }) => ({ source, score: Number(score.toFixed(3)) })));
  return contexts;
}

async function getFallbackContexts(limit = 10) {
  const chunks = await getKnowledgeChunks();
  return chunks.slice(0, limit).map((chunk) => ({ ...chunk, score: 0 }));
}

function buildContextFallbackAnswer(question, contexts) {
  if (!contexts?.length) {
    return "I'm having trouble answering that right now. You can try again, contact us on WhatsApp, or talk to our team for quick help.";
  }

  const contextSummary = contexts
    .slice(0, 3)
    .map((ctx) => String(ctx.text || "").replace(/^#+\s*/gm, "").replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join(" ")
    .slice(0, 720);

  return [
    "I found relevant SharpKode information, but the AI model is temporarily busy.",
    "",
    contextSummary ? `Here is what I can confirm from the knowledge base: ${contextSummary}` : "SharpKode can help with websites, custom software, mobile apps, AI solutions, ERP systems, cloud deployment, UI/UX, and digital marketing.",
    "",
    "For a precise recommendation or quote, share your project type, timeline, and budget range, or contact the team on WhatsApp."
  ].join("\n");
}
function isLeadIntent(message) {
  return /\b(quote|quotation|estimate|proposal|consultation|meeting|appointment|call|contact|talk\s+to\s+(a\s+)?human|talk\s+to\s+(the\s+)?team|hire|start\s+(a\s+)?project)\b/i.test(message);
}

function getGuidedSalesReply(message) {
  const normalized = String(message || "").toLowerCase().trim();
  if (/^(hi|hello|hey|good\s+(morning|afternoon|evening))\b/.test(normalized) || /who\s+are\s+you/.test(normalized)) {
    return "Hello. I'm SharpAI, SharpKode's AI Project Consultant. I can help you explore services, pricing, portfolio work, AI solutions, software development, or connect you with the team for a quote.";
  }

  if (/\b(need|want|build|create|develop).{0,24}\bwebsite\b/.test(normalized) || normalized === "website development") {
    return [
      "Great. What kind of website are you planning?",
      "",
      "- Business website",
      "- E-commerce store",
      "- Portfolio website",
      "- Healthcare or clinic website",
      "- Restaurant or local business website",
      "",
      "Share the type, number of pages, and any reference website. I can then help you estimate scope and next steps."
    ].join("\n");
  }

  if (/\b(need|want|build|create|develop).{0,24}\b(app|mobile)\b/.test(normalized)) {
    return "Great. For a mobile app, I need to understand the platform, user roles, core features, login/payment needs, and timeline. Is it for Android, iOS, or both?";
  }

  if (/\b(ai|chatbot|automation|agent)\b/.test(normalized) && /\b(need|want|build|create|develop|solution)\b/.test(normalized)) {
    return "Good direction. For an AI solution, tell me the workflow you want to automate, what data the AI should use, and whether it should chat with customers, support staff, or internal teams.";
  }

  return "";
}

async function answerQuestion(question) {
  logStep("Request received by RAG service", { question });
  const guidedReply = getGuidedSalesReply(question);
  if (guidedReply) {
    logStep("Using guided consultant response");
    return { answer: guidedReply, contexts: [], leadForm: isLeadIntent(question) };
  }

  let contexts = [];
  try {
    contexts = await retrieve(question);
  } catch (error) {
    logStep("Vector search failed; continuing with fallback knowledge", error.message);
  }

  if (!contexts.length) {
    logStep("No vector matches; loading company fallback knowledge");
    contexts = await getFallbackContexts();
  }

  try {
    logStep("Calling Gemini");
    const answer = await generateAnswer({ question, contexts });
    logStep("Gemini responded");
    return {
      answer: answer || FALLBACK_MESSAGE,
      contexts: contexts.map(({ source, score }) => ({ source, score })),
      leadForm: isLeadIntent(question)
    };
  } catch (error) {
    logStep("Gemini failed; returning retrieved-context fallback", error.message);
    return {
      answer: buildContextFallbackAnswer(question, contexts),
      contexts: contexts.map(({ source, score }) => ({ source, score })),
      leadForm: isLeadIntent(question)
    };
  }
}

if (require.main === module && process.argv.includes("--reindex")) {
  buildVectorStore()
    .then((store) => {
      console.log(`Indexed ${store.entries.length} knowledge chunks.`);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = {
  answerQuestion,
  buildVectorStore,
  ensureVectorStore,
  retrieve
};




