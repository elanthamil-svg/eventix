require('dotenv').config();

const https = require('https');

const apiKey = process.env.GEMINI_API_KEY;

// Try different API versions and model names
const tests = [
  { version: 'v1beta', model: 'gemini-2.0-flash' },
  { version: 'v1', model: 'gemini-2.0-flash' },
  { version: 'v1beta', model: 'gemini-pro' },
  { version: 'v1', model: 'gemini-pro' },
];

async function testEndpoint({ version, model }) {
  return new Promise((resolve) => {
    const data = JSON.stringify({
      contents: [{ parts: [{ text: 'Say exactly: WORKS' }] }]
    });
    const options = {
      hostname: 'generativelanguage.googleapis.com',
      port: 443,
      path: `/${version}/models/${model}:generateContent?key=${apiKey}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        try {
          const p = JSON.parse(body);
          if (p.candidates) {
            console.log(`✅ ${version}/${model}: WORKS! Response: ${p.candidates[0]?.content?.parts[0]?.text}`);
          } else {
            console.log(`❌ ${version}/${model}: ${p.error?.message?.substring(0, 80)}`);
          }
        } catch(e) {
          console.log(`❌ ${version}/${model}: parse error`);
        }
        resolve();
      });
    });
    req.on('error', e => { console.log(`❌ ${version}/${model}: ${e.message}`); resolve(); });
    req.write(data);
    req.end();
  });
}

(async () => {
  for (const t of tests) await testEndpoint(t);
})();
