const fs = require("fs/promises");
const path = require("path");

const knowledgeDir = path.join(__dirname, "..", "knowledge");

function chunkText(text, source) {
  const normalized = String(text || "")
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  const blocks = normalized.split(/\n(?=##?\s)/g);
  const chunks = [];

  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;
    if (trimmed.length <= 1200) {
      chunks.push({ source, text: trimmed });
      continue;
    }

    const sentences = trimmed.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [trimmed];
    let current = "";
    for (const sentence of sentences) {
      if ((current + sentence).length > 1100 && current) {
        chunks.push({ source, text: current.trim() });
        current = "";
      }
      current += sentence;
    }
    if (current.trim()) chunks.push({ source, text: current.trim() });
  }

  return chunks;
}

async function loadKnowledgeChunks() {
  const files = await fs.readdir(knowledgeDir);
  const markdownFiles = files.filter((file) => file.endsWith(".md")).sort();
  const chunks = [];
  for (const file of markdownFiles) {
    const fullPath = path.join(knowledgeDir, file);
    const text = await fs.readFile(fullPath, "utf8");
    chunks.push(...chunkText(text, file));
  }
  return chunks;
}

module.exports = {
  chunkText,
  loadKnowledgeChunks
};
