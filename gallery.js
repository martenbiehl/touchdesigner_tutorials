const http = require('http');
const fs = require('fs');
const path = require('path');

function findMovFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      findMovFiles(filePath, fileList);
    } else if (file.endsWith('.mov')) {
      fileList.push(filePath.replace(/\\/g, '/'));
    }
  });
  return fileList;
}

const server = http.createServer((req, res) => {
  if (req.url === '/') {
    const videos = findMovFiles('.').sort();

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Video Gallery</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: #0a0a0a;
            padding: 2rem;
            color: #e0e0e0;
        }

        h1 {
            font-size: 2rem;
            font-weight: 300;
            letter-spacing: -0.5px;
            margin-bottom: 2rem;
            color: #ffffff;
        }

        .gallery {
            columns: 400px;
            column-gap: 1.5rem;
            max-width: 1600px;
            margin: 0 auto;
        }

        .video-item {
            background: #1a1a1a;
            border-radius: 8px;
            overflow: hidden;
            margin-bottom: 1.5rem;
            break-inside: avoid;
            box-shadow: 0 2px 8px rgba(0,0,0,0.4);
            transition: transform 0.2s, box-shadow 0.2s;
        }

        .video-item:hover {
            transform: translateY(-4px);
            box-shadow: 0 4px 16px rgba(0,0,0,0.6);
        }

        video {
            width: 100%;
            height: auto;
            display: block;
            background: #000;
        }

        .video-info {
            padding: 0.75rem 1rem;
        }

        .video-title {
            font-size: 0.85rem;
            color: #b0b0b0;
            font-weight: 400;
            word-break: break-word;
        }

        @media (max-width: 768px) {
            .gallery {
                columns: 1;
            }
            
            body {
                padding: 1rem;
            }
        }
    </style>
</head>
<body>
    <h1>Video Gallery</h1>
    <div class="gallery">
        ${videos.map(v => {
      // Remove leading './' if present
      const displayPath = v.startsWith('./') ? v.slice(2) : v;
      return `
        <div class="video-item">
            <video controls autoplay muted loop playsinline preload="metadata">
                <source src="${v}" type="video/quicktime">
            </video>
            <div class="video-info">
                <div class="video-title">${displayPath}</div>
            </div>
        </div>
        `;
    }).join('')}
    </div>
</body>
</html>`;

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  } else {
    // Serve video files
    const filePath = path.join('.', decodeURIComponent(req.url));

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const stat = fs.statSync(filePath);
      const fileSize = stat.size;
      const range = req.headers.range;

      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = (end - start) + 1;
        const file = fs.createReadStream(filePath, { start, end });

        res.writeHead(206, {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': 'video/quicktime',
        });
        file.pipe(res);
      } else {
        res.writeHead(200, {
          'Content-Length': fileSize,
          'Content-Type': 'video/quicktime',
        });
        fs.createReadStream(filePath).pipe(res);
      }
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
    }
  }
});

const PORT = 8080;
server.listen(PORT, () => {
  console.log(`🎬 Video gallery running at http://localhost:${PORT}`);
});
