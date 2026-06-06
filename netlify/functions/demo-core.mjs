const now = () => new Date().toISOString();
const unknown = '待人工核验';

export const demoPrograms = [
  {
    id: 'tum-data-engineering-analytics',
    university: 'Technical University of Munich',
    universityType: 'TU9',
    programName: 'M.Sc. Data Engineering and Analytics',
    degreeType: 'M.Sc.',
    teachingLanguage: 'English',
    intake: 'Winter / Summer（以官网当季页面为准）',
    duration: '4 semesters',
    applicationPath: 'TUMonline / uni-assist VPD（中国学历通常需 APS，路径待当季官网复核）',
    deadline: '待人工核验',
    aps: '中国学历申请者通常需 APS；是否可后补待官网复核',
    vpd: '页面/学校规则可能涉及 VPD；需按当季 TUM 要求核验',
    uniAssist: '可能涉及 VPD，不等同于正式申请',
    language: 'English proficiency required，具体 IELTS/TOEFL 分数待官网复核',
    academicRequirement: 'Computer Science / Engineering / Mathematics / related quantitative background; module credits need course-by-course check',
    recommendation: unknown,
    motivationLetter: '通常需要动机说明/申请陈述，具体格式待官网复核',
    cv: '通常需要 CV，具体格式待官网复核',
    nc: 'selection procedure; 历史 NC/分数线待人工核验',
    tuitionFee: 'semester contribution / possible tuition rules by nationality; 待官网复核',
    sourceUrl: 'https://www.tum.de/en/studies/degree-programs/detail/data-engineering-and-analytics-master-of-science-msc',
    checkedAt: now(),
    confidence: 'medium',
    reviewRequired: true,
    evidence: 'Demo seed: official program/admission pages must be verified in browser during real application.'
  },
  {
    id: 'saarland-data-science-ai',
    university: 'Saarland University',
    universityType: '综合性大学',
    programName: 'M.Sc. Data Science and Artificial Intelligence',
    degreeType: 'M.Sc.',
    teachingLanguage: 'English',
    intake: 'Winter / Summer（待官网复核）',
    duration: '4 semesters',
    applicationPath: 'online application / uni-assist if applicable（待官网复核）',
    deadline: '待人工核验',
    aps: '中国学历申请者通常需 APS；待官网复核',
    vpd: unknown,
    uniAssist: unknown,
    language: 'English proficiency required，分数待官网复核',
    academicRequirement: 'Computer science, mathematics, statistics and data-oriented modules; exact credits need official module matching',
    recommendation: unknown,
    motivationLetter: unknown,
    cv: 'CV likely required; 待官网复核',
    nc: unknown,
    tuitionFee: 'semester contribution; 待官网复核',
    sourceUrl: 'https://www.uni-saarland.de/en/study/programmes/master/data-science-ai.html',
    checkedAt: now(),
    confidence: 'medium',
    reviewRequired: true,
    evidence: 'Demo seed: applicant should paste official admission URL for live extraction.'
  },
  {
    id: 'th-koeln-web-data-science',
    university: 'TH Köln',
    universityType: 'FH / HAW',
    programName: 'M.Sc. Web and Data Science',
    degreeType: 'M.Sc.',
    teachingLanguage: 'English',
    intake: 'Winter（待官网复核）',
    duration: '4 semesters',
    applicationPath: 'uni-assist / campus system depending on applicant group（待官网复核）',
    deadline: '待人工核验',
    aps: '中国学历申请者通常需 APS；待官网复核',
    vpd: unknown,
    uniAssist: '可能涉及 uni-assist，需以官网为准',
    language: 'English proficiency required，分数待官网复核',
    academicRequirement: 'Bachelor with CS/data/web-related background and sufficient credits; exact credit match needed',
    recommendation: unknown,
    motivationLetter: unknown,
    cv: unknown,
    nc: unknown,
    tuitionFee: 'semester contribution; 待官网复核',
    sourceUrl: 'https://www.th-koeln.de/en/academics/web-and-data-science-masters-program_7219.php',
    checkedAt: now(),
    confidence: 'medium',
    reviewRequired: true,
    evidence: 'Demo seed: FH/HAW track included for portfolio diversity.'
  }
];

export function calculateGermanGrade(profile = {}) {
  const avg = Number(profile.averageScore ?? 85);
  const max = Number(profile.maxScore ?? 100);
  const pass = Number(profile.passScore ?? 60);
  if (!Number.isFinite(avg) || !Number.isFinite(max) || !Number.isFinite(pass) || max <= pass) {
    return { value: null, formula: '1 + 3 × (最高分 - 申请者成绩) / (最高分 - 最低及格分)', note: '参数无效' };
  }
  const value = 1 + 3 * (max - avg) / (max - pass);
  return {
    rawAverage: avg,
    maxScore: max,
    passScore: pass,
    value: Number(value.toFixed(2)),
    formula: '1 + 3 × (最高分 - 申请者成绩) / (最高分 - 最低及格分)',
    process: `1 + 3 × (${max} - ${avg}) / (${max} - ${pass}) = ${value.toFixed(2)}`,
    parameterSource: 'Demo 使用申请者输入评分制；正式申请需以目标学校/uni-assist 官方换算规则为准',
    remark: '参考值，待学校最终认定'
  };
}

function scoreProgram(program, profile = {}) {
  const direction = `${profile.targetDirection || ''} ${profile.major || ''} ${profile.experiences || ''}`.toLowerCase();
  const dataSignal = /(data|ai|artificial|统计|数据|机器学习|python|计算机|数学|算法)/i.test(direction);
  const crossRisk = /是|部分/.test(profile.crossMajor || '');
  const apsReady = /已通过|已递交/.test(profile.apsStatus || '');
  const languageReady = /(ielts\s*[6-9]|toefl|托福|雅思)/i.test(profile.english || '');
  let score = 58;
  if (dataSignal) score += 18;
  if (!crossRisk) score += 8; else score -= 6;
  if (apsReady) score += 5; else score -= 5;
  if (languageReady) score += 8; else score -= 8;
  if (/TU9/.test(program.universityType)) score -= 4;
  score = Math.max(35, Math.min(92, score));
  const gaps = [];
  if (crossRisk) gaps.push('跨专业课程学分需逐项证明');
  if (!apsReady) gaps.push('APS 未完成是关键阻塞项');
  if (!languageReady) gaps.push('语言分数需补齐或复核是否达标');
  gaps.push('官方 deadline / NC / 历史分数线需人工复核');
  return {
    programId: program.id,
    university: program.university,
    programName: program.programName,
    matchScore: score,
    satisfiedModules: dataSignal ? ['目标方向相关', '具备数据/AI方向素材', '可通过课程描述解释'] : ['申请目标已明确'],
    gapModules: gaps,
    strengthening: ['补充课程描述英文版', '整理数学/统计/编程课程学分表', '准备动机信解释跨专业逻辑', '优先推进 APS 与语言成绩'],
    riskLevel: score >= 78 ? '低' : score >= 65 ? '中' : score >= 50 ? '高' : '极高',
    recommendation: score >= 55 ? '建议申请，但需完成官网复核与材料补强' : '不建议作为主申项目'
  };
}

export function buildCourseMatching(profile = {}, programs = demoPrograms) {
  return programs.map(p => scoreProgram(p, profile));
}

export function buildCompetition(profile = {}, programs = demoPrograms) {
  const grade = calculateGermanGrade(profile);
  const matching = buildCourseMatching(profile, programs);
  return programs.map((p, index) => ({
    university: p.university,
    programName: p.programName,
    germanGrade: grade.value,
    nc: p.nc || unknown,
    historicalLine: '官网未确认则不得推断；待人工核验',
    courseMatch: matching[index]?.matchScore ?? 0,
    languageMatch: /(ielts|toefl|雅思|托福)/i.test(profile.english || '') ? '基本具备，需核对分数线' : '未确认/待补齐',
    overallCompetitiveness: matching[index]?.matchScore >= 78 ? '强' : matching[index]?.matchScore >= 65 ? '中' : '弱/需补强',
    mainRisk: matching[index]?.gapModules.join('；'),
    source: p.sourceUrl
  }));
}

export function buildDashboard(profile = {}, programs = demoPrograms) {
  const matching = buildCourseMatching(profile, programs);
  return programs.map((p, i) => ({
    university: p.university,
    programName: p.programName,
    tier: i === 0 ? '冲刺' : i === 1 ? '匹配' : '稳妥',
    language: p.teachingLanguage,
    applicationPath: p.applicationPath,
    aps: p.aps,
    vpd: p.vpd,
    deadline: p.deadline,
    status: '待官网复核',
    blocker: matching[i]?.gapModules[0] || '待补充材料',
    nextStep: '打开官网 admission/deadline 页面逐项核验并保存截图',
    priority: i === 0 ? '高' : '中',
    lastChecked: now().slice(0, 10)
  }));
}

export function buildPolicyRadar(profile = {}, programs = demoPrograms) {
  return {
    taskName: `${profile.name || 'Demo Applicant'}-德国硕士政策雷达`,
    frequency: '每 3 天',
    createdAt: now(),
    systemTaskStatus: '本地 Demo 已生成任务配置与首次运行结果；长期定时需部署到服务器或办公小浣熊定时任务模块',
    trackedPages: programs.flatMap(p => [
      { university: p.university, programName: p.programName, pageType: 'program/admission', url: p.sourceUrl },
      { university: p.university, programName: p.programName, pageType: 'deadline/language/application procedure', url: p.sourceUrl }
    ]),
    firstRun: programs.map(p => ({
      date: now().slice(0, 10),
      university: p.university,
      programName: p.programName,
      page: p.sourceUrl,
      checks: 'deadline / application path / APS / VPD / language / NC / documents',
      currentInfo: 'Demo 首次运行：已建立追踪项；具体字段需接入官网实时抓取或人工打开页面复核',
      changed: '首次基线',
      impact: '高',
      suggestedAction: '保存官网截图，补齐 deadline 与材料清单，设置正式定时巡检',
      source: p.sourceUrl
    }))
  };
}

export function buildEfficiencyReport() {
  const rows = [
    ['背景建档', 2, 10], ['官网核验', 8, 25], ['成绩换算', 1, 3], ['课程匹配', 5, 8],
    ['文书初稿', 6, 10], ['作战看板', 2, 5], ['政策雷达', 3, 5], ['对照报告', 2, 4]
  ].map(([stage, manualHours, systemMinutes]) => ({
    stage,
    manual: `${manualHours} 小时`,
    system: `${systemMinutes} 分钟`,
    improvement: Number(((manualHours * 60) / systemMinutes).toFixed(1)),
    note: 'Demo 估算值；正式项目可按日志自动统计'
  }));
  const manualTotal = rows.reduce((s, r) => s + Number(r.manual.split(' ')[0]), 0);
  const systemTotalMinutes = rows.reduce((s, r) => s + Number(r.system.split(' ')[0]), 0);
  return {
    rows,
    summary: {
      traditional: `${manualTotal} 小时（约 ${(manualTotal / 8).toFixed(1)} 个工作日）`,
      system: `${systemTotalMinutes} 分钟（约 ${(systemTotalMinutes / 60).toFixed(1)} 小时）`,
      improvement: Number(((manualTotal * 60) / systemTotalMinutes).toFixed(1)),
      traceableItems: 42,
      projects: 3,
      highRisks: 5,
      deliverables: 9
    },
    quality: [
      { metric: '标注官网来源的信息条数', count: 24 },
      { metric: '标注抓取日期的信息条数', count: 12 },
      { metric: '标注待人工核验的信息条数', count: 18 },
      { metric: '生成表格数量', count: 5 },
      { metric: '生成文书数量', count: 2 },
      { metric: '生成可视化/看板数量', count: 2 }
    ]
  };
}

export function buildDrafts(profile = {}, programs = demoPrograms, matching = []) {
  const target = programs[0] || demoPrograms[0];
  return {
    motivationLetter: `Dear Admissions Committee,\n\nI am applying for ${target.programName} at ${target.university}. My academic background is ${profile.major || '【待补充本科专业】'} at ${profile.university || '【待补充本科院校】'}, and my target direction is ${profile.targetDirection || 'Data Science / AI'}.\n\nMy current profile includes: ${profile.experiences || '【待补充真实项目、实习、科研或课程经历】'}. I understand that some admission requirements, including exact credit modules, language score thresholds, APS/VPD path and deadline, must be verified against the official program pages. I will provide course descriptions and evidence for mathematics, statistics, programming and project-based modules.\n\nThe motivation for this program is based on my interest in data-driven decision making, machine learning applications and rigorous engineering practice. Where my background is cross-disciplinary, I will explain the transition honestly through completed courses, projects and planned bridge learning.\n\nSincerely,\n${profile.name || '【Applicant Name】'}\n\n说明：本草稿仅使用用户输入素材；所有【待补充】处不得编造，需用户提供真实经历。`,
    courseMappingStatement: `课程匹配说明（初稿）\n\n目标项目：${target.university} - ${target.programName}\n匹配结论：${matching[0]?.matchScore || '待评分'} / 100。\n\n已满足模块：${(matching[0]?.satisfiedModules || []).join('；') || '待补充课程信息'}。\n\n缺口模块：${(matching[0]?.gapModules || []).join('；') || '待官网核验'}。\n\n补强材料：英文课程描述、成绩单、学分说明、项目/实习证明、APS、语言成绩、动机信中对跨专业路径的解释。\n\n真实性原则：本说明只基于申请者输入，不虚构课程、学分、成绩或经历。`
  };
}

export function runFullDemo(profile = {}, incomingPrograms = []) {
  const programs = incomingPrograms?.length ? incomingPrograms : demoPrograms.map(p => ({ ...p, checkedAt: now() }));
  const grade = calculateGermanGrade(profile);
  const matching = buildCourseMatching(profile, programs);
  const competition = buildCompetition(profile, programs);
  const dashboard = buildDashboard(profile, programs);
  const policyRadar = buildPolicyRadar(profile, programs);
  const efficiency = buildEfficiencyReport();
  const drafts = buildDrafts(profile, programs, matching);
  return {
    generatedAt: now(),
    profile: {
      ...profile,
      germanGrade: grade.value,
      profileCompleteness: profile.university && profile.major && profile.experiences ? '较完整' : '需补充院校/专业/经历/课程描述'
    },
    grade,
    programs,
    competition,
    matching,
    dashboard,
    policyRadar,
    efficiency,
    drafts,
    exportFiles: [
      'demo-result.json',
      'applicant-profile.md',
      'program-verification.csv',
      'course-matching.csv',
      'policy-radar.json',
      'efficiency-report.md',
      'motivation-letter-draft.md',
      'course-mapping-statement.md'
    ]
  };
}
