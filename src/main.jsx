import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const api = async (path, payload = {}) => {
  const request = async (base) => {
    const res = await fetch(`${base}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`API ${path} failed via ${base}`);
    return res.json();
  };
  try {
    return await request('/api');
  } catch (error) {
    // 兼容旧 Netlify 部署；Vercel 发布时默认走 /api。
    return request('/.netlify/functions/api');
  }
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
  ['experts', '专家团会诊'],
  ['programs', '项目核验'],
  ['scoring', '评分依据'],
  ['dashboard', '作战看板'],
  ['radar', '政策雷达'],
  ['report', '报告摘要'],
  ['ai', 'AI 顾问']
];


const expertRoles = [
  {
    name: 'DeutschOS｜申请总控专家',
    role: '统筹申请者档案、项目匹配、官网核验、文书与风险控制，决定是否进入顾问交付。',
    output: '总控结论 / 交付状态 / 顾问复核清单',
    status: '待顾问复核',
    risk: '中'
  },
  {
    name: '申请者背景画像专家',
    role: '结构化本科背景、成绩、语言、APS、经历和跨专业说明。',
    output: '申请者画像 / 优势风险 / 待补材料',
    status: '已完成初筛',
    risk: '中'
  },
  {
    name: '院校项目核验专家',
    role: '核验学校官网、项目页面、deadline、语言要求、申请路径、APS/VPD/uni-assist。',
    output: '项目核验表 / 来源链接 / 抓取日期 / 待人工核实项',
    status: '部分待官网复核',
    risk: '高'
  },
  {
    name: '课程匹配与风险诊断专家',
    role: '比对课程模块、ECTS/学分、专业相关性与跨专业风险。',
    output: '课程匹配分 / 缺口模块 / 补强建议',
    status: '待课程描述补充',
    risk: '中'
  },
  {
    name: '申请文书与材料表达专家',
    role: '基于真实经历生成 Motivation Letter、课程匹配说明与材料表达建议。',
    output: '文书初稿 / 素材使用说明 / 真实性检查',
    status: '可生成初稿',
    risk: '中'
  },
  {
    name: '申请任务看板与汇报专家',
    role: '拆解 APS、语言、VPD、网申、材料、文书和 deadline 任务。',
    output: '多校作战看板 / 本周任务 / 阻塞项',
    status: '已生成看板',
    risk: '中'
  },
  {
    name: '申请风控与合规专家',
    role: '检查录取承诺、来源缺失、政策过期、路径误判和人工复核边界。',
    output: '风险门禁 / 合规声明 / 不可交付项',
    status: '待最终门禁',
    risk: '高'
  }
];

const buildConsultantReview = (result) => {
  const pendingSources = (result?.programs || []).reduce((sum, program) => {
    const values = Object.values(program.fieldConfidence || {});
    return sum + values.filter(v => /待|人工|复核|演示|入口/.test(String(v))).length;
  }, 0);
  const grade = result?.grade?.value ? Number(result.grade.value).toFixed(2) : '待计算';
  return [
    ['申请者信息是否完整', result?.profile?.apsStatus === '已通过' ? '基本完整' : '待补充', `APS 状态：${result?.profile?.apsStatus || '未提供'}；语言和课程描述仍需顾问确认。`],
    ['成绩换算是否标注参考性质', '已完成', `德国制参考成绩 ${grade}，仅用于初筛，正式认定以学校或 uni-assist 为准。`],
    ['项目要求是否有官网来源', pendingSources > 0 ? '部分待复核' : '已核验', `当前存在 ${pendingSources} 个字段需要官网/官方平台二次确认。`],
    ['课程匹配是否存在硬缺口', '待确认', '需上传完整成绩单和课程描述后判断数学、统计、计算机、专业核心课学分。'],
    ['文书是否基于真实经历', '待顾问审核', '文书只能使用申请者已提供经历，不编造科研、实习、获奖或项目。'],
    ['是否可交付学生', pendingSources > 0 ? '暂不可直接交付' : '可进入顾问复核', '专家团输出是顾问审核前初筛，不替代人工判断，不承诺录取。']
  ];
};

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
  if (!result?.ok) return '# DeutschOS 专家团顾问工作台诊断报告\n\n暂无有效结果。';
  const p = result.profile || {};
  const g = result.grade || {};
  const programs = result.programs || [];
  const matching = result.matching || [];
  const generated = result.generatedAt || new Date().toISOString();
  const programLines = programs.map((program, i) => {
    const m = matching[i] || {};
    const fields = Object.entries(program.fieldConfidence || {}).map(([k, v]) => `  - ${k}: ${v}`).join('\n');
    return `## ${i + 1}. ${program.university} - ${program.programName}\n\n- 类型：${program.universityType}\n- 匹配分：${m.matchScore ?? '待评分'} / 100\n- 梯度：${m.tier || '待评估'}\n- 风险等级：${m.riskLevel || '待评估'}\n- 来源：${program.sourceUrl}\n- 最近生成/核验日期：${String(program.checkedAt || generated).slice(0, 10)}\n- 项目数据边界：演示种子数据，申请前必须官网复核\n\n### 推荐理由\n${(m.recommendationReasons || []).map(x => `- ${x}`).join('\n')}\n\n### 风险证据\n${(m.riskEvidence || []).map(x => `- ${x}`).join('\n')}\n\n### 字段级可信度\n${fields}\n\n### 下一步任务\n${(m.nextTasks || []).map(x => `- ${x}`).join('\n')}\n`;
  }).join('\n');
  const expertLines = expertRoles.map(expert => `- ${expert.name}：${expert.status}；输出：${expert.output}`).join('\n');

  return `# DeutschOS 专家团顾问工作台诊断报告\n\n生成时间：${generated}\n\n> 当前报告由 DeutschOS 德国硕士申请专家团生成，定位为留学顾问审核前初筛材料；不承诺录取，不替代学校官网、uni-assist、DAAD、APS 或顾问人工判断。\n\n## 一、申请者输入摘要\n\n- 姓名：${p.name || '未填写'}\n- 本科院校：${p.university || '未填写'}\n- 本科专业：${p.major || '未填写'}\n- 目标方向：${p.targetDirection || '未填写'}\n- 跨专业状态：${p.crossMajor || '未填写'}\n- 语言状态：${p.english || '未填写'}\n- APS 状态：${p.apsStatus || '未填写'}\n\n## 二、专家团会诊状态\n\n${expertLines}\n\n## 三、德国制成绩换算\n\n- 原始均分：${g.rawAverage}\n- 满分：${g.maxScore}\n- 及格线：${g.passScore}\n- 公式：${g.formula}\n- 计算过程：${g.process}\n- 德国制参考成绩：**${g.value}**\n- 参数来源：${g.parameterSource}\n- 备注：${g.remark}\n\n## 四、示范项目核验与初筛结果\n\n当前 Demo 使用 **TUM / Saarland University / TH Köln 三个示范院校 + 引擎可扩展** 验证流程闭环，不声称已覆盖大量院校。所有 deadline、语言要求、申请路径、NC、APS、VPD、uni-assist 信息均须以官网或官方平台最终信息为准。\n\n${programLines}\n\n## 五、顾问审核门禁\n\n${buildConsultantReview(result).map(([item, status, note]) => `- ${item}：${status}。${note}`).join('\n')}\n\n## 六、可信度与边界\n\n- 成绩换算：真实计算，但仅为参考值。\n- 项目要求：演示种子数据 + 来源入口，提交前必须官网复核。\n- 评分模型：启发式初筛模型，用于风险排序，不代表录取概率。\n- 政策雷达：Demo 配置展示，待长期运行验证。\n- 顾问责任：专家团输出用于提高整理效率，最终交付前必须由顾问复核。\n\n## 七、建议下一步\n\n1. 上传或整理成绩单与课程描述，补齐数学/统计/计算机/专业核心 ECTS。\n2. 逐项目打开 admission、deadline、language、application procedure 页面并保存截图。\n3. 推进 APS，核对是否需要 VPD / uni-assist / 直申。\n4. 将风险证据转化为 Motivation Letter 与课程匹配说明。\n5. 由顾问完成最终审核后，再交付给申请者。\n`;
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
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAdvice, setAiAdvice] = useState(null);
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
      setAiAdvice(null);
      setActive('overview');
    } catch (e) {
      setError(e.message || '运行失败');
    } finally {
      setLoading(false);
    }
  };

  const reportMarkdown = useMemo(() => buildMarkdownReport(result), [result]);


  const requestAiAdvice = async () => {
    if (!result?.ok) return;
    setAiLoading(true); setError('');
    try {
      const data = await api('/ai/advice', { profile: result.profile, programs: result.programs });
      setAiAdvice(data);
      setActive('ai');
    } catch (e) {
      setError(e.message || 'AI 顾问调用失败');
    } finally {
      setAiLoading(false);
    }
  };

  return <div className="app">
    <header className="hero">
      <div className="eyebrow">DeutschOS MVP · 专家团会诊 / 顾问审核 / 风险证据</div>
      <h1>德国硕士申请专家团顾问工作台</h1>
      <p className="lead">输入申请者背景后，由 DeutschOS 专家团完成初筛会诊，输出项目核验、课程风险、申请任务和顾问审核清单。</p>
      <div className="hero-tags">
        <span>真实计算：84/100/60 → 2.20</span>
        <span>示范院校：TUM / Saarland / TH Köln</span>
        <span>顾问门禁：来源、日期、待人工核实</span>
      </div>
      <div className="hero-actions">
        <button onClick={() => runDemo(true)} disabled={loading}>{loading ? '生成中…' : '一键运行完整 Demo'}</button>
        <button className="ghost" onClick={() => document.querySelector('#input-panel')?.scrollIntoView({ behavior: 'smooth' })}>手动输入背景</button>
      </div>
      <p className="boundary">本 Demo 展示“专家团初筛 + 顾问复核”的留学中介工作流；专家团输出不等于最终申请结论，不承诺录取。</p>
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
            <h2>2. 专家团初筛与顾问审核结果</h2>
            <p>核心目标：把“专家如何分工 / 风险在哪 / 顾问如何把关 / 下一步做什么”讲清楚。</p>
          </div>
          {result?.ok && <div className="result-actions"><button className="ai-button" onClick={requestAiAdvice} disabled={aiLoading}>{aiLoading ? 'AI 生成中…' : '生成 AI 顾问建议'}</button><button className="download" onClick={() => downloadText('deutschos-expert-workbench-report.md', reportMarkdown)}>下载专家团诊断报告</button></div>}
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
              <article><span>专家团状态</span><b>7 位</b><small>已完成初筛会诊，等待顾问最终审核</small></article>
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


          {active === 'experts' && <div className="tab-content">
            <div className="section-title-row">
              <div>
                <h3>专家团会诊：AI 初筛输出，顾问最终把关</h3>
                <p>基于你已配置的 DeutschOS 德国硕士申请专家团，本区将留学中介服务拆成总控、画像、核验、课程、文书、看板和风控七个环节。</p>
              </div>
              <span className="review-badge">顾问审核前初筛</span>
            </div>
            <div className="expert-grid">
              {expertRoles.map(expert => <article className="expert-card" key={expert.name}>
                <div className="expert-card-head">
                  <h4>{expert.name}</h4>
                  <span className={`pill ${expert.risk === '高' ? 'warn' : 'info'}`}>风险：{expert.risk}</span>
                </div>
                <p>{expert.role}</p>
                <dl>
                  <dt>输出</dt><dd>{expert.output}</dd>
                  <dt>状态</dt><dd><span className={`pill ${statusClass(expert.status)}`}>{expert.status}</span></dd>
                </dl>
              </article>)}
            </div>

            <div className="consultant-gate">
              <h3>顾问审核门禁</h3>
              <p className="boundary-box">专家团负责把复杂申请信息整理成可复核的初筛材料；留学顾问负责最终判断、官网复核、材料真实性确认和交付口径把关。</p>
              <table><thead><tr><th>审核项</th><th>状态</th><th>顾问备注</th></tr></thead><tbody>
                {buildConsultantReview(result).map(([item, status, note]) => <tr key={item}><td>{item}</td><td><span className={`pill ${statusClass(status)}`}>{status}</span></td><td>{note}</td></tr>)}
              </tbody></table>
            </div>

            <div className="workflow-strip">
              {['申请者输入', '专家团会诊', '官网/材料复核', '顾问审核', '方案交付'].map((step, index) => <span key={step}>{index + 1}. {step}</span>)}
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



          {active === 'ai' && <div className="tab-content">
            <h3>AI 顾问建议：服务端安全代理</h3>
            <p className="boundary-box">安全说明：真实 API Key 只允许配置在 Netlify 服务端环境变量 <b>DEEPSEEK_API_KEY</b> 中；公开 GitHub、前端代码和构建产物不包含密钥。若未配置环境变量，本页会返回本地规则兜底建议。</p>
            {!aiAdvice && <div className="empty"><b>尚未生成 AI 建议</b><p>点击右上角“生成 AI 顾问建议”。</p></div>}
            {aiAdvice && <div className="ai-card">
              <div className="ai-meta"><span>模式：{aiAdvice.mode}</span><span>提供方：{aiAdvice.provider}</span></div>
              {aiAdvice.warning && <p className="warning-line">{aiAdvice.warning}</p>}
              <h4>建议解读</h4>
              <ul>{(aiAdvice.advice || []).map((x, i) => <li key={`a-${i}`}>{x}</li>)}</ul>
              {!!aiAdvice.riskWarnings?.length && <><h4>风险提醒</h4><ul className="risk-list">{aiAdvice.riskWarnings.map((x, i) => <li key={`r-${i}`}>{x}</li>)}</ul></>}
              <h4>下一步动作</h4>
              <ol>{(aiAdvice.nextActions || []).map((x, i) => <li key={`n-${i}`}>{x}</li>)}</ol>
            </div>}
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
