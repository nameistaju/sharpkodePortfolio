const path = require("path");
const dotenv = require("dotenv");

const envPath = path.join(__dirname, ".env");
const result = dotenv.config({ path: envPath });

if (result.error && process.env.NODE_ENV !== "production") {
  console.warn(`[config] .env not loaded from ${envPath}: ${result.error.message}`);
}

function getEnv(name, fallback) {
  const value = process.env[name];
  return value === undefined || value === "" ? fallback : value;
}

function hasEnv(name) {
  return Boolean(
    process.env[name] &&
    process.env[name] !== "your_google_gemini_api_key_here" &&
    process.env[name] !== "your_nvidia_api_key_here"
  );
}

function requireEnv(name) {
  if (!hasEnv(name)) {
    throw new Error(`${name} is not configured.`);
  }
  return process.env[name];
}

function getAllowedOrigins() {
  const defaults = [
    "https://sharpkode.com",
    "https://www.sharpkode.com",
    "https://api.sharpkode.com",
    "https://sharpkode.vercel.app",
    "https://sharpkode-api.onrender.com",
    "https://sharpkode.onrender.com",
    "http://localhost:3000",
    "http://localhost:5050",
    "http://127.0.0.1:5500"
  ];
  const configured = getEnv("ALLOWED_ORIGINS", "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  return Array.from(new Set([...defaults, ...configured]));
}

module.exports = {
  getAllowedOrigins,
  getEnv,
  hasEnv,
  requireEnv
};
