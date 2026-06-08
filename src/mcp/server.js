NETLIFY_AUTH_TOKEN = "nfp_R368x1CEw6hidmKJHnC9mjJWniRfLBDW68bd"


import http from 'http';

const PORT = process.env.PORT || 8787;
const NETLIFY_AI = 'https://netlify.ai';

let cached = null;

async function getNetlifyAI() {
  if (cached) return cached;
  try {
    const res = await fetch(NETLIFY_AI);
    const text = await res.text();
    cached = {
      source: NETLIFY_AI,
      fetchedAt: new Date().toISOString(),
      summary: 'Agent deployment instructions and FAQ from netlify.ai',
      htmlSnippet: text.slice(0, 2000)
    };
    return cached;
  } catch (e) {
    return { error: e.message };
  }
}

const server = http.createServer(async (req, res) => {
  if (req.url === '/mcp' || req.url === '/mcp/') {
    const content = await getNetlifyAI();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify(
        {
          name: 'mcp-netlify-instructions',
          description:
            'Fetches https://netlify.ai and exposes a minimal MCP endpoint with agent deploy guidance.',
          instruction: "Copy `fetch https://netlify.ai` to start deploying",
          link: NETLIFY_AI,
          content
        },
        null,
        2
      )
    );
    return;
  }
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('MCP server running. GET /mcp to fetch Netlify AI instructions.');
});

server.listen(PORT, () => console.log(`MCP server listening on http://localhost:${PORT}`));
