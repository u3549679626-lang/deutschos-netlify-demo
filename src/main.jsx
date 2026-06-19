
import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const api = async (path, payload = {}, options = {}) => {
  const method = options.method || 'POST';
  const request = async (base) => {
    const init = {
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (method !== 'GET') init.body = JSON.stringify(payload);
    const res = await fetch(`${base}${path}`, init);
    if (!res.ok) throw new Error(`API ${path} failed via ${base}`);
    return res.json();
  };
  try {
    return await request('/api');
  } catch (error) {
    return request('/.netlify/functions/api');
  }
};

const accounts = [
  { role: 'student', label: '申请者', email: 'student@demo.com', password: 'demo123', name: 'Demo Applicant' },
  { role: 'consultant', label: '顾问', email: 'consultant@demo.com', password: 'demo123', name: 'DeutschOS 顾问' },
  { role: 'admin', label: '管理员', email: 'admin@demo.com', password: 'demo123', name: '系统管理员' }
];

const baseApplicant = {
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
  currentStage: '材料准备与项目复核',
  progress: 42,
  consultant: 'DeutschOS 顾问',
  lastPublished: '2026-06-18'
};

const materials = [
  { name: '成绩单', status: '已上传', owner: '申请者', note: '需补英文版或翻译件状态' },
  { name: '课程描述', status: '待补充', owner: '申请者', note: '课程匹配诊断的关键阻塞项' },
  { name: 'CV', status: '待顾问修改', owner: '顾问', note: '已有素材，需按德国项目重排' },
  { name: 'IELTS / TOEFL', status: '待确认', owner: '申请者', note: '需上传官方成绩单并核对小分' },
  { name: 'APS', status: '未开始', owner: '申请者', note: '本周高优先级风险' },
  { name: '推荐信', status: '待确认推荐人', owner: '申请者', note: '建议准备 2 位推荐人' }
];

const approvedPrograms = [
  {
    university: 'Technical University of Munich',
    program: 'Data Engineering and Analytics',
    tier: '冲刺',
    status: '待官网复核',
    deadline: '待官网确认',
    path: '学校官网 / 可能涉及 VPD，待复核',
    risk: '高',
    source: 'https://www.tum.de/',
    consultantNote: '仅作为冲刺样例保留，必须复核课程 ECTS 与申请路径。'
  },
  {
    university: 'Saarland University',
    program: 'Data Science and Artificial Intelligence',
    tier: '匹配',
    status: '材料准备中',
    deadline: '待官网确认',
    path: '官网申请入口，待确认是否需要 uni-assist',
    risk: '中',
    source: 'https://www.uni-saarland.de/',
    consultantNote: '与目标方向相关性较强，需补充统计/编程课程描述。'
  },
  {
    university: 'TH Köln',
    program: 'Web and Data Science',
    tier: '稳妥',
    status: '待人工核实',
    deadline: '待官网确认',
    path: '官网 / 申请平台待核验',
    risk: '中',
    source: 'https://www.th-koeln.de/',
    consultantNote: 'FH/HAW 类型可作为稳妥方向，但官方页面需重新核验。'
  }
];

const weeklyTasks = [
  { title: '补充课程描述：统计学、数据库、Python/编程相关课程', owner: '申请者', due: '本周五', priority: '高', status: '未完成' },
  { title: '整理 APS 材料清单并确认是否开始递交', owner: '申请者', due: '本周五', priority: '高', status: '未完成' },
  { title: '上传 IELTS/TOEFL 官方成绩或考试计划', owner: '申请者', due: '本周三', priority: '高', status: '进行中' },
  { title: '复核 TUM / Saarland / TH Köln 项目申请路径', owner: '顾问', due: '下周一', priority: '高', status: '待处理' },
  { title: '基于真实经历整理 Motivation Letter 素材', owner: '申请者 + 顾问', due: '下周三', priority: '中', status: '待处理' }
];

const weeklyReport = {
  title: '第 1 周申请推进周报',
  period: '每周一定时生成，本版为演示数据',
  summary: '本周重点是补齐课程描述、确认 APS 进度、上传语言成绩，并由顾问复核三个示范项目的申请路径与官网要求。',
  done: ['完成基础档案录入', '完成德国制成绩参考换算：2.20', '建立 3 个示范项目的初步看板'],
  next: ['补课程描述', '确认 APS 材料状态', '复核项目 deadline / VPD / uni-assist', '准备 CV 与动机信素材'],
  risks: ['APS 未开始，可能影响整体申请节奏', '课程描述缺失，无法完成严肃的 ECTS 匹配', '项目 deadline 与申请路径仍需官网复核']
};

const expertOutputs = [
  { expert: '申请者背景画像专家', type: '背景画像', status: '已采纳', visible: true, result: '背景与数据科学方向存在交叉基础，但跨专业解释和课程描述需要补强。' },
  { expert: '院校项目核验专家', type: '项目核验', status: '待顾问复核', visible: false, result: '三个示范项目已有来源入口，但 deadline、VPD、uni-assist、NC 需逐项官网核验。' },
  { expert: '课程匹配与风险诊断专家', type: '课程匹配', status: '待补材料', visible: false, result: '缺少完整课程描述，数学/统计/计算机 ECTS 无法最终判断。' },
  { expert: '申请任务看板与汇报专家', type: '周报任务', status: '已采纳', visible: true, result: '已生成本周任务：课程描述、APS、语言成绩、项目路径复核。' },
  { expert: '申请风控与合规专家', type: '合规风控', status: '强制保留', visible: true, result: '不承诺录取；所有官网要求以官方页面和顾问人工复核为准。' }
];

const projectLibrary = [
  { school: 'TUM', type: 'TU9', records: 1, status: '示范数据，待官网复核' },
  { school: 'Saarland University', type: '综合性大学', records: 1, status: '示范数据，待官网复核' },
  { school: 'TH Köln', type: 'FH/HAW', records: 1, status: '页面链接待重新核验' }
];

const storageKey = 'deutschos.publishedApplicant.v1';

const defaultPortalData = {
  schemaVersion: 'deutschos-sync-v1',
  applicant: baseApplicant,
  materials,
  programs: approvedPrograms,
  tasks: weeklyTasks,
  weeklyReport,
  expertOutputs,
  consultantReview: {
    status: '已发布演示基线',
    reviewer: 'DeutschOS 顾问',
    reviewedAt: '2026-06-18',
    note: '这是系统内置演示数据；顾问可在工作台粘贴小浣熊后台 JSON 后发布覆盖。'
  }
};

const sampleSyncPayload = {
  schemaVersion: 'deutschos-sync-v1',
  applicantId: 'app-001',
  source: {
    system: '小浣熊平台',
    modules: ['专家中心', '数据分析', '每周一定时任务'],
    generatedAt: '2026-06-22T09:00:00+08:00'
  },
  reviewRequired: true,
  consultantReview: {
    status: '待顾问审核',
    reviewer: 'DeutschOS 顾问',
    note: '顾问确认后发布给申请者；未经审核不得直接展示。'
  },
  applicant: {
    currentStage: '材料补强与项目路径复核',
    progress: 56,
    lastPublished: '2026-06-22'
  },
  programs: [
    {
      university: 'Saarland University',
      program: 'Data Science and Artificial Intelligence',
      tier: '匹配',
      status: '优先推进',
      deadline: '待官网最终复核',
      path: '官网申请入口；是否需 uni-assist 待复核',
      risk: '中',
      source: 'https://www.uni-saarland.de/',
      checkedAt: '2026-06-22',
      consultantNote: '目标方向匹配度较高，本周优先补统计/编程课程描述。'
    },
    {
      university: 'TH Köln',
      program: 'Web and Data Science',
      tier: '稳妥',
      status: '可作为保底推进',
      deadline: '待官网最终复核',
      path: '官网 / 申请平台待核验',
      risk: '中',
      source: 'https://www.th-koeln.de/',
      checkedAt: '2026-06-22',
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
    { type: '课程匹配', level: '中', description: '课程描述缺失导致 ECTS 匹配无法最终确认。', suggestedAction: '优先补统计、编程、数据库课程描述。', visibleToApplicant: true },
    { type: '官网核验', level: '中', description: 'deadline、VPD、uni-assist 路径仍需人工复核。', suggestedAction: '由顾问本周完成官网核验。', visibleToApplicant: false }
  ],
  weeklyReport: {
    title: '第 2 周申请推进周报',
    period: '2026-06-22 至 2026-06-28',
    summary: '本周重点从“初步建档”进入“材料补强与项目路径复核”。申请者需补课程描述和 APS 进度，顾问需确认 Saarland 与 TH Köln 的官方申请路径。',
    done: ['完成三角色门户上线', '完成德国制成绩参考换算：2.20', '完成第一轮项目分层草案'],
    next: ['补充课程描述', '推进 APS 材料清单', '复核项目 deadline / VPD / uni-assist', '整理 CV 与动机信素材'],
    risks: ['APS 未开始', '课程描述缺失', '部分项目官网路径待人工复核']
  },
  expertOutputs: [
    { expert: '申请总控专家', type: '总控结论', status: '顾问已审核', visible: true, result: '当前优先级为课程描述补强、APS 启动和两个匹配/稳妥项目路径复核。' },
    { expert: '院校项目核验专家', type: '项目核验', status: '待人工复核', visible: false, result: 'Saarland 与 TH Köln 需确认本申请季 deadline、语言要求和平台路径。' },
    { expert: '申请风控与合规专家', type: '合规风控', status: '强制保留', visible: true, result: '所有官网要求以学校官方页面、uni-assist、DAAD、APS 和顾问人工复核为准；不承诺录取。' }
  ]
};

const sampleSyncJson = JSON.stringify(sampleSyncPayload, null, 2);

function mergePortalData(payload) {
  return {
    schemaVersion: payload.schemaVersion || 'deutschos-sync-v1',
    applicant: { ...baseApplicant, ...(payload.applicant || {}) },
    materials: payload.materials || materials,
    programs: payload.programs || approvedPrograms,
    tasks: payload.tasks || weeklyTasks,
    risks: payload.risks || [],
    weeklyReport: payload.weeklyReport || weeklyReport,
    expertOutputs: payload.expertOutputs || expertOutputs,
    consultantReview: {
      status: '顾问已审核并发布',
      reviewer: 'DeutschOS 顾问',
      reviewedAt: new Date().toISOString().slice(0, 10),
      note: payload.consultantReview?.note || '顾问已将小浣熊后台结果审核后发布给申请者。'
    },
    source: payload.source || { system: '手动同步', generatedAt: new Date().toISOString() }
  };
}

function validateSyncPayload(payload) {
  const errors = [];
  if (!payload || typeof payload !== 'object') errors.push('根对象必须是 JSON object');
  if (!payload.schemaVersion) errors.push('缺少 schemaVersion，建议使用 deutschos-sync-v1');
  if (!payload.applicantId) errors.push('缺少 applicantId');
  if (payload.programs && !Array.isArray(payload.programs)) errors.push('programs 必须是数组');
  if (payload.tasks && !Array.isArray(payload.tasks)) errors.push('tasks 必须是数组');
  if (payload.risks && !Array.isArray(payload.risks)) errors.push('risks 必须是数组');
  if (payload.weeklyReport && !payload.weeklyReport.summary) errors.push('weeklyReport 缺少 summary');
  return errors;
}

function loadPublishedData() {
  try {
    const raw = localStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : defaultPortalData;
  } catch {
    return defaultPortalData;
  }
}

function Status({ value }) {
  const cls = /高|未|待|风险|复核|阻塞/.test(value) ? 'warn' : /已|完成|采纳|通过/.test(value) ? 'ok' : 'info';
  return <span className={`pill ${cls}`}>{value}</span>;
}

function Login({ onLogin }) {
  const [email, setEmail] = useState('student@demo.com');
  const [password, setPassword] = useState('demo123');
  const [error, setError] = useState('');
  const submit = (account) => {
    const target = account || accounts.find(a => a.email === email && a.password === password);
    if (!target) return setError('演示账号或密码不正确，请使用页面下方提供的账号。');
    setError('');
    onLogin(target);
  };
  return <div className="login-shell">
    <section className="login-hero">
      <div className="eyebrow">DeutschOS Step 8 · Supabase 接入诊断</div>
      <h1>前台用户录入，后台小浣熊专家团工作，顾问审核后同步展示</h1>
      <p>本版 Demo 将原专家团工作台升级为三角色门户：申请者提交资料并查看周报，顾问审核小浣熊后台输出，管理员维护项目库、专家团规则和每周定时任务。</p>
      <div className="flow-strip"><span>申请者录入</span><b>→</b><span>小浣熊后台分析</span><b>→</b><span>顾问审核</span><b>→</b><span>前台展示</span></div>
    </section>
    <section className="login-card">
      <h2>演示登录</h2>
      <label>邮箱<input value={email} onChange={e => setEmail(e.target.value)} /></label>
      <label>密码<input type="password" value={password} onChange={e => setPassword(e.target.value)} /></label>
      {error && <div className="error">{error}</div>}
      <button className="primary" onClick={() => submit()}>登录门户</button>
      <div className="demo-accounts">
        {accounts.map(a => <button key={a.role} onClick={() => submit(a)}><b>{a.label}</b><small>{a.email} / demo123</small></button>)}
      </div>
      <p className="note">第一版为演示登录，不接真实注册；后续可升级 Supabase Auth。</p>
    </section>
  </div>;
}

function Shell({ user, onLogout, children }) {
  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><b>DeutschOS</b><span>申请者门户 + 小浣熊后台</span></div>
      <nav>
        <a>首页</a><a>申请档案</a><a>项目 / 任务</a><a>周报</a><a>顾问审核</a>
      </nav>
      <div className="user-box"><span>当前角色</span><b>{user.label}</b><small>{user.email}</small><button onClick={onLogout}>退出登录</button></div>
    </aside>
    <main className="workspace">{children}</main>
  </div>;
}

function Header({ eyebrow, title, desc, actions }) {
  return <header className="page-head"><div><span>{eyebrow}</span><h1>{title}</h1><p>{desc}</p></div>{actions && <div className="head-actions">{actions}</div>}</header>;
}

function StudentPortal({ runResult, onRunDemo, portalData, portalMode }) {
  const applicant = portalData.applicant;
  const portalMaterials = portalData.materials || materials;
  const portalPrograms = portalData.programs || approvedPrograms;
  const portalTasks = portalData.tasks || weeklyTasks;
  const portalReport = portalData.weeklyReport || weeklyReport;
  const portalOutputs = portalData.expertOutputs || expertOutputs;
  const visibleOutputs = portalOutputs.filter(x => x.visible);
  const visibleRisks = (portalData.risks || []).filter(r => r.visibleToApplicant !== false);
  return <>
    <Header eyebrow="申请者门户" title="我的德国硕士申请进度" desc="你只能看到顾问审核后发布的内容；后台专家团原始分析不会直接展示，避免误读和未经核验的信息外泄。" actions={<button className="primary" onClick={onRunDemo}>刷新初筛计算</button>} />
    <section className="sync-banner">
      <b>当前展示版本：{portalData.consultantReview?.status || '顾问已发布版本'}</b>
      <span>来源：{portalData.source?.system || '内置演示数据'} · 存储模式：{portalMode || 'localStorage'} · 最近发布：{applicant.lastPublished || portalData.consultantReview?.reviewedAt || '待发布'}</span>
    </section>
    <section className="grid-4">
      <article className="metric"><span>当前阶段</span><b>{applicant.currentStage}</b><small>负责顾问：{applicant.consultant}</small></article>
      <article className="metric"><span>总体进度</span><b>{applicant.progress}%</b><small>按任务、材料、项目状态估算</small></article>
      <article className="metric"><span>德国制参考成绩</span><b>{runResult?.grade?.value || applicant.germanGrade}</b><small>仅供初筛，最终以学校认定为准</small></article>
      <article className="metric"><span>本周高风险</span><b>{visibleRisks.filter(r => r.level === '高').length || 1} 项</b><small>仅展示顾问允许用户可见的风险</small></article>
    </section>
    <section className="panel two-col">
      <div><h2>我的资料摘要</h2><div className="info-list">
        <p><b>本科：</b>{applicant.university} · {applicant.major}</p>
        <p><b>目标：</b>{applicant.targetDirection} · {applicant.intake}</p>
        <p><b>语言：</b>{applicant.english}</p>
        <p><b>APS：</b><Status value={applicant.apsStatus} /></p>
      </div></div>
      <div><h2>材料状态</h2><div className="mini-table">{portalMaterials.map(m => <div key={m.name}><b>{m.name}</b><Status value={m.status} /><small>{m.note}</small></div>)}</div></div>
    </section>
    <section className="panel"><h2>顾问发布的申请项目</h2><div className="cards">{portalPrograms.map(p => <article className="program" key={`${p.university}-${p.program}`}><div><span>{p.university}</span><h3>{p.program}</h3></div><div className="tags"><Status value={p.tier} /><Status value={p.status} /><Status value={`风险：${p.risk}`} /></div><p>{p.consultantNote}</p><dl><dt>Deadline</dt><dd>{p.deadline}</dd><dt>申请路径</dt><dd>{p.path}</dd><dt>最近核验</dt><dd>{p.checkedAt || '待官网复核'}</dd><dt>来源入口</dt><dd><a href={p.source} target="_blank">{p.source}</a></dd></dl></article>)}</div></section>
    <section className="panel two-col"><div><h2>本周我的任务</h2><TaskTable rows={portalTasks.filter(t => t.owner?.includes('申请者'))} /></div><div><h2>顾问发布的风险提醒</h2>{visibleRisks.length ? visibleRisks.map(r => <div className="review-item" key={`${r.type}-${r.description}`}><b>{r.type}</b><Status value={r.level} /><p>{r.description}</p><small>{r.suggestedAction}</small></div>) : <p className="muted">暂无新增用户可见风险。</p>}</div></section>
    <section className="panel two-col"><WeeklyReport applicantOnly report={portalReport} /><div><h2>已发布专家团结论</h2>{visibleOutputs.map(o => <div className="review-item" key={o.expert}><b>{o.expert}</b><Status value={o.status} /><p>{o.result}</p></div>)}</div></section>
  </>;
}

function ConsultantWorkbench({ onRunDemo, runResult, portalData, setPortalData, portalMode, setPortalMode, refreshPortal }) {
  const [syncText, setSyncText] = useState(sampleSyncJson);
  const [syncPreview, setSyncPreview] = useState(null);
  const [syncErrors, setSyncErrors] = useState([]);
  const [publishMessage, setPublishMessage] = useState('');
  const parseSync = () => {
    setPublishMessage('');
    try {
      const payload = JSON.parse(syncText);
      const errors = validateSyncPayload(payload);
      setSyncErrors(errors);
      setSyncPreview(payload);
    } catch {
      setSyncPreview(null);
      setSyncErrors(['JSON 格式错误，请检查小浣熊后台导出内容。']);
    }
  };
  const publishSync = async () => {
    try {
      const payload = syncPreview || JSON.parse(syncText);
      const errors = validateSyncPayload(payload);
      if (errors.length) {
        setSyncErrors(errors);
        setPublishMessage('存在校验错误，暂不能发布。');
        return;
      }
      const merged = mergePortalData(payload);
      try {
        const result = await api('/portal/publish', { applicantId: payload.applicantId || 'app-001', portalData: merged });
        const published = result.portalData || merged;
        localStorage.setItem(storageKey, JSON.stringify(published));
        setPortalData(published);
        setPortalMode(result.mode || 'api');
        setPublishMessage(`已发布到申请者门户。存储模式：${result.mode || 'api'}。请切换申请者账号查看更新。`);
      } catch (apiError) {
        localStorage.setItem(storageKey, JSON.stringify(merged));
        setPortalData(merged);
        setPortalMode('localStorage-fallback');
        setPublishMessage(`后端 API 暂不可用，已使用 localStorage 兜底发布：${apiError.message}`);
      }
    } catch {
      setPublishMessage('发布失败：JSON 无法解析。');
    }
  };
  const resetPublished = async () => {
    localStorage.removeItem(storageKey);
    try { await api('/portal/reset', { applicantId: 'app-001' }); } catch {}
    setPortalData(defaultPortalData);
    setPortalMode('localStorage-reset');
    setSyncPreview(null);
    setSyncErrors([]);
    setPublishMessage('已恢复内置演示基线数据。');
  };
  return <>
    <Header eyebrow="顾问工作台" title="小浣熊后台输出审核与发布中心" desc="顾问负责把小浣熊专家团、数据分析和每周定时任务的结果转化为可交付版本；申请者前台只展示审核后的内容。" actions={<><button className="primary" onClick={onRunDemo}>运行成绩/匹配计算</button><button className="secondary" onClick={parseSync}>解析后台 JSON</button><button className="primary" onClick={publishSync}>顾问审核后发布</button><button className="secondary" onClick={refreshPortal}>从数据库/API刷新</button></>} />
    <section className="grid-4">
      <article className="metric"><span>负责申请者</span><b>1</b><small>演示账号</small></article>
      <article className="metric"><span>已发布项目</span><b>{portalData.programs?.length || 0}</b><small>申请者门户当前可见 · {portalMode}</small></article>
      <article className="metric"><span>本周顾问待办</span><b>{(portalData.tasks || []).filter(t => t.owner?.includes('顾问')).length}</b><small>需在周报发布前处理</small></article>
      <article className="metric"><span>用户可见风险</span><b>{(portalData.risks || []).filter(r => r.visibleToApplicant !== false).length}</b><small>经顾问筛选</small></article>
    </section>
    <section className="panel two-col"><div><h2>申请者列表</h2><div className="applicant-row"><b>{portalData.applicant.name}</b><Status value={portalData.applicant.currentStage} /><small>{portalData.applicant.targetDirection} · 进度 {portalData.applicant.progress}% · APS {portalData.applicant.apsStatus}</small></div></div><div><h2>计算结果</h2><p>德国制成绩：<b>{runResult?.grade?.value || '待运行'}</b></p><p>项目数量：<b>{runResult?.programs?.length || approvedPrograms.length}</b></p><p className="note">计算结果仍需顾问审核，不能直接等同录取判断。</p></div></section>
    <section className="panel"><div className="section-title"><div><h2>小浣熊后台 JSON 同步入口</h2><p className="muted">标准链路：专家团/数据分析/定时任务在小浣熊后台完成 → 导出 JSON → 顾问粘贴 → 解析校验 → 审核发布 → 申请者门户展示。</p></div><button onClick={resetPublished}>恢复演示基线</button></div><textarea className="json-box" value={syncText} onChange={e => setSyncText(e.target.value)} />
      <div className="schema-help"><b>必备字段：</b><code>schemaVersion</code><code>applicantId</code><code>programs[]</code><code>tasks[]</code><code>weeklyReport.summary</code><code>expertOutputs[]</code></div>
      {syncErrors.length > 0 && <div className="error-list"><b>校验提示</b>{syncErrors.map(e => <p key={e}>{e}</p>)}</div>}
      {publishMessage && <div className="success-msg">{publishMessage}</div>}
      {syncPreview && <pre className="json-preview">{JSON.stringify(syncPreview, null, 2)}</pre>}
    </section>
    <section className="panel two-col"><div><h2>专家团输出审核</h2>{(portalData.expertOutputs || []).map(o => <div className="review-item" key={o.expert}><b>{o.expert}</b><Status value={o.status} /><p>{o.result}</p><div className="actions"><button>采纳</button><button>修改后采纳</button><button>标记待复核</button><button>不展示</button></div></div>)}</div><div><WeeklyReport report={portalData.weeklyReport} /><h2>顾问本周待办</h2><TaskTable rows={(portalData.tasks || []).filter(t => t.owner?.includes('顾问'))} /></div></section>
  </>;
}

function AdminConsole({ portalStatus, refreshStatus }) {
  const env = portalStatus?.environment || {};
  const actions = portalStatus?.requiredActions || [];
  return <>
    <Header eyebrow="管理员后台" title="系统运营、专家团配置与 Supabase 接入诊断" desc="管理员维护三角色权限、项目库质量、专家团规则、每周一自动周报任务和数据库持久化配置。" actions={<button className="primary" onClick={refreshStatus}>刷新数据库状态</button>} />
    <section className="grid-4">
      <article className="metric"><span>用户角色</span><b>3 类</b><small>申请者 / 顾问 / 管理员</small></article>
      <article className="metric"><span>项目库记录</span><b>3</b><small>演示项目，待扩展数据库</small></article>
      <article className="metric"><span>数据库模式</span><b>{portalStatus?.mode || '检测中'}</b><small>{portalStatus?.supabaseConfigured ? 'Supabase 已配置' : '当前仍为 fallback / memory'}</small></article>
      <article className="metric"><span>同步方式</span><b>API</b><small>顾问发布 → Portal API → Supabase / fallback</small></article>
    </section>
    <section className="panel two-col">
      <div>
        <h2>Supabase 配置诊断</h2>
        <div className="review-item"><b>当前状态</b><Status value={portalStatus?.supabaseConfigured ? 'Supabase 已配置' : '待配置 Supabase'} /><p>{portalStatus?.securityNote || '正在检测环境变量状态。'}</p></div>
        <table><thead><tr><th>环境变量</th><th>状态</th><th>说明</th></tr></thead><tbody>
          <tr><td>SUPABASE_URL</td><td><Status value={env.SUPABASE_URL ? '已配置' : '未配置'} /></td><td>Supabase Project URL</td></tr>
          <tr><td>SUPABASE_SERVICE_ROLE_KEY</td><td><Status value={env.SUPABASE_SERVICE_ROLE_KEY ? '已配置' : '未配置'} /></td><td>服务端写库密钥，严禁暴露到前端</td></tr>
          <tr><td>SUPABASE_ANON_KEY</td><td><Status value={env.SUPABASE_ANON_KEY ? '已配置' : '可选'} /></td><td>后续接 Supabase Auth 时使用</td></tr>
        </tbody></table>
      </div>
      <div>
        <h2>下一步配置动作</h2>
        <ol className="check-list">{actions.map(x => <li key={x}>{x}</li>)}</ol>
        <div className="schema-help"><b>建表脚本：</b><code>supabase/schema.sql</code><code>/api/portal/status</code><code>/api/portal/publish</code></div>
      </div>
    </section>
    <section className="panel two-col"><div><h2>账号与权限</h2><table><thead><tr><th>角色</th><th>账号</th><th>权限重点</th></tr></thead><tbody>{accounts.map(a => <tr key={a.role}><td>{a.label}</td><td>{a.email}</td><td>{a.role === 'student' ? '编辑资料、查看审核后结果、完成任务' : a.role === 'consultant' ? '审核专家输出、发布周报、跟进申请者' : '管理用户、项目库、专家团规则和定时任务'}</td></tr>)}</tbody></table></div><div><h2>每周定时任务配置</h2><div className="timeline"><div><b>每周一 09:00</b><p>读取所有活跃申请者档案</p></div><div><b>09:10</b><p>检查 APS、语言、材料、deadline、网申状态</p></div><div><b>09:30</b><p>生成顾问内部版周报与申请者可见版草稿</p></div><div><b>顾问审核后</b><p>发布到申请者门户并写入数据库快照</p></div></div></div></section>
    <section className="panel two-col"><div><h2>项目库质量</h2>{projectLibrary.map(p => <div className="review-item" key={p.school}><b>{p.school}</b><Status value={p.type} /><p>{p.records} 条记录 · {p.status}</p></div>)}</div><div><h2>专家团配置边界</h2><ul className="check-list"><li>所有 deadline、NC、语言、VPD、APS 信息必须标注来源和日期。</li><li>专家团输出默认进入待顾问审核，不直接同步给申请者。</li><li>用户前台仅展示顾问审核后的任务、周报和建议。</li><li>不承诺录取，不替代学校官网、uni-assist、DAAD、APS 或人工判断。</li></ul></div></section>
  </>;
}

function TaskTable({ rows }) {
  return <table><thead><tr><th>任务</th><th>负责人</th><th>截止</th><th>优先级</th><th>状态</th></tr></thead><tbody>{rows.map(t => <tr key={t.title}><td>{t.title}</td><td>{t.owner}</td><td>{t.due}</td><td><Status value={t.priority} /></td><td><Status value={t.status} /></td></tr>)}</tbody></table>;
}

function WeeklyReport({ applicantOnly = false, report = weeklyReport }) {
  return <div className="weekly"><h2>{report.title}</h2><Status value={applicantOnly ? '顾问已发布版本' : '待顾问审核 / 可发布'} /><p>{report.summary}</p><h3>已完成</h3><ul>{(report.done || []).map(x => <li key={x}>{x}</li>)}</ul><h3>下周重点</h3><ul>{(report.next || []).map(x => <li key={x}>{x}</li>)}</ul><h3>风险提醒</h3><ul>{(report.risks || []).map(x => <li key={x}>{x}</li>)}</ul></div>;
}

function App() {
  const [user, setUser] = useState(null);
  const [runResult, setRunResult] = useState(null);
  const [portalData, setPortalData] = useState(() => loadPublishedData());
  const [portalMode, setPortalMode] = useState('localStorage');
  const [portalStatus, setPortalStatus] = useState(null);
  const [toast, setToast] = useState('');
  const refreshStatus = async () => {
    try {
      const result = await api('/portal/status', {}, { method: 'GET' });
      setPortalStatus(result);
    } catch (error) {
      setPortalStatus({ ok: false, mode: 'status-api-error', supabaseConfigured: false, environment: {}, requiredActions: ['检查 /api/portal/status 路由是否部署成功'], securityNote: error.message });
    }
  };

  const refreshPortal = async () => {
    try {
      const result = await api('/portal/read', { applicantId: 'app-001' });
      if (result.portalData) {
        setPortalData(result.portalData);
        setPortalMode(result.mode || 'api');
        localStorage.setItem(storageKey, JSON.stringify(result.portalData));
      }
    } catch (error) {
      const fallback = loadPublishedData();
      setPortalData(fallback);
      setPortalMode('localStorage-fallback');
    }
  };

  useEffect(() => {
    refreshPortal();
    refreshStatus();
  }, []);

  const demoProfile = useMemo(() => ({
    name: baseApplicant.name,
    university: baseApplicant.university,
    major: baseApplicant.major,
    targetDirection: baseApplicant.targetDirection,
    crossMajor: baseApplicant.crossMajor,
    averageScore: baseApplicant.averageScore,
    maxScore: baseApplicant.maxScore,
    passScore: baseApplicant.passScore,
    english: baseApplicant.english,
    german: baseApplicant.german,
    apsStatus: baseApplicant.apsStatus,
    experiences: 'Python 数据分析课程项目、用户行为分析 Demo、课程论文与毕业设计素材（演示）'
  }), []);
  const runDemo = async () => {
    setToast('正在调用 Vercel API 计算成绩和项目匹配…');
    try {
      const data = await api('/demo/run', { profile: demoProfile });
      setRunResult(data);
      setToast(data.ok ? `计算完成：德国制参考成绩 ${data.grade?.value}` : '计算失败，请检查接口。');
    } catch (error) {
      setToast(error.message || '接口调用失败');
    }
  };
  if (!user) return <Login onLogin={setUser} />;
  return <Shell user={user} onLogout={() => setUser(null)}>
    {toast && <div className="toast">{toast}<button onClick={() => setToast('')}>×</button></div>}
    {user.role === 'student' && <StudentPortal runResult={runResult} onRunDemo={runDemo} portalData={portalData} portalMode={portalMode} />}
    {user.role === 'consultant' && <ConsultantWorkbench runResult={runResult} onRunDemo={runDemo} portalData={portalData} setPortalData={setPortalData} portalMode={portalMode} setPortalMode={setPortalMode} refreshPortal={refreshPortal} />}
    {user.role === 'admin' && <AdminConsole portalStatus={portalStatus} refreshStatus={refreshStatus} />}
  </Shell>;
}

createRoot(document.getElementById('root')).render(<App />);
