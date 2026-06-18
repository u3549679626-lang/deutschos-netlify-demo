import { runFullDemo } from '../demo-core.mjs';

export function readJson(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch { return {}; }
  }
  return {};
}

export function allow(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
}

export function fallbackAdvice(profile = {}, programs = []) {
  const demo = runFullDemo(profile, programs);
  const top = demo.matching?.[0] || {};
  return {
    ok: true,
    mode: 'fallback-no-secret',
    provider: 'local-rule-engine',
    warning: '未检测到服务端环境变量 DEEPSEEK_API_KEY，当前返回本地规则兜底建议；公开仓库不会包含真实 API Key。',
    advice: [
      `当前德国制参考成绩为 ${demo.grade?.value}，可用于初筛排序，但正式成绩认定以学校或 uni-assist 为准。`,
      '优先处理 APS、deadline、申请路径、语言要求和课程/ECTS 五类高风险字段。',
      `当前最高匹配项目为 ${top.university || '待生成'} - ${top.programName || '待生成'}，匹配分用于风险排序，不代表录取概率。`,
      '专家团输出为顾问审核前初筛材料，正式交付前必须完成官网与材料复核。'
    ],
    nextActions: [
      '整理成绩单和英文课程描述，补齐数学/统计/计算机相关课程证据。',
      '逐项目打开官网 admission、deadline、language requirements 页面并截图。',
      '将报告中的风险证据转化为课程匹配说明和 Motivation Letter 素材。'
    ],
    riskWarnings: [
      '未配置服务端 AI Key 时使用本地兜底规则。',
      'Vercel 环境变量不得写入前端或公开仓库。'
    ]
  };
}
