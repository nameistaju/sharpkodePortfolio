const fs = require('fs');
const key = fs.readFileSync('.env', 'utf8').split(/\r?\n/).find(l => l.startsWith('GEMINI_API_KEY=')).split('=')[1];
const fetch = globalThis.fetch;
async function test() {
  const embedUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${key}`;
  const embedResp = await fetch(embedUrl, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({content:{parts:[{text:'hello world'}]}})
  });
  console.log('EMBED_STATUS', embedResp.status);
  const embedJson = await embedResp.json();
  console.log('EMBED_JSON', JSON.stringify(embedJson).slice(0,500));

  const genUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`;
  const genResp = await fetch(genUrl, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({contents:[{role:'user',parts:[{text:'Hello world'}]}],generationConfig:{temperature:0.2,maxOutputTokens:20}})
  });
  console.log('GEN_STATUS', genResp.status);
  const genJson = await genResp.json();
  console.log('GEN_JSON', JSON.stringify(genJson).slice(0,500));
}

test().catch(err => { console.error('ERROR', err); process.exit(1); });
