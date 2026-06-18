
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

const sampleSyncJson = JSON.stringify({
  applicantId: 'app-001',
  source: '小浣熊后台专家团',
  reviewRequired: true,
  publishToApplicant: false,
  weeklySummary: '后台专家团建议本周优先补齐课程描述、推进 APS，并复核三个项目的申请路径。',
  tasks: [
    { title: '补充数据库课程描述', owner: '申请者', priority: '高' },
    { title: '顾问复核 Saarland 语言要求', owner: '顾问', priority: '高' }
  ],
  risks: [
    { type: 'APS', level: '高', description: 'APS 未开始，影响后续申请节奏。' }
  ]
}, null, 2);

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
      <div className="eyebrow">DeutschOS Step 5 · 登录式申请者门户</div>
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

function StudentPortal({ runResult, onRunDemo }) {
  const visibleOutputs = expertOutputs.filter(x => x.visible);
  return <>
    <Header eyebrow="申请者门户" title="我的德国硕士申请进度" desc="你只能看到顾问审核后发布的内容；后台专家团原始分析不会直接展示，避免误读和未经核验的信息外泄。" actions={<button className="primary" onClick={onRunDemo}>刷新初筛计算</button>} />
    <section className="grid-4">
      <article className="metric"><span>当前阶段</span><b>{baseApplicant.currentStage}</b><small>负责顾问：{baseApplicant.consultant}</small></article>
      <article className="metric"><span>总体进度</span><b>{baseApplicant.progress}%</b><small>按任务、材料、项目状态估算</small></article>
      <article className="metric"><span>德国制参考成绩</span><b>{runResult?.grade?.value || baseApplicant.germanGrade}</b><small>仅供初筛，最终以学校认定为准</small></article>
      <article className="metric"><span>本周高风险</span><b>3 项</b><small>APS / 课程描述 / 官网复核</small></article>
    </section>
    <section className="panel two-col">
      <div><h2>我的资料摘要</h2><div className="info-list">
        <p><b>本科：</b>{baseApplicant.university} · {baseApplicant.major}</p>
        <p><b>目标：</b>{baseApplicant.targetDirection} · {baseApplicant.intake}</p>
        <p><b>语言：</b>{baseApplicant.english}</p>
        <p><b>APS：</b><Status value={baseApplicant.apsStatus} /></p>
      </div></div>
      <div><h2>材料状态</h2><div className="mini-table">{materials.map(m => <div key={m.name}><b>{m.name}</b><Status value={m.status} /><small>{m.note}</small></div>)}</div></div>
    </section>
    <section className="panel"><h2>顾问发布的申请项目</h2><div className="cards">{approvedPrograms.map(p => <article className="program" key={p.program}><div><span>{p.university}</span><h3>{p.program}</h3></div><div className="tags"><Status value={p.tier} /><Status value={p.status} /><Status value={`风险：${p.risk}`} /></div><p>{p.consultantNote}</p><dl><dt>Deadline</dt><dd>{p.deadline}</dd><dt>申请路径</dt><dd>{p.path}</dd><dt>来源入口</dt><dd><a href={p.source} target="_blank">{p.source}</a></dd></dl></article>)}</div></section>
    <section className="panel"><h2>本周我的任务</h2><TaskTable rows={weeklyTasks.filter(t => t.owner.includes('申请者'))} /></section>
    <section className="panel two-col"><WeeklyReport applicantOnly /><div><h2>已发布专家团结论</h2>{visibleOutputs.map(o => <div className="review-item" key={o.expert}><b>{o.expert}</b><Status value={o.status} /><p>{o.result}</p></div>)}</div></section>
  </>;
}

function ConsultantWorkbench({ onRunDemo, runResult }) {
  const [syncText, setSyncText] = useState(sampleSyncJson);
  const [syncPreview, setSyncPreview] = useState(null);
  const parseSync = () => {
    try { setSyncPreview(JSON.parse(syncText)); } catch { setSyncPreview({ error: 'JSON 格式错误，请检查小浣熊后台导出内容。' }); }
  };
  return <>
    <Header eyebrow="顾问工作台" title="小浣熊后台输出审核与发布中心" desc="顾问负责把小浣熊专家团、数据分析和每周定时任务的结果转化为可交付版本；申请者前台只展示审核后的内容。" actions={<><button className="primary" onClick={onRunDemo}>运行成绩/匹配计算</button><button className="secondary" onClick={parseSync}>解析后台 JSON</button></>} />
    <section className="grid-4">
      <article className="metric"><span>负责申请者</span><b>1</b><small>演示账号</small></article>
      <article className="metric"><span>待审核输出</span><b>3</b><small>项目核验 / 课程匹配 / 文书素材</small></article>
      <article className="metric"><span>本周顾问待办</span><b>{weeklyTasks.filter(t => t.owner.includes('顾问')).length}</b><small>需在周报发布前处理</small></article>
      <article className="metric"><span>高风险学生</span><b>1</b><small>APS 未开始</small></article>
    </section>
    <section className="panel two-col"><div><h2>申请者列表</h2><div className="applicant-row"><b>{baseApplicant.name}</b><Status value={baseApplicant.currentStage} /><small>{baseApplicant.targetDirection} · 进度 {baseApplicant.progress}% · APS {baseApplicant.apsStatus}</small></div></div><div><h2>计算结果</h2><p>德国制成绩：<b>{runResult?.grade?.value || '待运行'}</b></p><p>项目数量：<b>{runResult?.programs?.length || approvedPrograms.length}</b></p><p className="note">计算结果仍需顾问审核，不能直接等同录取判断。</p></div></section>
    <section className="panel"><h2>小浣熊后台 JSON 同步入口</h2><p className="muted">第一版采用“JSON 上传 / 粘贴”方式：专家团在小浣熊后台完成分析后，顾问把结构化结果粘贴到这里，审核后发布给申请者。</p><textarea className="json-box" value={syncText} onChange={e => setSyncText(e.target.value)} />{syncPreview && <pre className={syncPreview.error ? 'json-preview error' : 'json-preview'}>{JSON.stringify(syncPreview, null, 2)}</pre>}</section>
    <section className="panel two-col"><div><h2>专家团输出审核</h2>{expertOutputs.map(o => <div className="review-item" key={o.expert}><b>{o.expert}</b><Status value={o.status} /><p>{o.result}</p><div className="actions"><button>采纳</button><button>修改后采纳</button><button>标记待复核</button><button>不展示</button></div></div>)}</div><div><WeeklyReport /><h2>顾问本周待办</h2><TaskTable rows={weeklyTasks.filter(t => t.owner.includes('顾问'))} /></div></section>
  </>;
}

function AdminConsole() {
  return <>
    <Header eyebrow="管理员后台" title="系统运营、专家团配置与定时任务管理" desc="管理员维护三角色权限、项目库质量、专家团规则、每周一自动周报任务和同步记录。" />
    <section className="grid-4">
      <article className="metric"><span>用户角色</span><b>3 类</b><small>申请者 / 顾问 / 管理员</small></article>
      <article className="metric"><span>项目库记录</span><b>3</b><small>演示项目，待扩展数据库</small></article>
      <article className="metric"><span>定时任务</span><b>周一</b><small>每周生成完整周报</small></article>
      <article className="metric"><span>同步方式</span><b>JSON</b><small>后台粘贴/上传，顾问审核</small></article>
    </section>
    <section className="panel two-col"><div><h2>账号与权限</h2><table><thead><tr><th>角色</th><th>账号</th><th>权限重点</th></tr></thead><tbody>{accounts.map(a => <tr key={a.role}><td>{a.label}</td><td>{a.email}</td><td>{a.role === 'student' ? '编辑资料、查看审核后结果、完成任务' : a.role === 'consultant' ? '审核专家输出、发布周报、跟进申请者' : '管理用户、项目库、专家团规则和定时任务'}</td></tr>)}</tbody></table></div><div><h2>每周定时任务配置</h2><div className="timeline"><div><b>每周一 09:00</b><p>读取所有活跃申请者档案</p></div><div><b>09:10</b><p>检查 APS、语言、材料、deadline、网申状态</p></div><div><b>09:30</b><p>生成顾问内部版周报与申请者可见版草稿</p></div><div><b>顾问审核后</b><p>发布到申请者门户</p></div></div></div></section>
    <section className="panel two-col"><div><h2>项目库质量</h2>{projectLibrary.map(p => <div className="review-item" key={p.school}><b>{p.school}</b><Status value={p.type} /><p>{p.records} 条记录 · {p.status}</p></div>)}</div><div><h2>专家团配置边界</h2><ul className="check-list"><li>所有 deadline、NC、语言、VPD、APS 信息必须标注来源和日期。</li><li>专家团输出默认进入待顾问审核，不直接同步给申请者。</li><li>用户前台仅展示顾问审核后的任务、周报和建议。</li><li>不承诺录取，不替代学校官网、uni-assist、DAAD、APS 或人工判断。</li></ul></div></section>
  </>;
}

function TaskTable({ rows }) {
  return <table><thead><tr><th>任务</th><th>负责人</th><th>截止</th><th>优先级</th><th>状态</th></tr></thead><tbody>{rows.map(t => <tr key={t.title}><td>{t.title}</td><td>{t.owner}</td><td>{t.due}</td><td><Status value={t.priority} /></td><td><Status value={t.status} /></td></tr>)}</tbody></table>;
}

function WeeklyReport({ applicantOnly = false }) {
  return <div className="weekly"><h2>{weeklyReport.title}</h2><Status value={applicantOnly ? '顾问已发布版本' : '待顾问审核 / 可发布'} /><p>{weeklyReport.summary}</p><h3>已完成</h3><ul>{weeklyReport.done.map(x => <li key={x}>{x}</li>)}</ul><h3>下周重点</h3><ul>{weeklyReport.next.map(x => <li key={x}>{x}</li>)}</ul><h3>风险提醒</h3><ul>{weeklyReport.risks.map(x => <li key={x}>{x}</li>)}</ul></div>;
}

function App() {
  const [user, setUser] = useState(null);
  const [runResult, setRunResult] = useState(null);
  const [toast, setToast] = useState('');
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
    {user.role === 'student' && <StudentPortal runResult={runResult} onRunDemo={runDemo} />}
    {user.role === 'consultant' && <ConsultantWorkbench runResult={runResult} onRunDemo={runDemo} />}
    {user.role === 'admin' && <AdminConsole />}
  </Shell>;
}

createRoot(document.getElementById('root')).render(<App />);
