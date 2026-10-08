// Vercel serverless entrypoint. The rewrite supplies nested API paths as `path`.
import app from '../src/index.js';

export default function handler(req, res) {
  const path = Array.isArray(req.query.path) ? req.query.path.join('/') : req.query.path;
  if (path) {
    const query = new URLSearchParams(req.query);
    query.delete('path');
    const suffix = query.toString();
    req.url = `/api/${path}${suffix ? `?${suffix}` : ''}`;
  }
  return app(req, res);
}
