const express = require("express");
const { answerQuestion } = require("../services/rag");
const { appendJson, cleanString, readJson } = require("../services/storage");
const { FALLBACK_MESSAGE } = require("../services/gemini");

const router = express.Router();

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isPhone(value) {
  return /^[+\d][\d\s()-]{7,18}$/.test(value);
}

router.post("/chat", async (req, res) => {
  const message = cleanString(req.body?.message, 1000);
  const sessionId = cleanString(req.body?.sessionId, 120) || "anonymous";

  if (!message) {
    console.info("[SharpAI:Route] Empty message rejected", { sessionId });
    res.status(400).json({ error: "Please enter a question for SharpAI." });
    return;
  }

  console.info("[SharpAI:Route] Request received by Express", { sessionId, length: message.length });
  const timestamp = new Date().toISOString();
  try {
    const result = await answerQuestion(message);
    console.info("[SharpAI:Route] Response sent to frontend", { sessionId, contexts: result.contexts?.length || 0, leadForm: result.leadForm });
    await appendJson("chat-history.json", {
      sessionId,
      message,
      answer: result.answer,
      contexts: result.contexts,
      timestamp
    });
    await appendJson("conversation-logs.json", {
      sessionId,
      role: "user",
      content: message,
      timestamp
    });
    await appendJson("conversation-logs.json", {
      sessionId,
      role: "assistant",
      content: result.answer,
      contexts: result.contexts,
      timestamp: new Date().toISOString()
    });
    res.json(result);
  } catch (error) {
    console.error("[SharpAI:Route] Chat flow failed", { sessionId, reason: error.message });
    await appendJson("chat-history.json", {
      sessionId,
      message,
      answer: FALLBACK_MESSAGE,
      error: error.message,
      timestamp
    });
    res.status(200).json({
      answer: "I'm having trouble answering that right now. Would you like to try again, contact us on WhatsApp, or talk to our team?",
      contexts: [],
      leadForm: false,
      error: error.message
    });
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
