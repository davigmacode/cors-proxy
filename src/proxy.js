import { createProxyMiddleware } from 'http-proxy-middleware';

const target = process.env.TARGET_API; // ex: https://api.example.com

const corsProxy = createProxyMiddleware({
  target,
  changeOrigin: true,
  pathRewrite: { '^/api': '' },
  onProxyReq: (proxyReq, req, res) => {
    // optional: inject header or log
  },
  onProxyRes: (proxyRes, req, res) => {
    res.setHeader('Access-Control-Allow-Origin', process.env.ALLOW_ORIGIN || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  },
});

export default function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  return corsProxy(req, res, (err) => {
    if (err) throw err;
  });
}
