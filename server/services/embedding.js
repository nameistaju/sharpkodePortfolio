const { embedText } = require("./gemini");

async function createEmbedding(text) {
  return embedText(text);
}

module.exports = {
  createEmbedding
};
