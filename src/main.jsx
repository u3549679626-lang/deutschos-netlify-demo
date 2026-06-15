import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const api = async (path, payload = {}) => {
  const res = await fetch(`/.netlify/functions/api${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(`API ${path} failed`);
  return res.json();
};

const demoProfile = {
  name: 'Demo Applicant',
  university: '中国本科院校（演示）',
  major: '信息管理与信息系统 / 商科与数据方向交叉背景',
  targetDirection: '数据科学与人工智能',
  crossMajor: '部分跨专业',
  averageScore: 84,
  maxScore: 100,
  passScore: 60,
  english: 'IELTS 6.5（演示输入，需按项目官网复核）',
  german: '未提供',
  apsStatus: '未开始',
  experiences: 'Python 数据分析课程项目、用户行为分析 Demo、课程论文与毕业设计素材（演示）'
};

const tabs = [
  ['overview', '核心结论'],
  ['programs', '项目卡'],
  ['scoring', '评分依据'],
  ['dashboard', '作战看板'],
  ['radar', '政策雷达'],
  ['report', '报告摘要']
];

const statusClass = (value = '') => {
  if (/已核验|已提供|真实计算/.test(value)) return 'ok';
  if (/不稳定|过期|待|复核|人工/.test(value)) return 'warn';
  return 'info';
};

const downloadText = (filename, text) => {
  const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

function buildMarkdownReport(result) {
  if (!result?.ok) return '# DeutschOS 初筛诊断报告\n\n暂无有效结果。';
  const p = result.profile || {};
  const g = result.grade || {};
  const programs = result.programs || [];
  const matching = result.matching || [];
  const generated = result.generatedAt || new Date().toISOString();
  const programLines = programs.map((program, i) => {
    const m = matching[i] || {};
    const fields = Object.entries(program.fieldConfidence || {})
      .map(([k, v]) => `  - ${k}: ${v}`)
      .join('\n');
    return `## ${i + 1}. ${program.university} - ${program.programName}\n\n- 类型：${program.universityType}\n- 匹配分：${m.matchScore ?? '待评分'} / 100\n- 梯度：${m.tier || '待评估'}\n- 风险等级：${m.riskLevel || '待评估'}\n- 来源：${program.sourceUrl}\n- 最近生成/核验日期：${String(program.checkedAt || generated).slice(0, 10)}\n- 项目数据边界：演示种子数据，申请前必须官网复核\n\n### 推荐理由\n${(m.recommendationReasons || []).map(x => `- ${x}`).join('\n')}\n\n### 风险证据\n${(m.riskEvidence || []).map(x => `- ${x}`).join('\n')}\n\n### 字段级可信度\n${fields}\n\n### 下一步任务\n${(m.nextTasks || []).map(x => `- ${x}`).join('\n')}\n`;
  }).join('\n');

  return `# DeutschOS 德国硕士申请初筛诊断报告\n\n生成时间：${generated}\n\n> 当前报告为 MVP 初筛诊断，不代表录取概率，不替代学校、uni-assist 或 APS 的官方审核。\n\n## 一、申请者输入摘要\n\n- 姓名：${p.name || '未填写'}\n- 本科院校：${p.university || '未填写'}\n- 本科专业：${p.major || '未填写'}\n- 目标方向：${p.targetDirection || '未填写'}\n- 跨专业状态：${p.crossMajor || '未填写'}\n- 语言状态：${p.english || '未填写'}\n- APS 状态：${p.apsStatus || '未填写'}\n\n## 二、德国制成绩换算\n\n- 原始均分：${g.rawAverage}\n- 满分：${g.maxScore}\n- 及格线：${g.passScore}\n- 公式：${g.formula}\n- 计算过程：${g.process}\n- 德国制参考成绩：**${g.value}**\n- 参数来源：${g.parameterSource}\n- 备注：${g.remark}\n\n## 三、示范项目初筛结果\n\n当前 Demo 使用 **TUM / Saarland University / TH Köln 三个示范院校 + 引擎可扩展** 验证流程闭环，不声称已覆盖大量院校。\n\n${programLines}\n\n## 四、可信度与边界\n\n- 成绩换算：真实计算。\n- 项目要求：演示种子数据 + 来源入口，提交前必须官网复核。\n- 评分模型：启发式初筛模型，用于风险排序，不代表录取概率。\n- 政策雷达：Demo 配置展示，待长期运行验证。\n- 效率表达：初筛从数天缩短到分钟级（基于作者真实申请经历对比），未使用无依据精确倍数。\n\n## 五、建议下一步\n\n1. 上传或整理成绩单与课程描述，补齐数学/统计/计算机/专业核心 ECTS。\n2. 逐项目打开 admission、deadline、language、application procedure 页面并保存截图。\n3. 推进 APS，核对是否需要 VPD / uni-assist / 直申。\n4. 将风险证据转化为 Motivation Letter 与课程匹配说明。\n`;
}

function FieldConfidenceTable({ program }) {
  const rows = [
    ['项目名称', program.fieldConfidence?.programName || '演示数据 / 待官网复核'],
    ['来源链接', program.sourceUrl ? '已提供来源入口' : '待补充'],
    ['抓取/生成日期', String(program.checkedAt || '').slice(0, 10) || '待补充'],
    ['Deadline', program.fieldConfidence?.deadline || '待人工复核'],
    ['申请路径', program.fieldConfidence?.applicationPath || '待人工复核'],
    ['APS 要求', program.fieldConfidence?.aps || '待人工复核'],
    ['课程/ECTS', program.fieldConfidence?.ects || '待人工复核'],
    ['NC / Selection', program.fieldConfidence?.nc || '待人工复核']
  ];
  return <div className="field-table">
    {rows.map(([k, v]) => <div className="field-row" key={k}>
      <span>{k}</span><b className={`pill ${statusClass(v)}`}>{v}</b>
    </div>)}
    {program.university === 'TH Köln' && <p className="warning-line">TH Köln 当前官方详情页链接不稳定，项目详情需人工重新核验。</p>}
  </div>;
}

function ScoreParts({ parts = [] }) {
  return <div className="score-grid">
    {parts.map(part => <article className="score-part" key={part.key}>
      <div className="score-top"><b>{part.key}</b><span>{part.score} / {part.weight}</span></div>
      <div className="bar"><i style={{ width: `${Math.min(100, (part.score / part.weight) * 100)}%` }} /></div>
      <p>{part.reason}</p>
    </article>)}
  </div>;
}

function App() {
  const [profile, setProfile] = useState(demoProfile);
  const [result, setResult] = useState(null);
  const [active, setActive] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const update = (key, value) => setProfile(prev => ({ ...prev, [key]: value }));

  const runDemo = async (usePreset = false) => {
    setLoading(true); setError('');
    try {
      const payloadProfile = usePreset ? demoProfile : profile;
      if (usePreset) setProfile(demoProfile);
      const data = await api('/demo/run', { profile: payloadProfile });
      if (!data.ok) throw new Error(data.error || '输入校验失败');
      setResult(data);
      setActive('overview');
    } catch (e) {
      setError(e.message || '运行失败');
    } finally {
      setLoading(false);
    }
  };

  const reportMarkdown = useMemo(() => buildMarkdownReport(result), [result]);

  return <div className="app">
    <header className="hero">
      <div className="eyebrow">DeutschOS MVP · 可信初筛 / 风险证据 / 材料作战</div>
      <h1>德国硕士申请初筛与材料作战工作台</h1>
      <p className="lead">输入申请者背景，生成德国制成绩、示范项目匹配、风险证据、下一步任务和可信度标注。</p>
      <div className="hero-tags">
        <span>真实计算：84/100/60 → 2.20</span>
        <span>示范院校：TUM / Saarland / TH Köln</span>
        <span>诚信边界：来源、日期、待复核</span>
      </div>
      <div className="hero-actions">
        <button onClick={() => runDemo(true)} disabled={loading}>{loading ? '生成中…' : '一键运行完整 Demo'}</button>
        <button className="ghost" onClick={() => document.querySelector('#input-panel')?.scrollIntoView({ behavior: 'smooth' })}>手动输入背景</button>
      </div>
      <p className="boundary">本 Demo 使用三个示范院校验证流程闭环，后续引擎可扩展；不声称覆盖大量院校，不声称录取概率预测。</p>
    </header>

    <main className="layout">
      <section id="input-panel" className="panel input-panel">
        <h2>1. 申请者背景输入</h2>
        <div className="form-grid">
          <label>姓名<input value={profile.name} onChange={e => update('name', e.target.value)} /></label>
          <label>本科院校<input value={profile.university} onChange={e => update('university', e.target.value)} /></label>
          <label>本科专业<input value={profile.major} onChange={e => update('major', e.target.value)} /></label>
          <label>目标方向<input value={profile.targetDirection} onChange={e => update('targetDirection', e.target.value)} /></label>
          <label>跨专业状态<select value={profile.crossMajor} onChange={e => update('crossMajor', e.target.value)}>
            <option>否</option><option>部分跨专业</option><option>是</option>
          </select></label>
          <label>APS 状态<select value={profile.apsStatus} onChange={e => update('apsStatus', e.target.value)}>
            <option>未开始</option><option>准备中</option><option>已递交</option><option>已通过</option><option>不确定</option>
          </select></label>
          <label>均分<input type="number" value={profile.averageScore} onChange={e => update('averageScore', e.target.value)} /></label>
          <label>满分<input type="number" value={profile.maxScore} onChange={e => update('maxScore', e.target.value)} /></label>
          <label>及格线<input type="number" value={profile.passScore} onChange={e => update('passScore', e.target.value)} /></label>
          <label className="wide">英语成绩<input value={profile.english} onChange={e => update('english', e.target.value)} /></label>
          <label className="wide">项目 / 实习 / 课程素材<textarea value={profile.experiences} onChange={e => update('experiences', e.target.value)} /></label>
        </div>
        <button className="run" onClick={() => runDemo(false)} disabled={loading}>{loading ? '生成中…' : '生成初筛诊断'}</button>
        {error && <p className="error">{error}</p>}
      </section>

      <section className="panel result-panel">
        <div className="result-head">
          <div>
            <h2>2. 初筛结果与可解释报告</h2>
            <p>核心目标：把“为什么推荐 / 风险在哪 / 下一步做什么”讲清楚。</p>
          </div>
          {result?.ok && <button className="download" onClick={() => downloadText('deutschos-initial-screening-report.md', reportMarkdown)}>下载初筛诊断报告</button>}
        </div>

        {!result?.ok && <div className="empty">
          <b>尚未生成结果</b>
          <p>点击“一键运行完整 Demo”或手动输入背景后生成。报告会明确区分真实计算、演示数据和待人工复核项。</p>
        </div>}

        {result?.ok && <>
          <nav className="tabs">{tabs.map(([id, label]) => <button key={id} className={active === id ? 'active' : ''} onClick={() => setActive(id)}>{label}</button>)}</nav>

          {active === 'overview' && <div className="tab-content">
            <div className="kpi-grid">
              <article><span>德国制参考成绩</span><b>{Number(result.grade.value).toFixed(2)}</b><small>{result.grade.process}</small></article>
              <article><span>示范院校</span><b>3 个</b><small>TUM / Saarland University / TH Köln + 引擎可扩展</small></article>
              <article><span>最高匹配分</span><b>{Math.max(...result.matching.map(m => m.matchScore))}</b><small>启发式评分，不代表录取概率</small></article>
            </div>
            <div className="formula-card">
              <h3>输入 → 计算 → 输出证据链</h3>
              <p><b>公式：</b>{result.grade.formula}</p>
              <p><b>计算：</b>{result.grade.process}</p>
              <p><b>边界：</b>{result.grade.remark}；正式申请以学校或 uni-assist 认定为准。</p>
            </div>
            <div className="honesty-card">
              <h3>本次 Demo 的诚实边界</h3>
              <ul>
                <li>成绩换算和评分为浏览器/接口真实计算。</li>
                <li>院校数量按“三个示范院校 + 引擎可扩展”表达，不写 400 所/100 所。</li>
                <li>效率只表达为“初筛从数天缩短到分钟级（基于作者真实申请经历对比）”。</li>
                <li>政策雷达为 Demo 配置展示，待长期运行验证。</li>
              </ul>
            </div>
          </div>}

          {active === 'programs' && <div className="cards">
            {result.programs.map((p, i) => {
              const m = result.matching[i];
              return <article className="program-card" key={p.id}>
                <div className="program-title">
                  <div><span>{p.universityType}</span><h3>{p.university}</h3><p>{p.programName}</p></div>
                  <b>{m.matchScore} / 100</b>
                </div>
                <div className="meta"><span>{m.tier}</span><span>风险：{m.riskLevel}</span><span>{p.teachingLanguage}</span></div>
                <h4>推荐理由</h4><ul>{m.recommendationReasons.map(x => <li key={x}>{x}</li>)}</ul>
                <h4>风险证据</h4><ul className="risk-list">{m.riskEvidence.map(x => <li key={x}>{x}</li>)}</ul>
                <h4>字段级可信度</h4><FieldConfidenceTable program={p} />
                <h4>下一步任务</h4><ol>{m.nextTasks.map(x => <li key={x}>{x}</li>)}</ol>
                <a href={p.sourceUrl} target="_blank" rel="noreferrer">打开来源入口</a>
              </article>;
            })}
          </div>}

          {active === 'scoring' && <div className="tab-content">
            <h3>启发式评分模型：用于初筛，不代表录取概率</h3>
            <p className="boundary-box">评分由成绩、专业相关度、课程/ECTS、语言、APS、项目经历、deadline 风险和数据可信度构成。当前未做历史录取结果校准，因此不声称准确率。</p>
            {result.matching.map(m => <section className="score-section" key={m.programId}>
              <h4>{m.university} · {m.programName} <span>{m.matchScore} / 100</span></h4>
              <ScoreParts parts={m.scoreParts} />
            </section>)}
          </div>}

          {active === 'dashboard' && <div className="tab-content">
            <h3>多校作战看板</h3>
            <table><thead><tr><th>学校</th><th>梯度</th><th>当前状态</th><th>阻塞项</th><th>下一步</th><th>优先级</th></tr></thead><tbody>
              {result.dashboard.map(r => <tr key={r.university}><td>{r.university}</td><td>{r.tier}</td><td>{r.status}</td><td>{r.blocker}</td><td>{r.nextStep}</td><td>{r.priority}</td></tr>)}
            </tbody></table>
          </div>}

          {active === 'radar' && <div className="tab-content">
            <h3>政策雷达配置原型</h3>
            <p className="boundary-box">当前状态：Demo 配置展示，待长期运行验证。正式版需接入定时抓取、页面差异检测、通知和历史版本留存。</p>
            <div className="radar-box"><b>{result.policyRadar.taskName}</b><span>频率：{result.policyRadar.frequency}</span><span>{result.policyRadar.systemTaskStatus}</span></div>
            <table><thead><tr><th>日期</th><th>学校</th><th>检查项</th><th>影响</th><th>建议动作</th></tr></thead><tbody>
              {result.policyRadar.firstRun.map((r, i) => <tr key={i}><td>{r.date}</td><td>{r.university}</td><td>{r.checks}</td><td>{r.impact}</td><td>{r.suggestedAction}</td></tr>)}
            </tbody></table>
          </div>}

          {active === 'report' && <div className="tab-content">
            <h3>报告摘要：以诚实口径展示效率与质量</h3>
            <div className="summary-card"><b>{result.efficiency.summary.efficiencyStatement}</b><p>{result.efficiency.summary.quantificationBoundary}</p></div>
            <table><thead><tr><th>环节</th><th>传统方式</th><th>DeutschOS Demo</th><th>证据边界</th></tr></thead><tbody>
              {result.efficiency.rows.map(r => <tr key={r.stage}><td>{r.stage}</td><td>{r.manual}</td><td>{r.system}</td><td>{r.evidence}</td></tr>)}
            </tbody></table>
            <h4>质量边界</h4><ul>{result.efficiency.quality.map(q => <li key={q.metric}><b>{q.metric}：</b>{q.count}</li>)}</ul>
          </div>}
        </>}
      </section>
    </main>
  </div>;
}

createRoot(document.getElementById('root')).render(<App />);
