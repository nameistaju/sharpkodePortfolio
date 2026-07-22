const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const { getAllowedOrigins, getEnv, hasEnv } = require("./config");

const chatRoutes = require("./routes/chat");
const { ensureVectorStore } = require("./services/rag");

const app = express();
const port = Number(getEnv("PORT", 5050));
const nodeEnv = getEnv("NODE_ENV", "development");
const allowedOrigins = getAllowedOrigins();

app.disable("x-powered-by");
app.use(compression());
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(express.json({ limit: "32kb" }));
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || origin.startsWith("file://")) {
      callback(null, true);
      return;
    }
    callback(new Error(`Origin not allowed: ${origin}`));
  },
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please try again shortly." }
}));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", chatRoutes);

app.use((error, _req, res, _next) => {
  console.error("[server] Request failed:", error.message);
  res.status(500).json({ error: "SharpAI service is temporarily unavailable. Please try again shortly." });
});

async function start() {
  console.log(`✓ Environment ${nodeEnv.charAt(0).toUpperCase() + nodeEnv.slice(1)}`);
  console.log(hasEnv("GEMINI_API_KEY") ? "✓ Gemini Loaded" : "⚠ Gemini: API key missing");
  
  try {
    const store = await ensureVectorStore();
    console.log("✓ Knowledge Base Loaded");
    console.log(`✓ Vector Store Loaded (${store?.entries?.length || 0} chunks)`);
  } catch (error) {
    console.error("✗ Vector Store Failed:", error.message);
  }

  app.listen(port, () => {
    console.log(`✓ Server Running on port ${port}`);
  });
}

start();

