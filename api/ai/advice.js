import { runFullDemo } from '../demo-core.mjs';
import { allow, readJson, fallbackAdvice } from '../_shared.mjs';

export default async function handler(req, res) {
  allow(res);
  if (req.method === 'OPTIONS') return res.status(200).json({ ok: true });
  const body = readJson(req);
  const profile = body.profile || {};
  const programs = body.programs || [];
  const demo = runFullDemo(profile, programs);
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) return res.status(200).json(fallbackAdvice(profile, programs));

  try {
    const payload = {
      profile: demo.profile,
      grade: demo.grade,
      programs: demo.programs.map((p, i) => ({ university: p.university, programName: p.programName, sourceUrl: p.sourceUrl, checkedAt: p.checkedAt, fieldConfidence: p.fieldConfidence, matching: demo.matching[i] }))
    };
    const prompt = `你是德国硕士申请专家团的风控型顾问。请基于以下 JSON 生成中文建议，必须不承诺录取、不替代官网/uni-assist/DAAD/APS/顾问判断。输出 JSON，字段为 advice 数组、nextActions 数组、riskWarnings 数组。\n${JSON.stringify(payload)}`;
    const upstream = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model: process.env.DEEPSEEK_MODEL || 'deepseek-chat', temperature: 0.2, messages: [{ role: 'system', content: '你是严谨合规的德国硕士申请初筛顾问。' }, { role: 'user', content: prompt }] })
    });
    if (!upstream.ok) return res.status(200).json({ ...fallbackAdvice(profile, programs), mode: 'fallback-api-error', warning: `AI 服务调用失败，已返回本地规则建议。状态码：${upstream.status}` });
    const data = await upstream.json();
    const content = data.choices?.[0]?.message?.content || '';
    let parsed;
    try { parsed = JSON.parse(content.replace(/^```json\s*/i, '').replace(/```$/,'').trim()); }
    catch { parsed = { advice: [content], nextActions: [], riskWarnings: ['AI 返回非 JSON 格式，已按原文展示。'] }; }
    return res.status(200).json({ ok: true, mode: 'ai-env-proxy', provider: 'deepseek-compatible-server-proxy', warning: 'API Key 仅从 Vercel 服务端环境变量读取。', ...parsed });
  } catch (error) {
    return res.status(200).json({ ...fallbackAdvice(profile, programs), mode: 'fallback-exception', warning: `AI 服务异常，已返回本地规则建议：${error.message}` });
  }
}
