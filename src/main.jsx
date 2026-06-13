import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AlertTriangle, CheckCircle2, ClipboardCheck, Database, Download, FileText, Gauge, Globe2, LayoutDashboard, Loader2, Radar, ShieldCheck, Sparkles } from 'lucide-react';
import './styles.css';

const API_BASE = import.meta.env.VITE_API_BASE ?? (import.meta.env.PROD ? '' : 'http://localhost:8787');

const defaultProfile = {
  name: 'Demo Applicant',
  educationStatus: '本科应届生',
  university: '示例大学',
  major: '信息管理与信息系统',
  targetDirection: '数据科学与人工智能',
  crossMajor: '部分跨专业',
  intake: 'Winter 2026',
  averageScore: 84,
  maxScore: 100,
  passScore: 60,
  english: 'IELTS 6.5',
  german: '未考',
  apsStatus: '未开始',
  experiences: 'Python 数据分析课程项目；机器学习课程作业；一段互联网数据运营实习；毕业论文方向为用户行为分析。'
};

function germanGrade(profile) {
  const avg = Number(profile.averageScore);
  const max = Number(profile.maxScore);
  const pass = Number(profile.passScore);
  if (!Number.isFinite(avg) || !Number.isFinite(max) || !Number.isFinite(pass) || max <= pass || avg > max || avg < pass) return null;
  return 1 + 3 * (max - avg) / (max - pass);
}

function validateProfile(profile) {
  const errors = [];
  const avg = Number(profile.averageScore);
  const max = Number(profile.maxScore);
  const pass = Number(profile.passScore);
  if (!Number.isFinite(avg)) errors.push('均分必须为有效数字');
  if (!Number.isFinite(max)) errors.push('满分必须为有效数字');
  if (!Number.isFinite(pass)) errors.push('及格线必须为有效数字');
  if (Number.isFinite(max) && Number.isFinite(pass) && max <= pass) errors.push('满分必须高于及格线');
  if (Number.isFinite(avg) && Number.isFinite(max) && avg > max) errors.push('均分不能高于满分');
  if (Number.isFinite(avg) && Number.isFinite(pass) && avg < pass) errors.push('均分不能低于及格线');
  if (!String(profile.targetDirection || '').trim()) errors.push('目标方向不能为空');
  return errors;
}

async function api(path, payload) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function Field({ label, children, hint }) {
  return <label className="field"><span>{label}</span>{children}{hint ? <small>{hint}</small> : null}</label>;
}

function Badge({ children, tone = 'gray' }) {
  return <span className={`badge ${tone}`}>{children}</span>;
}

function Kpi({ label, value, hint, tone }) {
  return <div className={`kpi ${tone || ''}`}><span>{label}</span><strong>{value}</strong>{hint ? <small>{hint}</small> : null}</div>;
}

function App() {
  const [profile, setProfile] = useState(defaultProfile);
  const [demo, setDemo] = useState(null);
  const [loading, setLoading] = useState('');
  const [notice, setNotice] = useState('当前为 Netlify 纯前端/函数 Demo：成绩与评分真实计算；项目要求为演示种子数据，提交申请前必须官网复核。');
  const [active, setActive] = useState('summary');
  const grade = useMemo(() => germanGrade(profile), [profile]);
  const inputErrors = useMemo(() => validateProfile(profile), [profile]);
  const update = (k, v) => setProfile(prev => ({ ...prev, [k]: v }));

  async function runFullDemo() {
    const errors = validateProfile(profile);
    if (errors.length) {
      setDemo(null);
      setNotice(`请先修正输入：${errors.join('；')}`);
      return;
    }
    setLoading('一键运行完整 Demo');
    try {
      const data = await api('/api/demo/run', { profile });
      if (data.ok === false) {
        setDemo(null);
        setNotice(`请先修正输入：${data.error || '输入不合法'}`);
        return;
      }
      setDemo(data);
      setActive('summary');
      setNotice('已生成申请初筛方案：包含德国制成绩、项目梯度、评分依据、风险证据、下一步任务、看板与政策雷达配置。');
    } catch (e) {
      setNotice(`Demo 运行失败：${e.message}`);
    } finally {
      setLoading('');
    }
  }

  async function exportPackage() {
    if (!demo) return setNotice('请先运行完整 Demo，再导出结果。');
    downloadJson('deutschos-demo-result.json', demo);
    setNotice('已导出 JSON 初筛结果；正式版可扩展为 Word/PDF 报告。');
  }

  return (
    <div className="app-shell">
      <header className="hero">
        <div className="hero-copy">
          <Badge tone="blue">DeutschOS MVP · 申请初筛与材料管理工作台</Badge>
          <h1>输入背景，生成德国硕士申请梯度方案</h1>
          <p>基于成绩换算、专业相关度、课程/ECTS、语言、APS、项目经历、deadline 风险和数据可信度，输出可解释、可复核的初筛方案。</p>
          <div className="hero-actions">
            <button className="primary" onClick={runFullDemo} disabled={!!loading}>{loading ? <Loader2 className="spin" size={18}/> : <Sparkles size={18}/>}一键运行完整 Demo</button>
            <button className="secondary" onClick={exportPackage}><Download size={18}/>导出初筛结果</button>
          </div>
          <div className="trust-strip">
            <span><CheckCircle2 size={16}/>真实计算：巴伐利亚公式</span>
            <span><ShieldCheck size={16}/>诚信标注：演示数据/待复核</span>
            <span><ClipboardCheck size={16}/>输出：理由、证据、任务</span>
          </div>
        </div>
        <div className="hero-card">
          <div className="mini-title">当前核心结论</div>
          <div className="grade-display">{grade ? grade.toFixed(2) : '--'}</div>
          <p>德国制参考成绩</p>
          <small>84 / 100 / 60 → 2.20；最终以学校或 uni-assist 认定为准。</small>
        </div>
      </header>

      <main className="grid-layout">
        <section className="panel form-panel">
          <div className="section-title"><FileText size={20}/><div><h2>申请者背景输入</h2><p>无效输入会停止生成结果，避免错误方案被渲染。</p></div></div>
          <div className="form-grid">
            <Field label="姓名"><input value={profile.name} onChange={e => update('name', e.target.value)} /></Field>
            <Field label="当前身份"><select value={profile.educationStatus} onChange={e => update('educationStatus', e.target.value)}><option>本科应届生</option><option>已毕业工作党</option><option>研究生在读</option></select></Field>
            <Field label="本科院校"><input value={profile.university} onChange={e => update('university', e.target.value)} /></Field>
            <Field label="本科专业"><input value={profile.major} onChange={e => update('major', e.target.value)} /></Field>
            <Field label="目标方向"><input value={profile.targetDirection} onChange={e => update('targetDirection', e.target.value)} /></Field>
            <Field label="跨专业状态"><select value={profile.crossMajor} onChange={e => update('crossMajor', e.target.value)}><option>否</option><option>部分跨专业</option><option>是</option></select></Field>
            <Field label="均分"><input type="number" value={profile.averageScore} onChange={e => update('averageScore', e.target.value)} /></Field>
            <Field label="满分"><input type="number" value={profile.maxScore} onChange={e => update('maxScore', e.target.value)} /></Field>
            <Field label="及格线"><input type="number" value={profile.passScore} onChange={e => update('passScore', e.target.value)} /></Field>
            <Field label="英语成绩"><input value={profile.english} onChange={e => update('english', e.target.value)} /></Field>
            <Field label="APS 状态"><select value={profile.apsStatus} onChange={e => update('apsStatus', e.target.value)}><option>未开始</option><option>准备中</option><option>已递交 / 等待结果</option><option>已通过</option><option>不确定</option></select></Field>
            <Field label="申请季"><input value={profile.intake} onChange={e => update('intake', e.target.value)} /></Field>
          </div>
          <Field label="项目 / 实习 / 科研经历" hint="React 文本节点渲染用户输入，不使用危险 HTML 拼接。"><textarea value={profile.experiences} onChange={e => update('experiences', e.target.value)} rows={4}/></Field>
          {inputErrors.length ? <div className="error-box"><AlertTriangle size={18}/><div><strong>请修正后再生成：</strong>{inputErrors.join('；')}</div></div> : null}
        </section>

        <section className="panel result-panel">
          <div className="notice">{notice}</div>
          <TabNav active={active} setActive={setActive} />
          {!demo ? <EmptyState /> : <Result active={active} demo={demo} profile={profile} />}
        </section>
      </main>
    </div>
  );
}

function TabNav({ active, setActive }) {
  const tabs = [
    ['summary', '核心结论'], ['programs', '项目卡'], ['scoring', '评分依据'], ['dashboard', '作战看板'], ['radar', '政策雷达'], ['report', '报告摘要']
  ];
  return <div className="tabs">{tabs.map(([key, label]) => <button key={key} className={active === key ? 'active' : ''} onClick={() => setActive(key)}>{label}</button>)}</div>;
}

function EmptyState() {
  return <div className="empty-state"><Gauge size={36}/><h3>点击“一键运行完整 Demo”生成申请初筛方案</h3><p>结果将包含德国制成绩、申请梯度、推荐理由、风险证据、下一步任务、政策雷达配置和报告摘要。</p></div>;
}

function Result({ active, demo }) {
  if (active === 'summary') return <Summary demo={demo} />;
  if (active === 'programs') return <Programs demo={demo} />;
  if (active === 'scoring') return <Scoring demo={demo} />;
  if (active === 'dashboard') return <Dashboard demo={demo} />;
  if (active === 'radar') return <RadarView demo={demo} />;
  return <Report demo={demo} />;
}

function Summary({ demo }) {
  const best = demo.matching?.[0];
  return <div className="stack">
    <div className="kpi-grid">
      <Kpi label="德国制参考成绩" value={demo.grade?.value ?? '--'} hint="修正巴伐利亚公式，最终以学校认定为准" tone="blue" />
      <Kpi label="综合推荐档位" value={best?.tier || '--'} hint="基于 8 项启发式评分" />
      <Kpi label="初筛项目数" value={demo.programs?.length || 0} hint="当前为演示种子数据" />
      <Kpi label="高优先级风险" value="APS / ECTS / Deadline" hint="提交前需官网复核" tone="warn" />
    </div>
    <div className="summary-card">
      <h3>输入 → 输出</h3>
      <p><strong>输入：</strong>{demo.profile?.major}，目标 {demo.profile?.targetDirection}，{demo.profile?.crossMajor}，英语 {demo.profile?.english || '待补充'}，APS {demo.profile?.apsStatus || '待补充'}。</p>
      <p><strong>输出：</strong>{demo.executiveSummary?.mainConclusion}</p>
      <p><strong>边界：</strong>{demo.executiveSummary?.boundary}</p>
    </div>
    <div className="summary-card opc">
      <h3>对照 OPC 竞赛评分维度</h3>
      <div className="opc-grid">
        <span>场景真实性与闭环验证 35%</span><span>真实成绩计算 + 完整初筛闭环 + 诚信标注</span>
        <span>商业价值与可持续 30%</span><span>B2C/B2B 双路径 + 可复用评分模型</span>
        <span>工具整合与替代 25%</span><span>数据分析 / 浏览器核验 / 看板 / 政策雷达 / PPT 工作流</span>
        <span>表达清晰 10%</span><span>3 秒可懂首屏 + 核心结论卡</span>
      </div>
    </div>
  </div>;
}

function Programs({ demo }) {
  return <div className="program-list">{demo.programs.map((p, i) => {
    const m = demo.matching[i];
    return <article className="program-card" key={p.id}>
      <div className="program-head"><div><h3>{p.university}</h3><p>{p.programName}</p></div><div className="score-pill">{m.matchScore}/100</div></div>
      <div className="badges"><Badge tone="blue">{p.universityType}</Badge><Badge tone="green">{m.tier}</Badge><Badge tone="yellow">{p.reviewRequired ? '待官网复核' : '已核验'}</Badge><Badge tone="gray">演示数据</Badge></div>
      <div className="two-col">
        <InfoBlock title="推荐理由" items={m.recommendationReasons} />
        <InfoBlock title="风险证据" items={m.riskEvidence} danger />
      </div>
      <InfoBlock title="下一步任务" items={m.nextTasks} />
      <div className="field-confidence">
        <h4>字段可信度</h4>
        {Object.entries(p.fieldConfidence || {}).map(([k, v]) => <span key={k}>{k}：<b>{v}</b></span>)}
      </div>
      <a className="source-link" href={p.sourceUrl} target="_blank" rel="noreferrer"><Globe2 size={16}/>来源线索：{p.sourceUrl}</a>
    </article>;
  })}</div>;
}

function InfoBlock({ title, items = [], danger }) {
  return <div className={`info-block ${danger ? 'danger' : ''}`}><h4>{title}</h4><ul>{items.map((item, idx) => <li key={idx}>{item}</li>)}</ul></div>;
}

function Scoring({ demo }) {
  return <div className="stack">
    <div className="summary-card">
      <h3>评分模型依据</h3>
      <p>8 项权重参考德国硕士申请实际审核逻辑：成绩与课程/ECTS 是主要学术硬门槛，语言和 APS 是硬性材料，项目经历为加分项；deadline 风险和数据可信度用于约束申请节奏与信息可靠性。该模型是启发式初筛，不代表学校录取模型，也不提供录取概率保证。</p>
    </div>
    {demo.matching.map((m) => <div className="score-card" key={m.programId}>
      <div className="program-head"><div><h3>{m.university}</h3><p>{m.programName}</p></div><div className="score-pill">{m.matchScore}/100</div></div>
      <div className="score-grid">{m.scoreParts.map(part => <div className="score-row" key={part.key}><div><strong>{part.key}</strong><small>{part.reason}</small></div><span>{part.score}/{part.weight}</span></div>)}</div>
    </div>)}
  </div>;
}

function Dashboard({ demo }) {
  return <div className="table-wrap"><table><thead><tr><th>学校</th><th>项目</th><th>梯度</th><th>申请路径</th><th>Deadline</th><th>阻塞项</th><th>下一步</th><th>优先级</th></tr></thead><tbody>{demo.dashboard.map((r, i) => <tr key={i}><td>{r.university}</td><td>{r.programName}</td><td>{r.tier}</td><td>{r.applicationPath}</td><td>{r.deadline}</td><td>{r.blocker}</td><td>{r.nextStep}</td><td>{r.priority}</td></tr>)}</tbody></table></div>;
}

function RadarView({ demo }) {
  const radar = demo.policyRadar;
  return <div className="stack"><div className="summary-card"><h3><Radar size={18}/> {radar.taskName}</h3><p><strong>频率：</strong>{radar.frequency}</p><p><strong>状态：</strong>{radar.systemTaskStatus}</p></div><div className="table-wrap"><table><thead><tr><th>日期</th><th>学校</th><th>检查项</th><th>当前信息</th><th>影响</th><th>建议动作</th></tr></thead><tbody>{radar.firstRun.map((r, i) => <tr key={i}><td>{r.date}</td><td>{r.university}</td><td>{r.checks}</td><td>{r.currentInfo}</td><td>{r.impact}</td><td>{r.suggestedAction}</td></tr>)}</tbody></table></div></div>;
}

function Report({ demo }) {
  const e = demo.efficiency?.summary || {};
  return <div className="stack">
    <div className="kpi-grid"><Kpi label="传统流程" value={e.traditional}/><Kpi label="Demo 流程" value={e.system}/><Kpi label="效率提升估算" value={`${e.improvement}x`}/><Kpi label="可溯源信息" value={e.traceableItems}/></div>
    <div className="summary-card"><h3>报告摘要</h3><p>本次 Demo 共覆盖 {e.projects} 个项目，识别 {e.highRisks} 类高风险事项，生成 {e.deliverables} 类交付物。所有种子项目均保留来源线索与待复核标注，避免将未核验信息包装成确定结论。</p></div>
    <div className="draft-box"><h3>文书/课程匹配示例</h3><pre>{demo.drafts?.courseMappingStatement}</pre></div>
  </div>;
}

createRoot(document.getElementById('root')).render(<App />);
