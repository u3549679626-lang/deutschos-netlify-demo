import { handleAuthRequest } from '../auth-store.mjs';

export default async function handler(req, res) {
  return handleAuthRequest(req, res, 'login');
}
