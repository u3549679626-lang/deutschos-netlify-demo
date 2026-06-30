
import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const api = async (path, payload = {}, options = {}) => {
  const method = options.method || 'POST';
  const init = {
    method,
    headers: { 'Content-Type': 'application/json' }
  };
  const query = method === 'GET' && payload && Object.keys(payload).length
    ? `?${new URLSearchParams(payload).toString()}`
    : '';
  if (method !== 'GET') init.body = JSON.stringify(payload);
  const res = await fetch(`/api${path}${query}`, init);
  if (!res.ok) throw new Error(`API ${path} failed on Vercel catch-all API`);
  return res.json();
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
const sharedPortalStorageKey = 'deutschos.portalData.v1';
const portalStorageKeys = [sharedPortalStorageKey, storageKey];
const intakeStorageKey = 'deutschos.applicantIntake.v1';

const createInitialProfile = () => ({
  name: baseApplicant.name,
  university: baseApplicant.university,
  major: baseApplicant.major,
  currentDegree: '本科应届生',
  targetDirection: baseApplicant.targetDirection,
  intake: baseApplicant.intake,
  crossMajor: baseApplicant.crossMajor,
  averageScore: baseApplicant.averageScore,
  maxScore: baseApplicant.maxScore,
  passScore: baseApplicant.passScore,
  gpaRank: '排名 / 荣誉待补充',
  english: baseApplicant.english,
  german: baseApplicant.german,
  apsStatus: baseApplicant.apsStatus,
  courseSummary: '数学、统计、Python、数据库、机器学习等课程待从成绩单提取',
  experiences: 'Python 数据分析课程项目、用户行为分析 Demo、课程论文与毕业设计素材（演示）',
  targetPreferences: '德国公立大学；英授优先；覆盖 TU9 / 综合性大学 / FH-HAW',
  uploadedFiles: []
});


function normalizeIntakeProfile(profile = {}) {
  const base = createInitialProfile();
  const merged = { ...base, ...profile };
  return {
    ...merged,
    averageScore: Number(merged.averageScore || base.averageScore),
    maxScore: Number(merged.maxScore || base.maxScore),
    passScore: Number(merged.passScore || base.passScore),
    uploadedFiles: Array.isArray(merged.uploadedFiles) ? merged.uploadedFiles : [],
  };
}

function loadIntakeProfile() {
  try {
    const saved = JSON.parse(localStorage.getItem(intakeStorageKey) || 'null');
    return saved ? normalizeIntakeProfile(saved) : createInitialProfile();
  } catch (error) {
    console.warn('intake profile fallback', error);
    return createInitialProfile();
  }
}

function saveIntakeProfile(profile) {
  const normalized = normalizeIntakeProfile(profile);
  localStorage.setItem(intakeStorageKey, JSON.stringify(normalized));
  return normalized;
}

const fileBuckets = ['成绩单', '课程描述', 'CV', '语言成绩', 'APS 文件', '文书素材', '其他材料'];


const courseModuleLabels = {
  math: '数学基础',
  statistics: '统计与概率',
  cs: '计算机与编程',
  data: '数据科学/AI',
  research: '研究方法',
  project: '项目实践',
  ai: 'AI / 数据科学',
  major: '专业核心',
  business: '商科/管理',
  engineering: '工程/自然科学'
};

function getModuleLabel(module) {
  return courseModuleLabels[module] || module || '待归类模块';
}

function normalizeCourseEngine(engine = {}) {
  const moduleMatches = (engine.moduleMatches || engine.evidenceRows || []).map(row => ({
    module: row.module,
    label: row.label || getModuleLabel(row.module),
    requiredCredits: Number(row.requiredCredits ?? row.required ?? 0),
    matchedCredits: Number(row.matchedCredits ?? row.credits ?? row.matched ?? 0),
    credits: Number(row.credits ?? row.matchedCredits ?? row.matched ?? 0),
    courseCount: Number(row.courseCount ?? row.courses?.length ?? 0),
    matchedCourses: row.matchedCourses || row.courses || [],
    evidence: row.evidence || row.note || '基于申请者课程与项目画像规则比对',
    status: row.status || (Number(row.matchedCredits ?? row.credits ?? 0) >= Number(row.requiredCredits ?? row.required ?? 0) ? '满足' : '需补强')
  }));
  const programMatches = (engine.programMatches || engine.programs || []).map(program => {
    const gapModules = (program.gapModules || program.gaps || []).map(gap => typeof gap === 'string' ? { module: gap, label: getModuleLabel(gap), gapCredits: 0 } : {
      module: gap.module,
      label: gap.label || getModuleLabel(gap.module),
      gapCredits: Number(gap.gapCredits ?? gap.credits ?? 0),
      suggestion: gap.suggestion || `${gap.label || getModuleLabel(gap.module)}仍需补强课程描述、项目经历或在线课程证明。`
    });
    return {
      ...program,
      university: program.university || program.school || '待定学校',
      programName: program.programName || program.program || '待定项目',
      matchScore: Number(program.matchScore ?? program.evidenceScore ?? program.score ?? 0),
      reviewStatus: program.reviewStatus || program.sourceStatus || '待顾问复核',
      gapModules,
      moduleMatches: program.moduleMatches || moduleMatches
    };
  });
  const reviewQueue = engine.manualReviewQueue || engine.advisorReviewQueue || programMatches.flatMap(program => (program.gapModules || []).map(gap => ({
    university: program.university,
    programName: program.programName,
    module: gap.label || getModuleLabel(gap.module),
    issue: `${gap.label || getModuleLabel(gap.module)}缺口 ${gap.gapCredits || 0} 学分`,
    action: gap.suggestion || '由顾问核对课程描述和项目官网要求后给出补强方案',
    status: '待顾问复核'
  })));
  return {
    ...engine,
    moduleMatches,
    programMatches,
    programs: programMatches,
    gapModules: engine.gapModules || programMatches.flatMap(p => p.gapModules || []),
    advisorReviewQueue: reviewQueue,
    manualReviewQueue: reviewQueue,
    requirementProfiles: engine.requirementProfiles || programMatches.map(program => ({
      university: program.university,
      programName: program.programName,
      source: program.source || program.requirementSource || '官网来源待维护',
      status: program.reviewStatus || '待人工核实',
      modules: program.moduleMatches || moduleMatches
    }))
  };
}

function normalizeRunResult(result = {}) {
  const engine = normalizeCourseEngine(result.courseMatchingEngine || {});
  const matching = result.matching || result.courseMatching || [];
  const normalized = { ...result, matching, courseMatching: result.courseMatching || matching, courseMatchingEngine: engine };
  return {
    ...normalized,
    applicantLoop: normalized.applicantLoop || buildApplicantFullLoop(normalized.profile || loadIntakeProfile(), normalized)
  };
}

function estimateGermanGrade(profile = {}) {
  const average = Number(profile.averageScore);
  const max = Number(profile.maxScore);
  const pass = Number(profile.passScore);
  const grade = 1 + 3 * (max - average) / (max - pass);
  return Number.isFinite(grade) ? grade.toFixed(2) : '待计算';
}


function buildApplicantFullLoop(profile = createInitialProfile(), result = {}) {
  const grade = estimateGermanGrade(profile);
  const gradeValue = grade ? Number(grade) : null;
  const needsAps = !String(profile.apsStatus || '').includes('已通过');
  const needsLanguage = !profile.english || String(profile.english).includes('未') || String(profile.english).trim().length < 4;
  const isCrossMajor = String(profile.crossMajor || '').includes('是') || String(profile.crossMajor || '').includes('跨');
  const hasLowGrade = gradeValue ? gradeValue > 2.7 : false;
  const materialsChecklist = [
    { name: '成绩单 / 均分证明', status: profile.averageScore ? '已录入核心成绩，待上传正式文件' : '待补充', owner: '申请者', action: '上传中英文成绩单或学校盖章均分证明' },
    { name: '课程描述 / 模块说明', status: isCrossMajor ? '高优先级待补充' : '待补充', owner: '申请者', action: '补数学、统计、编程、专业核心课描述，用于课程匹配说明' },
    { name: '语言成绩', status: needsLanguage ? '待补充考试或官方成绩' : '已录入，待核对小分', owner: '申请者', action: '上传 IELTS/TOEFL/TestDaF/DSH 官方成绩单或考试计划' },
    { name: 'APS 材料', status: needsAps ? '未闭环' : '已通过/待上传证明', owner: '申请者', action: '确认 APS 状态，整理审核材料与递交时间' },
    { name: 'CV', status: '可生成初稿', owner: '申请者 + 顾问', action: '按德国申请格式补教育、项目、实习、技能和语言信息' },
    { name: 'Motivation Letter 素材', status: '已生成素材框架', owner: '申请者', action: '补真实项目/实习/课程案例，避免模板化' },
    { name: '推荐信', status: '待确认推荐人', owner: '申请者', action: '准备 1–2 位推荐人信息与沟通邮件' }
  ];
  const applicantTasks = [
    { title: '上传或整理课程描述', owner: '申请者', due: '48 小时内', priority: isCrossMajor ? '高' : '中', status: '待处理' },
    { title: '确认 APS 进度与材料清单', owner: '申请者', due: '本周内', priority: needsAps ? '高' : '低', status: needsAps ? '待处理' : '待上传证明' },
    { title: '上传语言成绩或考试计划', owner: '申请者', due: '本周内', priority: needsLanguage ? '高' : '中', status: needsLanguage ? '待处理' : '待核验' },
    { title: '补充 CV 与动机信真实经历素材', owner: '申请者', due: '3 天内', priority: '中', status: '待处理' },
    { title: '确认 3 个初筛项目是否接受进入官网复核', owner: '申请者', due: '本周内', priority: '中', status: '待确认' }
  ];
  const riskRegister = [
    isCrossMajor ? { level: '高', item: '跨专业/课程匹配风险', reason: '目标方向与本科专业存在差异，需用课程描述、项目经历和文书解释补强。', action: '优先补课程描述与课程匹配说明。' } : null,
    needsAps ? { level: '高', item: 'APS 风险', reason: `当前 APS 状态为「${profile.apsStatus || '未提供'}」，可能影响德国申请节奏。`, action: '建立 APS 材料清单并确认递交计划。' } : null,
    needsLanguage ? { level: '高', item: '语言风险', reason: '未录入有效语言成绩或缺官方证明。', action: '上传成绩单或制定最近考试计划。' } : null,
    hasLowGrade ? { level: '中', item: '成绩竞争力风险', reason: `德国制参考成绩 ${grade}，部分 NC/高竞争项目需谨慎。`, action: '扩大匹配/稳妥项目，并强化经历与课程匹配。' } : { level: '中', item: '官网核验风险', reason: '当前项目要求仍为本地规则初筛，deadline、VPD、uni-assist、NC 未实时核验。', action: '进入顾问官网核验或接入后端抓取服务。' }
  ].filter(Boolean);
  const motivationDraft = `Dear Admissions Committee,

I am ${profile.name || 'the applicant'}, currently studying ${profile.major || 'my undergraduate major'} at ${profile.university || 'my university'}. I am applying for a master's programme related to ${profile.targetDirection || 'my target field'} because my academic background and project interests have led me to focus on this area.

My current average score is ${profile.averageScore || 'N/A'} out of ${profile.maxScore || 'N/A'}, with a German reference grade of ${grade || 'to be calculated'}. ${isCrossMajor ? 'Because my application involves a cross-disciplinary transition, I will use my course descriptions, project experience and motivation letter to explain the academic bridge clearly.' : 'My undergraduate coursework provides a relevant foundation for the target direction.'}

At this stage, I understand that the programme requirements, deadlines and application path must be verified on the official university pages. I will therefore prepare course descriptions, language proof, APS-related materials and a programme-specific motivation letter before final submission.

Sincerely,
${profile.name || 'Applicant'}`;
  const courseMatchingDraft = `课程匹配说明初稿：申请者本科专业为「${profile.major || '未填写'}」，目标方向为「${profile.targetDirection || '未填写'}」。当前德国制参考成绩为 ${grade || '待计算'}。建议将已修课程按数学/统计、计算机/编程、专业核心、项目实践、研究方法五类整理；跨专业或课程缺口部分应结合课程描述、项目经历、实习经历和补充学习计划说明。该说明为本地规则草稿，进入正式申请前必须结合目标项目官网 ECTS 要求逐项复核。`;
  const nextActions = ['确认本次初筛项目是否进入顾问官网复核', '上传正式成绩单、课程描述、语言证明、APS 状态证明', '完善 CV / Motivation Letter 真实经历素材', '由顾问核验 deadline、申请路径、VPD/uni-assist/NC 与材料清单'];
  return {
    generatedAt: new Date().toISOString(), source: 'local-profile-rule-engine', grade,
    materialsChecklist, applicantTasks, riskRegister,
    documents: [
      { title: 'Motivation Letter 初稿', language: 'EN', status: '本地规则草稿，待顾问润色', content: motivationDraft },
      { title: '课程匹配说明初稿', language: 'ZH', status: '本地规则草稿，待官网 ECTS 复核', content: courseMatchingDraft }
    ],
    nextActions,
    exportPayload: { applicant: profile, grade, programs: result.programs || [], matching: result.courseMatching || [], materialsChecklist, applicantTasks, riskRegister, documents: ['Motivation Letter 初稿', '课程匹配说明初稿'], limitations: ['项目官网、deadline、VPD/uni-assist、NC 仍需官方来源核验', '当前无数据库后端时仅使用浏览器 localStorage 保存', 'AI Key 不可用时文书为本地规则草稿'] }
  };
}

function buildLocalDemoResult(profile = createInitialProfile()) {
  const p = normalizeIntakeProfile(profile);
  const gradeText = estimateGermanGrade(p);
  const moduleSummary = [
    { module: 'math', label: '数学基础', requiredCredits: 12, matchedCredits: 10, credits: 10, courseCount: 2, status: '部分满足', confidence: 0.78, averageConfidence: 0.78, courses: ['高等数学', '线性代数'], gap: '建议补充概率论/离散数学课程描述' },
    { module: 'statistics', label: '统计与概率', requiredCredits: 10, matchedCredits: 7, credits: 7, courseCount: 2, status: '部分满足', confidence: 0.74, averageConfidence: 0.74, courses: ['概率论与数理统计', '统计学'], gap: '需证明统计建模和推断训练' },
    { module: 'cs', label: '计算机基础', requiredCredits: 12, matchedCredits: 10, credits: 10, courseCount: 2, status: '部分满足', confidence: 0.72, averageConfidence: 0.72, courses: ['Python 程序设计', '数据结构基础'], gap: '算法/软件工程课程描述需补强' },
    { module: 'data', label: '数据与数据库', requiredCredits: 8, matchedCredits: 8, credits: 8, courseCount: 2, status: '满足', confidence: 0.84, averageConfidence: 0.84, courses: ['数据库原理', '数据分析实践'], gap: '无明显缺口' },
    { module: 'ai', label: 'AI / 数据科学', requiredCredits: 8, matchedCredits: 6, credits: 6, courseCount: 2, status: '部分满足', confidence: 0.7, averageConfidence: 0.7, courses: ['机器学习导论', '商业数据分析'], gap: '需补机器学习项目证据' },
    { module: 'major', label: '专业核心', requiredCredits: 12, matchedCredits: 14, credits: 14, courseCount: 2, status: '满足', confidence: 0.86, averageConfidence: 0.86, courses: ['信息管理系统', '管理信息系统'], gap: '跨专业解释需写清与目标方向关系' },
    { module: 'research', label: '研究方法', requiredCredits: 4, matchedCredits: 3, credits: 3, courseCount: 1, status: '部分满足', confidence: 0.66, averageConfidence: 0.66, courses: ['研究方法与论文写作'], gap: '可用毕业论文/课程论文补强' },
    { module: 'project', label: '项目实践', requiredCredits: 6, matchedCredits: 6, credits: 6, courseCount: 2, status: '满足', confidence: 0.8, averageConfidence: 0.8, courses: ['用户行为分析项目', 'Python 数据分析项目'], gap: '需上传项目说明或作品集' },
  ];
  const requirementProfiles = approvedPrograms.map((program, index) => ({
    university: program.university,
    program: program.program,
    programName: program.program,
    source: program.source,
    requirementSource: program.source,
    evidenceUrl: program.source,
    checkedAt: '演示数据，待官网复核',
    reviewStatus: '待人工核实',
    requirements: moduleSummary.slice(0, index === 0 ? 6 : 5).map(item => ({ module: item.module, label: item.label, requiredCredits: item.requiredCredits, credits: item.requiredCredits, type: item.status === '满足' ? '建议' : '硬性/重点' }))
  }));
  const programMatches = approvedPrograms.map((program, index) => {
    const score = [72, 80, 84][index] || 76;
    const missing = moduleSummary.filter(m => m.status !== '满足').slice(0, index === 2 ? 2 : 3);
    return {
      university: program.university,
      program: program.program,
      programName: program.program,
      requirementSource: program.source,
      checkedAt: '演示数据，待官网复核',
      tier: program.tier,
      matchScore: score,
      riskLevel: index === 0 ? '高' : index === 1 ? '中' : '中低',
      decision: index === 0 ? '冲刺保留，必须补课程证据' : index === 1 ? '建议优先推进' : '可作为稳妥备选',
      matchedModules: moduleSummary.filter(m => m.status === '满足').map(m => m.module),
      gapModules: missing.map(m => ({ module: m.module, label: m.label, gapCredits: Math.max(0, m.requiredCredits - m.matchedCredits), suggestion: m.gap })),
      moduleMatches: moduleSummary.map(m => ({
        module: m.module,
        label: m.label,
        requirementType: m.status === '满足' ? '建议模块' : '重点/硬性模块',
        requiredCredits: m.requiredCredits,
        matchedCredits: Math.max(0, m.matchedCredits - index),
        matchedCourses: m.courses,
        status: m.status,
        evidence: m.gap
      })),
      suggestions: missing.map(m => `${m.label}：${m.gap}`),
      source: program.source,
      reviewRequired: true
    };
  });
  const localResult = {
    ok: true,
    applicant: { ...baseApplicant, ...p, germanGrade: gradeText },
    grade: {
      originalScore: p.averageScore,
      maxScore: p.maxScore,
      passScore: p.passScore,
      value: gradeText,
      result: gradeText,
      formula: '1 + 3 × (最高分 - 申请者成绩) / (最高分 - 最低及格分)',
      note: '前端本地演示计算；正式版本以学校/uni-assist 官方认定为准。'
    },
    executiveSummary: { version: '本地课程匹配演示引擎' },
    programs: approvedPrograms,
    courseMatching: programMatches.map(m => ({ school: m.university, program: m.program, score: m.matchScore, risk: m.riskLevel, gaps: m.gapModules.map(g => typeof g === 'string' ? getModuleLabel(g) : (g.label || getModuleLabel(g.module))).join('、') })),
    courseMatchingEngine: {
      mode: 'local-fallback-demo',
      rationale: 'API 暂不可用时启用前端演示引擎；用于展示课程匹配证据链，不替代真实官网核验。',
      moduleSummary,
      programMatches,
      requirementProfiles,
      advisorReviewQueue: programMatches.flatMap(m => m.gapModules.map(gap => ({ university: m.university, program: m.program, issue: (typeof gap === 'string' ? getModuleLabel(gap) : `${gap.label || getModuleLabel(gap.module)}缺口 ${gap.gapCredits || 0} 学分`), priority: m.riskLevel === '高' ? '高' : '中', reason: '课程证据或 ECTS 仍需顾问复核' }))).slice(0, 6)
    },
    risks: weeklyReport.risks,
    tasks: weeklyTasks,
    generatedAt: new Date().toISOString()
  };
  return {
    ...localResult,
    applicantLoop: buildApplicantFullLoop(p, localResult)
  };
}


const questionStorageKey = 'deutschos.questionCenter.v1';

const questionCategories = [
  { value: 'application', label: '申请判断问题', targetRole: 'consultant', ownerLabel: '顾问', hint: '选校、课程匹配、APS/VPD、deadline、文书、材料解释' },
  { value: 'platform', label: '平台/数据问题', targetRole: 'admin', ownerLabel: '管理员', hint: '登录、上传、项目库错误、链接失效、权限、隐私、系统异常' },
  { value: 'uncertain', label: '不确定/需协同', targetRole: 'consultant', ownerLabel: '顾问先处理', hint: '先由顾问判断，必要时转交管理员' },
];

const questionStatusFlow = ['待处理', '处理中', '需补充', '已回复', '已关闭'];

const createInitialQuestions = () => ([
  {
    id: 'Q-2026-001',
    title: '课程描述不足会不会影响 Data Science 方向匹配？',
    category: 'application',
    targetRole: 'consultant',
    priority: '重要',
    status: '已回复',
    applicantName: '周栩正',
    related: '课程匹配 / 项目推荐',
    description: '目前只有课程名称和部分成绩，缺少英文课程描述，想确认是否会影响跨专业申请判断。',
    createdAt: '2026-06-11 10:20',
    updatedAt: '2026-06-11 15:40',
    replies: [
      { role: 'consultant', author: '顾问端', message: '会影响硬性学分核验。建议优先补充数学、统计、编程、专业核心课的英文课程描述，并在课程匹配说明中解释项目经历。', at: '2026-06-11 15:40' }
    ],
    internalNotes: '可关联课程匹配诊断与文书说明。',
  },
  {
    id: 'Q-2026-002',
    title: 'TUM 项目官网链接需要复核',
    category: 'platform',
    targetRole: 'admin',
    priority: '普通',
    status: '处理中',
    applicantName: '周栩正',
    related: '项目库 / 官网核验',
    description: '申请者看到项目库中部分官网入口仍是示范链接，希望管理员确认项目库来源。',
    createdAt: '2026-06-11 11:05',
    updatedAt: '2026-06-11 11:30',
    replies: [
      { role: 'admin', author: '管理员端', message: '已进入项目库复核队列，下一版将区分官网原文、抓取日期和待人工核实标签。', at: '2026-06-11 11:30' }
    ],
    internalNotes: '项目库质量问题，需管理员处理。',
  },
]);

function loadQuestions() {
  try {
    const raw = localStorage.getItem(questionStorageKey);
    if (raw) return JSON.parse(raw);
  } catch (error) {
    console.warn('question center fallback', error);
  }
  return createInitialQuestions();
}

function saveQuestions(nextQuestions) {
  localStorage.setItem(questionStorageKey, JSON.stringify(nextQuestions));
}

function getQuestionCategory(value) {
  return questionCategories.find(c => c.value === value) || questionCategories[0];
}

function nowLabel() {
  return new Date().toLocaleString('zh-CN', { hour12: false }).replaceAll('/', '-');
}

function nextQuestionId(questions) {
  const max = questions.reduce((acc, q) => {
    const n = Number(String(q.id || '').split('-').pop());
    return Number.isFinite(n) ? Math.max(acc, n) : acc;
  }, 0);
  return `Q-2026-${String(max + 1).padStart(3, '0')}`;
}

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


const sampleScheduledTaskPayload = {
  schemaVersion: 'deutschos-scheduled-task-result-v1',
  applicantId: 'app-001',
  taskId: 'weekly-application-progress-report',
  runId: 'weekly-2026-06-29-app-001',
  generatedAt: '2026-06-29T09:00:00+08:00',
  result: {
    title: '第 3 周申请推进周报',
    period: '2026-06-29 至 2026-07-05',
    summary: '小浣熊平台定时任务发现：APS 仍是最高优先级，课程描述补充进度影响项目匹配判断；本周建议顾问完成官网路径复核并发布申请者任务。',
    done: ['完成 Supabase 项目创建', '完成定时任务包创建', '完成申请者门户 JSON 同步链路'],
    next: ['完成 APS 材料准备清单', '补齐统计/数据库/Python 课程描述', '顾问复核 Saarland 与 TH Köln 官方申请路径'],
    programs: [
      { university: 'Saarland University', program: 'Data Science and Artificial Intelligence', tier: '匹配', status: '需复核官网路径', deadline: '待官网确认', path: '官网入口 / uni-assist 待确认', risk: '中', source: 'https://www.uni-saarland.de/', checkedAt: '2026-06-29', note: '定时任务建议本周复核 language requirements 与 application procedure。' },
      { university: 'TH Köln', program: 'Web and Data Science', tier: '稳妥', status: '材料补强后推进', deadline: '待官网确认', path: '官网 / 申请平台待确认', risk: '中', source: 'https://www.th-koeln.de/', checkedAt: '2026-06-29', note: '适合作为 HAW/FH 稳妥方向，需确认课程 ECTS。' }
    ],
    materials: [
      { name: '课程描述', status: '待补充', owner: '申请者', note: '统计、数据库、Python 课程描述缺失。' },
      { name: 'APS', status: '未开始', owner: '申请者', note: '本周最高优先级，需确认材料清单。' }
    ],
    tasks: [
      { title: '上传统计/数据库/Python 课程描述', owner: '申请者', due: '本周五', priority: '高', status: '未完成' },
      { title: '整理 APS 材料清单并确认递交流程', owner: '申请者', due: '本周四', priority: '高', status: '未完成' },
      { title: '顾问复核两个项目官网申请路径', owner: '顾问', due: '本周三', priority: '高', status: '待处理' }
    ],
    risks: [
      { type: 'APS', level: '高', description: 'APS 未开始，可能影响后续申请节奏。', suggestedAction: '本周完成 APS 材料清单确认。', visibleToApplicant: true },
      { type: '课程匹配', level: '中', description: '课程描述缺失，ECTS 匹配无法最终确认。', suggestedAction: '先补统计、数据库、Python 课程。', visibleToApplicant: true },
      { type: '官网核验', level: '中', description: 'deadline、语言要求和申请平台仍需官网复核。', suggestedAction: '由顾问完成官网核验后再发布最终判断。', visibleToApplicant: false }
    ]
  }
};

const sampleScheduledTaskJson = JSON.stringify(sampleScheduledTaskPayload, null, 2);

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
    applicantLoop: payload.applicantLoop || null,
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

function mergeIncomingPortalData(incoming = {}) {
  const local = loadPublishedData(false);
  return mergePortalData({
    ...local,
    ...incoming,
    applicant: { ...(local.applicant || {}), ...(incoming.applicant || {}) },
    materials: incoming.materials?.length ? incoming.materials : local.materials,
    programs: incoming.programs?.length ? incoming.programs : local.programs,
    tasks: incoming.tasks?.length ? incoming.tasks : local.tasks,
    risks: incoming.risks?.length ? incoming.risks : local.risks,
    weeklyReport: incoming.weeklyReport || local.weeklyReport,
    expertOutputs: incoming.expertOutputs || local.expertOutputs,
    applicantLoop: incoming.applicantLoop || local.applicantLoop || null,
    source: incoming.source || local.source
  });
}

function saveSharedPortalData(data) {
  const normalized = mergeIncomingPortalData(data);
  portalStorageKeys.forEach(key => localStorage.setItem(key, JSON.stringify(normalized)));
  return normalized;
}

function loadPublishedData(mergeWithDefault = true) {
  try {
    for (const key of portalStorageKeys) {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        return mergeWithDefault ? mergePortalData({ ...defaultPortalData, ...parsed }) : parsed;
      }
    }
    return defaultPortalData;
  } catch {
    return defaultPortalData;
  }
}

function Status({ value }) {
  const cls = /高|未|待|风险|复核|阻塞/.test(value) ? 'warn' : /已|完成|采纳|通过/.test(value) ? 'ok' : 'info';
  return <span className={`pill ${cls}`}>{value}</span>;
}

function Login({ onLogin, authStatus }) {
  const [email, setEmail] = useState('student@demo.com');
  const [password, setPassword] = useState('demo123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const submit = async (account) => {
    const targetEmail = account?.email || email;
    const targetPassword = account?.password || password;
    setLoading(true);
    setError('');
    try {
      const data = await api('/auth/login', { email: targetEmail, password: targetPassword });
      if (!data.ok) throw new Error(data.error || '登录失败');
      onLogin({
        role: data.user.role,
        label: accounts.find(a => a.role === data.user.role)?.label || data.user.role,
        email: data.user.email,
        name: data.user.name,
        applicantId: data.user.applicantId || 'app-001',
        assignedApplicants: data.user.assignedApplicants || [],
        authMode: data.mode,
        session: data.session
      });
    } catch (err) {
      const fallback = account || accounts.find(a => a.email === targetEmail && a.password === targetPassword);
      if (fallback) {
        onLogin({ ...fallback, applicantId: fallback.role === 'student' ? 'app-001' : null, authMode: 'client-demo-fallback' });
      } else {
        setError(err.message || '登录失败，请检查账号或 Auth 配置。');
      }
    } finally {
      setLoading(false);
    }
  };
  return <>
    <div className="login-shell">
      <section className="login-hero">
        <div className="eyebrow">DeutschOS Step 10 · Auth 与多用户权限隔离</div>
        <h1>从演示账号升级到 Supabase Auth 与角色权限控制</h1>
        <p>申请者、顾问、管理员通过统一登录入口进入系统。真实 Auth 配置完成后，系统会按 user_roles 与 consultant_applicants 控制 applicantId、角色和可见数据。</p>
        <div className="flow-strip"><span>Supabase Auth</span><b>→</b><span>角色映射</span><b>→</b><span>数据隔离</span><b>→</b><span>顾问审核发布</span></div>
      </section>
      <section className="login-card">
        <h2>登录门户</h2>
        <div className="auth-status"><b>Auth 状态</b><Status value={authStatus?.mode || '检测中'} /><small>{authStatus?.configured?.SUPABASE_ANON_KEY ? '已配置 SUPABASE_ANON_KEY，可使用真实 Auth 用户。' : '尚未配置 SUPABASE_ANON_KEY 或 Auth 用户，演示账号兜底可用。'}</small></div>
        <label>邮箱<input value={email} onChange={e => setEmail(e.target.value)} /></label>
        <label>密码<input type="password" value={password} onChange={e => setPassword(e.target.value)} /></label>
        {error && <div className="error">{error}</div>}
        <button className="primary" disabled={loading} onClick={() => submit()}>{loading ? '登录中…' : '登录门户'}</button>
        <div className="demo-accounts">
          {accounts.map(a => <button key={a.role} onClick={() => submit(a)}><b>{a.label}</b><small>{a.email} / demo123</small></button>)}
        </div>
        <p className="note">真实上线需要在 Supabase Authentication 中创建用户，并在 user_roles 表维护角色。</p>
      </section>
    </div>
    <div className="login-wide"><ExpertCenterMapping compact /></div>
  </>;
}

function Shell({ user, onLogout, navState = {}, children }) {
  const hasRunResult = Boolean(navState.hasRunResult);
  const hasApplicantLoop = Boolean(navState.hasApplicantLoop);
  const hasCourseReview = Boolean(navState.hasCourseReview);
  const hasPrograms = Boolean(navState.hasPrograms);
  const hasPolicyRadar = Boolean(navState.hasPolicyRadar);
  const hasWriting = Boolean(navState.hasWriting);
  const hasRequirementProfiles = Boolean(navState.hasRequirementProfiles);

  const navMap = {
    student: [
      ['首页', 'home'], ['申请资料', 'profile'], ['问题反馈', 'questions'], ['项目推荐', 'projects'], ['任务/周报', 'tasks'], ['风险提醒', 'risks'],
      ...(hasApplicantLoop ? [['申请者完整闭环', 'applicant-loop']] : [])
    ],
    consultant: [
      ['首页', 'home'], ['问题收件箱', 'questions'],
      ...(hasApplicantLoop ? [['新复核任务', 'applicant-sync-review']] : []),
      ...(hasCourseReview ? [['课程复核', 'course-review']] : []),
      ['申请者', 'profile'],
      ...(hasPrograms ? [['匹配结果', 'matching'], ['多校看板', 'projects']] : []),
      ...(hasPolicyRadar ? [['政策雷达', 'policy-radar']] : []),
      ...(hasWriting ? [['文书依据', 'writing']] : []),
      ['JSON 同步', 'json-sync'], ['定时任务', 'scheduled-tasks'], ['审核发布', 'review']
    ],
    admin: [
      ['首页', 'home'], ['专家中心', 'expert-center'], ['平台工单', 'tickets'],
      ...(hasRequirementProfiles ? [['项目画像', 'requirement-profiles']] : []),
      ...(hasApplicantLoop ? [['三端闭环', 'three-role-loop']] : []),
      ['数据库', 'database'], ['权限', 'auth'], ['账号', 'accounts'], ['项目库', 'projects'], ['隐私商业化', 'commercialization']
    ]
  };
  const jump = target => {
    const root = document.querySelector('.workspace');
    const el = target === 'home' ? root : document.querySelector(`[data-nav="${target}"]`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><b>DeutschOS</b><span>申请者门户 + 小浣熊后台</span></div>
      <nav>{(navMap[user.role] || navMap.student).map(([label, target]) => <button className="nav-link" key={target} onClick={() => jump(target)}>{label}</button>)}</nav>
      <div className="user-box"><span>当前角色</span><b>{user.label}</b><small>{user.email}</small><small>{user.authMode || 'demo'} · {user.applicantId || '全局/顾问视图'}</small><button onClick={onLogout}>退出登录</button></div>
    </aside>
    <main className="workspace" data-nav="home">{children}</main>
  </div>;
}

function Header({ eyebrow, title, desc, actions }) {
  return <header className="page-head"><div><span>{eyebrow}</span><h1>{title}</h1><p>{desc}</p></div>{actions && <div className="head-actions">{actions}</div>}</header>;
}

function WorkflowStrip({ steps = [] }) {
  return <section className="workflow-strip">{steps.map((step, index) => <div className="workflow-step" key={step}><span>{index + 1}</span><b>{step}</b></div>)}</section>;
}

function V04ResultPanel({ result }) {
  if (!result?.executiveSummary) return null;
  const summary = result.executiveSummary;
  const profile = result.applicantProfile || {};
  return <section className="panel v04-panel">
    <div className="section-title"><div><h2>v0.4 MVP 工作台闭环</h2><p className="muted">从申请者画像、成绩换算、课程匹配到官网核验与政策雷达，统一输出可审核的申请工作台结果。</p></div><Status value={summary.version} /></div>
    <WorkflowStrip steps={summary.workflow || result.workflowSteps || []} />
    <div className="grid-4 compact">
      <article className="metric accent"><span>德国制成绩</span><b>{summary.germanGrade || result.grade?.value}</b><small>修正巴伐利亚公式参考值</small></article>
      <article className="metric"><span>最高匹配</span><b>{summary.bestFit}</b><small>仍需官网逐项核验</small></article>
      <article className="metric"><span>项目数量</span><b>{result.programs?.length || 0}</b><small>TU9 / 综合性大学 / FH-HAW</small></article>
      <article className="metric"><span>待人工复核</span><b>{result.programs?.filter(p => p.reviewRequired).length || 0} 项</b><small>deadline / NC / VPD / APS</small></article>
    </div>
    <div className="two-col tight"><div><h3>申请者画像摘要</h3><ul className="clean-list"><li>{profile.education}</li><li>目标：{profile.targetDirection}</li><li>语言：{profile.language}</li><li>APS：{profile.apsStatus}</li></ul></div><div><h3>优先风险与下一步</h3><ul className="clean-list">{(summary.topRisks || []).map(r => <li key={r}>{r}</li>)}<li>{summary.nextAction}</li></ul></div></div>
    <p className="guardrail">{summary.guardrail}</p>
  </section>;
}


function ExpertCenterMapping({ compact = false }) {
  const mappings = [
    { capability: '文档理解', expert: '申请者画像专家', output: '成绩单、课程、经历结构化' },
    { capability: '数据分析', expert: '成绩与课程匹配专家', output: '德国制成绩、模块学分、匹配证据' },
    { capability: '信息核验', expert: '项目官网核验专家', output: 'deadline、语言、APS、VPD 来源链' },
    { capability: '写作生成', expert: '文书与解释材料专家', output: 'Motivation Letter、课程缺口说明' },
    { capability: '任务规划', expert: '申请规划专家', output: '申请看板、本周任务、阻塞项' },
    { capability: '风险控制', expert: '风控专家', output: '课程缺口、跨专业、deadline 风险' },
    { capability: '报告/PPT', expert: '交付专家', output: '顾问报告、竞赛汇报材料' },
    { capability: '记忆与定时任务', expert: '政策雷达专家', output: '项目画像沉淀、官网变化提醒' },
  ];
  return <section className="panel expert-center-map" data-nav="expert-center">
    <div className="section-title">
      <div>
        <span className="eyebrow">能力底座 × 垂直场景</span>
        <h2>小浣熊专家中心 × DeutschOS 专家团</h2>
        <p className="muted">将办公小浣熊的通用专家能力，封装为德国硕士申请中的课程匹配、项目核验、风控、文书和任务规划专家。</p>
      </div>
      <Status value="能力映射 / 可接入架构" />
    </div>
    <div className="expert-flow">
      <div><b>办公小浣熊专家中心</b><span>文档理解、分析、写作、规划、核验、报告、记忆、定时任务</span></div>
      <div className="flow-arrow">→</div>
      <div><b>DeutschOS 小浣熊专家团</b><span>面向德国硕士申请的场景化专家角色</span></div>
      <div className="flow-arrow">→</div>
      <div><b>顾问工作台复核发布</b><span>规则引擎 + 官网来源 + 人工复核，避免黑箱判断</span></div>
    </div>
    <div className="mapping-grid">
      {mappings.slice(0, compact ? 6 : mappings.length).map(item => <article className="mapping-card" key={item.capability}>
        <span>{item.capability}</span>
        <b>{item.expert}</b>
        <p>{item.output}</p>
      </article>)}
    </div>
    <div className="boundary-note">
      <b>当前边界：</b>本 Demo 已实现专家协作流程、课程匹配证据引擎、顾问复核台和管理员项目画像维护；当前表述为专家中心能力映射与可接入架构，未宣称已完成专家中心后台 API 的真实接入。
    </div>
  </section>;
}

function PrivacyCommercialBlock({ result = {} }) {
  const privacy = result.privacyAndCompliance || {};
  const commercialization = result.commercialization || {};
  const principles = privacy.principles || [
    '最小化采集申请材料',
    '学生、顾问、管理员角色隔离',
    '敏感字段脱敏展示',
    '官网关键要求必须人工复核'
  ];
  const studentPackage = commercialization.studentPackage || ['申请诊断报告', '项目匹配建议', '课程缺口清单'];
  const consultantWorkspace = commercialization.consultantWorkspace || ['多学生管理', '项目库核验', '任务看板'];

  return <section className="panel privacy-commercial-block" data-nav="commercialization">
    <div className="section-title">
      <div>
        <span className="eyebrow">隐私合规 × 商业化边界</span>
        <h2>可演示，但不越界承诺</h2>
        <p className="muted">把 Demo 中涉及申请材料、顾问复核和商业包装的边界明确展示，便于后续进入真实产品化阶段。</p>
      </div>
      <Status value="Demo Guardrail" />
    </div>
    <div className="three-col">
      <article className="mini-card"><span>合规原则</span><ul className="clean-list">{principles.map(item => <li key={item}>{item}</li>)}</ul></article>
      <article className="mini-card"><span>学生诊断包</span><ul className="clean-list">{studentPackage.map(item => <li key={item}>{item}</li>)}</ul></article>
      <article className="mini-card"><span>顾问工作台</span><ul className="clean-list">{consultantWorkspace.map(item => <li key={item}>{item}</li>)}</ul></article>
    </div>
    <p className="guardrail">{privacy.demoBoundary || commercialization.value || '当前为 Demo 原型：真实商用前需补充隐私政策、审计日志、数据删除/导出机制与人工复核责任边界。'}</p>
  </section>;
}

function VerificationTable({ programs = [] }) {
  if (!programs.length) return null;
  return <section className="panel verification-table"><div className="section-title"><div><h2>官网核验表 v0.4</h2><p className="muted">保留来源入口、抓取日期、核验状态和待人工复核标签；未确认信息不推断。</p></div></div><div className="responsive-table"><table><thead><tr><th>学校 / 项目</th><th>路径</th><th>APS / VPD</th><th>Deadline / NC</th><th>来源与状态</th></tr></thead><tbody>{programs.map(p => <tr key={p.id}><td><b>{p.university}</b><small>{p.programName} · {p.universityType}</small></td><td>{p.applicationPlatform}<small>{p.teachingLanguage} · {p.degreeType}</small></td><td>{p.apsRequired}<small>{p.vpdRequired}</small></td><td>{p.deadline}<small>{p.ncStatus}</small></td><td><a href={p.sourceUrl} target="_blank">官方入口</a><div className="tags"><Status value={p.verification?.status || '待人工复核'} /><Status value={p.confidence || 'medium'} /></div><small>{p.checkedAt?.slice(0, 10)}</small></td></tr>)}</tbody></table></div></section>;
}

function CourseMatchingMatrix({ rows = [], engine, onRunDemo, highlight = false }) {
  const evidenceEngine = engine || null;
  const moduleSummary = evidenceEngine?.moduleSummary || [];
  const programMatches = evidenceEngine?.programMatches || rows;
  const reviewQueue = evidenceEngine?.manualReviewQueue || evidenceEngine?.advisorReviewQueue || [];
  const hasResult = moduleSummary.length > 0 || programMatches.length > 0;
  const moduleLabel = value => moduleSummary.find(m => m.module === value || m.label === value)?.label || value;
  return <section className={`panel course-engine ${highlight ? 'course-engine-hero' : ''}`} data-nav="matching">
    <div className="section-title"><div><span className="eyebrow">DeutschOS 核心竞争力</span><h2>课程匹配证据引擎</h2><p className="muted">不是简单 AI 评分，而是“申请者课程 → 模块归类 → 项目要求画像 → 逐项比对 → 风险与补强建议”的可追溯判断链。它回答德国院校最关键的问题：你的课程到底能不能支撑申请。</p></div><Status value={hasResult ? '已生成证据链' : '待生成'} /></div>
    <div className="course-principles">
      <article><b>1. 逐门课程归类</b><span>把成绩单课程映射到数学、统计、计算机、AI、研究方法、项目实践等模块。</span></article>
      <article><b>2. 项目画像比对</b><span>不同学校使用独立要求画像，避免一套权重硬套所有德国项目。</span></article>
      <article><b>3. 顾问复核闭环</b><span>低置信度、硬性学分缺口和跨专业解释进入顾问复核队列。</span></article>
    </div>
    {!hasResult && <div className="course-empty-state">
      <div><h3>当前还没有生成课程匹配结果</h3><p>请先保存申请资料并生成方案。系统会在 API 可用时调用后端课程引擎；API 暂不可用时自动使用本地演示引擎，保证评委能看到完整判断链。</p></div>
      {onRunDemo && <button className="primary" onClick={onRunDemo}>立即生成课程匹配方案</button>}
    </div>}
    {moduleSummary.length > 0 && <><h3 className="subsection-title">模块学分统计</h3><div className="module-grid">{moduleSummary.map(m => <article className="module-card" key={m.module}><span>{m.label || m.module}</span><b>{m.credits ?? m.matchedCredits ?? 0} 学分</b><small>{m.courseCount ?? m.courses?.length ?? 0} 门课程 · 置信度 {Math.round((m.averageConfidence || m.confidence || 0) * 100)}%</small><Status value={m.status || '待复核'} /></article>)}</div></>}
    {programMatches.length > 0 && <h3 className="subsection-title">项目级课程匹配证据</h3>}
    {programMatches.map(row => <article className="program-evidence" key={row.programId || `${row.university || row.school}-${row.programName || row.program}`}>
      <div className="match-head"><div><span>{row.university || row.school}</span><h3>{row.programName || row.program}</h3><small>{row.requirementSource || row.source || 'Demo 要求画像'} · {row.checkedAt || '待官网复核'}</small></div><b>{row.matchScore ?? row.score ?? '待评估'}</b></div>
      <div className="tags"><Status value={row.tier || '项目梯度'} /><Status value={`风险：${row.riskLevel || row.risk || '待复核'}`} /><Status value={row.reviewStatus || '需顾问复核'} /></div>
      <p>{row.recommendation || row.explanation || row.decision || '系统将结合课程模块、项目画像和顾问复核形成最终申请建议。'}</p>
      {row.moduleMatches?.length > 0 && <div className="responsive-table"><table><thead><tr><th>要求模块</th><th>要求学分</th><th>已匹配</th><th>匹配课程</th><th>状态</th><th>证据</th></tr></thead><tbody>{row.moduleMatches.map(m => <tr key={`${row.programId || row.programName}-${m.module}`}><td><b>{m.label || m.module}</b><small>{m.requirementType}</small></td><td>{m.requiredCredits}</td><td>{m.matchedCredits}</td><td>{Array.isArray(m.matchedCourses) ? m.matchedCourses.join('、') : (m.matchedCourses || '暂无明确课程')}</td><td><Status value={m.status} /></td><td><small>{m.evidence}</small></td></tr>)}</tbody></table></div>}
      <div className="two-col tight"><div><h4>缺口模块</h4><ul className="clean-list">{(row.gapModules || (row.gaps ? String(row.gaps).split('、') : [])).map((g, i) => <li key={typeof g === 'string' ? g : `${g.module || 'gap'}-${i}`}>{typeof g === 'string' ? moduleLabel(g) : `${g.label || moduleLabel(g.module)}${g.gapCredits ? `（缺口 ${g.gapCredits} 学分）` : ''}`}</li>)}</ul></div><div><h4>补强建议</h4><ul className="clean-list">{(row.suggestions || ['补充课程描述、项目证明和跨专业解释材料，由顾问复核后发布。']).map(s => <li key={s}>{String(s).replace(/^([a-z]+)：/, (_, code) => `${moduleLabel(code)}：`)}</li>)}</ul></div></div>
    </article>)}
    {reviewQueue.length > 0 && <section className="review-queue"><h3>顾问复核队列</h3><div className="cards">{reviewQueue.map((item, index) => <article className="review-item" key={item.id || `${item.issue}-${index}`}><b>{item.title || item.issue}</b><Status value={item.priority} /><p>{item.reason}</p><small>{item.action || `${item.university || ''} ${item.program || ''}`}</small></article>)}</div></section>}
    <div className="science-notes"><h3>判断依据与科学性</h3><ol>{(evidenceEngine?.scientificNotes || ['课程先归入标准模块，再与项目级要求画像逐项比对。', '分数只作为排序和风险提示，最终申请判断保留官网来源与顾问复核。', '不同德国项目使用独立画像，解决课程要求差异问题。']).map(n => <li key={n}>{n}</li>)}</ol></div>
  </section>;
}


function QuestionCard({ question, activeRole, onReply, onStatus, onTransfer, onCloseByApplicant }) {
  const [replyText, setReplyText] = useState('');
  const replies = question.replies || [];
  const targetLabel = question.targetRole === 'admin' ? '管理员' : '顾问';
  const statusLabel = question.status === 'closed' ? '已关闭' : question.status === 'answered' ? '已回复' : '待处理';
  return <article className="question-card">
    <div className="question-card-head">
      <div>
        <strong>{question.title || '未命名问题'}</strong>
        <p className="muted small">{question.category || '未分类'} · 接收方：{targetLabel} · {question.createdAt || '刚刚'}</p>
      </div>
      <span className={`status-pill ${question.status || 'open'}`}>{statusLabel}</span>
    </div>
    <p>{question.content || question.description || '暂无问题描述'}</p>
    <div className="question-replies">
      {replies.length ? replies.map((r, i) => <div className="reply-bubble" key={i}>
        <strong>{r.author || (r.role === 'admin' ? '管理员' : r.role === 'consultant' ? '顾问' : '申请者')}</strong>
        <span>{r.content || r.text}</span>
      </div>) : <p className="muted small">暂未回复，系统会按问题类型分发给{targetLabel}处理。</p>}
    </div>
    {activeRole === 'student' ? <div className="question-actions">
      {question.status !== 'closed' && <button className="ghost" onClick={() => onCloseByApplicant?.(question.id)}>关闭问题</button>}
    </div> : <div className="question-actions stacked-actions">
      <textarea value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="输入给申请者的回复，说明依据、下一步和是否需要补充材料" />
      <div className="button-row">
        <button className="primary" onClick={() => { if (replyText.trim()) { onReply?.(question.id, replyText.trim()); setReplyText(''); } }}>回复申请者</button>
        <button className="ghost" onClick={() => onStatus?.(question.id, 'answered')}>标记已回复</button>
        <button className="ghost" onClick={() => onTransfer?.(question.id, question.targetRole === 'admin' ? 'consultant' : 'admin')}>转交{question.targetRole === 'admin' ? '顾问' : '管理员'}</button>
      </div>
    </div>}
  </article>;
}

function StudentQuestionCenter({ questions, setQuestions, profile }) {
  const [draft, setDraft] = useState({ category: 'application', priority: '普通', title: '', related: '申请方案', description: '' });
  const myQuestions = questions.filter(q => q.applicantName === (profile.name || '周栩正'));
  const submitQuestion = () => {
    if (!draft.title.trim() || !draft.description.trim()) return;
    const category = getQuestionCategory(draft.category);
    const next = [{
      id: nextQuestionId(questions),
      title: draft.title.trim(),
      category: draft.category,
      targetRole: category.targetRole,
      priority: draft.priority,
      status: '待处理',
      applicantName: profile.name || '周栩正',
      related: draft.related,
      description: draft.description.trim(),
      createdAt: nowLabel(),
      updatedAt: nowLabel(),
      replies: [],
      internalNotes: '',
    }, ...questions];
    setQuestions(next);
    setDraft({ category: 'application', priority: '普通', title: '', related: '申请方案', description: '' });
  };
  const closeByApplicant = (id) => setQuestions(questions.map(q => q.id === id ? { ...q, status: '已关闭', updatedAt: nowLabel() } : q));
  return <section className="panel question-center" data-nav="questions">
    <div className="section-head"><div><h2>我的问题与反馈</h2><p>当系统暂时无法判断时，可提交给顾问或管理员，回复会回到这里形成闭环。</p></div><Status value={`${myQuestions.length} 条`} /></div>
    <div className="question-form">
      <div className="form-grid compact">
        <label>问题类型<select value={draft.category} onChange={e => setDraft({ ...draft, category: e.target.value })}>{questionCategories.map(c => <option key={c.value} value={c.value}>{c.label} → {c.ownerLabel}</option>)}</select></label>
        <label>优先级<select value={draft.priority} onChange={e => setDraft({ ...draft, priority: e.target.value })}><option>普通</option><option>重要</option><option>紧急</option></select></label>
        <label>关联对象<input value={draft.related} onChange={e => setDraft({ ...draft, related: e.target.value })} placeholder="如 TUM 项目 / 文件上传 / APS" /></label>
      </div>
      <label>问题标题<input value={draft.title} onChange={e => setDraft({ ...draft, title: e.target.value })} placeholder="用一句话描述问题" /></label>
      <label>问题说明<textarea value={draft.description} onChange={e => setDraft({ ...draft, description: e.target.value })} placeholder="补充背景、已尝试操作、希望顾问/管理员回答什么……" /></label>
      <button className="primary" onClick={submitQuestion}>提交并自动分发</button>
    </div>
    <div className="question-list">
      {myQuestions.map(q => <QuestionCard key={q.id} question={q} activeRole="student" onCloseByApplicant={closeByApplicant} />)}
    </div>
  </section>;
}

function StaffQuestionInbox({ role, questions, setQuestions }) {
  const inbox = questions.filter(q => q.targetRole === role);
  const replyQuestion = (id, message) => setQuestions(questions.map(q => q.id === id ? {
    ...q,
    status: '已回复',
    updatedAt: nowLabel(),
    replies: [...(q.replies || []), { role, author: role === 'consultant' ? '顾问端' : '管理员端', message, at: nowLabel() }]
  } : q));
  const updateStatus = (id, status) => setQuestions(questions.map(q => q.id === id ? { ...q, status, updatedAt: nowLabel() } : q));
  const transfer = (id, targetRole) => setQuestions(questions.map(q => q.id === id ? {
    ...q,
    targetRole,
    status: '待处理',
    updatedAt: nowLabel(),
    replies: [...(q.replies || []), { role, author: role === 'consultant' ? '顾问端' : '管理员端', message: `已转交${targetRole === 'admin' ? '管理员' : '顾问'}继续处理。`, at: nowLabel() }]
  } : q));
  return <section className="panel question-center" data-nav={role === 'consultant' ? 'questions' : 'tickets'}>
    <div className="section-head"><div><h2>{role === 'consultant' ? '申请问题收件箱' : '平台问题与数据工单'}</h2><p>{role === 'consultant' ? '处理选校、课程匹配、文书、deadline、APS/VPD 等申请判断问题。' : '处理登录、上传、项目库、权限隐私、官网链接和系统数据问题。'}</p></div><Status value={`${inbox.length} 条待看`} /></div>
    <div className="question-list">
      {inbox.map(q => <QuestionCard key={q.id} question={q} activeRole={role} onReply={replyQuestion} onStatus={updateStatus} onTransfer={transfer} />)}
      {!inbox.length && <div className="reply-empty">当前没有分发到本角色的问题。</div>}
    </div>
  </section>;
}

function ApplicantIntakeModal({ profile, setProfile, onClose, onRunDemo }) {
  const [saveNotice, setSaveNotice] = useState('');
  const update = (field, value) => setProfile(prev => normalizeIntakeProfile({ ...prev, [field]: value }));
  const saveProfile = () => {
    const saved = saveIntakeProfile(profile);
    setProfile(saved);
    setSaveNotice('资料已保存到本地，可直接用于生成方案。');
    return saved;
  };
  const addFiles = (bucket, fileList) => {
    const files = Array.from(fileList || []).map(file => ({
      id: `${bucket}-${file.name}-${file.size}-${Date.now()}`,
      bucket,
      name: file.name,
      size: file.size,
      type: file.type || 'unknown',
      uploadedAt: new Date().toISOString()
    }));
    if (!files.length) return;
    setProfile(prev => ({ ...prev, uploadedFiles: [...(prev.uploadedFiles || []), ...files] }));
  };
  const removeFile = id => setProfile(prev => ({ ...prev, uploadedFiles: (prev.uploadedFiles || []).filter(f => f.id !== id) }));
  return <div className="modal-backdrop" role="dialog" aria-modal="true">
    <section className="modal intake-modal">
      <div className="modal-head"><div><span>Applicant Intake</span><h2>申请者信息录入与材料上传</h2><p>这里是成绩换算、课程匹配、项目推荐、文书和申请看板的数据起点。</p></div><button className="ghost" onClick={onClose}>关闭</button></div>
      <div className="intake-grid">
        <label>申请者姓名<input value={profile.name || ''} onChange={e => update('name', e.target.value)} /></label>
        <label>当前身份<select value={profile.currentDegree || ''} onChange={e => update('currentDegree', e.target.value)}><option>本科应届生</option><option>已毕业工作党</option><option>本科在读</option><option>其他</option></select></label>
        <label>本科院校<input value={profile.university || ''} onChange={e => update('university', e.target.value)} /></label>
        <label>本科专业<input value={profile.major || ''} onChange={e => update('major', e.target.value)} /></label>
        <label>目标方向<input value={profile.targetDirection || ''} onChange={e => update('targetDirection', e.target.value)} /></label>
        <label>申请入学季<input value={profile.intake || ''} onChange={e => update('intake', e.target.value)} /></label>
        <label>跨专业情况<select value={profile.crossMajor || ''} onChange={e => update('crossMajor', e.target.value)}><option>否</option><option>部分跨专业</option><option>是</option></select></label>
        <label>语言偏好<input value={profile.targetPreferences || ''} onChange={e => update('targetPreferences', e.target.value)} /></label>
        <label>原始均分<input type="number" value={profile.averageScore || ''} onChange={e => update('averageScore', Number(e.target.value))} /></label>
        <label>评分满分<input type="number" value={profile.maxScore || ''} onChange={e => update('maxScore', Number(e.target.value))} /></label>
        <label>最低及格分<input type="number" value={profile.passScore || ''} onChange={e => update('passScore', Number(e.target.value))} /></label>
        <label>GPA / 排名 / 荣誉<input value={profile.gpaRank || ''} onChange={e => update('gpaRank', e.target.value)} /></label>
        <label>英语成绩<input value={profile.english || ''} onChange={e => update('english', e.target.value)} /></label>
        <label>德语成绩<input value={profile.german || ''} onChange={e => update('german', e.target.value)} /></label>
        <label>APS 状态<select value={profile.apsStatus || ''} onChange={e => update('apsStatus', e.target.value)}><option>未开始</option><option>准备中</option><option>已递交</option><option>已通过</option><option>不确定</option></select></label>
      </div>
      <label className="wide-field">课程摘要 / 课程缺口<textarea value={profile.courseSummary || ''} onChange={e => update('courseSummary', e.target.value)} /></label>
      <label className="wide-field">实习 / 科研 / 项目经历<textarea value={profile.experiences || ''} onChange={e => update('experiences', e.target.value)} /></label>
      <div className="upload-zone"><div><h3>申请材料上传入口</h3><p>本 Demo 先保存文件名、类型、大小等元数据；正式版可接入成绩单/PDF/Excel 解析和安全存储。</p></div><div className="upload-grid">{fileBuckets.map(bucket => <label className="upload-card" key={bucket}><b>{bucket}</b><small>选择文件</small><input type="file" multiple onChange={e => addFiles(bucket, e.target.files)} /></label>)}</div></div>
      {(profile.uploadedFiles || []).length > 0 && <div className="file-list"><h3>已选择材料</h3>{profile.uploadedFiles.map(file => <div className="file-row" key={file.id}><span><b>{file.bucket}</b> · {file.name}</span><small>{Math.ceil(file.size / 1024)} KB · {file.type}</small><button onClick={() => removeFile(file.id)}>移除</button></div>)}</div>}
      {saveNotice && <div className="save-notice">{saveNotice}</div>}
      <div className="modal-actions"><button className="secondary" onClick={onClose}>关闭</button><button className="secondary" onClick={() => { saveProfile(); onClose(); }}>保存资料</button><button className="primary" onClick={() => { const saved = saveProfile(); onRunDemo(saved); onClose(); }}>保存并生成方案</button></div>
    </section>
  </div>;
}

function ApplicantIntakeSummary({ profile }) {
  return <section className="panel intake-summary" data-nav="profile"><div className="section-title"><div><h2>申请资料录入</h2><p className="muted">先录入申请者背景与上传材料，再生成成绩换算、课程匹配、项目推荐和申请看板。入口已固定在页面右上角“录入 / 上传资料”。</p></div><Status value="资料入口" /></div><div className="grid-4 compact"><article className="metric"><span>申请者</span><b>{profile.name || '待填写'}</b><small>{profile.university || '院校待填'} · {profile.major || '专业待填'}</small></article><article className="metric"><span>目标方向</span><b>{profile.targetDirection || '待填写'}</b><small>{profile.intake || '入学季待填'}</small></article><article className="metric"><span>成绩参数</span><b>{profile.averageScore || '-'} / {profile.maxScore || '-'}</b><small>及格线 {profile.passScore || '-'}</small></article><article className="metric"><span>已选材料</span><b>{profile.uploadedFiles?.length || 0} 份</b><small>成绩单、课程描述、CV、语言等</small></article></div></section>;
}



function mergeApplicantLoopIntoPortal(currentPortal = {}, result = {}, profile = createInitialProfile()) {
  const loop = result.applicantLoop || buildApplicantFullLoop(profile, result);
  const applicantName = profile.name || '申请者';
  const generatedAt = loop.generatedAt || new Date().toISOString();
  const loopTasks = (loop.applicantTasks || []).map((task, index) => ({
    id: `app-loop-task-${index + 1}`,
    task: task.title || task.task,
    owner: task.owner || '申请者',
    due: task.due || '本周内',
    priority: task.priority || '中',
    status: task.status || '待处理',
    source: '申请者资料生成'
  }));
  const consultantTasks = (loop.riskRegister || []).map((risk, index) => ({
    id: `consultant-review-${index + 1}`,
    task: `复核${applicantName}：${risk.item}`,
    owner: '顾问',
    due: '24 小时内',
    priority: risk.level === '高' ? '高' : '中',
    status: '待顾问复核',
    source: '申请者资料生成'
  }));
  const risks = (loop.riskRegister || []).map(risk => ({
    type: risk.item,
    level: risk.level,
    description: risk.reason,
    suggestedAction: risk.action,
    visibleToApplicant: true,
    source: '申请者资料生成',
    generatedAt
  }));
  const materials = (loop.materialsChecklist || []).map(item => ({
    name: item.name,
    status: item.status,
    note: item.action,
    owner: item.owner,
    source: '申请者资料生成'
  }));
  return {
    ...currentPortal,
    applicantSnapshot: { ...profile, generatedAt, grade: loop.grade },
    materials,
    tasks: [...loopTasks, ...consultantTasks],
    risks,
    documents: loop.documents || [],
    lastGeneratedPackage: loop.exportPayload,
    syncStatus: {
      source: 'localStorage-three-role-loop',
      generatedAt,
      applicantReady: true,
      consultantReviewPending: consultantTasks.length,
      managerVisible: true,
      limitations: loop.exportPayload?.limitations || []
    }
  };
}

function ApplicantFullLoopPanel({ loop, onRegenerate }) {
  if (!loop) return <section className="panel"><div className="section-title"><div><h2>申请者闭环工作台</h2><p className="muted">录入资料后点击“用当前资料生成方案”，系统会生成材料清单、任务、风险、文书草稿和导出包。</p></div><button className="primary" onClick={onRegenerate}>立即生成</button></div></section>;
  const downloadPackage = () => {
    const blob = new Blob([JSON.stringify(loop.exportPayload || loop, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `deutschos-applicant-package-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  return <section className="panel" data-nav="applicant-loop">
    <div className="section-title"><div><h2>申请者完整闭环</h2><p className="muted">以下内容由当前申请者资料本地规则引擎生成，可直接作为顾问复核和正式申请准备清单。</p></div><div className="actions"><button className="secondary" onClick={onRegenerate}>重新生成</button><button className="primary" onClick={downloadPackage}>下载申请包 JSON</button></div></div>
    <div className="grid-4 compact">
      <article className="metric"><span>材料清单</span><b>{loop.materialsChecklist?.length || 0} 项</b><small>成绩单、课程描述、语言、APS、CV</small></article>
      <article className="metric"><span>申请任务</span><b>{loop.applicantTasks?.length || 0} 项</b><small>按优先级给申请者执行</small></article>
      <article className="metric"><span>风险提醒</span><b>{loop.riskRegister?.length || 0} 项</b><small>高风险优先补材料</small></article>
      <article className="metric"><span>文书草稿</span><b>{loop.documents?.length || 0} 篇</b><small>本地规则草稿，待顾问润色</small></article>
    </div>
    <div className="responsive-table"><table><thead><tr><th>材料</th><th>状态</th><th>负责人</th><th>下一步</th></tr></thead><tbody>{(loop.materialsChecklist || []).map(item => <tr key={item.name}><td><b>{item.name}</b></td><td><Status value={item.status} /></td><td>{item.owner}</td><td>{item.action}</td></tr>)}</tbody></table></div>
    <div className="panel two-col nested"><div><h3>申请者待办</h3><div className="mini-table">{(loop.applicantTasks || []).map(task => <div key={task.title}><b>{task.title}</b><Status value={task.priority} /><small>{task.due} · {task.status}</small></div>)}</div></div><div><h3>风险与处理动作</h3>{(loop.riskRegister || []).map(risk => <div className="review-item" key={risk.item}><b>{risk.item}</b><Status value={risk.level} /><p>{risk.reason}</p><small>{risk.action}</small></div>)}</div></div>
    <div className="document-grid">{(loop.documents || []).map(doc => <article className="document-draft" key={doc.title}><div className="section-title"><div><b>{doc.title}</b><p className="muted">{doc.language} · {doc.status}</p></div><Status value="可复制" /></div><div className="document-body">{String(doc.content || '').split(/\n{2,}|\n/).filter(Boolean).map((para, idx) => <p key={idx}>{para}</p>)}</div></article>)}</div>
    <div className="science-notes"><h3>真实落地边界</h3><ol><li>当前材料、任务、风险和文书草稿已由本地资料真实生成，并可下载 JSON 申请包。</li><li>官网 deadline、VPD/uni-assist、NC、语言小分和 ECTS 要求还未实时抓取，必须由顾问复核或接入后端核验服务。</li><li>若未配置数据库，资料只保存在当前浏览器 localStorage，不能跨设备同步。</li></ol></div>
  </section>;
}

function StudentPortal({ runResult, onRunDemo, portalData, portalMode, intakeProfile, setIntakeProfile, questions, setQuestions }) {
  const publishedApplicant = portalData.applicant;
  const generatedApplicant = runResult?.applicant || normalizeIntakeProfile(intakeProfile);
  const applicant = { ...publishedApplicant, ...generatedApplicant };
  const currentGermanGrade = runResult?.grade?.value || estimateGermanGrade(applicant);
  const hasUserInput = Boolean(intakeProfile?.name || intakeProfile?.averageScore || intakeProfile?.targetDirection);
  const portalMaterials = portalData.materials || materials;
  const matchingRows = runResult?.matching || runResult?.courseMatching || [];
  const applicantLoop = runResult?.applicantLoop;
  const generatedPrograms = (runResult?.programs || []).map((p, index) => {
    const match = matchingRows[index] || {};
    const gaps = match.gapModules || match.gaps || [];
    return {
      ...p,
      program: p.program || p.programName,
      tier: match.tier || p.tier || '本次初筛',
      status: match.matchScore ? `匹配分：${match.matchScore}/100` : (p.status || '本次生成'),
      deadline: p.deadline || '待官网最终复核',
      path: p.applicationPath || p.path || '待官网/申请平台复核',
      risk: match.riskLevel || match.risk || p.risk || '待复核',
      consultantNote: Array.isArray(gaps) && gaps.length ? `本次根据录入资料识别缺口：${gaps.map(g => typeof g === 'string' ? g : (g.label || g.module || '待补强')).join('；')}` : (typeof gaps === 'string' && gaps ? `本次根据录入资料识别缺口：${gaps}` : (match.recommendation || p.consultantNote || '根据当前录入资料生成，需顾问复核。'))
    };
  });
  const portalPrograms = generatedPrograms.length ? generatedPrograms : (portalData.programs || approvedPrograms);
  const portalTasks = runResult?.dashboard || runResult?.tasks || portalData.tasks || weeklyTasks;
  const portalReport = portalData.weeklyReport || weeklyReport;
  const portalOutputs = portalData.expertOutputs || expertOutputs;
  const visibleOutputs = portalOutputs.filter(x => x.visible);
  const visibleRisks = (portalData.risks || []).filter(r => r.visibleToApplicant !== false);
  const [showIntake, setShowIntake] = useState(false);
  return <>
    <Header eyebrow="申请者门户" title="申请者端：资料录入与申请进度" desc="申请者先录入背景、成绩、语言、APS、课程与材料文件，再生成匹配结果和申请看板。" actions={<><button className="secondary" onClick={() => setShowIntake(true)}>录入 / 上传资料</button><button className="primary" onClick={() => onRunDemo(saveIntakeProfile(intakeProfile))}>用当前资料生成方案</button></>} />
    {showIntake && <ApplicantIntakeModal profile={intakeProfile} setProfile={setIntakeProfile} onClose={() => setShowIntake(false)} onRunDemo={onRunDemo} />}
    <ApplicantIntakeSummary profile={intakeProfile} />
    <CourseMatchingMatrix rows={runResult?.courseMatching || []} engine={runResult?.courseMatchingEngine} onRunDemo={() => onRunDemo(saveIntakeProfile(intakeProfile))} highlight />
    <StudentQuestionCenter questions={questions} setQuestions={setQuestions} profile={intakeProfile} />
    <section className="sync-banner">
      <b>本次生成状态：{runResult?.generatedAt ? '已根据当前录入资料生成方案' : hasUserInput ? '已录入资料，等待生成方案' : '尚未录入资料'}</b>
      <span>顾问发布版本：{portalData.consultantReview?.status || '顾问已发布版本'} · 当前资料：{hasUserInput ? '来自申请者录入' : '未录入，显示演示占位'} · 生成时间：{runResult?.generatedAt ? new Date(runResult.generatedAt).toLocaleString('zh-CN', { hour12: false }) : '待生成'}</span>
    </section>
    <section className="grid-4">
      <article className="metric"><span>申请者</span><b>{applicant.name || '待填写'}</b><small>{applicant.university || '院校待填'} · {applicant.major || '专业待填'}</small></article>
      <article className="metric"><span>目标方向</span><b>{applicant.targetDirection || '待填写'}</b><small>{applicant.crossMajor || '跨专业情况待填'} · {applicant.intake || '入学季待填'}</small></article>
      <article className="metric"><span>德国制参考成绩</span><b>{currentGermanGrade}</b><small>{applicant.averageScore || '-'} / {applicant.maxScore || '-'}，及格线 {applicant.passScore || '-'}</small></article>
      <article className="metric"><span>本次高风险</span><b>{matchingRows.filter(r => ['高', '极高'].includes(r.riskLevel || r.risk)).length || visibleRisks.filter(r => r.level === '高').length || 0} 项</b><small>根据当前资料初筛，需顾问复核</small></article>
    </section>
    <V04ResultPanel result={runResult} />
    <ApplicantFullLoopPanel loop={applicantLoop} onRegenerate={() => onRunDemo(saveIntakeProfile(intakeProfile))} />
    <VerificationTable programs={runResult?.programs || []} />
    <section className="panel two-col">
      <div><h2>当前录入资料摘要</h2><div className="info-list">
        <p><b>本科：</b>{applicant.university || '待填写'} · {applicant.major || '待填写'}</p>
        <p><b>目标：</b>{applicant.targetDirection || '待填写'} · {applicant.intake || '待填写'}</p>
        <p><b>语言：</b>{applicant.english || '英语待填'} / {applicant.german || '德语待填'}</p>
        <p><b>APS：</b><Status value={applicant.apsStatus || '待填写'} /></p>
        <p><b>经历：</b>{applicant.experiences || '待补充实习 / 科研 / 项目经历'}</p>
      </div></div>
      <div><h2>材料状态</h2><div className="mini-table">{(applicantLoop?.materialsChecklist || portalMaterials).map(m => <div key={m.name}><b>{m.name}</b><Status value={m.status} /><small>{m.action || m.note}</small></div>)}</div></div>
    </section>
    <section className="panel" data-nav="projects"><div className="section-title"><div><h2>{generatedPrograms.length ? '本次生成的申请项目初筛' : '顾问发布的申请项目'}</h2><p className="muted">{generatedPrograms.length ? '以下结果来自当前录入资料的实时计算，正式申请前仍需顾问与官网复核。' : '尚未基于当前资料生成，当前显示顾问发布/演示项目。'}</p></div><Status value={generatedPrograms.length ? '当前资料驱动' : '演示/发布版本'} /></div><div className="cards">{portalPrograms.map(p => <article className="program" key={`${p.university}-${p.program || p.programName}`}><div><span>{p.university}</span><h3>{p.program || p.programName}</h3></div><div className="tags"><Status value={p.tier} /><Status value={p.status} /><Status value={`风险：${p.risk}`} /></div><p>{p.consultantNote}</p><dl><dt>Deadline</dt><dd>{p.deadline}</dd><dt>申请路径</dt><dd>{p.path}</dd><dt>最近核验</dt><dd>{p.checkedAt || p.checkedDate || '待官网复核'}</dd><dt>来源入口</dt><dd>{p.source ? <a href={p.source} target="_blank">{p.source}</a> : <span>待补充官网来源</span>}</dd></dl></article>)}</div></section>
    <section className="panel two-col" data-nav="tasks"><div><h2>本周我的任务</h2><TaskTable rows={(applicantLoop?.applicantTasks || portalTasks).filter(t => !t.owner || t.owner?.includes('申请者'))} /></div><div data-nav="risks"><h2>{applicantLoop ? '本次生成的风险提醒' : '顾问发布的风险提醒'}</h2>{applicantLoop?.riskRegister?.length ? applicantLoop.riskRegister.map(r => <div className="review-item" key={r.item}><b>{r.item}</b><Status value={r.level} /><p>{r.reason}</p><small>{r.action}</small></div>) : visibleRisks.length ? visibleRisks.map(r => <div className="review-item" key={`${r.type}-${r.description}`}><b>{r.type}</b><Status value={r.level} /><p>{r.description}</p><small>{r.suggestedAction}</small></div>) : <p className="muted">暂无新增用户可见风险。</p>}</div></section>
    <section className="panel two-col"><WeeklyReport applicantOnly report={portalReport} /><div><h2>已发布专家团结论</h2>{visibleOutputs.map(o => <div className="review-item" key={o.expert}><b>{o.expert}</b><Status value={o.status} /><p>{o.result}</p></div>)}</div></section>
  </>;
}


function ConsultantCourseReviewPanel({ engine }) {
  if (!engine) return null;
  return <section className="panel course-review" data-nav="course-review">
    <div className="section-title"><div><h2>课程匹配复核台</h2><p className="muted">顾问重点复核低置信度课程、硬性学分缺口和跨专业解释，避免把 AI/规则判断直接作为最终结论。</p></div><Status value={`${engine.manualReviewQueue?.length || 0} 项待复核`} /></div>
    <div className="cards">{(engine.manualReviewQueue || []).map(item => <article className="review-item" key={item.id}><b>{item.title}</b><Status value={item.priority} /><p>{item.reason}</p><small>{item.action}</small></article>)}</div>
    <div className="responsive-table"><table><thead><tr><th>项目</th><th>匹配分</th><th>风险</th><th>复核状态</th><th>顾问关注点</th></tr></thead><tbody>{(engine.programMatches || []).map(p => <tr key={p.programId}><td><b>{p.university}</b><small>{p.programName}</small></td><td>{p.matchScore}</td><td>{p.riskLevel}</td><td>{p.reviewStatus}</td><td>{(p.gapModules || []).map(g => typeof g === 'string' ? moduleLabel(g) : (g.label || moduleLabel(g.module))).join('、') || '暂无明显缺口'}</td></tr>)}</tbody></table></div>
  </section>;
}

function AdminRequirementProfiles({ engine }) {
  const profiles = engine?.requirementProfiles || [];
  if (!profiles.length) return null;
  return <section className="panel course-review" data-nav="requirement-profiles">
    <div className="section-title"><div><h2>项目要求画像维护</h2><p className="muted">每个项目使用独立课程要求画像，解决“德国学校要求不同，不能一套权重硬套所有项目”的问题。</p></div><Status value="Demo 画像库" /></div>
    <div className="responsive-table"><table><thead><tr><th>学校 / 项目</th><th>要求模块</th><th>来源</th><th>核验状态</th></tr></thead><tbody>{profiles.map(profile => <tr key={profile.programId}><td><b>{profile.university}</b><small>{profile.programName}</small></td><td>{profile.requirements.map(r => `${r.label} ${r.requiredCredits} 学分`).join('；')}</td><td><small>{profile.requirementSource}<br />{profile.evidenceUrl}</small></td><td><Status value={profile.reviewStatus} /></td></tr>)}</tbody></table></div>
    <div className="science-notes"><h3>管理员维护原则</h3><ol><li>项目要求必须以官网或官方申请平台为准。</li><li>未核验字段在前台显示“待人工复核”，不得包装成确定结论。</li><li>项目画像变更后，应重新计算受影响申请者的课程匹配结果。</li></ol></div>
  </section>;
}

function ConsultantWorkbench({ onRunDemo, runResult, portalData, setPortalData, portalMode, setPortalMode, refreshPortal, questions, setQuestions }) {
  const [syncText, setSyncText] = useState(sampleSyncJson);
  const [syncPreview, setSyncPreview] = useState(null);
  const [syncErrors, setSyncErrors] = useState([]);
  const [publishMessage, setPublishMessage] = useState('');
  const [reviewActions, setReviewActions] = useState({});
  const markReview = (expert, action) => {
    setReviewActions(prev => ({ ...prev, [expert]: action }));
    setPublishMessage(`${expert} 已标记为：${action}`);
  };
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
        const result = await api('/portal/publish', { applicantId: payload.applicantId || portalData.applicant?.id || 'app-001', portalData: merged });
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
    <StaffQuestionInbox role="consultant" questions={questions} setQuestions={setQuestions} />
    <ConsultantApplicantSyncCard portalData={portalData} portalMode={portalMode} />
    <ConsultantCourseReviewPanel engine={runResult?.courseMatchingEngine} />
    <section className="grid-4">
      <article className="metric"><span>负责申请者</span><b>1</b><small>演示账号</small></article>
      <article className="metric"><span>已发布项目</span><b>{portalData.programs?.length || 0}</b><small>申请者门户当前可见 · {portalMode}</small></article>
      <article className="metric"><span>本周顾问待办</span><b>{(portalData.tasks || []).filter(t => t.owner?.includes('顾问')).length}</b><small>需在周报发布前处理</small></article>
      <article className="metric"><span>用户可见风险</span><b>{(portalData.risks || []).filter(r => r.visibleToApplicant !== false).length}</b><small>经顾问筛选</small></article>
    </section>
    <section className="panel two-col" data-nav="profile"><div><h2>申请者列表</h2><div className="applicant-row"><b>{portalData.applicant.name}</b><Status value={portalData.applicant.currentStage} /><small>{portalData.applicant.targetDirection} · 进度 {portalData.applicant.progress}% · APS {portalData.applicant.apsStatus}</small></div></div><div><h2>计算结果</h2><p>德国制成绩：<b>{runResult?.grade?.value || '待运行'}</b></p><p>项目数量：<b>{runResult?.programs?.length || approvedPrograms.length}</b></p><p className="note">计算结果仍需顾问审核，不能直接等同录取判断。</p></div></section>
    <V04ResultPanel result={runResult} />
    <div data-nav="course-review"><CourseMatchingMatrix rows={runResult?.courseMatching || []} engine={runResult?.courseMatchingEngine} /></div>
    <div data-nav="matching"><VerificationTable programs={runResult?.programs || []} /></div>
    {runResult?.dashboard?.length > 0 && <section className="panel" data-nav="projects"><h2>v0.4 多校作战看板</h2><div className="responsive-table"><table><thead><tr><th>项目</th><th>梯度</th><th>路径</th><th>阻塞项</th><th>下一步</th><th>优先级</th></tr></thead><tbody>{runResult.dashboard.map(r => <tr key={`${r.university}-${r.programName}`}><td><b>{r.university}</b><small>{r.programName}</small></td><td><Status value={r.tier} /></td><td>{r.applicationPath}<small>APS: {r.aps} · VPD: {r.vpd}</small></td><td>{r.blocker}</td><td>{r.nextStep}</td><td><Status value={r.priority} /></td></tr>)}</tbody></table></div></section>}
    {runResult?.policyRadar && <section className="panel" data-nav="policy-radar"><div className="section-title"><div><h2>政策雷达首次基线</h2><p className="muted">{runResult.policyRadar.systemTaskStatus}</p></div><Status value={runResult.policyRadar.frequency} /></div><div className="responsive-table"><table><thead><tr><th>项目</th><th>检查项</th><th>当前信息</th><th>影响</th><th>动作</th></tr></thead><tbody>{runResult.policyRadar.firstRun?.map(r => <tr key={`${r.university}-${r.programName}`}><td><b>{r.university}</b><small>{r.programName}</small></td><td>{r.checks}</td><td>{r.currentInfo}</td><td><Status value={r.impact} /></td><td>{r.suggestedAction}</td></tr>)}</tbody></table></div></section>}
    {runResult?.writingSamples && <section className="panel two-col" data-nav="writing"><div><h2>文书辅助依据</h2><ul className="clean-list">{runResult.writingSamples.materialSources?.map(s => <li key={s}>{s}</li>)}</ul><p className="note">{runResult.writingSamples.noFabricationNotice}</p></div><div><h2>课程匹配说明片段</h2><p>{runResult.writingSamples.courseMatchStatement}</p></div></section>}
    <section className="panel" data-nav="json-sync"><div className="section-title"><div><h2>小浣熊后台 JSON 同步入口</h2><p className="muted">标准链路：专家团/数据分析/定时任务在小浣熊后台完成 → 导出 JSON → 顾问粘贴 → 解析校验 → 审核发布 → 申请者门户展示。</p></div><button onClick={resetPublished}>恢复演示基线</button></div><textarea className="json-box" value={syncText} onChange={e => setSyncText(e.target.value)} />
      <div className="schema-help"><b>必备字段：</b><code>schemaVersion</code><code>applicantId</code><code>programs[]</code><code>tasks[]</code><code>weeklyReport.summary</code><code>expertOutputs[]</code></div>
      {syncErrors.length > 0 && <div className="error-list"><b>校验提示</b>{syncErrors.map(e => <p key={e}>{e}</p>)}</div>}
      {publishMessage && <div className="success-msg">{publishMessage}</div>}
      {syncPreview && <pre className="json-preview">{JSON.stringify(syncPreview, null, 2)}</pre>}
    </section>
    <ScheduledTaskConnector setPortalData={setPortalData} setPortalMode={setPortalMode} />
    <section className="panel two-col" data-nav="review"><div><h2>专家团输出审核</h2>{(portalData.expertOutputs || []).map(o => <div className="review-item" key={o.expert}><b>{o.expert}</b><Status value={reviewActions[o.expert] || o.status} /><p>{o.result}</p><div className="actions"><button onClick={() => markReview(o.expert, '已采纳')}>采纳</button><button onClick={() => markReview(o.expert, '修改后采纳')}>修改后采纳</button><button onClick={() => markReview(o.expert, '待复核')}>标记待复核</button><button onClick={() => markReview(o.expert, '不展示给申请者')}>不展示</button></div></div>)}</div><div><WeeklyReport report={portalData.weeklyReport} /><h2>顾问本周待办</h2><TaskTable rows={(portalData.tasks || []).filter(t => t.owner?.includes('顾问'))} /></div></section>
  </>;
}



function ConsultantApplicantSyncCard({ portalData, portalMode }) {
  const loop = portalData?.applicantLoop;
  const applicant = loop?.applicantSnapshot || portalData?.applicant || {};
  const materials = portalData?.materials || [];
  const tasks = portalData?.tasks || [];
  const risks = portalData?.risks || [];
  const documents = portalData?.documents || [];
  const generated = Boolean(loop || materials.length || tasks.length || risks.length || documents.length);
  const reviewItems = [
    { title: `复核 ${applicant.name || 'Demo Applicant'}：跨专业 / 课程匹配风险`, detail: risks.find(r => String(r.title || r.type || '').includes('课程'))?.suggestion || '检查数学、统计、编程与目标方向的课程学分是否支撑申请。', level: '高' },
    { title: `复核 ${applicant.name || 'Demo Applicant'}：APS 风险`, detail: risks.find(r => String(r.title || r.type || '').includes('APS'))?.suggestion || `${applicant.apsStatus || portalData?.applicant?.apsStatus || 'APS 状态待确认'}，需确认是否已递交或预约。`, level: '高' },
    { title: `复核 ${applicant.name || 'Demo Applicant'}：语言风险`, detail: risks.find(r => String(r.title || r.type || '').includes('语言'))?.suggestion || '确认 IELTS / TOEFL / 德语成绩是否满足每个项目硬性门槛。', level: '中' }
  ];
  return <section className="panel" data-nav="applicant-sync-review">
    <div className="section-title"><div><h2>来自申请者端的新复核任务</h2><p className="muted">申请者生成方案后自动同步到顾问端；顾问需要把自动结果转化为可交付判断。</p></div><Status value={generated ? '已收到申请包' : '待申请者生成'} /></div>
    <section className="grid-4 compact-grid">
      <article className="metric"><span>申请者</span><b>{applicant.name || 'Demo Applicant'}</b><small>{applicant.targetDirection || portalData?.applicant?.targetDirection || '目标方向待确认'}</small></article>
      <article className="metric"><span>材料</span><b>{materials.length}</b><small>待补 / 待核验</small></article>
      <article className="metric"><span>风险</span><b>{risks.length || reviewItems.length}</b><small>课程 / APS / 语言</small></article>
      <article className="metric"><span>文书</span><b>{documents.length}</b><small>初稿待顾问审核</small></article>
    </section>
    <div className="responsive-table"><table><thead><tr><th>顾问复核项</th><th>关键依据</th><th>优先级</th><th>建议动作</th></tr></thead><tbody>{reviewItems.map(item => <tr key={item.title}><td><b>{item.title}</b><small>来源：申请者端生成包 · {portalMode || 'localStorage'}</small></td><td>{item.detail}</td><td><Status value={item.level} /></td><td>核对材料原件、课程描述和项目官网硬性要求后再发布给申请者。</td></tr>)}</tbody></table></div>
    <p className="note">演示边界：当前为前端 Demo 同步，真实商用仍需接入数据库持久化、文件解析与官网核验队列。</p>
  </section>;
}

function ScheduledTaskConnector({ setPortalData, setPortalMode }) {
  const [taskStatus, setTaskStatus] = useState(null);
  const [taskText, setTaskText] = useState(sampleScheduledTaskJson);
  const [mappedResult, setMappedResult] = useState(null);
  const [taskMessage, setTaskMessage] = useState('');
  const refreshTaskStatus = async () => {
    try {
      const status = await api('/scheduled-tasks/status', {}, { method: 'GET' });
      setTaskStatus(status);
    } catch (error) {
      setTaskStatus({ ok: false, mode: 'unavailable', note: error.message, taskCatalog: [] });
    }
  };
  const ingestTaskResult = async () => {
    setTaskMessage('');
    try {
      const payload = JSON.parse(taskText);
      const result = await api('/scheduled-tasks/ingest', payload);
      setMappedResult(result);
      setTaskMessage(result.ok ? '定时任务结果已接收并映射为门户发布草稿。' : '接收失败。');
    } catch (error) {
      setTaskMessage(`接收失败：${error.message}`);
    }
  };
  const publishMappedResult = async () => {
    if (!mappedResult?.portalPatch) {
      setTaskMessage('请先接收并映射定时任务结果。');
      return;
    }
    try {
      const merged = mergePortalData(mappedResult.portalPatch);
      localStorage.setItem(storageKey, JSON.stringify(merged));
      setPortalData(merged);
      setPortalMode('scheduled-task-local');
      try {
        const saved = await api('/portal/publish', { applicantId: mappedResult.applicantId || 'app-001', portalData: merged });
        if (saved.portalData) {
          setPortalData(saved.portalData);
          setPortalMode(saved.mode || 'scheduled-task-api');
        }
      } catch {}
      setTaskMessage('顾问已将定时任务结果发布到申请者门户。');
    } catch (error) {
      setTaskMessage(`发布失败：${error.message}`);
    }
  };
  useEffect(() => { refreshTaskStatus(); }, []);
  return <section className="panel" data-nav="scheduled-tasks">
    <div className="section-title"><div><h2>定时任务包接入</h2><p className="muted">已识别 <b>deutschos-scheduled-tasks-bundle</b>。小浣熊平台定时任务无需重复创建；这里负责接收运行结果、映射为门户数据，并由顾问审核发布。</p></div><button onClick={refreshTaskStatus}>刷新接入状态</button></div>
    <section className="grid-4 compact-grid">
      <article className="metric"><span>任务包</span><b>{taskStatus?.bundle || 'deutschos-scheduled-tasks-bundle'}</b><small>小浣熊平台已创建</small></article>
      <article className="metric"><span>任务数量</span><b>{taskStatus?.taskCount ?? 6}</b><small>Deadline / 官网 / 材料 / 风险 / 周报 / 预警</small></article>
      <article className="metric"><span>接入模式</span><b>{taskStatus?.mode || '检测中'}</b><small>POST ingest 或复制 JSON</small></article>
      <article className="metric"><span>最近映射</span><b>{mappedResult?.summary?.risks ?? 0} 风险</b><small>{mappedResult?.summary?.tasks ?? 0} 任务 · {mappedResult?.summary?.programs ?? 0} 项目</small></article>
    </section>
    <div className="two-col">
      <div><h3>运行结果 JSON</h3><textarea className="json-box" value={taskText} onChange={e => setTaskText(e.target.value)} /><div className="actions"><button className="secondary" onClick={ingestTaskResult}>接收并映射</button><button className="primary" onClick={publishMappedResult}>顾问审核后发布</button></div>{taskMessage && <div className="success-msg">{taskMessage}</div>}</div>
      <div><h3>任务目录与映射</h3><div className="mini-table">{(taskStatus?.taskCatalog || []).map(t => <div key={t.taskId}><b>{t.name}</b><Status value={t.frequency} /><small>{t.description}</small><small>映射：{(t.mapsTo || []).join(' / ')}</small></div>)}</div></div>
    </div>
    {mappedResult && <pre className="json-preview">{JSON.stringify(mappedResult, null, 2)}</pre>}
  </section>;
}

function AdminConsole({ portalStatus, authStatus, refreshStatus, questions, setQuestions, runResult, portalData, portalMode }) {
  const env = portalStatus?.environment || {};
  const actions = portalStatus?.requiredActions || [];
  const loop = portalData?.applicantLoop;
  const syncStatus = portalData?.syncStatus || loop?.syncStatus;
  const applicantSnapshot = portalData?.applicantSnapshot || loop?.applicantSnapshot || portalData?.applicant;
  const hasApplicantGeneratedData = Boolean((portalData?.materials?.length || 0) || (portalData?.tasks?.length || 0) || (portalData?.risks?.length || 0) || (portalData?.documents?.length || 0));
  const applicantLoopReady = Boolean(syncStatus?.applicantReady || loop || hasApplicantGeneratedData);
  return <>
    <Header eyebrow="管理员后台" title="系统运营、专家团配置与 Supabase 接入诊断" desc="管理员维护三角色权限、项目库质量、专家团规则、每周一自动周报任务和数据库持久化配置。" actions={<button className="primary" onClick={refreshStatus}>刷新数据库状态</button>} />
    <ExpertCenterMapping />
    <StaffQuestionInbox role="admin" questions={questions} setQuestions={setQuestions} />
    <AdminRequirementProfiles engine={runResult?.courseMatchingEngine} />
    <section className="grid-4">
      <article className="metric"><span>用户角色</span><b>3 类</b><small>申请者 / 顾问 / 管理员</small></article>
      <article className="metric"><span>项目库记录</span><b>3</b><small>演示项目，待扩展数据库</small></article>
      <article className="metric"><span>数据库模式</span><b>{portalStatus?.mode || '检测中'}</b><small>{portalStatus?.supabaseConfigured ? 'Supabase 已配置' : '当前仍为 fallback / memory'}</small></article>
      <article className="metric"><span>同步方式</span><b>API</b><small>顾问发布 → Portal API → Supabase / fallback</small></article>
    </section>
    <section className="panel two-col" data-nav="three-role-loop"><div><h2>三端闭环状态</h2><div className="review-item"><b>申请者生成包</b><Status value={applicantLoopReady ? '已生成' : '待生成'} /><p>{applicantSnapshot ? `${applicantSnapshot.name || '申请者'} · ${applicantSnapshot.major || '专业待补'} → ${applicantSnapshot.targetDirection || '方向待补'} · 德国制 ${applicantSnapshot.grade || '待计算'}` : '申请者端尚未生成本次方案。'}</p><small>同步模式：{portalMode || syncStatus?.source || 'localStorage'}</small></div><div className="grid-4 compact"><article className="metric"><span>材料</span><b>{portalData?.materials?.length || 0}</b><small>申请者待补</small></article><article className="metric"><span>任务</span><b>{portalData?.tasks?.length || 0}</b><small>申请者 + 顾问</small></article><article className="metric"><span>风险</span><b>{portalData?.risks?.length || 0}</b><small>需复核</small></article><article className="metric"><span>文书</span><b>{portalData?.documents?.length || 0}</b><small>草稿待审核</small></article></div></div><div><h2>管理者下一步</h2><ol className="check-list"><li>查看顾问是否在 24 小时内完成风险复核。</li><li>检查申请者是否补齐成绩单、课程描述、语言和 APS 文件。</li><li>若进入商用，必须接入 Supabase 持久化、文件上传和官网核验队列。</li></ol></div></section>
    <section className="panel two-col" data-nav="database">
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
    <section className="panel two-col" data-nav="auth">
      <div>
        <h2>Auth 与角色权限诊断</h2>
        <div className="review-item"><b>当前 Auth 模式</b><Status value={authStatus?.mode || '检测中'} /><p>Step 10 将演示登录升级为 Supabase Auth + user_roles + consultant_applicants 的多角色隔离。</p></div>
        <table><thead><tr><th>配置项</th><th>状态</th><th>说明</th></tr></thead><tbody>
          <tr><td>SUPABASE_ANON_KEY</td><td><Status value={authStatus?.configured?.SUPABASE_ANON_KEY ? '已配置' : '未配置'} /></td><td>真实邮箱密码登录需要此变量</td></tr>
          <tr><td>user_roles</td><td><Status value={authStatus?.roleTableReady ? '已就绪' : '待执行 SQL'} /></td><td>维护 student / consultant / admin 角色</td></tr>
          <tr><td>角色记录</td><td>{authStatus?.roleCount ?? 0}</td><td>当前可检测到的角色映射数量</td></tr>
        </tbody></table>
      </div>
      <div>
        <h2>第十步待完成动作</h2>
        <ol className="check-list">{(authStatus?.requiredActions || ['执行 supabase/step10-auth-rbac.sql', '在 Supabase Authentication 创建用户', '在 Vercel 配置 SUPABASE_ANON_KEY 并 Redeploy']).map(x => <li key={x}>{x}</li>)}</ol>
        <div className="schema-help"><b>Auth API：</b><code>/api/auth/status</code><code>/api/auth/login</code><code>/api/auth/logout</code></div><div className="schema-help"><b>定时任务 API：</b><code>/api/scheduled-tasks/status</code><code>/api/scheduled-tasks/ingest</code><code>deutschos-scheduled-tasks-bundle</code></div>
      </div>
    </section>
    <section className="panel two-col" data-nav="accounts"><div><h2>账号与权限</h2><table><thead><tr><th>角色</th><th>账号</th><th>权限重点</th></tr></thead><tbody>{accounts.map(a => <tr key={a.role}><td>{a.label}</td><td>{a.email}</td><td>{a.role === 'student' ? '编辑资料、查看审核后结果、完成任务' : a.role === 'consultant' ? '审核专家输出、发布周报、跟进申请者' : '管理用户、项目库、专家团规则和定时任务'}</td></tr>)}</tbody></table></div><div><h2>每周定时任务配置</h2><div className="timeline"><div><b>每周一 09:00</b><p>读取所有活跃申请者档案</p></div><div><b>09:10</b><p>检查 APS、语言、材料、deadline、网申状态</p></div><div><b>09:30</b><p>生成顾问内部版周报与申请者可见版草稿</p></div><div><b>顾问审核后</b><p>发布到申请者门户并写入数据库快照</p></div></div></div></section>
    <section className="panel two-col" data-nav="projects"><div><h2>项目库质量</h2>{projectLibrary.map(p => <div className="review-item" key={p.school}><b>{p.school}</b><Status value={p.type} /><p>{p.records} 条记录 · {p.status}</p></div>)}</div><div><h2>专家团配置边界</h2><ul className="check-list"><li>所有 deadline、NC、语言、VPD、APS 信息必须标注来源和日期。</li><li>专家团输出默认进入待顾问审核，不直接同步给申请者。</li><li>用户前台仅展示顾问审核后的任务、周报和建议。</li><li>不承诺录取，不替代学校官网、uni-assist、DAAD、APS 或人工判断。</li></ul></div></section>
    <PrivacyCommercialBlock result={{ privacyAndCompliance: { principles: ['最小化采集申请材料', '学生/顾问/管理员角色隔离', '敏感字段脱敏展示', '官网关键项必须人工复核', '支持申请结束后删除材料'], demoBoundary: '当前 v0.4 仍为 Demo 原型，商业化前需补充隐私政策、审计日志、数据删除和导出机制。' }, commercialization: { studentPackage: ['申请诊断报告', '项目匹配建议', '课程缺口清单', '文书方向建议'], consultantWorkspace: ['多学生管理', '项目库核验', '任务看板', '政策雷达', '交付记录'], value: '优先验证学生端诊断包和顾问端工作台两个最小可收费场景。' } }} />
  </>;
}

function TaskTable({ rows }) {
  return <table><thead><tr><th>任务</th><th>负责人</th><th>截止</th><th>优先级</th><th>状态</th></tr></thead><tbody>{rows.map((t, index) => <tr key={t.id || t.title || t.task || index}><td>{t.title || t.task}</td><td>{t.owner}</td><td>{t.due}</td><td><Status value={t.priority} /></td><td><Status value={t.status} /></td></tr>)}</tbody></table>;
}

function WeeklyReport({ applicantOnly = false, report = weeklyReport }) {
  return <div className="weekly"><h2>{report.title}</h2><Status value={applicantOnly ? '顾问已发布版本' : '待顾问审核 / 可发布'} /><p>{report.summary}</p><h3>已完成</h3><ul>{(report.done || []).map(x => <li key={x}>{x}</li>)}</ul><h3>下周重点</h3><ul>{(report.next || []).map(x => <li key={x}>{x}</li>)}</ul><h3>风险提醒</h3><ul>{(report.risks || []).map(x => <li key={x}>{x}</li>)}</ul></div>;
}

function App() {
  const [user, setUser] = useState(null);
  const [authStatus, setAuthStatus] = useState(null);
  const [runResult, setRunResult] = useState(null);
  const [portalData, setPortalData] = useState(() => loadPublishedData());
  const [portalMode, setPortalMode] = useState('localStorage');
  const [portalStatus, setPortalStatus] = useState(null);
  const [toast, setToast] = useState('');
  const [questions, setQuestionsState] = useState(() => loadQuestions());
  const setQuestions = (next) => {
    const value = typeof next === 'function' ? next(questions) : next;
    setQuestionsState(value);
    saveQuestions(value);
  };
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
      const result = await api('/portal/read', { applicantId: user?.applicantId || 'app-001' });
      if (result.portalData) {
        const mergedPortal = saveSharedPortalData(result.portalData);
        setPortalData(mergedPortal);
        setPortalMode(result.mode || 'api');
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

  const [demoProfile, setDemoProfileState] = useState(() => loadIntakeProfile());
  const setDemoProfile = (next) => {
    setDemoProfileState(prev => {
      const value = typeof next === 'function' ? next(prev) : next;
      return normalizeIntakeProfile(value);
    });
  };

  useEffect(() => {
    saveIntakeProfile(demoProfile);
  }, [demoProfile]);
  useEffect(() => {
    api('/auth/status', {}, { method: 'GET' }).then(setAuthStatus).catch(() => setAuthStatus({ mode: 'auth-status-unavailable' }));
  }, []);

  useEffect(() => {
    const applicantId = user?.applicantId || 'app-001';
    api('/portal/read', { applicantId }, { method: 'GET' }).then(data => {
      if (data?.portalData) {
        const mergedPortal = saveSharedPortalData(data.portalData);
        setPortalData(mergedPortal);
        setPortalMode(data.mode || 'api');
      }
    }).catch(() => setPortalMode('localStorage'));
  }, [user?.applicantId]);
  const runDemo = async (profileOverride) => {
    const activeProfile = saveIntakeProfile(profileOverride || demoProfile);
    setDemoProfile(activeProfile);
    setToast('正在调用 API 计算 v0.4 工作台方案…');
    try {
      const profileForRun = {
        ...activeProfile,
        experiences: `${activeProfile.experiences || ''}\n课程摘要：${activeProfile.courseSummary || ''}\n上传材料：${(activeProfile.uploadedFiles || []).map(f => `${f.bucket}:${f.name}`).join('；') || '未选择文件'}`
      };
      const data = await api('/demo/run', { profile: profileForRun });
      const normalized = normalizeRunResult({ ...data, grade: data.grade || data.germanGrade, profile: activeProfile });
      const syncedPortal = mergeApplicantLoopIntoPortal(portalData, normalized, activeProfile);
      setRunResult(normalized);
      const persistedPortal = saveSharedPortalData(syncedPortal);
      setPortalData(persistedPortal);
      setPortalMode('localStorage-three-role-loop');
      setToast(normalized.ok ? `计算完成：德国制参考成绩 ${normalized.grade?.value} · 已同步顾问/管理者闭环` : '计算失败，请检查接口。');
    } catch (error) {
      console.warn('demo api fallback to local engine', error);
      const fallback = normalizeRunResult(buildLocalDemoResult(activeProfile));
      const syncedPortal = mergeApplicantLoopIntoPortal(portalData, fallback, activeProfile);
      setRunResult(fallback);
      const persistedPortal = saveSharedPortalData(syncedPortal);
      setPortalData(persistedPortal);
      setPortalMode('localStorage-three-role-loop');
      setToast('后端 API 暂不可用，已切换为本地演示引擎，并已同步顾问/管理者闭环。');
    }
  };
  if (!user) return <Login onLogin={setUser} authStatus={authStatus} />;
  const applicantLoop = portalData?.applicantLoop || runResult?.applicantLoop;
  const navState = {
    hasRunResult: Boolean(runResult),
    hasApplicantLoop: Boolean(applicantLoop),
    hasCourseReview: Boolean(runResult?.courseMatching?.length),
    hasPrograms: Boolean(runResult?.programs?.length || runResult?.dashboard?.length),
    hasPolicyRadar: Boolean(runResult?.policyRadar),
    hasWriting: Boolean(runResult?.writingSamples),
    hasRequirementProfiles: Boolean(runResult?.courseMatchingEngine?.requirementProfiles?.length)
  };
  return <Shell user={user} navState={navState} onLogout={() => setUser(null)}>
    {toast && <div className="toast">{toast}<button onClick={() => setToast('')}>×</button></div>}
    {user.role === 'student' && <StudentPortal runResult={runResult} onRunDemo={runDemo} portalData={portalData} portalMode={portalMode} intakeProfile={demoProfile} setIntakeProfile={setDemoProfile} questions={questions} setQuestions={setQuestions} />}
    {user.role === 'consultant' && <ConsultantWorkbench runResult={runResult} onRunDemo={runDemo} portalData={portalData} setPortalData={setPortalData} portalMode={portalMode} setPortalMode={setPortalMode} refreshPortal={refreshPortal} questions={questions} setQuestions={setQuestions} />}
    {user.role === 'admin' && <AdminConsole portalStatus={portalStatus} authStatus={authStatus} refreshStatus={refreshStatus} questions={questions} setQuestions={setQuestions} runResult={runResult} portalData={portalData} portalMode={portalMode} />}
  </Shell>;
}

createRoot(document.getElementById('root')).render(<App />);
