// HTTP reverse proxy: corp.little.global:8080 → Vite dev server (localhost:3000)
// This makes the browser access the app via corp.little.global hostname
// so the referrer header matches your Google API key restriction
import http from 'http';
import httpProxy from 'http-proxy';

const proxy = httpProxy.createProxyServer({
  target: 'http://localhost:3000',
  changeOrigin: true,
  ws: true, // Enable WebSocket proxying for Vite HMR
});

const server = http.createServer((req, res) => {
  proxy.web(req, res);
});

// Handle WebSocket upgrade for Vite HMR
server.on('upgrade', (req, socket, head) => {
  proxy.ws(req, socket, head);
});

proxy.on('error', (err, req, res) => {
  console.error('Proxy error:', err);
  if (res.writeHead) {
    res.writeHead(502);
    res.end('Bad Gateway');
  }
});

server.listen(8080, '0.0.0.0', () => {
  console.log('🔄 Reverse proxy running:');
  console.log('   http://corp.little.global:8080 → http://localhost:3000');
  console.log('   Open http://corp.little.global:8080/dashboard in your browser');
});
