#!/usr/bin/env node
import http from 'node:http';
import path from 'node:path';
import fs from 'node:fs';
import url from 'node:url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const ROOT = process.cwd();
const PORT = Number(process.env.PORT || 5500);

const MIME = {
	'.html': 'text/html; charset=UTF-8',
	'.js': 'application/javascript; charset=UTF-8',
	'.mjs': 'application/javascript; charset=UTF-8',
	'.css': 'text/css; charset=UTF-8',
	'.json': 'application/json; charset=UTF-8',
	'.svg': 'image/svg+xml',
	'.ico': 'image/x-icon',
	'.png': 'image/png',
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.gif': 'image/gif',
	'.map': 'application/json; charset=UTF-8',
	'.woff': 'font/woff',
	'.woff2': 'font/woff2',
	'.ttf': 'font/ttf',
	'.txt': 'text/plain; charset=UTF-8'
};

function safeJoin(root, requestPath) {
	const decoded = decodeURIComponent(requestPath);
	const normalized = path.posix.normalize(decoded).replace(/^\/+/, '/');
	const joined = path.join(root, normalized);
	if (!joined.startsWith(path.resolve(root))) {
		return null;
	}
	return joined;
}

function sendFile(res, filePath, statusCode = 200) {
	const ext = path.extname(filePath).toLowerCase();
	const type = MIME[ext] || 'application/octet-stream';
	fs.createReadStream(filePath)
		.on('open', () => {
			res.writeHead(statusCode, { 'Content-Type': type });
		})
		.on('error', (err) => {
			console.error('Read error:', err);
			res.writeHead(500, { 'Content-Type': 'text/plain; charset=UTF-8' });
			res.end('500 Internal Server Error');
		})
		.pipe(res);
}

function exists(p) {
	try { fs.accessSync(p, fs.constants.R_OK); return true; } catch { return false; }
}

function isDirectory(p) {
	try { return fs.statSync(p).isDirectory(); } catch { return false; }
}

const server = http.createServer((req, res) => {
	const parsed = url.parse(req.url || '/');
	const pathname = parsed.pathname || '/';

	const fullPath = safeJoin(ROOT, pathname);
	if (!fullPath) {
		return sendFile(res, path.join(ROOT, '404.html'), 404);
	}

	// If path exists and is a file, serve it
	if (exists(fullPath) && !isDirectory(fullPath)) {
		return sendFile(res, fullPath);
	}

	// If path is a directory
	if (isDirectory(fullPath)) {
		const indexPath = path.join(fullPath, 'index.html');
		if (exists(indexPath)) {
			return sendFile(res, indexPath);
		}
		// Directory without index.html → serve 404.html (SPA fallback)
		const notFound = path.join(ROOT, '404.html');
		if (exists(notFound)) {
			return sendFile(res, notFound, 200);
		}
	}

	// Fallback for not found paths
	const notFound = path.join(ROOT, '404.html');
	if (exists(notFound)) {
		return sendFile(res, notFound, 404);
	}

	res.writeHead(404, { 'Content-Type': 'text/plain; charset=UTF-8' });
	res.end('404 Not Found');
});

server.listen(PORT, () => {
	console.log(`Dev server running at http://127.0.0.1:${PORT}`);
	console.log(`Root: ${ROOT}`);
	console.log('Fallback: 404.html for directories without index.html and not-found paths');
});


