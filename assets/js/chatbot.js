(() => {
  const API_BASE_URL = window.API_BASE_URL || (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.protocol === "file:"
      ? "http://localhost:5050"
      : "https://sharpkode-api.onrender.com"
  );
  const WHATSAPP_URL = "https://wa.me/917799343436?text=Hi%20SharpKode%20Team%2C%20I%20found%20your%20website%20and%20would%20like%20to%20discuss%20my%20project.";
  const CONTACT_EMAIL = "info@sharpkode.com";
  const CONTACT_PHONE = "+917799343436";

  let isWindowLoaded = false;
  let secondaryShown = false;

  const icons = {
    send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m22 2-7 20-4-9-9-4Z"></path><path d="M22 2 11 13"></path></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>',
    services: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>',
    pricing: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>',
    software: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="18" height="18" x="3" y="3" rx="2"></rect><path d="M21 15H3M9 21V15"></path></svg>',
    portfolio: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>',
    contact: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.32 1.77.6 2.61a2 2 0 0 1-.45 2.11L8 9.7a16 16 0 0 0 6.3 6.3l1.26-1.26a2 2 0 0 1 2.11-.45c.84.28 1.71.48 2.61.6A2 2 0 0 1 22 16.92Z"></path></svg>',
    spark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path></svg>',
    bot: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="7" width="18" height="13" rx="4.5"></rect><path d="M12 7V3M9 3h6"></path><circle cx="8.5" cy="13.5" r="1.5" fill="currentColor"></circle><circle cx="15.5" cy="13.5" r="1.5" fill="currentColor"></circle><path d="M10 17h4"></path></svg>',
    whatsapp: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2a9.87 9.87 0 0 0-8.55 14.82L2.3 22l5.3-1.14A9.88 9.88 0 1 0 12.04 2Zm0 1.8a8.08 8.08 0 1 1 0 16.16 8 8 0 0 1-4.08-1.12l-.37-.22-2.82.6.63-2.72-.25-.4A8.08 8.08 0 0 1 12.04 3.8Zm-3.4 4.1c-.18 0-.46.06-.7.33-.24.26-.92.9-.92 2.18s.94 2.53 1.07 2.7c.13.18 1.82 2.9 4.5 3.95 2.22.88 2.68.7 3.16.66.49-.05 1.57-.64 1.79-1.26.22-.62.22-1.15.15-1.26-.06-.11-.24-.18-.51-.31-.27-.14-1.58-.78-1.83-.87-.24-.09-.42-.14-.6.13-.17.27-.69.87-.84 1.04-.16.18-.31.2-.58.07-.27-.14-1.14-.42-2.17-1.33-.8-.72-1.35-1.6-1.51-1.87-.15-.27-.02-.42.12-.55.12-.12.27-.31.4-.47.14-.15.18-.26.27-.44.09-.18.05-.33-.02-.47-.07-.13-.6-1.45-.82-1.98-.22-.52-.44-.45-.6-.46h-.52Z"></path></svg>'
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

  // Circular Launcher with uploaded botIcon.png
  function createWidget() {
    if (document.querySelector(".sharpai-widget")) return;

    const widget = document.createElement("div");
    widget.className = "sharpai-widget";
    widget.innerHTML = `
      <div class="sharpai-floating-actions" aria-label="SharpKode quick contact actions">
        <a class="sharpai-whatsapp" href="${WHATSAPP_URL}" target="_blank" rel="noopener noreferrer" aria-label="Chat with SharpKode on WhatsApp">${icons.whatsapp}<span>WhatsApp</span></a>
        <button class="sharpai-launcher" type="button" aria-label="Open SharpAI chat" data-sharpai-launcher>
          <img class="sharpai-launcher-img" src="./assets/images/botIcon.png" alt="SharpAI" />
        </button>
      </div>
    `;

    document.body.appendChild(widget);

    const launcher = widget.querySelector("[data-sharpai-launcher]");
    if (launcher) {
      launcher.addEventListener("click", () => {
        setOpen(true);
      });
    }

    // ESC closes chatbot
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && state.open) {
        setOpen(false);
      }
    });

    // Close when clicking outside
    document.addEventListener("click", (e) => {
      if (state.open && !widget.contains(e.target)) {
        setOpen(false);
      }
    });
  }

  // Lazy-load chat window with premium glassmorphism styling
  function lazyLoadWindow(widget) {
    if (isWindowLoaded) return;
    isWindowLoaded = true;

    const windowHtml = `
      <section class="sharpai-window" role="dialog" aria-label="SharpAI AI Project Consultant" aria-modal="false" aria-live="polite">
        <header class="sharpai-header">
          <div class="sharpai-header-left">
            <div class="sharpai-avatar" aria-hidden="true">
              <img src="./assets/images/botIcon.png" alt="SharpAI" />
            </div>
            <div class="sharpai-title-wrap">
              <span class="sharpai-title">SharpAI</span>
              <span class="sharpai-status">
                <span class="sharpai-status-dot"></span>
                <span>Online ●</span>
              </span>
            </div>
          </div>
          <div class="sharpai-header-actions">
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
    `;

    widget.insertAdjacentHTML("afterbegin", windowHtml);
    bindEvents(widget);

    // Initial Welcome Message
    addMessage("bot", `Hi 👋\n\nI'm **SharpAI**.\n\nHow can I help today?`);
    renderChips();
    renderPrimaryActions();
  }

  function bindEvents(widget) {
    const closeBtn = widget.querySelector("[data-sharpai-close]");
    const form = widget.querySelector("[data-sharpai-form]");
    const input = widget.querySelector("[data-sharpai-input]");
    const leadForm = widget.querySelector("[data-sharpai-lead-form]");
    const cancelLead = widget.querySelector("[data-sharpai-cancel-lead]");

    if (closeBtn) {
      closeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        setOpen(false);
      });
    }

    const submitChat = (event) => {
      event?.preventDefault();
      event?.stopPropagation();
      if (typeof event?.stopImmediatePropagation === "function") event.stopImmediatePropagation();
      
      if (!input) return;
      const message = input.value.trim();
      if (!message || state.busy) return;
      
      input.value = "";
      input.style.height = "auto";
      sendMessage(message);
    };

    if (form) {
      form.addEventListener("submit", submitChat);
    }

    const sendBtn = widget.querySelector(".sharpai-send");
    if (sendBtn) {
      sendBtn.addEventListener("click", submitChat);
    }

    if (input) {
      input.addEventListener("keydown", (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
          event.preventDefault();
          event.stopPropagation();
          submitChat(event);
        }
      });
    }

    if (leadForm) {
      leadForm.addEventListener("submit", submitLead);
    }
    if (cancelLead) {
      cancelLead.addEventListener("click", hideLeadForm);
    }

    // Pull down to close sheet gesture tracking on Mobile
    let touchStartY = 0;
    let touchMoveY = 0;
    let hasMoved = false;
    const windowEl = widget.querySelector(".sharpai-window");
    const headerEl = widget.querySelector(".sharpai-header");

    if (headerEl && windowEl) {
      headerEl.addEventListener("touchstart", (e) => {
        touchStartY = e.touches[0].clientY;
        touchMoveY = 0;
        hasMoved = false;
        windowEl.style.transition = "none";
      }, { passive: true });

      headerEl.addEventListener("touchmove", (e) => {
        touchMoveY = e.touches[0].clientY;
        hasMoved = true;
        const diffY = touchMoveY - touchStartY;
        if (diffY > 0) {
          windowEl.style.transform = `translateY(${diffY}px)`;
        }
      }, { passive: true });

      headerEl.addEventListener("touchend", () => {
        windowEl.style.transition = "";
        if (hasMoved) {
          const diffY = touchMoveY - touchStartY;
          if (diffY > 150 && state.open) {
            setOpen(false);
          }
        }
        windowEl.style.transform = "";
        touchStartY = 0;
        touchMoveY = 0;
        hasMoved = false;
      });
    }
  }

  function setOpen(open) {
    state.open = open;
    const widget = document.querySelector(".sharpai-widget");
    if (!widget) return;

    if (open && !isWindowLoaded) {
      lazyLoadWindow(widget);
    }

    const windowEl = widget.querySelector(".sharpai-window");
    const launcher = widget.querySelector("[data-sharpai-launcher]");
    if (!windowEl) return;

    widget.classList.toggle("is-chat-open", open);
    windowEl.classList.toggle("is-open", open);
    launcher?.setAttribute("aria-expanded", String(open));
    if (open) {
      logStep("Chat opened");
      setMinimized(false);
      window.setTimeout(() => widget.querySelector("[data-sharpai-input]")?.focus(), 180);
    }
  }

  function setMinimized(minimized) {
    state.minimized = minimized;
    const windowEl = document.querySelector(".sharpai-window");
    if (windowEl) windowEl.classList.toggle("is-minimized", minimized);
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
    message.innerHTML = `
      ${role === "bot" ? `<span class="sharpai-mini-avatar" aria-hidden="true"><img src="./assets/images/botIcon.png" alt="SharpAI" /></span>` : ""}
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

  // 3 suggestions: Website, AI, Pricing
  function renderChips() {
    const body = getBody();
    if (!body) return;
    const chipsContainer = document.createElement("div");
    chipsContainer.className = "sharpai-chips-container";
    const chips = [
      { label: "Website", prompt: "I need a website. Help me choose the right type and next steps." },
      { label: "AI", prompt: "Tell me about SharpKode AI solutions for my business." },
      { label: "Pricing", prompt: "What is the estimated cost of your services?" }
    ];
    chips.forEach(chip => {
      const chipBtn = document.createElement("button");
      chipBtn.type = "button";
      chipBtn.className = "sharpai-chip";
      chipBtn.textContent = chip.label;
      chipBtn.addEventListener("click", () => {
        sendMessage(chip.prompt);
      });
      chipsContainer.appendChild(chipBtn);
    });
    body.appendChild(chipsContainer);
    scrollToBottom();
  }

  // 7 compact action buttons (Website, Software, AI, Pricing, Portfolio, Contact, Book Call)
  function renderPrimaryActions() {
    const body = getBody();
    if (!body || body.querySelector(".sharpai-actions")) return;
    const actions = document.createElement("div");
    actions.className = "sharpai-actions";
    actions.setAttribute("aria-label", "Primary SharpAI actions");

    const compactButtons = [
      { title: "Website", icon: icons.services, prompt: "I need a website. Help me choose the right type and next steps." },
      { title: "Software", icon: icons.software, prompt: "I need custom software or an ERP solution for my company." },
      { title: "AI", icon: icons.bot, prompt: "Tell me about SharpKode AI solutions for my business." },
      { title: "Pricing", icon: icons.pricing, prompt: "What is the estimated cost for website development or software?" },
      { title: "Portfolio", icon: icons.portfolio, prompt: "Show me SharpKode portfolio and featured client projects." },
      { title: "Contact", icon: icons.contact, prompt: "I want to talk to the SharpKode team about my project.", lead: true },
      { title: "Book Call", icon: icons.spark, prompt: "I want a free consultation and quotation.", lead: true }
    ];

    compactButtons.forEach((btn) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "sharpai-action-card";
      button.innerHTML = `
        <span class="sharpai-action-icon">${btn.icon}</span>
        <span class="sharpai-action-text">${btn.title}</span>
      `;
      button.addEventListener("click", () => {
        sendMessage(btn.prompt);
      });
      actions.appendChild(button);
    });

    body.appendChild(actions);
    scrollToBottom();
  }

  function showSecondaryQuickActions() {
    if (secondaryShown) return;
    secondaryShown = true;
    const body = getBody();
    if (!body) return;
    const panel = document.createElement("div");
    panel.className = "sharpai-action-panel";
    panel.innerHTML = `
      <div class="sharpai-action-panel-title">Useful links</div>
      <a class="sharpai-option" href="./portfolio.html">Our Portfolio</a>
      <button class="sharpai-option" type="button" data-quote>Book Call / Quote</button>
      <a class="sharpai-option" href="${WHATSAPP_URL}" target="_blank" rel="noopener noreferrer">WhatsApp</a>
    `;
    panel.querySelector("[data-quote]").addEventListener("click", () => {
      showLeadForm("I want to book a call / request a quote.");
    });
    body.appendChild(panel);
    scrollToBottom();
  }

  function addTyping() {
    const body = getBody();
    if (!body) return null;
    const message = document.createElement("div");
    message.className = "sharpai-message is-bot is-typing-indicator";
    message.innerHTML = `
      <span class="sharpai-mini-avatar" aria-hidden="true"><img src="./assets/images/botIcon.png" alt="SharpAI" /></span>
      <div class="sharpai-bubble">
        <span class="sharpai-typing-text">SharpAI is thinking</span>
        <span class="sharpai-typing"><span></span><span></span><span></span></span>
      </div>
    `;
    body.appendChild(message);
    scrollToBottom();
    return message;
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
    const widget = document.querySelector(".sharpai-widget");
    if (!widget) return;
    const send = widget.querySelector(".sharpai-send");
    const input = widget.querySelector("[data-sharpai-input]");
    state.busy = busy;
    if (send) send.disabled = busy;
    if (input) input.setAttribute("aria-busy", String(busy));
  }

  async function sendMessage(message, options = {}) {
    setOpen(true);
    state.lastMessage = message;
    updateConversationIntelligence(message);
    logStep("User message received", { message });
    addMessage("user", message);

    showSecondaryQuickActions();

    const typing = addTyping();
    setBusy(true);

    try {
      logStep("Submitting streaming request...");
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, sessionId: state.sessionId })
      });

      const data = await response.json();
      typing?.remove();

      if (data.response) {
        addMessage("bot", data.response);
      }

      if (data.leadForm) {
        promptLeadForm(message);
      } else if (!state.leadPrompted && looksMeaningful(message) && state.leadScore >= 35 && !isLeadCooldownActive(message)) {
        maybeOfferQuote();
      }
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
    const form = document.querySelector("[data-sharpai-lead-form]");
    if (form) form.classList.remove("is-visible");
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
      const response = await fetch(`${API_BASE_URL}/api/leads`, {
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
