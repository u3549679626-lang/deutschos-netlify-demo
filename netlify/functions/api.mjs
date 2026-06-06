import { runFullDemo, buildPolicyRadar, buildEfficiencyReport } from './demo-core.mjs';

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

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return json(200, { ok: true });
  const path = event.path.replace('/.netlify/functions/api', '').replace(/^\/api/, '') || '/health';
  const body = parseBody(event);

  try {
    if (event.httpMethod === 'GET' && (path === '/health' || path === '/')) {
      return json(200, { ok: true, service: 'deutschos-netlify-api', version: '0.3.0-netlify' });
    }

    if (path === '/health') return json(200, { ok: true, service: 'deutschos-netlify-api', version: '0.3.0-netlify' });

    if (path === '/demo/run') {
      return json(200, runFullDemo(body.profile || {}, body.programs || []));
    }

    if (path === '/policy-radar/run') {
      return json(200, buildPolicyRadar(body.profile || {}, body.programs || []));
    }

    if (path === '/efficiency-report') {
      return json(200, buildEfficiencyReport());
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
