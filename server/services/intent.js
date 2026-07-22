"use strict";

/**
 * SharpAI Intent & Response Style Classifier
 *
 * Classifies user messages into a broad intent category and a response style.
 * Returns routing metadata used by the chat route to decide:
 *   - Whether to use a static cache response (for purely factual/static queries)
 *   - How many RAG chunks to retrieve
 *   - What response style/tone to request from the LLM
 *   - How many max_tokens to allow
 *
 * Design principles:
 *   - Zero latency (pure regex, no API calls)
 *   - Broad categories with targeted sub-intents only where it matters
 *   - Easy to extend: add patterns to the INTENT_RULES array
 */

// ─── Intent rules ────────────────────────────────────────────────────────────
// Ordered from most specific to most general.
// First match wins. Each rule produces { intent, style, chunkLimit, maxTokens, useCache }.

const INTENT_RULES = [
  // ── Static / factual intents (no NVIDIA needed) ──────────────────────────
  {
    name: "greeting",
    pattern: /^\s*(hi+|hello+|hey+|good\s+(morning|afternoon|evening)|howdy|greetings|sup|what'?s?\s+up)\b/i,
    style: "greeting",
    chunkLimit: 0,
    maxTokens: 120,
    useCache: true
  },
  {
    name: "thanks",
    pattern: /^\s*(thank(s| you)|thanks a lot|appreciate it|cheers|great|perfect|awesome|wonderful|brilliant)\b/i,
    style: "greeting",
    chunkLimit: 0,
    maxTokens: 80,
    useCache: true
  },
  {
    name: "goodbye",
    pattern: /^\s*(bye|goodbye|see you|take care|talk later|cya|later)\b/i,
    style: "greeting",
    chunkLimit: 0,
    maxTokens: 80,
    useCache: true
  },
  {
    name: "contact",
    pattern: /\b(contact|phone|email|whatsapp|call us|reach you|get in touch|address|office|location|where are you|how to contact)\b/i,
    style: "quick_answer",
    chunkLimit: 1,
    maxTokens: 160,
    useCache: true
  },
  {
    name: "company",
    pattern: /\b(who are you|what is sharpkode|about (sharpkode|you|the company)|about us|tell me about|sharpkode company|founded|headquarters)\b/i,
    style: "quick_answer",
    chunkLimit: 1,
    maxTokens: 200,
    useCache: true
  },
  {
    name: "team",
    pattern: /\b(team|staff|founder|ceo|director|who (works|built)|employees|your team)\b/i,
    style: "quick_answer",
    chunkLimit: 1,
    maxTokens: 180,
    useCache: true
  },
  {
    name: "portfolio",
    pattern: /\b(portfolio|projects|case studies|our work|examples|clients|past work|built before|previous projects)\b/i,
    style: "quick_answer",
    chunkLimit: 1,
    maxTokens: 200,
    useCache: true
  },
  {
    name: "comparison",
    pattern: /\b(compare|vs\.?|versus|difference between|better than|which (is|one|should)|pros and cons|alternative)\b/i,
    style: "comparison",
    chunkLimit: 5,
    maxTokens: 380,
    useCache: false
  },
  {
    name: "technologies",
    pattern: /\b(tech stack|technologies|what do you use|programming languages|frameworks|tools|react|next\.?js|node|python|flutter|laravel)\b/i,
    style: "quick_answer",
    chunkLimit: 1,
    maxTokens: 200,
    useCache: true
  },
  {
    name: "hosting",
    pattern: /\b(hosting|server|deployment|cloud|aws|gcp|azure|vercel|render|who hosts|where is it hosted)\b/i,
    style: "quick_answer",
    chunkLimit: 1,
    maxTokens: 180,
    useCache: true
  },
  {
    name: "maintenance",
    pattern: /\b(maintenance|support|updates|after launch|post launch|ongoing support|warranty|bug fix)\b/i,
    style: "quick_answer",
    chunkLimit: 1,
    maxTokens: 200,
    useCache: true
  },

  // ── Context-aware intents (NVIDIA + RAG required) ──────────────────────────
  {
    name: "pricing",
    pattern: /\b(price|pricing|cost|how much|budget|package|rate|fee|charge|estimate|invoice|affordable|expensive|cheap)\b/i,
    style: "explanation",
    chunkLimit: 2,
    maxTokens: 300,
    useCache: false
  },
  {
    name: "timeline",
    pattern: /\b(timeline|how long|when|deadline|duration|delivery|turnaround|time to (build|develop|launch|complete))\b/i,
    style: "explanation",
    chunkLimit: 2,
    maxTokens: 250,
    useCache: false
  },
  {
    name: "website",
    pattern: /\b(website|web (site|app|design|development)|landing page|e-?commerce|online store|redesign|wordpress|shopify)\b/i,
    style: "recommendation",
    chunkLimit: 3,
    maxTokens: 300,
    useCache: false
  },
  {
    name: "seo",
    pattern: /\b(seo|search engine|ranking|google rank|organic|local seo|google business|gbp|keywords|backlinks|on.?page|technical seo)\b/i,
    style: "recommendation",
    chunkLimit: 3,
    maxTokens: 300,
    useCache: false
  },
  {
    name: "google_ads",
    pattern: /\b(google ads|ppc|pay per click|google campaign|search ads|display ads|adwords)\b/i,
    style: "recommendation",
    chunkLimit: 3,
    maxTokens: 300,
    useCache: false
  },
  {
    name: "meta_ads",
    pattern: /\b(meta ads|facebook ads|instagram ads|social (media )?ads|paid social|fb ads|roas)\b/i,
    style: "recommendation",
    chunkLimit: 3,
    maxTokens: 300,
    useCache: false
  },
  {
    name: "mobile_app",
    pattern: /\b(mobile app|android|ios|flutter|react native|app development|native app)\b/i,
    style: "recommendation",
    chunkLimit: 3,
    maxTokens: 300,
    useCache: false
  },
  {
    name: "ai",
    pattern: /\b(ai|artificial intelligence|chatbot|llm|machine learning|automation|rag|nlp|ai agent|workflow automation)\b/i,
    style: "explanation",
    chunkLimit: 4,
    maxTokens: 350,
    useCache: false
  },
  {
    name: "erp",
    pattern: /\b(erp|enterprise resource|business management system|inventory|accounting software|operations software)\b/i,
    style: "explanation",
    chunkLimit: 4,
    maxTokens: 350,
    useCache: false
  },
  {
    name: "crm",
    pattern: /\b(crm|customer relationship|lead management|sales pipeline|customer tracking|deal management)\b/i,
    style: "explanation",
    chunkLimit: 4,
    maxTokens: 350,
    useCache: false
  },
  {
    name: "objection",
    pattern: /\b(too expensive|can'?t afford|already have (a )?website|no budget|need (to )?think|need approval|not ready|maybe later|not sure yet|considering|comparing)\b/i,
    style: "recommendation",
    chunkLimit: 2,
    maxTokens: 280,
    useCache: false
  },
  {
    name: "strategy",
    pattern: /\b(strategy|plan|roadmap|growth|scale|business (plan|growth)|how (should|can|do) (i|we)|recommend|advise|suggest|what would you)\b/i,
    style: "strategy",
    chunkLimit: 5,
    maxTokens: 500,
    useCache: false
  },
  {
    name: "troubleshooting",
    pattern: /\b(not working|issue|problem|bug|error|broken|fix|down|failed|slow|crash|why (is|isn'?t|doesn'?t|won'?t))\b/i,
    style: "troubleshooting",
    chunkLimit: 3,
    maxTokens: 300,
    useCache: false
  },
  {
    name: "lead_request",
    pattern: /\b(quote|quotation|proposal|call|book|schedule|appointment|consultation|hire|start (a |the )?project|get started)\b/i,
    style: "quick_answer",
    chunkLimit: 1,
    maxTokens: 180,
    useCache: false  // needs RAG for current pricing/process context
  }
];

// ─── Fallback ─────────────────────────────────────────────────────────────────
const FALLBACK_INTENT = {
  name: "unknown",
  style: "explanation",
  chunkLimit: 3,
  maxTokens: 280,
  useCache: false
};

// ─── Exported classifier ─────────────────────────────────────────────────────

/**
 * Classify the user's message.
 *
 * @param {string} message
 * @returns {{ intent: string, style: string, chunkLimit: number, maxTokens: number, useCache: boolean }}
 */
function classifyIntent(message) {
  const text = String(message || "").trim();
  for (const rule of INTENT_RULES) {
    if (rule.pattern.test(text)) {
      return {
        intent: rule.name,
        style: rule.style,
        chunkLimit: rule.chunkLimit,
        maxTokens: rule.maxTokens,
        useCache: rule.useCache
      };
    }
  }
  return { ...FALLBACK_INTENT };
}

module.exports = { classifyIntent };
