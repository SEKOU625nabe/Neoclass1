const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 8000;
const WWW_DIR = path.join(__dirname, 'www');

const server = http.createServer((req, res) => {
  // Parse URL
  const parsedUrl = url.parse(req.url, true);
  let pathname = parsedUrl.pathname;

  // Handle root
  if (pathname === '/') {
    pathname = '/index.html';
  }

  // Build file path
  let filePath = path.join(WWW_DIR, pathname);

  // Security: prevent path traversal
  if (!filePath.startsWith(WWW_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
    return;
  }

  // Read file
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
      return;
    }

    // Set content type
    const ext = path.extname(filePath);
    let contentType = 'application/octet-stream';
    
    switch (ext) {
      case '.html': contentType = 'text/html; charset=utf-8'; break;
      case '.js': contentType = 'application/javascript; charset=utf-8'; break;
      case '.css': contentType = 'text/css; charset=utf-8'; break;
      case '.json': contentType = 'application/json; charset=utf-8'; break;
      case '.png': contentType = 'image/png'; break;
      case '.jpg': case '.jpeg': contentType = 'image/jpeg'; break;
      case '.gif': contentType = 'image/gif'; break;
      case '.svg': contentType = 'image/svg+xml'; break;
      case '.webp': contentType = 'image/webp'; break;
      case '.woff': contentType = 'font/woff'; break;
      case '.woff2': contentType = 'font/woff2'; break;
      case '.ttf': contentType = 'font/ttf'; break;
      case '.eot': contentType = 'application/vnd.ms-fontobject'; break;
    }

    // Add CORS headers
    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    });

    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`✅ Serveur local démarré sur http://localhost:${PORT}`);
  console.log(`📱 Ouvrez: http://localhost:${PORT}`);
  console.log(`🔴 Appuyez Ctrl+C pour arrêter`);
});
