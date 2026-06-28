import { runFullDemo, buildPolicyRadar, buildEfficiencyReport } from './demo-core.mjs';
import { handlePortalRequest } from '../../server/portal-store.mjs';

const json = (statusCode, body) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
  },
  body: JSON.stringify(body)
});

function parseBody(event) {
  try { return event.body ? JSON.parse(event.body) : {}; } catch { return {}; }
}


function buildFallbackAdvice(demo) {
  const top = demo.matching?.[0] || {};
  return {
    ok: true,
    mode: 'fallback-no-secret',
    provider: 'local-rule-engine',
    warning: '未检测到服务端环境变量 DEEPSEEK_API_KEY，当前返回本地规则兜底建议；公开仓库不会包含真实 API Key。',
    advice: [
      `当前德国制参考成绩为 ${demo.grade?.value}，可用于初筛排序，但正式成绩认定以学校或 uni-assist 为准。`,
      `优先处理 APS、deadline、申请路径、语言要求和课程/ECTS 五类高风险字段。`,
      `当前最高匹配项目为 ${top.university || '待生成'} - ${top.programName || '待生成'}，匹配分用于风险排序，不代表录取概率。`,
      'TH Köln 等待复核项目不要写成已完成官方详情核验，PPT 中应保留“待人工核实”标注。'
    ],
    nextActions: [
      '整理成绩单和英文课程描述，补齐数学/统计/计算机相关课程证据。',
      '逐项目打开官网 admission、deadline、language requirements 页面并截图。',
      '将报告中的风险证据转化为课程匹配说明和 Motivation Letter 素材。'
    ]
  };
}

async function buildAiAdvice(profile = {}, programs = []) {
  const demo = runFullDemo(profile, programs);
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) return buildFallbackAdvice(demo);

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

  const prompt = `你是德国硕士申请初筛顾问。请基于以下 JSON 生成中文建议，必须遵守：1) 不承诺录取概率；2) 明确区分真实计算、演示数据、待人工复核；3) 院校数量只能表述为 TUM/Saarland University/TH Köln 三个示范院校 + 引擎可扩展；4) 政策雷达仅为 Demo 配置，待长期运行验证。输出 JSON，字段为 advice 数组、nextActions 数组、riskWarnings 数组。\n\n${JSON.stringify(safePayload)}`;

  const res = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
      temperature: 0.2,
      messages: [
        { role: 'system', content: '你是严谨、诚实、合规的德国硕士申请初筛产品顾问。只输出可核验、不过度承诺的建议。' },
        { role: 'user', content: prompt }
      ]
    })
  });

  if (!res.ok) {
    const text = await res.text();
    return { ...buildFallbackAdvice(demo), mode: 'fallback-api-error', warning: `AI 服务调用失败，已返回本地兜底建议。状态码：${res.status}。错误摘要：${text.slice(0, 160)}` };
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content || '';
  let parsed;
  try {
    parsed = JSON.parse(content.replace(/^```json\s*/i, '').replace(/```$/,'').trim());
  } catch {
    parsed = { advice: [content], nextActions: [], riskWarnings: ['AI 返回非 JSON 格式，已按原文展示。'] };
  }

  return {
    ok: true,
    mode: 'ai-env-proxy',
    provider: 'deepseek-compatible-server-proxy',
    warning: 'API Key 仅从 Netlify 服务端环境变量读取，不会暴露给浏览器或公开仓库。',
    ...parsed
  };
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return json(200, { ok: true });
  const path = event.path.replace('/.netlify/functions/api', '').replace(/^\/api/, '') || '/health';
  const body = parseBody(event);

  try {
    if (event.httpMethod === 'GET' && (path === '/health' || path === '/')) {
      return json(200, { ok: true, service: 'deutschos-netlify-api', version: '0.3.0-netlify' });
    }

    if (path === '/health') return json(200, { ok: true, service: 'deutschos-netlify-api', version: '0.3.0-netlify' });

    if (path.startsWith('/portal/')) {
      return handlePortalRequest({ method: event.httpMethod, path, body });
    }

    if (path === '/demo/run') {
      return json(200, runFullDemo(body.profile || {}, body.programs || []));
    }

    if (path === '/policy-radar/run') {
      return json(200, buildPolicyRadar(body.profile || {}, body.programs || []));
    }

    if (path === '/efficiency-report') {
      return json(200, buildEfficiencyReport());
    }

    if (path === '/ai/advice') {
      return json(200, await buildAiAdvice(body.profile || {}, body.programs || []));
    }

    if (path === '/export/package') {
      const demo = body.demo || runFullDemo(body.profile || {}, body.programs || []);
      return json(200, {
        generatedAt: new Date().toISOString(),
        note: 'Netlify Demo 支持浏览器下载 JSON；完整源码包请从提交附件获取。',
        files: demo.exportFiles || [],
        demo
      });
    }

    if (path === '/profile/save') {
      return json(200, { ok: true, mode: 'netlify-demo', message: 'Netlify Demo 已接收档案；正式版可接 Supabase/数据库持久化。', profile: body.profile || {} });
    }

    if (path === '/research/crawl') {
      const demo = runFullDemo(body.profile || {}, []);
      return json(200, {
        mode: 'netlify-demo',
        pageCount: Array.isArray(body.urls) ? body.urls.length : 0,
        note: 'Netlify 静态 Demo 默认返回演示核验数据；正式部署可接入后端抓取服务或浏览器自动化截图服务。',
        programs: demo.programs,
        pages: (body.urls || []).map((url, index) => ({ url, status: 'queued/demo', extractedAt: new Date().toISOString(), index }))
      });
    }

    if (path === '/analysis/run') {
      const demo = runFullDemo(body.profile || {}, body.research?.programs || []);
      return json(200, {
        report: `已基于 ${demo.programs.length} 个项目生成申请分析。德国制参考成绩 ${demo.grade.value}。请优先处理 APS、语言成绩、课程描述和官网 deadline 复核。`,
        programs: demo.programs,
        tasks: demo.dashboard.map((r, i) => ({ id: `task-${i+1}`, status: i === 0 ? 'blocked' : 'todo', priority: r.priority === '高' ? 'high' : 'medium', title: `${r.university} ${r.programName}`, detail: r.blocker, nextAction: r.nextStep })),
        guide: { sections: [
          { title: '官网核验', enabled: true, steps: ['打开项目官网', '核对 deadline / APS / VPD / 语言 / 材料', '保存截图并标注待人工复核项'] },
          { title: '材料补强', enabled: true, steps: ['整理英文课程描述', '补齐语言成绩', '推进 APS', '定制 Motivation Letter'] }
        ]}
      });
    }

    if (path === '/materials/draft') {
      const demo = runFullDemo(body.profile || {}, body.analysis?.programs || []);
      const type = body.type || 'Motivation Letter';
      return json(200, { title: `${type} 初稿`, draft: type.includes('Course') ? demo.drafts.courseMappingStatement : demo.drafts.motivationLetter });
    }

    if (path === '/application-guide') {
      return json(200, { sections: [
        { title: '申请路径核验', enabled: true, steps: ['确认直申/uni-assist/VPD', '确认中国申请者 APS 要求', '记录来源链接和抓取日期'] },
        { title: '提交前检查', enabled: true, steps: ['检查课程匹配表', '检查语言成绩', '检查文书真实性', '检查 deadline'] }
      ]});
    }

    if (path === '/chat') {
      const demo = runFullDemo(body.profile || {}, body.analysis?.programs || []);
      return json(200, { answer: `基于当前档案，建议先完成 APS 与官网 deadline/VPD 复核。当前德国制参考成绩为 ${demo.grade.value}，课程匹配最高项目为 ${demo.matching[0]?.university} - ${demo.matching[0]?.programName}，主要风险是：${demo.matching[0]?.gapModules.join('；')}。` });
    }

    return json(404, { error: `Unknown API path: ${path}` });
  } catch (error) {
    return json(500, { error: error.message || 'Internal Server Error' });
  }
}
