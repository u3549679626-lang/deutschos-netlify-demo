import { runFullDemo } from '../demo-core.mjs';
import { allow, readJson } from '../_shared.mjs';

export default function handler(req, res) {
  allow(res);
  if (req.method === 'OPTIONS') return res.status(200).json({ ok: true });
  const body = readJson(req);
  return res.status(200).json(runFullDemo(body.profile || {}, body.programs || []));
}
