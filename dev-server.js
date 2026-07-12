const http = require('http');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split(/\r?\n/).forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const parts = trimmed.split('=');
      const key = parts[0].trim();
      const value = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, ''); // strip optional quotes
      process.env[key] = value;
    }
  });
  console.log('Loaded environment variables from .env.local');
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const PORT = process.env.PORT || 3000;

const server = http.createServer(async (req, res) => {
  // Parse URL
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  console.log(`${req.method} ${pathname}`);

  // Route API requests
  if (pathname === '/api/contact') {
    try {
      // Read body
      let bodyBuffer = [];
      req.on('data', chunk => {
        bodyBuffer.push(chunk);
      });

      req.on('end', async () => {
        const bodyRaw = Buffer.concat(bodyBuffer).toString();
        let body = {};
        if (bodyRaw) {
          try {
            body = JSON.parse(bodyRaw);
          } catch (e) {
            console.error('Failed to parse request JSON:', e);
          }
        }

        // Mock req.body for the handler
        req.body = body;

        // Mock res.status and res.json for Vercel helper compatibility
        res.status = function(code) {
          res.statusCode = code;
          return res;
        };
        res.json = function(data) {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(data));
          return res;
        };

        // Load contact handler
        const contactHandler = require('./api/contact.js');
        await contactHandler(req, res);
      });
    } catch (err) {
      console.error('API Error:', err);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Internal Server Error', message: err.message }));
    }
    return;
  }

  // Route static files
  let filePath = path.join(__dirname, 'frontend', pathname);
  
  // If the path ends in a slash or is empty, default to index.html
  if (pathname === '/' || pathname === '') {
    filePath = path.join(__dirname, 'frontend', 'index.html');
  }

  const ext = path.extname(filePath).toLowerCase();

  // Check if file exists
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      if (ext) {
        // If it's a file request that doesn't exist, return 404
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/plain');
        res.end('404 Not Found');
      } else {
        // Serve index.html as a fallback for routing
        const fallbackIndex = path.join(__dirname, 'frontend', 'index.html');
        serveStaticFile(fallbackIndex, res);
      }
    } else {
      serveStaticFile(filePath, res);
    }
  });
});

function serveStaticFile(filePath, res) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'text/plain');
      res.end('500 Internal Server Error');
      return;
    }
    res.statusCode = 200;
    res.setHeader('Content-Type', contentType);
    res.end(content);
  });
}

server.listen(PORT, () => {
  console.log(`\n🚀 Server running locally at:`);
  console.log(`   👉 http://localhost:${PORT}\n`);
  console.log(`Press Ctrl+C to stop.\n`);
});
