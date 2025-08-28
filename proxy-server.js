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

app.use('/api', createProxyMiddleware({
    target: 'https://ieltsspeakingbot-production.up.railway.app',
    changeOrigin: true,
    pathRewrite: {
        '^/api': '',
    },
    onProxyReq: (proxyReq, req, res) => {
        console.log(`Proxying ${req.method} ${req.url} to target`);
    },
    onProxyRes: (proxyRes, req, res) => {
        console.log(`Response ${proxyRes.statusCode} from target`);
    },
    onError: (err, req, res) => {
        console.error('Proxy error:', err);
        res.status(500).json({ error: 'Proxy error occurred' });
    }
}));

app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Proxy server running on port ${PORT}`);
    console.log(`Serving static files from ${__dirname}`);
    console.log(`Proxying /api/* to https://ieltsspeakingbot-production.up.railway.app`);
});