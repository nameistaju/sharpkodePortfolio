const express = require("express");
const { retrieve, ensureVectorStore } = require("../services/rag");
const { generateAnswer, FALLBACK_MESSAGE } = require("../services/nvidia");
const { classifyIntent } = require("../services/intent");
const { appendJson, cleanString, readJson } = require("../services/storage");

const router = express.Router();

// ─── Static response cache ──────────────────────────────────────────────────
// Only used for purely factual, static information that does not require
// context-aware reasoning (e.g. contact details, company identity, team).
// Dynamic topics (pricing, SEO, AI, etc.) always go through RAG + NVIDIA.

const STATIC_CACHE = new Map([
  ["greeting", {
    answer: "Hey! I'm SharpAI, your business consultant here at SharpKode. I can help with websites, apps, AI solutions, marketing, pricing, or anything else tech-related. What are you working on?",
    leadForm: false
  }],
  ["thanks", {
    answer: "Happy to help. Let me know if there's anything else you'd like to explore.",
    leadForm: false
  }],
  ["goodbye", {
    answer: "Take care! Reach us anytime at info@sharpkode.com or on WhatsApp if something comes up.",
    leadForm: false
  }],
  ["contact", {
    answer: "You can reach the team through any of these:\n\n• **WhatsApp:** [Chat Now](https://wa.me/917799343436)\n• **Phone:** +91 77993 43436\n• **Email:** info@sharpkode.com\n• **Office:** Visakhapatnam, India\n\nOr fill in the quick form below and someone will get back to you.",
    leadForm: true
  }],
  ["company", {
    answer: "SharpKode is a technology and digital marketing company based in Visakhapatnam. We build websites, custom software, mobile apps, AI solutions, ERP systems, and run performance marketing campaigns for businesses across industries.",
    leadForm: false
  }],
  ["team", {
    answer: "SharpKode has a cross-functional team of developers, designers, and digital marketers who specialize in web, software, mobile, AI, and growth marketing. Want to know more about a specific area?",
    leadForm: false
  }],
  ["portfolio", {
    answer: "We've worked with businesses in real estate, interior design, wellness, hospitality, retail, and more. You can browse the full portfolio at [sharpkode.com/portfolio.html](./portfolio.html) — or ask me about a specific industry and I'll pull up relevant examples.",
    leadForm: false
  }],
  ["technologies", {
    answer: "Our core stack covers both sides of the build:\n\n• **Frontend:** React, Next.js, Tailwind CSS, Flutter\n• **Backend:** Node.js, Express, Python, Laravel, Django\n• **Databases:** MySQL, PostgreSQL, MongoDB\n• **Cloud:** AWS, Google Cloud, Vercel, Render\n• **AI/ML:** LLMs, RAG, automation pipelines\n\nWe match the stack to the project, not the other way around.",
    leadForm: false
  }],
  ["hosting", {
    answer: "We deploy on AWS, Google Cloud, Vercel, or Render depending on the project's scale and budget. All deployments include SSL, CDN, automated backups, and CI/CD pipelines. Hosting and infrastructure management can be included in your package.",
    leadForm: false
  }],
  ["maintenance", {
    answer: "Yes — all our projects come with post-launch support. Depending on your package, this covers bug fixes, content updates, performance monitoring, and feature additions. Maintenance plans start from Rs 9,999/month. Want specifics for your project type?",
    leadForm: false
  }]
]);

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isLeadIntent(message) {
  return /\b(quote|quotation|estimate|proposal|consultation|meeting|appointment|call|book|contact|talk\s+to\s+(a\s+)?human|talk\s+to\s+(the\s+)?team|hire|start\s+(a\s+)?project|get started)\b/i.test(message);
}

// ─── POST /api/chat ───────────────────────────────────────────────────────────

router.post("/chat", async (req, res) => {
  console.log("CHAT ROUTE HIT");
  console.log("Incoming request:", req.body);

  const message = cleanString(req.body?.message, 1000);
  const sessionId = cleanString(req.body?.sessionId, 120) || "anonymous";

  if (!message) {
    console.info("[SharpAI:Route] Empty message rejected", { sessionId });
    res.status(400).json({ error: "Please enter a question for SharpAI." });
    return;
  }

  const timestamp = new Date().toISOString();
  console.info("[SharpAI:Route] Request received by Express", { sessionId, length: message.length });

  // 1. Classify intent (zero-latency)
  const intent = classifyIntent(message);
  console.info("[SharpAI:Intent]", { intent: intent.intent, style: intent.style, chunkLimit: intent.chunkLimit, useCache: intent.useCache });

  // 2. Static cache hit — return immediately, no RAG, no NVIDIA
  if (intent.useCache) {
    const cached = STATIC_CACHE.get(intent.intent);
    if (cached) {
      console.info("[SharpAI:Route] Static cache hit", { intent: intent.intent });
      const leadForm = isLeadIntent(message) || cached.leadForm;
      res.json({ success: true, response: cached.answer, leadForm, contexts: [] });
      return;
    }
  }

  // 3. Dynamic RAG + NVIDIA path
  const startTotal = Date.now();
  let retrievalTime = 0;
  let nvidiaTime = 0;
  let contexts = [];
  let history = [];
  let answerAccumulator = "";

  try {
    const apiKey = process.env.NVIDIA_API_KEY;
    if (!apiKey) throw new Error("NVIDIA_API_KEY environment variable is not defined!");

    // 3a. Parallel retrieval + history load
    const startRetrieval = Date.now();
    await ensureVectorStore();

    const [retrievedContexts, allLogs] = await Promise.all([
      retrieve(message, intent.chunkLimit),
      readJson("conversation-logs.json", [])
    ]);

    contexts = retrievedContexts;
    retrievalTime = Date.now() - startRetrieval;
    console.log("Retrieved chunks:", contexts.length);

    // 3b. Build conversation history for this session
    history = allLogs
      .filter((log) => log.sessionId === sessionId)
      .map((log) => ({ role: log.role, content: log.content }));

    console.log("Prompt created");

    // 3c. Call NVIDIA NIM with intent-aware style and token limit
    const startNvidia = Date.now();
    console.log("Calling NVIDIA NIM...");
    const answer = await generateAnswer({
      question: message,
      contexts,
      history,
      style: intent.style,
      maxTokens: intent.maxTokens
    });
    answerAccumulator = answer;
    nvidiaTime = Date.now() - startNvidia;

    const leadForm = isLeadIntent(message);
    res.json({
      success: true,
      response: answerAccumulator,
      leadForm,
      contexts: contexts.map(({ source, score }) => ({ source, score }))
    });

    const totalTime = Date.now() - startTotal;
    console.info(`\nPerformance Stats:\nIntent:    ${intent.intent} (${intent.style})\nRetrieval: ${retrievalTime}ms\nNVIDIA:    ${nvidiaTime}ms\nTotal:     ${totalTime}ms\n`);

    // Async log saving (non-blocking)
    appendJson("chat-history.json", {
      sessionId, message, answer: answerAccumulator,
      intent: intent.intent, style: intent.style,
      contexts: contexts.map(({ source, score }) => ({ source, score })),
      timestamp
    }).catch(console.error);

    appendJson("conversation-logs.json", {
      sessionId, role: "user", content: message, timestamp
    }).then(() =>
      appendJson("conversation-logs.json", {
        sessionId, role: "assistant", content: answerAccumulator,
        contexts: contexts.map(({ source, score }) => ({ source, score })),
        timestamp: new Date().toISOString()
      }).catch(console.error)
    ).catch(console.error);

  } catch (error) {
    console.error("CHAT ERROR:", error);
    console.error(error.stack);

    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: error.message,
        stack: process.env.NODE_ENV !== "production" ? error.stack : undefined
      });
    }

    appendJson("chat-history.json", {
      sessionId, message, answer: FALLBACK_MESSAGE,
      error: error.message, timestamp
    }).catch(console.error);
  }
});

// ─── POST /api/leads ──────────────────────────────────────────────────────────

function isEmail(str) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str); }
function isPhone(str) { return /^[+\d\s\-().]{7,20}$/.test(str); }

router.post("/leads", async (req, res) => {
  const lead = {
    sessionId: cleanString(req.body?.sessionId, 120) || "anonymous",
    name:             cleanString(req.body?.name, 120),
    phone:            cleanString(req.body?.phone, 40),
    email:            cleanString(req.body?.email, 160),
    business:         cleanString(req.body?.business, 160),
    industry:         cleanString(req.body?.industry, 120),
    budget:           cleanString(req.body?.budget, 80),
    timeline:         cleanString(req.body?.timeline, 120),
    requiredServices: cleanString(req.body?.requiredServices, 300),
    message:          cleanString(req.body?.message, 1000),
    timestamp: new Date().toISOString()
  };

  if (!lead.name || !lead.phone || !lead.email || !lead.message) {
    res.status(400).json({ error: "Name, phone, email, and message are required." });
    return;
  }
  if (!isEmail(lead.email)) {
    res.status(400).json({ error: "Please enter a valid email address." });
    return;
  }
  if (!isPhone(lead.phone)) {
    res.status(400).json({ error: "Please enter a valid phone number." });
    return;
  }

  console.info("[SharpAI:Route] Lead received", { sessionId: lead.sessionId, email: lead.email, hasPhone: Boolean(lead.phone) });
  await appendJson("leads.json", lead);

  const summary = [
    "Thanks. Your project details have been captured.",
    "",
    "**Lead Summary**",
    `Name: ${lead.name}`,
    `Business: ${lead.business || "Not provided"}`,
    `Budget: ${lead.budget || "Not provided"}`,
    `Timeline: ${lead.timeline || "Not provided"}`,
    `Phone: ${lead.phone}`,
    `Email: ${lead.email}`,
    `Message: ${lead.message}`,
    "",
    "Our team will contact you soon. You can also reach us at info@sharpkode.com or on WhatsApp at +91 77993 43436."
  ].join("\n");

  res.json({ ok: true, summary });
});

// ─── Admin routes ─────────────────────────────────────────────────────────────

router.get("/admin/history", async (_req, res) => {
  res.json(await readJson("chat-history.json", []));
});

router.get("/admin/leads", async (_req, res) => {
  res.json(await readJson("leads.json", []));
});

module.exports = router;
