const { getEnv, requireEnv } = require("../config");

const API_ROOT = "https://generativelanguage.googleapis.com/v1beta/models";

async function postGemini(path, body) {
  const apiKey = requireEnv("GEMINI_API_KEY");
  const response = await fetch(`${API_ROOT}/${path}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${errorText}`);
  }

  return response.json();
}

async function embedText(text) {
  const model = getEnv("GEMINI_EMBEDDING_MODEL", "gemini-embedding-001");
  const payload = await postGemini(`${model}:embedContent`, {
    content: {
      parts: [{ text: String(text || "").slice(0, 8000) }]
    }
  });
  const embeddingData = payload.embedding;
  return Array.isArray(embeddingData) ? embeddingData : embeddingData?.values || [];
}

async function createEmbedding(text) {
  return embedText(text);
}

module.exports = {
  createEmbedding
};
