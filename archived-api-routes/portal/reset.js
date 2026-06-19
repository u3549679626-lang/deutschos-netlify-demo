import { handlePortalRequest } from '../portal-store.mjs';

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch { return {}; }
  }
  return {};
}

export default async function handler(req, res) {
  const body = await readBody(req);
  const result = await handlePortalRequest({ method: req.method || 'POST', path: '/portal/reset', body });
  return res.status(result.statusCode).setHeader('Content-Type', 'application/json; charset=utf-8').send(result.body);
}
