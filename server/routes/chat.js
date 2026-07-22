const express = require("express");
const { answerQuestion, retrieve, ensureVectorStore } = require("../services/rag");
const { generateAnswer, FALLBACK_MESSAGE } = require("../services/nvidia");
const { appendJson, cleanString, readJson } = require("../services/storage");

const router = express.Router();

const responseCache = new Map();
responseCache.set("services", {
  answer: "SharpKode offers a full suite of digital solutions:\n\n• **Website Development:** High-converting business sites, e-commerce, and portfolios.\n• **Custom Software & ERP:** Custom CRMs, admin dashboards, and internal business tools.\n• **AI Automation:** Intelligent chatbots, RAG systems, and workflow automation.\n• **Mobile App Development:** Native iOS/Android and Flutter apps.\n• **Digital Marketing & SEO:** Search Engine Optimization, Meta/Google Ads, and lead generation.",
  leadForm: false
});

responseCache.set("pricing", {
  answer: "We offer clear, transparent pricing packages:\n\n• **Basic Package (Rs 9,999/mo):** Basic website, 1 video, 3 posters, monthly maintenance.\n• **Standard Package (Rs 19,999/mo):** Standard website, SEO, 2 videos, 5 posters, Google Ads setup.\n• **Advanced Package (Rs 29,999/mo):** Dynamic website, SEO, weekly influencer promotion, 3 videos, everyday posters, cinema ads.\n\nAll packages can be customized. Contact us or book a call for a tailored quote.",
  leadForm: false
});

responseCache.set("contact", {
  answer: "You can reach the SharpKode team instantly:\n\n• **WhatsApp:** [Chat Now](https://wa.me/917799343436)\n• **Phone:** +91 77993 43436\n• **Email:** info@sharpkode.com\n• **Office:** Visakhapatnam, India.\n\nOr simply fill out our contact form right here in the chat!",
  leadForm: true
});

responseCache.set("portfolio", {
  answer: "Explore some of our featured client work:\n\n• **Zeta Real Estate Portal:** High-converting real estate search & listing platform (Next.js/Tailwind).\n• **Mammu Interior Designers:** Immersive showcase and booking portal for premium interiors (React/Figma).\n• **Aura Spa & Wellness:** Sleek appointment scheduling and package booking system.\n\nVisit our [Portfolio Page](./portfolio.html) to see all projects.",
  leadForm: false
});

responseCache.set("company", {
  answer: "SharpKode Tech Solutions is a professional software development and digital solutions company. We specialize in websites, custom software, AI integrations, mobile apps, and performance marketing to help businesses automate and scale.",
  leadForm: false
});

function getCachedResponse(message) {
  const normalized = String(message || "").toLowerCase().trim();
  if (/^(services|what do you do|our services|what services)\b/.test(normalized)) return responseCache.get("services");
  if (/^(price|pricing|cost|packages|how much|what package)\b/.test(normalized)) return responseCache.get("pricing");
  if (/^(contact|phone|email|whatsapp|address|office|call us)\b/.test(normalized)) return responseCache.get("contact");
  if (/^(portfolio|projects|case studies|our work|featured projects)\b/.test(normalized)) return responseCache.get("portfolio");
  if (/^(company|who are you|about sharpkode|about us|sharpkode)\b/.test(normalized)) return responseCache.get("company");
  return null;
}

function isLeadIntent(message) {
  return /\b(quote|quotation|estimate|proposal|consultation|meeting|appointment|call|contact|talk\s+to\s+(a\s+)?human|talk\s+to\s+(the\s+)?team|hire|start\s+(a\s+)?project)\b/i.test(message);
}

router.post("/chat", async (req, res) => {
  console.log("CHAT ROUTE HIT");
  // Validate request body
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

  // 1. Instant Cache Check
  const cached = getCachedResponse(message);
  if (cached) {
    console.info("[SharpAI:Route] Instant cache hit", { message });
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Transfer-Encoding", "chunked");
    res.write(JSON.stringify({ type: "chunk", text: cached.answer }) + "\n");
    res.write(JSON.stringify({ type: "meta", leadForm: cached.leadForm, contexts: [] }) + "\n");
    res.end();
    return;
  }

  // 2. Performance Tracking Variables
  const startTotal = Date.now();
  let retrievalTime = 0;
  let promptTime = 0;
  let nvidiaTime = 0;

  // Set streaming headers
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Transfer-Encoding", "chunked");

  let contexts = [];
  let history = [];
  let answerAccumulator = "";

  try {
    // Validate environment variables
    const apiKey = process.env.NVIDIA_API_KEY;
    if (!apiKey) {
      throw new Error("NVIDIA_API_KEY environment variable is not defined!");
    }

    // 3. Parallel retrieval and history loading
    const startRetrieval = Date.now();
    const store = await ensureVectorStore();
    const vectorStoreLength = store?.entries?.length || 0;
    console.log("Vector store loaded:", vectorStoreLength);

    const retrievalPromise = retrieve(message);
    const historyPromise = readJson("conversation-logs.json", []);

    // Wait concurrently
    const [retrievedContexts, allLogs] = await Promise.all([retrievalPromise, historyPromise]);
    contexts = retrievedContexts;
    retrievalTime = Date.now() - startRetrieval;
    console.log("Retrieved chunks:", contexts.length);

    const startPrompt = Date.now();
    history = allLogs
      .filter((log) => log.sessionId === sessionId)
      .map((log) => ({ role: log.role, content: log.content }));
    promptTime = Date.now() - startPrompt;
    console.log("Prompt created");

    // 4. Generate response from NVIDIA NIM API
    const startNvidia = Date.now();
    console.log("Calling NVIDIA NIM...");
    const answer = await generateAnswer({ question: message, contexts, history });
    answerAccumulator = answer;
    nvidiaTime = Date.now() - startNvidia;
    console.log("NVIDIA response:", answerAccumulator);

    res.write(JSON.stringify({ type: "chunk", text: answerAccumulator }) + "\n");

    const leadForm = isLeadIntent(message);
    res.write(JSON.stringify({
      type: "meta",
      leadForm,
      contexts: contexts.map(({ source, score }) => ({ source, score }))
    }) + "\n");
    res.end();

    const totalTime = Date.now() - startTotal;

    // 14. Performance Monitoring Logs
    console.info(`\nPerformance Stats:
Retrieval: ${retrievalTime}ms
Prompt:    ${promptTime}ms
NVIDIA:    ${nvidiaTime}ms
Total:     ${totalTime}ms\n`);

    // Async log saving (do not block the response)
    appendJson("chat-history.json", {
      sessionId,
      message,
      answer: answerAccumulator,
      contexts: contexts.map(({ source, score }) => ({ source, score })),
      timestamp
    }).catch(console.error);

    appendJson("conversation-logs.json", {
      sessionId,
      role: "user",
      content: message,
      timestamp
    }).then(() => {
      appendJson("conversation-logs.json", {
        sessionId,
        role: "assistant",
        content: answerAccumulator,
        contexts: contexts.map(({ source, score }) => ({ source, score })),
        timestamp: new Date().toISOString()
      }).catch(console.error);
    }).catch(console.error);

  } catch (error) {
    console.error("CHAT ERROR:", error);
    console.error(error.stack);

    if (!res.headersSent) {
      res.removeHeader("Transfer-Encoding");
      res.status(500).json({
        success: false,
        error: error.message,
        stack: process.env.NODE_ENV !== "production" ? error.stack : undefined
      });
    } else {
      res.write(JSON.stringify({
        type: "chunk",
        text: `CHAT ERROR: ${error.message}`
      }) + "\n");
      res.write(JSON.stringify({ type: "meta", leadForm: false, contexts: [], error: error.message }) + "\n");
      res.end();
    }

    appendJson("chat-history.json", {
      sessionId,
      message,
      answer: FALLBACK_MESSAGE,
      error: error.message,
      timestamp
    }).catch(console.error);
  }
});

router.post("/leads", async (req, res) => {
  const lead = {
    sessionId: cleanString(req.body?.sessionId, 120) || "anonymous",
    name: cleanString(req.body?.name, 120),
    phone: cleanString(req.body?.phone, 40),
    email: cleanString(req.body?.email, 160),
    business: cleanString(req.body?.business, 160),
    industry: cleanString(req.body?.industry, 120),
    budget: cleanString(req.body?.budget, 80),
    timeline: cleanString(req.body?.timeline, 120),
    requiredServices: cleanString(req.body?.requiredServices, 300),
    message: cleanString(req.body?.message, 1000),
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

router.get("/admin/history", async (_req, res) => {
  res.json(await readJson("chat-history.json", []));
});

router.get("/admin/leads", async (_req, res) => {
  res.json(await readJson("leads.json", []));
});

module.exports = router;
