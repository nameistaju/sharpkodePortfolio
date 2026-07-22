
(() => {
  const API_BASE = resolveApiBase();
  const WHATSAPP_URL = "https://wa.me/917799343436?text=Hi%20SharpKode%20Team%2C%20I%20found%20your%20website%20and%20would%20like%20to%20discuss%20my%20project.";
  const CONTACT_EMAIL = "info@sharpkode.com";
  const CONTACT_PHONE = "+917799343436";

  function resolveApiBase() {
    const configured =
      window.API_BASE_URL ||
      window.SHARPAI_CONFIG?.apiBaseUrl ||
      window.SHARPAI_API_BASE ||
      document.querySelector('meta[name="sharpai-api-base"]')?.content;
    if (configured) return configured.replace(/\/$/, "");

    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    const isLocal = !hostname || hostname === "localhost" || hostname === "127.0.0.1" || protocol === "file:";
    if (isLocal) return "http://localhost:5050";

    const parts = hostname.split(".");
    const rootDomain = parts.length >= 2 ? parts.slice(-2).join(".") : hostname;
    return `${protocol}//api.${rootDomain}`;
  }

  const icons = {
    bot: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="18" height="12" x="3" y="8" rx="3"></rect><path d="M12 8V4"></path><path d="M8 4h8"></path><circle cx="8" cy="14" r="1"></circle><circle cx="16" cy="14" r="1"></circle><path d="M9.5 18h5"></path></svg>',
    send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m22 2-7 20-4-9-9-4Z"></path><path d="M22 2 11 13"></path></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>',
    minus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"></path></svg>',
    spark: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="8" width="16" height="12" rx="4" fill="url(#paint0_linear)" stroke="currentColor" stroke-width="1.5"/><path d="M12 8V4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M9 4H15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="9" cy="14" r="1.5" fill="white"/><circle cx="15" cy="14" r="1.5" fill="white"/><path d="M10 18H14" stroke="white" stroke-width="1.5" stroke-linecap="round"/><path d="M2 13H4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M20 13H22" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><defs><linearGradient id="paint0_linear" x1="4" y1="8" x2="20" y2="20" gradientUnits="userSpaceOnUse"><stop stop-color="#3b82f6"/><stop offset="1" stop-color="#1d4ed8"/></linearGradient></defs></svg>',
    services: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16"></path><path d="M7 7v13"></path><path d="M17 7v13"></path><path d="M5 20h14"></path><path d="M9 3h6l1 4H8Z"></path></svg>',
    pricing: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 12V8H4v8a2 2 0 0 0 2 2h8"></path><path d="M4 8l2-4h12l2 4"></path><path d="M16 18h6"></path><path d="M19 15v6"></path></svg>',
    portfolio: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="18" height="14" x="3" y="5" rx="2"></rect><path d="M8 5V3h8v2"></path><path d="M3 10h18"></path></svg>',
    contact: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.32 1.77.6 2.61a2 2 0 0 1-.45 2.11L8 9.7a16 16 0 0 0 6.3 6.3l1.26-1.26a2 2 0 0 1 2.11-.45c.84.28 1.71.48 2.61.6A2 2 0 0 1 22 16.92Z"></path></svg>',
    whatsapp: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2a9.87 9.87 0 0 0-8.55 14.82L2.3 22l5.3-1.14A9.88 9.88 0 1 0 12.04 2Zm0 1.8a8.08 8.08 0 1 1 0 16.16 8 8 0 0 1-4.08-1.12l-.37-.22-2.82.6.63-2.72-.25-.4A8.08 8.08 0 0 1 12.04 3.8Zm-3.4 4.1c-.18 0-.46.06-.7.33-.24.26-.92.9-.92 2.18s.94 2.53 1.07 2.7c.13.18 1.82 2.9 4.5 3.95 2.22.88 2.68.7 3.16.66.49-.05 1.57-.64 1.79-1.26.22-.62.22-1.15.15-1.26-.06-.11-.24-.18-.51-.31-.27-.14-1.58-.78-1.83-.87-.24-.09-.42-.14-.6.13-.17.27-.69.87-.84 1.04-.16.18-.31.2-.58.07-.27-.14-1.14-.42-2.17-1.33-.8-.72-1.35-1.6-1.51-1.87-.15-.27-.02-.42.12-.55.12-.12.27-.31.4-.47.14-.15.18-.26.27-.44.09-.18.05-.33-.02-.47-.07-.13-.6-1.45-.82-1.98-.22-.52-.44-.45-.6-.46h-.52Z"></path></svg>'
  };

  const actionGroups = {
    services: {
      title: "Services",
      description: "Choose what you want to build.",
      icon: icons.services,
      options: [
        { label: "Website Development", prompt: "I need a website. Help me choose the right type and next steps." },
        { label: "AI Solutions", prompt: "Tell me about SharpKode AI solutions for my business." },
        { label: "Mobile Apps", prompt: "I want to develop a mobile app. What do you need from me?" },
        { label: "ERP Software", prompt: "I need ERP or workforce management software for my company." }
      ]
    },
    pricing: {
      title: "Pricing",
      description: "Estimate budget or request a quote.",
      icon: icons.pricing,
      options: [
        { label: "Website Cost", prompt: "What is the estimated cost for a business website?" },
        { label: "Software Quote", prompt: "Can you prepare a free quotation for custom software?", lead: true },
        { label: "App Budget", prompt: "What budget should I plan for a mobile app?" },
        { label: "Free Consultation", prompt: "I want a free consultation and quotation.", lead: true }
      ]
    },
    portfolio: {
      title: "Portfolio",
      description: "See relevant client work.",
      icon: icons.portfolio,
      options: [
        { label: "Featured Projects", prompt: "Show me SharpKode portfolio and featured client projects." },
        { label: "Web Projects", prompt: "Show website development projects in the portfolio." },
        { label: "App Projects", prompt: "Show mobile app or software projects from the portfolio." },
        { label: "Open Portfolio", url: "./portfolio.html" }
      ]
    },
    contact: {
      title: "Contact",
      description: "Talk to the SharpKode team.",
      icon: icons.contact,
      options: [
        { label: "Talk to Human", prompt: "I want to talk to the SharpKode team about my project.", lead: true },
        { label: "WhatsApp", url: WHATSAPP_URL, external: true },
        { label: "Call", url: `tel:${CONTACT_PHONE}` },
        { label: "Email", url: `mailto:${CONTACT_EMAIL}` }
      ]
    }
  };

  const LEAD_THRESHOLD = Number(window.SHARPAI_LEAD_THRESHOLD || 70);
  const LEAD_COOLDOWN_MESSAGES = 10;
  const LEAD_COOLDOWN_MS = 15 * 60 * 1000;

  const explicitLeadPattern = /\b(quotation|quote|estimate|proposal|hire|consultation|meeting|call|contact|book appointment|talk to human|talk to (the )?team)\b/i;
  const leadSignals = [
    { pattern: /\b(website|web site|landing page|redesign)\b/i, score: 10, service: "website" },
    { pattern: /\b(seo|rank|google business|local seo|google maps)\b/i, score: 15, service: "SEO" },
    { pattern: /\b(marketing|google ads|meta ads|facebook ads|instagram|lead generation|performance marketing)\b/i, score: 15, service: "digital marketing" },
    { pattern: /\b(price|pricing|cost|budget|package)\b/i, score: 15, service: "pricing" },
    { pattern: /\b(ai|chatbot|agent|automation|machine learning)\b/i, score: 20, service: "AI" },
    { pattern: /\b(timeline|how long|deadline|urgent)\b/i, score: 10, service: "timeline" },
    { pattern: /\b(portfolio|case study|example|work)\b/i, score: 10, service: "portfolio" },
    { pattern: /\b(consultation|meeting|appointment)\b/i, score: 25, service: "consultation" },
    { pattern: /\b(contact|call|phone|whatsapp|email|talk to human)\b/i, score: 40, service: "contact" },
    { pattern: /\b(hire|start project|work with you|proceed)\b/i, score: 60, service: "hire" },
    { pattern: /\b(quotation|quote|estimate|proposal)\b/i, score: 80, service: "quotation" }
  ];

  const industryPatterns = [
    [/\b(dental|dentist)\b/i, "dental clinic"],
    [/\b(clinic|hospital|healthcare)\b/i, "healthcare"],
    [/\b(real estate|builder|property)\b/i, "real estate"],
    [/\b(restaurant|cafe|hotel)\b/i, "hospitality"],
    [/\b(school|college|education|institute)\b/i, "education"],
    [/\b(interior|construction|manufacturing|retail|ecommerce|salon|spa|law|finance|ngo)\b/i, (value) => value]
  ];

  const state = {
    open: false,
    minimized: false,
    busy: false,
    sessionId: getSessionId(),
    lastMessage: "",
    leadPrompted: false,
    leadScore: 0,
    userMessageCount: 0,
    dismissedLeadAt: 0,
    dismissedLeadMessageCount: -Infinity,
    memory: {
      industry: "",
      goals: [],
      services: [],
      budget: "",
      timeline: "",
      painPoints: []
    }
  };

  function logStep(message, data) {
    const debugEnabled = window.SHARPAI_DEBUG === true || sessionStorage.getItem("sharpai_debug") === "1";
    if (!debugEnabled) return;
    if (data !== undefined) console.log(message, data);
    else console.log(message);
  }

  function getSessionId() {
    const key = "sharpai_session_id";
    const existing = sessionStorage.getItem(key);
    if (existing) return existing;
    const id = `sharpai_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    sessionStorage.setItem(key, id);
    return id;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function renderMarkdown(text) {
    const escaped = escapeHtml(text || "");
    const withCodeBlocks = escaped.replace(/```([\s\S]*?)```/g, (_, code) => `<pre><code>${code.trim()}</code></pre>`);
    const inline = withCodeBlocks
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');

    return inline
      .split(/\n{2,}/)
      .map((part) => `<p>${part.replace(/\n/g, "<br>")}</p>`)
      .join("");
  }

  function timeLabel(date = new Date()) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }


  function createWidget() {
    if (document.querySelector(".sharpai-widget")) return;

    const widget = document.createElement("div");
    widget.className = "sharpai-widget";
    widget.innerHTML = `
      <section class="sharpai-window" role="dialog" aria-label="SharpAI AI Project Consultant" aria-modal="false" aria-live="polite">
        <header class="sharpai-header">
          <div class="sharpai-avatar" aria-hidden="true">${icons.bot}</div>
          <div class="sharpai-title-wrap">
            <span class="sharpai-title">SharpAI</span>
            <span class="sharpai-subtitle">AI Project Consultant</span>
            <span class="sharpai-status"><span class="sharpai-status-dot"></span>Usually replies instantly</span>
          </div>
          <div class="sharpai-header-actions">
            <button class="sharpai-icon-btn" type="button" data-sharpai-minimize aria-label="Minimize SharpAI">${icons.minus}</button>
            <button class="sharpai-icon-btn" type="button" data-sharpai-close aria-label="Close SharpAI">${icons.close}</button>
          </div>
        </header>
        <div class="sharpai-body" data-sharpai-body tabindex="0"></div>
        <form class="sharpai-lead-form" data-sharpai-lead-form action="javascript:void(0)" novalidate aria-label="Request a free quotation">
          <div class="sharpai-form-heading">
            <strong>Prepare a free quotation</strong>
            <span>Optional. Share what you can and our team will follow up.</span>
          </div>
          <div class="sharpai-form-grid">
            <input class="sharpai-field" name="name" placeholder="Name" autocomplete="name" required>
            <input class="sharpai-field" name="business" placeholder="Company" autocomplete="organization">
            <input class="sharpai-field" name="phone" placeholder="Phone" autocomplete="tel" required>
            <input class="sharpai-field" name="email" type="email" placeholder="Email" autocomplete="email" required>
            <input class="sharpai-field" name="budget" placeholder="Budget">
            <input class="sharpai-field" name="timeline" placeholder="Timeline">
            <textarea class="sharpai-textarea" name="message" placeholder="Tell us about your project" required></textarea>
          </div>
          <div class="sharpai-form-actions">
            <button class="sharpai-submit-lead" type="submit">Send Details</button>
            <button class="sharpai-cancel-lead" type="button" data-sharpai-cancel-lead>Not now</button>
          </div>
        </form>
        <form class="sharpai-composer" data-sharpai-form action="javascript:void(0)" novalidate>
          <label class="sharpai-input-wrap">
            <span class="sharpai-sr-only">Message SharpAI</span>
            <textarea class="sharpai-input" data-sharpai-input rows="1" placeholder="Ask about your project..."></textarea>
          </label>
          <button class="sharpai-send" type="button" aria-label="Send message">${icons.send}</button>
        </form>
      </section>
      <div class="sharpai-floating-actions" aria-label="SharpKode quick contact actions">
        <a class="sharpai-whatsapp" href="${WHATSAPP_URL}" target="_blank" rel="noopener noreferrer" aria-label="Chat with SharpKode on WhatsApp">${icons.whatsapp}<span>WhatsApp</span></a>
        <button class="sharpai-launcher" type="button" aria-label="Open SharpAI chat" data-sharpai-launcher>
          <span class="sharpai-tooltip">Ask SharpAI</span>
          ${icons.bot}
        </button>
      </div>
    `;

    document.body.appendChild(widget);
    bindEvents(widget);
    addMessage("bot", "Welcome to SharpKode.\n\nI'm **SharpAI**, your AI Project Consultant.\n\nI can help you build a website, develop software, explore AI solutions, estimate pricing, show portfolio work, or connect with our team.");
    renderPrimaryActions();
    logStep("Widget rendered");
  }

  function bindEvents(widget) {
    const launcher = widget.querySelector("[data-sharpai-launcher]");
    const closeBtn = widget.querySelector("[data-sharpai-close]");
    const minimizeBtn = widget.querySelector("[data-sharpai-minimize]");
    const form = widget.querySelector("[data-sharpai-form]");
    const input = widget.querySelector("[data-sharpai-input]");
    const leadForm = widget.querySelector("[data-sharpai-lead-form]");
    const cancelLead = widget.querySelector("[data-sharpai-cancel-lead]");

    launcher.addEventListener("click", () => setOpen(true));
    closeBtn.addEventListener("click", () => setOpen(false));
    minimizeBtn.addEventListener("click", () => setMinimized(!state.minimized));

    const submitChat = (event) => {
      event?.preventDefault();
      event?.stopPropagation();
      if (typeof event?.stopImmediatePropagation === "function") event.stopImmediatePropagation();
      console.log("1. Send clicked");
      const message = input.value.trim();
      if (!message || state.busy) return;
      input.value = "";
      input.style.height = "auto";
      sendMessage(message);
    };

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      event.stopPropagation();
      submitChat(event);
    });

    widget.querySelector(".sharpai-send")?.addEventListener("click", submitChat);

    input.addEventListener("input", () => {
      input.style.height = "auto";
      input.style.height = `${Math.min(input.scrollHeight, 112)}px`;
    });

    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        event.stopPropagation();
        submitChat(event);
      }
    });

    leadForm.addEventListener("submit", submitLead);
    cancelLead.addEventListener("click", hideLeadForm);
  }

  function setOpen(open) {
    state.open = open;
    const widget = document.querySelector(".sharpai-widget");
    const windowEl = document.querySelector(".sharpai-window");
    const launcher = document.querySelector("[data-sharpai-launcher]");
    if (!windowEl || !widget) return;
    widget.classList.toggle("is-chat-open", open);
    windowEl.classList.toggle("is-open", open);
    launcher?.setAttribute("aria-expanded", String(open));
    if (open) {
      logStep("Chat opened");
      setMinimized(false);
      window.setTimeout(() => document.querySelector("[data-sharpai-input]")?.focus(), 180);
    }
  }

  function setMinimized(minimized) {
    state.minimized = minimized;
    document.querySelector(".sharpai-window")?.classList.toggle("is-minimized", minimized);
  }

  function getBody() {
    return document.querySelector("[data-sharpai-body]");
  }

  function scrollToBottom() {
    const body = getBody();
    if (body) body.scrollTop = body.scrollHeight;
  }

  function addMessage(role, text, options = {}) {
    const body = getBody();
    if (!body) return null;
    const message = document.createElement("div");
    message.className = `sharpai-message is-${role}`;
    message.innerHTML = `${role === "bot" ? `<span class="sharpai-mini-avatar" aria-hidden="true">${icons.bot}</span>` : ""}
      <div class="sharpai-bubble">
        ${options.raw ? text : renderMarkdown(text)}
        <span class="sharpai-time">${timeLabel()}</span>
      </div>`;
    body.appendChild(message);
    scrollToBottom();
    logStep("Message rendered", { role });
    return message;
  }

  function clearActionPanels() {
    document.querySelectorAll(".sharpai-action-panel").forEach((panel) => panel.remove());
  }

  function renderPrimaryActions() {
    const body = getBody();
    if (!body || body.querySelector(".sharpai-actions")) return;
    const actions = document.createElement("div");
    actions.className = "sharpai-actions";
    actions.setAttribute("aria-label", "Primary SharpAI actions");

    Object.entries(actionGroups).forEach(([key, action]) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "sharpai-action-card";
      button.dataset.action = key;
      button.setAttribute("aria-expanded", "false");
      button.innerHTML = `<span class="sharpai-action-icon">${action.icon}</span><span><strong>${action.title}</strong><small>${action.description}</small></span>`;
      button.addEventListener("click", () => showSecondaryOptions(key, button));
      actions.appendChild(button);
    });

    body.appendChild(actions);
    scrollToBottom();
  }

  function showSecondaryOptions(key, trigger) {
    const action = actionGroups[key];
    if (!action) return;
    clearActionPanels();
    document.querySelectorAll(".sharpai-action-card").forEach((card) => card.setAttribute("aria-expanded", "false"));
    trigger?.setAttribute("aria-expanded", "true");

    const panel = document.createElement("div");
    panel.className = "sharpai-action-panel";
    panel.innerHTML = `<div class="sharpai-action-panel-title">${escapeHtml(action.title)} options</div>`;

    action.options.forEach((option) => {
      const item = document.createElement(option.url ? "a" : "button");
      item.className = "sharpai-option";
      item.textContent = option.label;
      if (option.url) {
        item.href = option.url;
        if (option.external) {
          item.target = "_blank";
          item.rel = "noopener noreferrer";
        }
      } else {
        item.type = "button";
        item.addEventListener("click", () => {
          clearActionPanels();
          sendMessage(option.prompt, { openLead: option.lead });
        });
      }
      panel.appendChild(item);
    });

    getBody()?.appendChild(panel);
    scrollToBottom();
  }

  function addTyping() {
    return addMessage("bot", '<span class="sharpai-typing" aria-label="SharpAI is typing"><span></span><span></span><span></span></span>', { raw: true });
  }

  function rememberUnique(list, value) {
    if (value && !list.includes(value)) list.push(value);
  }

  function updateConversationIntelligence(message) {
    const text = String(message || "");
    state.userMessageCount += 1;

    for (const [pattern, label] of industryPatterns) {
      const match = text.match(pattern);
      if (match) {
        state.memory.industry = typeof label === "function" ? label(match[0].toLowerCase()) : label;
        break;
      }
    }

    for (const signal of leadSignals) {
      if (signal.pattern.test(text)) {
        state.leadScore += signal.score;
        rememberUnique(state.memory.services, signal.service);
      }
    }

    if (/\b(grow|leads|sales|rank|visibility|automation|save time|conversion|customers)\b/i.test(text)) rememberUnique(state.memory.goals, text.slice(0, 120));
    if (/\b(expensive|slow|manual|no leads|not ranking|outdated|missed|problem|issue)\b/i.test(text)) rememberUnique(state.memory.painPoints, text.slice(0, 120));
    const budgetMatch = text.match(/(?:budget|around|under|above|rs\.?|inr)\s*([\w\s.,-]{2,40})/i);
    if (budgetMatch) state.memory.budget = budgetMatch[0];
    const timelineMatch = text.match(/\b(today|tomorrow|this week|this month|urgent|\d+\s*(days|weeks|months))\b/i);
    if (timelineMatch) state.memory.timeline = timelineMatch[0];

    logStep("Lead intelligence updated", { score: state.leadScore, memory: state.memory });
  }

  function isExplicitLeadRequest(message) {
    return explicitLeadPattern.test(String(message || ""));
  }

  function isLeadCooldownActive(message) {
    if (isExplicitLeadRequest(message)) return false;
    const messagesSinceDismiss = state.userMessageCount - state.dismissedLeadMessageCount;
    const timeSinceDismiss = Date.now() - state.dismissedLeadAt;
    return state.dismissedLeadAt && messagesSinceDismiss < LEAD_COOLDOWN_MESSAGES && timeSinceDismiss < LEAD_COOLDOWN_MS;
  }

  function shouldOpenLeadForm(message, options = {}) {
    if (options.openLead || isExplicitLeadRequest(message)) return true;
    if (isLeadCooldownActive(message)) return false;
    return state.leadScore >= LEAD_THRESHOLD;
  }

  function setBusy(busy) {
    state.busy = busy;
    const send = document.querySelector(".sharpai-send");
    const input = document.querySelector("[data-sharpai-input]");
    if (send) send.disabled = busy;
    if (input) input.setAttribute("aria-busy", String(busy));
  }

  async function sendMessage(message, options = {}) {
    setOpen(true);
    state.lastMessage = message;
    updateConversationIntelligence(message);
    logStep("User message received", { message });
    addMessage("user", message);

    const typing = addTyping();
    setBusy(true);
    try {
      console.log("2. Fetch started");
      logStep("Submitting request...");
      const response = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, sessionId: state.sessionId })
      });
      const payload = await response.json().catch((error) => ({ error: `Invalid JSON response: ${error.message}` }));
      typing?.remove();
      console.log("3. Response received");
      logStep("Response received:", payload);

      if (!response.ok) {
        addRecoverableError();
        return;
      }

      logStep("Rendering response...");
      addMessage("bot", payload.answer || "I'm having trouble answering that right now.");
      console.log("4. Response rendered");
      console.log("5. Before reload check");
      logStep("Render complete");
      if (shouldOpenLeadForm(message, options)) promptLeadForm(message);
      else if (!state.leadPrompted && looksMeaningful(message) && state.leadScore >= 35 && !isLeadCooldownActive(message)) maybeOfferQuote();
    } catch (error) {
      typing?.remove();
      logStep("Request failed", error.message);
      addRecoverableError();
    } finally {
      setBusy(false);
    }
  }

  function looksMeaningful(message) {
    return /website|software|app|ai|erp|marketing|pricing|quote|business|project/i.test(message);
  }

  function maybeOfferQuote() {
    state.leadPrompted = true;
    const panel = document.createElement("div");
    panel.className = "sharpai-recovery sharpai-quote-offer";
    panel.innerHTML = `<strong>Would you like a free quotation?</strong><button type="button" data-open-lead>Prepare quote</button><a href="${WHATSAPP_URL}" target="_blank" rel="noopener noreferrer">WhatsApp team</a>`;
    panel.querySelector("[data-open-lead]").addEventListener("click", () => showLeadForm(state.lastMessage));
    getBody()?.appendChild(panel);
    scrollToBottom();
  }

  function promptLeadForm(message) {
    addMessage("bot", "I can prepare a free quotation. Share your details when you're ready, or continue asking questions here.");
    showLeadForm(message);
  }

  function addRecoverableError() {
    addMessage("bot", "I am currently undergoing scheduled maintenance to upgrade my systems.\n\nPlease contact our human team for immediate assistance.");
    const panel = document.createElement("div");
    panel.className = "sharpai-recovery";
    panel.innerHTML = `<button type="button" data-retry>Try again</button><a href="${WHATSAPP_URL}" target="_blank" rel="noopener noreferrer">WhatsApp</a><button type="button" data-team>Talk to our team</button>`;
    panel.querySelector("[data-retry]").addEventListener("click", () => state.lastMessage && sendMessage(state.lastMessage));
    panel.querySelector("[data-team]").addEventListener("click", () => showLeadForm(state.lastMessage));
    getBody()?.appendChild(panel);
    scrollToBottom();
    logStep("Recoverable error shown");
  }

  function showLeadForm(message = "") {
    const form = document.querySelector("[data-sharpai-lead-form]");
    if (!form) return;
    state.leadPrompted = true;
    form.classList.add("is-visible");
    const messageField = form.querySelector('[name="message"]');
    if (messageField && !messageField.value) messageField.value = message;
    scrollToBottom();
  }

  function hideLeadForm() {
    state.dismissedLeadAt = Date.now();
    state.dismissedLeadMessageCount = state.userMessageCount;
    document.querySelector("[data-sharpai-lead-form]")?.classList.remove("is-visible");
  }

  async function submitLead(event) {
    event.preventDefault();
    event.stopPropagation();
    if (typeof event.stopImmediatePropagation === "function") event.stopImmediatePropagation();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    logStep("Submitting lead", { email: data.email, hasPhone: Boolean(data.phone) });
    addMessage("user", `Please contact me about ${data.business || "my project"}.`);
    const typing = addTyping();
    setBusy(true);
    try {
      const response = await fetch(`${API_BASE}/api/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, sessionId: state.sessionId })
      });
      const payload = await response.json().catch((error) => ({ error: `Invalid JSON response: ${error.message}` }));
      typing?.remove();
      logStep("Lead response received", { ok: response.ok, status: response.status, payload });
      if (!response.ok) {
        addRecoverableError();
        return;
      }
      addMessage("bot", payload.summary || "Thanks. Your details have been captured. Our team will contact you soon.");
      form.reset();
      hideLeadForm();
    } catch (error) {
      typing?.remove();
      addRecoverableError();
    } finally {
      setBusy(false);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", createWidget);
  } else {
    createWidget();
  }
})();



