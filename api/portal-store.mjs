const now = () => new Date().toISOString();

const demoApplicant = {
  id: 'app-001',
  name: 'Demo Applicant',
  email: 'student@demo.com',
  university: '中国本科院校（演示）',
  major: '信息管理与信息系统 / 商科与数据方向交叉背景',
  targetDirection: '数据科学与人工智能',
  intake: 'Winter Semester 2026',
  crossMajor: '部分跨专业',
  averageScore: 84,
  maxScore: 100,
  passScore: 60,
  germanGrade: '2.20',
  english: 'IELTS 6.5（需按项目官网复核小分要求）',
  german: '未提供',
  apsStatus: '未开始',
  currentStage: '数据库持久化演示准备',
  progress: 58,
  consultant: 'DeutschOS 顾问',
  lastPublished: '2026-06-19'
};

const demoPortalData = {
  schemaVersion: 'deutschos-sync-v1',
  applicant: demoApplicant,
  materials: [
    { name: '成绩单', status: '已上传', owner: '申请者', note: '需补英文版或翻译件状态' },
    { name: '课程描述', status: '待补充', owner: '申请者', note: '课程匹配诊断的关键阻塞项' },
    { name: 'CV', status: '待顾问修改', owner: '顾问', note: '已有素材，需按德国项目重排' },
    { name: 'IELTS / TOEFL', status: '待确认', owner: '申请者', note: '需上传官方成绩单并核对小分' },
    { name: 'APS', status: '未开始', owner: '申请者', note: '本周高优先级风险' }
  ],
  programs: [
    {
      university: 'Saarland University',
      program: 'Data Science and Artificial Intelligence',
      tier: '匹配',
      status: '数据库演示数据',
      deadline: '待官网最终复核',
      path: '官网申请入口；是否需 uni-assist 待复核',
      risk: '中',
      source: 'https://www.uni-saarland.de/',
      checkedAt: '2026-06-19',
      consultantNote: '后端 API 返回的演示数据；接入 Supabase 后可替换为真实发布快照。'
    },
    {
      university: 'TH Köln',
      program: 'Web and Data Science',
      tier: '稳妥',
      status: '数据库演示数据',
      deadline: '待官网最终复核',
      path: '官网 / 申请平台待核验',
      risk: '中',
      source: 'https://www.th-koeln.de/',
      checkedAt: '2026-06-19',
      consultantNote: '适合作为 HAW/FH 类型稳妥项目，但仍需核验语言和课程要求。'
    }
  ],
  tasks: [
    { title: '上传统计学、数据库、Python 三门课程描述', owner: '申请者', due: '本周五', priority: '高', status: '未完成' },
    { title: '确认 APS 材料清单并反馈准备进度', owner: '申请者', due: '本周四', priority: '高', status: '未完成' },
    { title: '顾问复核 Saarland 与 TH Köln 申请路径', owner: '顾问', due: '本周三', priority: '高', status: '待处理' }
  ],
  risks: [
    { type: 'APS', level: '高', description: 'APS 未开始，若继续延迟会影响后续递交节奏。', suggestedAction: '本周完成 APS 材料清单确认。', visibleToApplicant: true },
    { type: '课程匹配', level: '中', description: '课程描述缺失导致 ECTS 匹配无法最终确认。', suggestedAction: '优先补统计、编程、数据库课程描述。', visibleToApplicant: true }
  ],
  weeklyReport: {
    title: '第 3 周申请推进周报',
    period: '数据库持久化演示版',
    summary: '本周重点是把顾问审核发布结果从浏览器本地存储升级到后端 API / Supabase 就绪架构。',
    done: ['完成三角色门户', '完成 JSON 同步闭环', '新增门户持久化 API'],
    next: ['配置 Supabase 环境变量', '执行 SQL 建表', '验证真实云数据库写入'],
    risks: ['生产环境需启用真实 Auth 与 RLS', '官网要求仍需顾问人工复核']
  },
  expertOutputs: [
    { expert: '申请总控专家', type: '总控结论', status: '顾问已审核', visible: true, result: '当前系统已进入数据库持久化准备阶段。' },
    { expert: '申请风控与合规专家', type: '合规风控', status: '强制保留', visible: true, result: '所有官网要求以学校官方页面、uni-assist、DAAD、APS 和顾问人工复核为准；不承诺录取。' }
  ],
  consultantReview: {
    status: '后端 API 演示数据',
    reviewer: 'DeutschOS 顾问',
    reviewedAt: '2026-06-19',
    note: '当前环境未配置 Supabase 时返回 API 演示数据；配置后将读取最新发布快照。'
  },
  source: {
    system: 'DeutschOS Portal API fallback',
    generatedAt: now()
  }
};

const memoryStore = globalThis.__DEUTSCHOS_PORTAL_STORE__ || new Map();
globalThis.__DEUTSCHOS_PORTAL_STORE__ = memoryStore;

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    },
    body: JSON.stringify(body)
  };
}

function getEnv() {
  return {
    url: process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    anonKey: process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY
  };
}

function supabaseConfigured() {
  const env = getEnv();
  return Boolean(env.url && env.serviceKey);
}

async function supabaseFetch(path, options = {}) {
  const env = getEnv();
  if (!env.url || !env.serviceKey) throw new Error('Supabase is not configured');
  const endpoint = `${env.url.replace(/\/$/, '')}/rest/v1${path}`;
  const res = await fetch(endpoint, {
    ...options,
    headers: {
      apikey: env.serviceKey,
      Authorization: `Bearer ${env.serviceKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...(options.headers || {})
    }
  });
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) {
    const message = typeof data === 'string' ? data : data?.message || `Supabase request failed: ${res.status}`;
    throw new Error(message);
  }
  return data;
}

function normalizePayload(payload, applicantId = 'app-001') {
  const data = payload?.portalData || payload;
  const applicant = { ...demoApplicant, ...(data?.applicant || {}), id: applicantId };
  return {
    schemaVersion: data?.schemaVersion || 'deutschos-sync-v1',
    applicant,
    materials: data?.materials || demoPortalData.materials,
    programs: data?.programs || demoPortalData.programs,
    tasks: data?.tasks || demoPortalData.tasks,
    risks: data?.risks || demoPortalData.risks,
    weeklyReport: data?.weeklyReport || demoPortalData.weeklyReport,
    expertOutputs: data?.expertOutputs || demoPortalData.expertOutputs,
    consultantReview: {
      status: '顾问已审核并发布',
      reviewer: data?.consultantReview?.reviewer || 'DeutschOS 顾问',
      reviewedAt: now().slice(0, 10),
      note: data?.consultantReview?.note || '顾问已将小浣熊后台结果审核后发布。'
    },
    source: data?.source || { system: 'DeutschOS Portal API', generatedAt: now() },
    persistedAt: now()
  };
}

async function readPortal(applicantId = 'app-001') {
  if (supabaseConfigured()) {
    const rows = await supabaseFetch(`/portal_snapshots?applicant_id=eq.${encodeURIComponent(applicantId)}&select=*&order=published_at.desc&limit=1`);
    if (rows?.[0]?.payload) {
      return { ok: true, mode: 'supabase', applicantId, portalData: rows[0].payload, snapshotId: rows[0].id };
    }
    return { ok: true, mode: 'supabase-empty', applicantId, portalData: demoPortalData };
  }
  const stored = memoryStore.get(applicantId);
  return { ok: true, mode: stored ? 'memory' : 'fallback', applicantId, portalData: stored || demoPortalData };
}

async function publishPortal(payload = {}) {
  const applicantId = payload.applicantId || payload.portalData?.applicant?.id || 'app-001';
  const portalData = normalizePayload(payload, applicantId);
  if (supabaseConfigured()) {
    await supabaseFetch('/applicants?on_conflict=id', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
      body: JSON.stringify({
        id: applicantId,
        email: portalData.applicant.email || 'student@demo.com',
        name: portalData.applicant.name || 'Demo Applicant',
        profile: portalData.applicant,
        updated_at: now()
      })
    });
    const inserted = await supabaseFetch('/portal_snapshots', {
      method: 'POST',
      body: JSON.stringify({
        applicant_id: applicantId,
        payload: portalData,
        status: 'published',
        reviewer: portalData.consultantReview.reviewer,
        source_system: portalData.source?.system || 'DeutschOS Portal API',
        published_at: now()
      })
    });
    return { ok: true, mode: 'supabase', applicantId, portalData, snapshot: inserted?.[0] || null };
  }
  memoryStore.set(applicantId, portalData);
  return { ok: true, mode: 'memory', applicantId, portalData, note: 'Supabase 未配置，本次发布保存于函数内存；前端仍会同步 localStorage 兜底。' };
}

export async function handlePortalRequest({ method = 'GET', path = '', body = {} } = {}) {
  if (method === 'OPTIONS') return json(200, { ok: true });
  const segments = path.split('/').filter(Boolean);
  const action = segments[1] || segments[0] || 'read';
  try {
    if (method === 'GET' || action === 'read') {
      return json(200, await readPortal(body.applicantId || 'app-001'));
    }
    if (method === 'POST' && action === 'publish') {
      return json(200, await publishPortal(body));
    }
    if (method === 'POST' && action === 'reset') {
      memoryStore.delete(body.applicantId || 'app-001');
      return json(200, { ok: true, mode: 'memory', reset: true, portalData: demoPortalData });
    }
    return json(404, { ok: false, error: `Unknown portal action: ${action}` });
  } catch (error) {
    return json(500, { ok: false, error: error.message, mode: supabaseConfigured() ? 'supabase-error' : 'fallback-error' });
  }
}

export { demoPortalData, supabaseConfigured };
