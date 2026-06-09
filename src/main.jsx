import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Bot, CheckCircle2, ClipboardCheck, Database, Download, FileText, Gauge, Globe2, LayoutDashboard, Loader2, MessageSquare, Radar, Search, Sparkles } from 'lucide-react';
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
  averageScore: 85,
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
  if (!avg || !max || !pass || max <= pass) return null;
  return 1 + 3 * (max - avg) / (max - pass);
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

function Field({ label, children }) {
  return <label className="field"><span>{label}</span>{children}</label>;
}

function Badge({ children, tone = 'gray' }) {
  return <span className={`badge ${tone}`}>{children}</span>;
}

function hasPendingVerification(program = {}) {
  return ['applicationPath', 'aps', 'vpd', 'language', 'deadline', 'nc', 'historicalLine']
    .some(key => String(program[key] ?? '').includes('待人工'));
}

function Empty({ text }) {
  return <div className="empty">{text}</div>;
}

function App() {
  const [profile, setProfile] = useState(defaultProfile);
  const [urls, setUrls] = useState('https://www.tum.de/en/studies/degree-programs/detail/data-engineering-and-analytics-master-of-science-msc\nhttps://www.uni-saarland.de/en/study/programmes/master/data-science-ai.html\nhttps://www.th-koeln.de/en/academics/web-and-data-science-masters-program_7219.php');
  const [research, setResearch] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [demo, setDemo] = useState(null);
  const [materials, setMaterials] = useState(null);
  const [chat, setChat] = useState([
    { role: 'assistant', content: '我是 DeutschOS 申请助手。你可以先点击“一键运行完整 Demo”，也可以逐步输入官网 URL、抓取核验、生成分析与文书。' }
  ]);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState('');
  const [notice, setNotice] = useState('交互产品 Demo：支持一键跑通德国硕士申请 OS 主流程；官网实时核验需联网且以官方页面为准。');
  const [active, setActive] = useState('overview');
  const grade = useMemo(() => germanGrade(profile), [profile]);

  const programs = demo?.programs || analysis?.programs || research?.programs || [];
  const tasks = analysis?.tasks || [];
  const guide = analysis?.guide || null;

  const update = (k, v) => setProfile(prev => ({ ...prev, [k]: v }));

  async function saveProfile() {
    setLoading('保存档案');
    try {
      const data = await api('/api/profile/save', { profile });
      setNotice(data.message || '档案已保存；如未配置 Supabase，将使用本地占位保存提示。');
    } catch (e) { setNotice(`保存失败：${e.message}`); }
    finally { setLoading(''); }
  }

  async function runFullDemo() {
    setLoading('一键运行完整 Demo');
    try {
      const data = await api('/api/demo/run', { profile });
      setDemo(data);
      setMaterials({ title: 'Demo 文书包', draft: `${data.drafts.motivationLetter}\n\n---\n\n${data.drafts.courseMappingStatement}` });
      setActive('overview');
      setNotice('完整 Demo 已生成：建档、项目核验、成绩换算、NC 判断、课程匹配、文书、看板、政策雷达、效率报告、导出清单。');
    } catch (e) { setNotice(`Demo 运行失败：${e.message}`); }
    finally { setLoading(''); }
  }

  async function crawlUrls() {
    setLoading('官网抓取并结构化核验');
    try {
      const data = await api('/api/research/crawl', { profile, urls: urls.split('\n').map(s => s.trim()).filter(Boolean) });
      setResearch(data);
      setNotice(`已抓取 ${data.pageCount || 0} 个 URL，生成 ${data.programs?.length || 0} 条结构化核验记录。`);
    } catch (e) { setNotice(`抓取失败：${e.message}`); }
    finally { setLoading(''); }
  }

  async function runAnalysis() {
    setLoading('生成申请方案');
    try {
      const data = await api('/api/analysis/run', { profile, grade, research });
      setAnalysis(data);
      setNotice('申请分析、任务清单与操作教程已生成。');
    } catch (e) { setNotice(`分析失败：${e.message}`); }
    finally { setLoading(''); }
  }

  async function draftMaterials(type) {
    setLoading(`生成 ${type}`);
    try {
      const data = await api('/api/materials/draft', { profile, analysis, research, type });
      setMaterials(data);
      setNotice(`${type} 草稿已生成，需人工复核真实性。`);
    } catch (e) { setNotice(`生成失败：${e.message}`); }
    finally { setLoading(''); }
  }

  async function runPolicyRadar() {
    setLoading('政策雷达首次运行');
    try {
      const data = await api('/api/policy-radar/run', { profile, programs });
      setDemo(prev => ({ ...(prev || {}), policyRadar: data, programs: programs.length ? programs : prev?.programs || [] }));
      setActive('radar');
      setNotice('政策雷达已生成任务配置并完成首次基线运行；长期定时需部署。');
    } catch (e) { setNotice(`政策雷达失败：${e.message}`); }
    finally { setLoading(''); }
  }

  async function askAI() {
    if (!question.trim()) return;
    const next = [...chat, { role: 'user', content: question }];
    setChat(next); setQuestion(''); setLoading('AI 回答');
    try {
      const data = await api('/api/chat', { profile, research, analysis: analysis || demo, messages: next });
      setChat([...next, { role: 'assistant', content: data.answer }]);
    } catch (e) { setChat([...next, { role: 'assistant', content: `回答失败：${e.message}` }]); }
    finally { setLoading(''); }
  }

  const nav = [
    ['overview', '总览', Sparkles], ['verification', '官网核验', Globe2], ['grade', '成绩/NC', Gauge], ['matching', '课程匹配', ClipboardCheck],
    ['dashboard', '作战看板', LayoutDashboard], ['radar', '政策雷达', Radar], ['report', '效率报告', FileText], ['materials', '文书', FileText]
  ];

  return <div className="app-shell">
    <header className="topbar">
      <div className="brand"><div className="logo">D</div><div><b>DeutschOS</b><span>德国硕士申请 Agent 操作系统 · 交互 Demo v0.3</span></div></div>
      <div className="top-actions">
        <button className="primary" onClick={runFullDemo}>{loading ? <Loader2 className="spin" size={16}/> : <Sparkles size={16}/>} 一键运行完整 Demo</button>
        <button className="secondary" onClick={() => downloadJson('deutschos-demo-result.json', { profile, research, analysis, demo, materials })}><Download size={16}/>下载结果 JSON</button>
      </div>
    </header>

    <div className="workspace">
      <aside className="left-pane">
        <div className="status-line">{loading ? <><Loader2 size={15} className="spin"/> {loading}</> : <><CheckCircle2 size={15}/> 就绪</>}</div>
        <p className="notice">{notice}</p>
        <section className="panel">
          <h2><Database size={18}/> 申请者建档</h2>
          <Field label="姓名"><input value={profile.name} onChange={e => update('name', e.target.value)} /></Field>
          <Field label="当前身份"><select value={profile.educationStatus} onChange={e => update('educationStatus', e.target.value)}><option>本科应届生</option><option>已毕业</option><option>工作党</option></select></Field>
          <Field label="本科院校"><input value={profile.university} onChange={e => update('university', e.target.value)} /></Field>
          <Field label="本科专业"><input value={profile.major} onChange={e => update('major', e.target.value)} /></Field>
          <Field label="目标方向"><input value={profile.targetDirection} onChange={e => update('targetDirection', e.target.value)} /></Field>
          <div className="two-col"><Field label="入学季"><input value={profile.intake} onChange={e => update('intake', e.target.value)} /></Field><Field label="跨专业"><select value={profile.crossMajor} onChange={e => update('crossMajor', e.target.value)}><option>否</option><option>部分跨专业</option><option>是</option></select></Field></div>
          <div className="three-col"><Field label="均分"><input type="number" value={profile.averageScore} onChange={e => update('averageScore', e.target.value)} /></Field><Field label="满分"><input type="number" value={profile.maxScore} onChange={e => update('maxScore', e.target.value)} /></Field><Field label="及格"><input type="number" value={profile.passScore} onChange={e => update('passScore', e.target.value)} /></Field></div>
          <div className="grade-box"><b>{grade ? grade.toFixed(2) : '--'}</b><span>德国制参考成绩</span></div>
          <Field label="英语成绩"><input value={profile.english} onChange={e => update('english', e.target.value)} /></Field>
          <Field label="德语成绩"><input value={profile.german} onChange={e => update('german', e.target.value)} /></Field>
          <Field label="APS 状态"><select value={profile.apsStatus} onChange={e => update('apsStatus', e.target.value)}><option>未开始</option><option>准备中</option><option>已递交</option><option>已通过</option><option>不确定</option></select></Field>
          <Field label="真实经历素材"><textarea value={profile.experiences} onChange={e => update('experiences', e.target.value)} /></Field>
          <div className="actions"><button onClick={saveProfile}>保存档案</button></div>
        </section>
      </aside>

      <main className="center-pane">
        <section className="panel nav-panel">{nav.map(([key, label, Icon]) => <button key={key} className={active === key ? 'tab active' : 'tab'} onClick={() => setActive(key)}><Icon size={16}/>{label}</button>)}</section>

        {active === 'overview' && <Overview demo={demo} profile={profile} onRun={runFullDemo} />}
        {active === 'verification' && <Verification urls={urls} setUrls={setUrls} crawlUrls={crawlUrls} runAnalysis={runAnalysis} programs={programs} analysis={analysis} />}
        {active === 'grade' && <GradeView demo={demo} grade={grade} profile={profile} />}
        {active === 'matching' && <MatchingView matching={demo?.matching || []} />}
        {active === 'dashboard' && <DashboardView dashboard={demo?.dashboard || []} tasks={tasks} guide={guide} />}
        {active === 'radar' && <RadarView radar={demo?.policyRadar} onRun={runPolicyRadar} />}
        {active === 'report' && <ReportView report={demo?.efficiency} />}
        {active === 'materials' && <MaterialsView materials={materials} draftMaterials={draftMaterials} />}
      </main>

      <aside className="right-pane">
        <section className="panel sticky">
          <h2><Bot size={18}/> AI 申请助手</h2>
          <ContextBox profile={profile} programs={programs} demo={demo} />
          <div className="chatbox">{chat.map((m, i) => <div key={i} className={`msg ${m.role}`}>{m.content}</div>)}</div>
          <div className="ask"><textarea value={question} onChange={e => setQuestion(e.target.value)} placeholder="问：这个项目是否需要 VPD？我下一步该做什么？" onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) askAI(); }} /><button onClick={askAI}><MessageSquare size={16}/>发送</button></div>
        </section>
      </aside>
    </div>
  </div>;
}

function Overview({ demo, profile, onRun }) {
  const s = demo?.efficiency?.summary;
  const gradeValue = demo?.grade?.value || germanGrade(profile)?.toFixed(2) || '--';
  const avgMatch = demo?.matching?.length ? Math.round(demo.matching.reduce((sum, item) => sum + Number(item.matchScore || 0), 0) / demo.matching.length) : null;
  const matchBand = avgMatch === null ? '待生成' : avgMatch >= 80 ? '高匹配' : avgMatch >= 65 ? '中等偏强' : '需补强';
  const mainRisk = demo?.matching?.find(item => String(item.riskLevel || '').includes('高'))?.gapModules || (profile.crossMajor === '否' ? '关注语言与材料截止' : '跨专业课程学分需解释');
  const nextAction = demo ? '优先补课程描述与 APS/VPD 节点' : '填写信息后生成方案';
  if (demo) {
    return <section className="panel hero-panel result-first">
      <div className="closure-strip">本次已完成闭环：建档 → 官网核验 → 成绩换算 → 课程匹配 → 文书/看板 → 政策雷达 → 报告</div>
      <div className="result-summary-grid">
        <div className="conclusion-card">
          <Badge tone="blue">核心结论</Badge>
          <div className="conclusion-metrics"><Kpi label="德国制成绩" value={gradeValue}/><Kpi label="课程匹配" value={matchBand}/></div>
          <p><b>主要风险：</b>{Array.isArray(mainRisk) ? mainRisk.join('；') : mainRisk}</p>
          <p><b>建议动作：</b>{nextAction}</p>
        </div>
        <div className="io-card">
          <Badge tone="green">输入 → 输出</Badge>
          <div><b>{profile.averageScore}/{profile.maxScore}</b><span>均分输入</span></div>
          <div><b>{profile.targetDirection}</b><span>目标方向</span></div>
          <div><b>{programsCount(demo)} 个项目 / {s?.highRisks || 0} 项风险</b><span>方案输出</span></div>
        </div>
      </div>
      <div className="kpi-grid compact"><Kpi label="项目数" value={s?.projects || 3}/><Kpi label="可溯源信息" value={s?.traceableItems || 42}/><Kpi label="高风险事项" value={s?.highRisks || 5}/><Kpi label="效率提升" value={`${s?.improvement || '--'}×`}/></div>
    </section>;
  }
  return <section className="panel hero-panel"><div><Badge tone="blue">实际产品 Demo</Badge><h1>从申请者建档到政策雷达的一站式德国硕士申请工作台</h1><p>可交互输入申请者资料，运行官网核验、成绩换算、NC 竞争力判断、课程匹配、文书初稿、多校看板、政策雷达和效率报告。</p><button className="primary big" onClick={onRun}><Sparkles size={18}/>立即跑通全流程</button></div><div className="kpi-grid"><Kpi label="项目数" value={s?.projects || 3}/><Kpi label="可溯源信息" value={s?.traceableItems || 42}/><Kpi label="高风险事项" value={s?.highRisks || 5}/><Kpi label="效率提升" value={`${s?.improvement || '--'}×`}/></div><div className="flow"><span>建档</span><span>官网核验</span><span>成绩换算</span><span>课程匹配</span><span>文书</span><span>看板</span><span>政策雷达</span><span>报告导出</span></div></section>;
}
function programsCount(demo) { return demo?.programs?.length || demo?.competition?.length || 3; }
function Kpi({ label, value }) { return <div className="kpi"><b>{value}</b><span>{label}</span></div>; }

function Verification({ urls, setUrls, crawlUrls, runAnalysis, programs, analysis }) {
  return <section className="panel"><div className="section-head"><h2><Search size={18}/> 官网实时核验</h2><Badge>官方 URL 输入</Badge></div><textarea className="urlbox" value={urls} onChange={e => setUrls(e.target.value)} /><div className="actions"><button onClick={crawlUrls}>抓取并结构化核验</button><button className="secondary" onClick={runAnalysis}>基于抓取生成 AI 方案</button></div><ProgramTable programs={programs} />{analysis?.report && <><h3>AI 分析报告</h3><MarkdownLike text={analysis.report} /></>}</section>;
}

function ProgramTable({ programs = [] }) {
  if (!programs.length) return <Empty text="尚无核验结果。可点击“一键运行完整 Demo”加载演示项目，或输入官方 URL 抓取。" />;
  return <div className="table-wrap"><table><thead><tr><th>学校/项目</th><th>类型</th><th>路径</th><th>APS</th><th>VPD</th><th>语言</th><th>Deadline</th><th>NC</th><th>来源/核验</th></tr></thead><tbody>{programs.map((p, i) => {
    const pending = hasPendingVerification(p);
    return <tr key={p.id || i} className={pending ? 'pending-row' : ''}><td><b>{p.university}</b><small>{p.programName}</small></td><td>{p.universityType || '-'}</td><td>{p.applicationPath || '待人工核验'}</td><td>{p.aps || '待人工核验'}</td><td>{p.vpd || '待人工核验'}</td><td>{p.language || '待人工核验'}</td><td>{p.deadline || '待人工核验'}</td><td>{p.nc || '待人工核验'}</td><td><div className="source-tags"><a href={p.sourceUrl} target="_blank" rel="noreferrer">官网来源</a><span>{String(p.checkedAt || '').slice(0,10)}</span><Badge tone={pending ? 'yellow' : 'green'}>{pending ? '待人工核实' : '已核验'}</Badge></div></td></tr>;
  })}</tbody></table></div>;
}

function GradeView({ demo, grade, profile }) {
  const g = demo?.grade;
  return <section className="panel"><div className="section-head"><h2><Gauge size={18}/> 成绩换算与 NC 竞争力</h2><Badge tone="red">参考值，待学校认定</Badge></div><div className="formula"><b>{g?.value ?? grade?.toFixed?.(2) ?? '--'}</b><div><p>德国修正巴伐利亚公式</p><code>1 + 3 × (最高分 - 申请者成绩) / (最高分 - 最低及格分)</code><small>{g?.process || `1 + 3 × (${profile.maxScore} - ${profile.averageScore}) / (${profile.maxScore} - ${profile.passScore})`}</small></div></div><DataTable rows={demo?.competition || []} columns={[['university','学校'],['programName','项目'],['germanGrade','德国制'],['nc','NC'],['historicalLine','历史线'],['courseMatch','课程匹配'],['overallCompetitiveness','竞争力'],['mainRisk','风险']]} /></section>;
}

function MatchingView({ matching }) {
  return <section className="panel"><div className="section-head"><h2><ClipboardCheck size={18}/> 课程匹配诊断</h2><Badge tone="blue">权重模型评分</Badge></div><DataTable rows={matching} columns={[['university','学校'],['programName','项目'],['matchScore','匹配分'],['satisfiedModules','已满足模块'],['gapModules','缺口模块'],['strengthening','补强材料'],['riskLevel','风险'],['recommendation','建议']]} /></section>;
}

function DashboardView({ dashboard, tasks, guide }) {
  return <section className="panel"><div className="section-head"><h2><LayoutDashboard size={18}/> 多校申请作战看板</h2><Badge tone="green">下一步动作</Badge></div><DataTable rows={dashboard} columns={[['university','学校'],['programName','项目'],['tier','梯度'],['applicationPath','申请路径'],['deadline','Deadline'],['status','状态'],['blocker','阻塞项'],['nextStep','下一步'],['priority','优先级']]} />{tasks?.length ? <TaskBoard tasks={tasks} /> : null}{guide?.sections?.length ? <GuideView guide={guide} /> : null}</section>;
}

function RadarView({ radar, onRun }) {
  return <section className="panel"><div className="section-head"><h2><Radar size={18}/> 政策雷达</h2><button onClick={onRun}>首次运行/刷新</button></div>{!radar ? <Empty text="点击按钮或一键 Demo 生成政策雷达任务配置和首次运行记录。" /> : <><div className="radar-card"><b>{radar.taskName}</b><span>频率：{radar.frequency}</span><p>{radar.systemTaskStatus}</p></div><DataTable rows={radar.firstRun || []} columns={[['date','日期'],['university','学校'],['programName','项目'],['checks','检查项'],['currentInfo','当前信息'],['changed','是否变化'],['impact','影响'],['suggestedAction','建议动作'],['source','来源']]} /></>}</section>;
}

function ReportView({ report }) {
  if (!report) return <section className="panel"><Empty text="先点击“一键运行完整 Demo”生成效率与质量对照报告。" /></section>;
  return <section className="panel"><div className="section-head"><h2><FileText size={18}/> 效率与质量对照报告</h2><Badge tone="blue">量化结果</Badge></div><div className="kpi-grid compact"><Kpi label="传统流程" value={report.summary.traditional}/><Kpi label="系统流程" value={report.summary.system}/><Kpi label="效率提升" value={`${report.summary.improvement}×`}/><Kpi label="交付物" value={report.summary.deliverables}/></div><DataTable rows={report.rows} columns={[['stage','环节'],['manual','传统耗时'],['system','系统耗时'],['improvement','提升倍数'],['note','说明']]} /><h3>可溯源质量指标</h3><DataTable rows={report.quality} columns={[['metric','指标'],['count','数量']]} /></section>;
}

function MaterialsView({ materials, draftMaterials }) {
  return <section className="panel"><div className="section-head"><h2><FileText size={18}/> 文书生成</h2><Badge>不编造经历</Badge></div><div className="actions wrap"><button onClick={() => draftMaterials('Motivation Letter')}>生成 Motivation Letter</button><button onClick={() => draftMaterials('Recommendation Letter Framework')}>生成推荐信框架</button><button onClick={() => draftMaterials('Course Mapping Statement')}>生成课程匹配说明</button></div>{materials ? <div className="draft"><h3>{materials.title}</h3><MarkdownLike text={materials.draft} /></div> : <Empty text="可一键 Demo 生成样例，也可连接 AI 服务后基于真实素材生成。" />}</section>;
}

function DataTable({ rows = [], columns = [] }) {
  if (!rows.length) return <Empty text="暂无数据。" />;
  const fmt = v => Array.isArray(v) ? v.join('；') : (typeof v === 'object' && v ? JSON.stringify(v) : String(v ?? ''));
  return <div className="table-wrap"><table><thead><tr>{columns.map(([_, label]) => <th key={label}>{label}</th>)}</tr></thead><tbody>{rows.map((r, i) => <tr key={i}>{columns.map(([key]) => <td key={key}>{/^https?:/.test(fmt(r[key])) ? <a href={fmt(r[key])} target="_blank" rel="noreferrer">链接</a> : fmt(r[key])}</td>)}</tr>)}</tbody></table></div>;
}

function TaskBoard({ tasks = [] }) {
  return <><h3>任务看板</h3><div className="task-board">{['blocked','todo','in_progress','done'].map(status => <div className="task-col" key={status}><h3>{status}</h3>{tasks.filter(t => t.status === status || (status === 'todo' && !['blocked','in_progress','done'].includes(t.status))).map(t => <div className="task" key={t.id}><Badge tone={t.priority === 'urgent' ? 'red' : t.priority === 'high' ? 'blue' : 'gray'}>{t.priority || 'medium'}</Badge><b>{t.title}</b><p>{t.detail || t.description}</p><small>{t.nextAction}</small></div>)}</div>)}</div></>;
}

function GuideView({ guide }) {
  return <><h3>申请教程</h3><div className="guide-list">{guide.sections.map((s, i) => <div className={`guide ${s.enabled === false ? 'disabled' : ''}`} key={i}><h3>{s.title}{s.enabled === false ? <Badge>当前未触发</Badge> : null}</h3><ol>{(s.steps || []).map((step, j) => <li key={j}>{step}</li>)}</ol></div>)}</div></>;
}

function ContextBox({ profile, programs = [], demo }) {
  return <div className="context-box"><p><b>当前上下文</b></p><span>方向：{profile.targetDirection}</span><span>APS：{profile.apsStatus}</span><span>核验项目：{programs.length}</span><span>德国制：{demo?.grade?.value || germanGrade(profile)?.toFixed(2) || '--'}</span></div>;
}

function MarkdownLike({ text }) {
  return <div className="markdown">{String(text || '').split('\n').filter(Boolean).map((line, i) => <p key={i}>{line}</p>)}</div>;
}

createRoot(document.getElementById('root')).render(<App />);
