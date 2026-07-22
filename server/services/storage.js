const fs = require("fs/promises");
const path = require("path");

const dataDir = path.join(__dirname, "..", "vectorstore");

async function ensureFile(fileName, fallback) {
  await fs.mkdir(dataDir, { recursive: true });
  const filePath = path.join(dataDir, fileName);
  try {
    await fs.access(filePath);
  } catch (_error) {
    await fs.writeFile(filePath, JSON.stringify(fallback, null, 2));
  }
  return filePath;
}

async function readJson(fileName, fallback = []) {
  const filePath = await ensureFile(fileName, fallback);
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw || "null") || fallback;
  } catch (_error) {
    return fallback;
  }
}

async function appendJson(fileName, entry) {
  const existing = await readJson(fileName, []);
  existing.push(entry);
  const filePath = await ensureFile(fileName, []);
  await fs.writeFile(filePath, JSON.stringify(existing, null, 2));
  return entry;
}

function cleanString(value, maxLength = 1000) {
  return String(value || "")
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

module.exports = {
  appendJson,
  cleanString,
  readJson
};
