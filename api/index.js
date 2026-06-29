import { runFullDemo, buildPolicyRadar, buildEfficiencyReport } from '../server/demo-core.mjs';
import { handlePortalRequest } from '../server/portal-store.mjs';
import { handleAuthRequest } from '../server/auth-store.mjs';
import { handleScheduledTaskRequest } from '../server/scheduled-tasks-store.mjs';

function parseEnvList(value) {
  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function uniqueList(items) {
  return [...new Set(items.filter(Boolean))];
}

function sanitizeBaseUrl(value) {
  return String(value || '').replace(/\/$/, '');
}

function getLlmConfig() {
  const provider = (process.env.LLM_PROVIDER || (process.env.SENSENOVA_API_KEY ? 'sensenova' : process.env.DEEPSEEK_API_KEY ? 'deepseek' : process.env.OPENAI_API_KEY ? 'openai' : 'none')).toLowerCase();
  if (provider === 'sensenova') {
    const baseUrl = sanitizeBaseUrl(process.env.SENSENOVA_BASE_URL || 'https://api.sensenova.cn/compatible-mode/v1');
    const model = process.env.SENSENOVA_MODEL || 'SenseChat';
    return {
      configured: Boolean(process.env.SENSENOVA_API_KEY),
      provider: 'sensenova',
      apiKey: process.env.SENSENOVA_API_KEY,
      baseUrl,
      model,
      candidateBaseUrls: uniqueList([
        baseUrl,
        ...parseEnvList(process.env.SENSENOVA_CANDIDATE_BASE_URLS),
        'https://api.sensenova.cn/compatible-mode/v1',
        'https://api.sensenova.cn/v1',
        'https://token.sensenova.cn/v1'
      ]).map(sanitizeBaseUrl),
      candidateModels: uniqueList([
        model,
        ...parseEnvList(process.env.SENSENOVA_CANDIDATE_MODELS),
        'SenseChat',
        'SenseChat-5',
        'sensenova-6.7-flash-lite'
      ])
    };
  }
  if (provider === 'openai') {
    const baseUrl = sanitizeBaseUrl(process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1');
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    return {
      configured: Boolean(process.env.OPENAI_API_KEY),
      provider: 'openai',
      apiKey: process.env.OPENAI_API_KEY,
      baseUrl,
      model,
      candidateBaseUrls: [baseUrl],
      candidateModels: [model]
    };
  }
  const baseUrl = sanitizeBaseUrl(process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com');
  const model = process.env.DEEPSEEK_MODEL || 'deepseek-chat';
  return {
    configured: Boolean(process.env.DEEPSEEK_API_KEY),
    provider: 'deepseek',
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseUrl,
    model,
    candidateBaseUrls: [baseUrl],
    candidateModels: [model]
  };
}

function getRequiredEnv(provider) {
  if (provider === 'sensenova') return ['SENSENOVA_API_KEY', 'SENSENOVA_BASE_URL', 'SENSENOVA_MODEL'];
  if (provider === 'openai') return ['OPENAI_API_KEY', 'OPENAI_BASE_URL', 'OPENAI_MODEL'];
  return ['DEEPSEEK_API_KEY', 'DEEPSEEK_BASE_URL', 'DEEPSEEK_MODEL'];
}

function safeUrlHost(baseUrl) {
  try { return new URL(baseUrl).host; }
  catch { return null; }
}

function buildAiHealth() {
  const config = getLlmConfig();
  return {
    ok: true,
    service: 'deutschos-ai-proxy',
    mode: 'hybrid-local-first',
    localExpertEngine: {
      available: true,
      mode: 'local-expert-engine',
      description: 'Server-side deterministic German master application advisor; no external token required.'
    },
    externalLlm: {
      configured: config.configured,
      provider: config.provider,
      model: config.model,
      baseUrlHost: config.configured ? safeUrlHost(config.baseUrl) : null,
      candidateBaseUrlHosts: config.configured ? config.candidateBaseUrls.map(safeUrlHost).filter(Boolean) : [],
      candidateModels: config.configured ? config.candidateModels : [],
      requiredEnv: getRequiredEnv(config.provider),
      optionalDiagnosticEnv: config.provider === 'sensenova' ? ['SENSENOVA_CANDIDATE_BASE_URLS', 'SENSENOVA_CANDIDATE_MODELS'] : []
    },
    configured: true,
    provider: config.configured ? config.provider : 'local-expert-engine',
    model: config.configured ? config.model : 'deterministic-advisor-v1',
    baseUrlHost: config.configured ? safeUrlHost(config.baseUrl) : null,
    security: 'Model API keys are read only from server-side environment variables and are never exposed to browser bundles. Local expert mode does not require external API keys.'
  };
}

function buildFallbackAdvice(demo, mode = 'local-expert-engine', warning) {
  const top = demo.matching?.[0] || {};
  const gradeValue = demo.grade?.value ?? '待计算';
  const highRiskCount = demo.riskWarnings?.length || demo.matching?.filter((item) => ['高', '极高'].includes(item.riskLevel)).length || 0;
  return {
    ok: true,
    mode,
    provider: 'local-expert-engine',
    model: 'deterministic-advisor-v1',
    warning: warning || '当前使用服务端本地专家引擎生成建议；外部大模型可作为增强项接入，但不是 Demo 运行的硬依赖。',
    advice: [
      `当前德国制参考成绩为 ${gradeValue}，可用于初筛排序，但正式成绩认定以学校或 uni-assist 为准。`,
      `本次建议优先围绕 APS、deadline、申请路径、语言要求和课程/ECTS 五类风险展开，已识别 ${highRiskCount} 个需重点复核的高风险信号。`,
      `当前最高匹配项目为 ${top.university || '待生成'} - ${top.programName || '待生成'}，匹配分用于风险排序，不代表录取概率。`,
      '建议采用“官网核验表 + 课程匹配说明 + 文书证据链”的交付组合，先把不确定项标为待人工复核，再进入正式申请动作。'
    ],
    nextActions: [
      '整理成绩单和英文课程描述，补齐数学/统计/计算机相关课程证据。',
      '逐项目打开官网 admission、deadline、language requirements 页面并截图。',
      '优先处理 APS / VPD / uni-assist / 直申路径等硬性阻塞项。',
      '将报告中的风险证据转化为课程匹配说明和 Motivation Letter 素材。'
    ],
    riskWarnings: [
      '本地专家引擎输出为规则化初筛建议，不替代学校或 uni-assist 的正式审核。',
      '官网未明确公布的 NC、历史线、课程学分要求必须标注“待人工核实”。',
      '外部 LLM 授权失败不影响 Demo 主流程；如需真实模型增强，需提供有效的服务端 API Key。'
    ]
  };
}

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch { return {}; }
  }
  return {};
}

async function callChatCompletions(config, prompt, baseUrl, model) {
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${config.apiKey}` },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      messages: [
        { role: 'system', content: '你是严谨、诚实、合规的德国硕士申请初筛产品顾问。只输出可核验、不过度承诺的建议。' },
        { role: 'user', content: prompt }
      ]
    })
  });

  const text = await response.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = null; }
  return { response, text, data };
}

function summarizeAiError(result, baseUrl, model) {
  const raw = result?.data?.error?.message || result?.data?.message || result?.text || '';
  return {
    baseUrlHost: safeUrlHost(baseUrl),
    model,
    status: result?.response?.status || 0,
    statusText: result?.response?.statusText || 'request-failed',
    errorPreview: String(raw).replace(/Bearer\s+[\w.\-]+/gi, 'Bearer ***').slice(0, 180)
  };
}

async function requestAiAdvice(config, prompt) {
  const attempts = [];
  for (const baseUrl of config.candidateBaseUrls) {
    for (const model of config.candidateModels) {
      try {
        const result = await callChatCompletions(config, prompt, baseUrl, model);
        if (result.response.ok) return { ok: true, model, baseUrl, data: result.data };
        attempts.push(summarizeAiError(result, baseUrl, model));
        if (result.response.status === 401) break;
      } catch (error) {
        attempts.push({ baseUrlHost: safeUrlHost(baseUrl), model, status: 0, statusText: 'network-error', errorPreview: String(error.message || error).slice(0, 180) });
      }
    }
  }
  return { ok: false, attempts };
}

async function buildAiAdvice(profile = {}, programs = []) {
  const demo = runFullDemo(profile, programs);
  const config = getLlmConfig();
  if (!config.configured) return buildFallbackAdvice(demo, 'local-expert-engine', '当前使用服务端本地专家引擎生成建议；未配置外部 LLM Key，不影响 Demo 主流程。');

  const safePayload = {
    profile: demo.profile,
    grade: demo.grade,
    programs: demo.programs.map((p, i) => ({
      university: p.university,
      programName: p.programName,
      sourceUrl: p.sourceUrl,
      checkedAt: p.checkedAt,
      fieldConfidence: p.fieldConfidence,
      matching: demo.matching[i]
    }))
  };

  const prompt = `你是德国硕士申请专家团的风控型顾问。请基于以下 JSON 生成中文建议，必须遵守：1) 不承诺录取概率；2) 明确区分真实计算、演示数据、待人工复核；3) 项目数量只能表述为 TUM/Saarland University/TH Köln 三个示范院校 + 引擎可扩展；4) 专家团输出是顾问审核前初筛。输出 JSON，字段为 advice 数组、nextActions 数组、riskWarnings 数组。\n\n${JSON.stringify(safePayload)}`;

  const aiResult = await requestAiAdvice(config, prompt);
  if (!aiResult.ok) {
    const attempts = aiResult.attempts || [];
    const first = attempts[0];
    const summary = first ? `首个错误：${first.status} ${first.statusText}，host=${first.baseUrlHost}，model=${first.model}。` : '没有拿到上游响应。';
    return { ...buildFallbackAdvice(demo, 'local-expert-engine', `外部 LLM 增强暂未接通，已自动切换为服务端本地专家引擎。${summary}`), externalLlm: { ok: false, provider: config.provider, attempts } };
  }

  const content = aiResult.data?.choices?.[0]?.message?.content || '';
  let parsed;
  try { parsed = JSON.parse(content.replace(/^```json\s*/i, '').replace(/```$/,'').trim()); }
  catch { parsed = { advice: [content], nextActions: [], riskWarnings: ['AI 返回非 JSON 格式，已按原文展示。'] }; }
  return { ok: true, mode: 'ai-env-proxy', provider: `${config.provider}-server-proxy`, model: aiResult.model, baseUrlHost: safeUrlHost(aiResult.baseUrl), warning: 'API Key 仅从 Vercel 服务端环境变量读取，不会暴露给浏览器或公开仓库。', ...parsed };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).json({ ok: true });

  const body = await readBody(req);
  const slug = Array.isArray(req.query.slug) ? req.query.slug.join('/') : (req.query.slug || 'health');
  const path = `/${slug}`.replace(/\/+/g, '/');

  try {
    if (req.method === 'GET' && (path === '/version' || path === '/health' || path === '/')) {
      return res.status(200).json({
        ok: true,
        service: 'deutschos-vercel-api',
        step: 'Step 10',
        version: 'auth-rbac-2026-06-19',
        apiVersion: 'auth-rbac-2026-06-19',
        commitHint: 'catch-all-version-probe',
        authRoutes: ['/api/auth/status', '/api/auth/login', '/api/auth/logout'],
        portalRoutes: ['/api/portal/status', '/api/portal/read', '/api/portal/publish'],
        aiRoutes: ['/api/ai/health', '/api/ai/advice']
      });
    }
    if (path.startsWith('/portal/')) {
      const result = await handlePortalRequest({ method: req.method, path, body, query: req.query });
      return res.status(result.statusCode).setHeader('Content-Type', 'application/json; charset=utf-8').send(result.body);
    }
    if (path.startsWith('/auth/')) {
      const action = path.split('/').filter(Boolean)[1] || 'status';
      return handleAuthRequest(req, res, action);
    }
    if (path.startsWith('/scheduled-tasks')) {
      return handleScheduledTaskRequest(req, res, path);
    }
    if (path === '/demo/run') return res.status(200).json(runFullDemo(body.profile || {}, body.programs || []));
    if (path === '/policy-radar/run') return res.status(200).json(buildPolicyRadar(body.profile || {}, body.programs || []));
    if (path === '/efficiency-report') return res.status(200).json(buildEfficiencyReport());
    if (path === '/ai/health') return res.status(200).json(buildAiHealth());
    if (path === '/ai/advice') return res.status(200).json(await buildAiAdvice(body.profile || {}, body.programs || []));
    if (path === '/export/package') {
      const demo = body.demo || runFullDemo(body.profile || {}, body.programs || []);
      return res.status(200).json({ generatedAt: new Date().toISOString(), note: 'Vercel Demo 支持浏览器下载 JSON；完整源码包请从 GitHub/Vercel 项目获取。', files: demo.exportFiles || [], demo });
    }
    if (path === '/profile/save') return res.status(200).json({ ok: true, mode: 'vercel-demo', message: 'Vercel Demo 已接收档案；正式版可接 Supabase/数据库持久化。', profile: body.profile || {} });
    if (path === '/research/crawl') {
      const demo = runFullDemo(body.profile || {}, []);
      return res.status(200).json({ mode: 'vercel-demo', pageCount: Array.isArray(body.urls) ? body.urls.length : 0, note: 'Vercel 静态 Demo 默认返回演示核验数据；正式部署可接入后端抓取服务或浏览器自动化截图服务。', programs: demo.programs, pages: (body.urls || []).map((url, index) => ({ url, status: 'queued/demo', extractedAt: new Date().toISOString(), index })) });
    }
    if (path === '/analysis/run') {
      const demo = runFullDemo(body.profile || {}, body.research?.programs || []);
      return res.status(200).json({ report: `已基于 ${demo.programs.length} 个项目生成申请分析。德国制参考成绩 ${demo.grade.value}。请优先处理 APS、语言成绩、课程描述和官网 deadline 复核。`, programs: demo.programs, tasks: demo.dashboard.map((r, i) => ({ id: `task-${i+1}`, status: i === 0 ? 'blocked' : 'todo', priority: r.priority === '高' ? 'high' : 'medium', title: `${r.university} ${r.programName}`, detail: r.blocker, nextAction: r.nextStep })), guide: { sections: [ { title: '官网核验', enabled: true, steps: ['打开项目官网', '核对 deadline / APS / VPD / 语言 / 材料', '保存截图并标注待人工复核项'] }, { title: '材料补强', enabled: true, steps: ['整理英文课程描述', '补齐语言成绩', '推进 APS', '定制 Motivation Letter'] } ]} });
    }
    if (path === '/materials/draft') {
      const demo = runFullDemo(body.profile || {}, body.analysis?.programs || []);
      const type = body.type || 'Motivation Letter';
      return res.status(200).json({ title: `${type} 初稿`, draft: type.includes('Course') ? demo.drafts.courseMappingStatement : demo.drafts.motivationLetter });
    }
    if (path === '/application-guide') return res.status(200).json({ sections: [ { title: '申请路径核验', enabled: true, steps: ['确认直申/uni-assist/VPD', '确认中国申请者 APS 要求', '记录来源链接和抓取日期'] }, { title: '提交前检查', enabled: true, steps: ['检查课程匹配表', '检查语言成绩', '检查文书真实性', '检查 deadline'] } ]});
    if (path === '/chat') {
      const demo = runFullDemo(body.profile || {}, body.analysis?.programs || []);
      return res.status(200).json({ answer: `基于当前档案，建议先完成 APS 与官网 deadline/VPD 复核。当前德国制参考成绩为 ${demo.grade.value}，课程匹配最高项目为 ${demo.matching[0]?.university} - ${demo.matching[0]?.programName}，主要风险是：${demo.matching[0]?.gapModules.join('；')}。` });
    }
    return res.status(404).json({ error: `Unknown API path: ${path}` });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
