const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: ['https://result.ieltsly.uz', 'http://localhost:3000', 'http://127.0.0.1:3000', 'https://result.ieltsly.uz:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'User-Agent', 'X-Requested-With'],
    credentials: true,
    optionsSuccessStatus: 200
}));

// API proxy must come before static files
app.use('/api', createProxyMiddleware({
    target: 'https://ieltsspeakingbot-production.up.railway.app',
    changeOrigin: true,
    pathRewrite: {
        '^/api': '',
    },
    logLevel: 'debug',
    onProxyReq: (proxyReq, req, res) => {
        console.log(`[PROXY] Proxying ${req.method} ${req.url} to ${proxyReq.protocol}//${proxyReq.host}${proxyReq.path}`);
    },
    onProxyRes: (proxyRes, req, res) => {
        console.log(`[PROXY] Response ${proxyRes.statusCode} for ${req.url}`);
        console.log(`[PROXY] Content-Type: ${proxyRes.headers['content-type']}`);
    },
    onError: (err, req, res) => {
        console.error('[PROXY] Proxy error:', err.message);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Proxy error occurred', details: err.message });
        }
    }
}));

// Static files come after API proxy
app.use(express.static(path.join(__dirname)));

// Catch-all for SPA routes (except API)
app.get('*', (req, res) => {
    // Don't serve HTML for API routes
    if (req.path.startsWith('/api')) {
        return res.status(404).json({ error: 'API endpoint not found' });
    }
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Proxy server running on port ${PORT}`);
    console.log(`Serving static files from ${__dirname}`);
    console.log(`Proxying /api/* to https://ieltsspeakingbot-production.up.railway.app`);
});