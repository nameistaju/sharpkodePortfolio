require("../config");
const { buildVectorStore } = require("../services/rag");

async function run() {
  console.log("Initializing vector store build...");
  try {
    const store = await buildVectorStore();
    console.log(`✓ Vector store build complete. Saved ${store.entries.length} chunks to vectorstore/vectors.json.`);
    process.exit(0);
  } catch (error) {
    console.error("✗ Vector store build failed:", error.message);
    process.exit(1);
  }
}

run();
