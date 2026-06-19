const now = () => new Date().toISOString();

const json = (res, statusCode, data, headers = {}) => {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  Object.entries(headers).forEach(([key, value]) => res.setHeader(key, value));
  res.end(JSON.stringify(data));
};

const getBody = async (req) => {
  if (req.body && typeof req.body === 'object') return req.body;
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
};

const supabaseBase = () => (process.env.SUPABASE_URL || '').replace(/\/+$/, '');
const serviceKey = () => process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const anonKey = () => process.env.SUPABASE_ANON_KEY || '';

const authConfigured = () => Boolean(supabaseBase() && serviceKey() && anonKey());
const persistenceConfigured = () => Boolean(supabaseBase() && serviceKey());

async function supabaseFetch(path, options = {}, useAnon = false) {
  const base = supabaseBase();
  const key = useAnon ? anonKey() : serviceKey();
  if (!base || !key) throw new Error('Supabase is not configured');
  const response = await fetch(`${base}${path}`, {
    ...options,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const text = await response.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!response.ok) {
    const message = typeof data === 'object' && data?.message ? data.message : text || response.statusText;
    throw new Error(message);
  }
  return data;
}

async function findRoleByEmail(email) {
  const encoded = encodeURIComponent(email.toLowerCase());
  const rows = await supabaseFetch(`/rest/v1/user_roles?email=eq.${encoded}&is_active=eq.true&select=*`);
  return Array.isArray(rows) && rows.length ? rows[0] : null;
}

async function getAssignedApplicants(role, email) {
  if (role === 'admin') {
    const rows = await supabaseFetch('/rest/v1/applicants?select=id,email,name,assigned_consultant,profile&order=created_at.desc&limit=20');
    return rows || [];
  }
  if (role === 'consultant') {
    const encoded = encodeURIComponent(email.toLowerCase());
    const rows = await supabaseFetch(`/rest/v1/consultant_applicants?consultant_email=eq.${encoded}&status=eq.active&select=applicant_id`);
    return rows || [];
  }
  return [];
}

function demoRole(email) {
  const accounts = {
    'student@demo.com': { role: 'student', applicantId: 'app-001', name: 'Demo Applicant' },
    'consultant@demo.com': { role: 'consultant', applicantId: null, name: 'DeutschOS 顾问' },
    'admin@demo.com': { role: 'admin', applicantId: null, name: '系统管理员' }
  };
  return accounts[email.toLowerCase()] || null;
}

async function login(req, res) {
  const body = await getBody(req);
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');
  if (!email || !password) return json(res, 400, { ok: false, error: 'email and password are required' });

  if (!authConfigured()) {
    const demo = demoRole(email);
    if (demo && password === 'demo123') {
      return json(res, 200, {
        ok: true,
        mode: 'demo-auth-fallback',
        user: { email, name: demo.name, role: demo.role, applicantId: demo.applicantId },
        session: null,
        warning: 'SUPABASE_ANON_KEY is not configured or Auth users are not ready; demo login fallback is active.'
      });
    }
    return json(res, 401, { ok: false, mode: 'auth-not-configured', error: 'Real Auth is not configured. Use demo accounts or configure SUPABASE_ANON_KEY and Supabase Auth users.' });
  }

  try {
    const authData = await supabaseFetch('/auth/v1/token?grant_type=password', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }, true);
    const roleRow = await findRoleByEmail(email);
    if (!roleRow) return json(res, 403, { ok: false, mode: 'supabase-auth', error: 'User has no active role mapping in user_roles.' });
    const assignedApplicants = await getAssignedApplicants(roleRow.role, email);
    return json(res, 200, {
      ok: true,
      mode: 'supabase-auth',
      user: {
        id: authData.user?.id,
        email,
        name: roleRow.display_name || authData.user?.user_metadata?.name || email,
        role: roleRow.role,
        applicantId: roleRow.applicant_id,
        assignedApplicants
      },
      session: {
        access_token: authData.access_token,
        expires_at: authData.expires_at,
        token_type: authData.token_type
      }
    });
  } catch (error) {
    return json(res, 401, { ok: false, mode: 'supabase-auth-error', error: error.message });
  }
}

async function status(req, res) {
  let roleTableReady = false;
  let roleCount = 0;
  if (persistenceConfigured()) {
    try {
      const rows = await supabaseFetch('/rest/v1/user_roles?select=id&limit=5');
      roleTableReady = true;
      roleCount = Array.isArray(rows) ? rows.length : 0;
    } catch {
      roleTableReady = false;
    }
  }
  return json(res, 200, {
    ok: true,
    step: 'Step 10 · Supabase Auth 与多用户权限隔离',
    mode: authConfigured() ? 'supabase-auth-configured' : 'demo-auth-fallback',
    configured: {
      SUPABASE_URL: Boolean(supabaseBase()),
      SUPABASE_SERVICE_ROLE_KEY: Boolean(serviceKey()),
      SUPABASE_ANON_KEY: Boolean(anonKey())
    },
    roleTableReady,
    roleCount,
    requiredActions: authConfigured() && roleTableReady ? [] : [
      'Run supabase/step10-auth-rbac.sql in Supabase SQL Editor.',
      'Create Auth users for student@demo.com, consultant@demo.com and admin@demo.com or your real users.',
      'Set SUPABASE_ANON_KEY in Vercel Production environment variables and redeploy.',
      'Never expose SUPABASE_SERVICE_ROLE_KEY to the frontend or repository.'
    ],
    checkedAt: now()
  });
}

async function logout(req, res) {
  return json(res, 200, { ok: true, mode: authConfigured() ? 'supabase-auth' : 'demo-auth-fallback', message: 'Client session cleared.' });
}

export async function handleAuthRequest(req, res, action) {
  if (req.method === 'OPTIONS') return json(res, 200, { ok: true });
  if (action === 'status' || req.method === 'GET') return status(req, res);
  if (action === 'login') return login(req, res);
  if (action === 'logout') return logout(req, res);
  return json(res, 404, { ok: false, error: 'Unknown auth action' });
}
