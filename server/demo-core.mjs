const now = () => new Date().toISOString();
const today = () => now().slice(0, 10);
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
    applicationPath: 'TUMonline / 可能涉及 uni-assist VPD（需按当季官网复核）',
    deadline: '待人工核验',
    aps: '中国学历申请者通常需关注 APS；是否可后补待官网复核',
    vpd: '可能涉及 VPD；需按当季 TUM 要求核验',
    uniAssist: '可能涉及 VPD，不等同于正式申请',
    language: 'English proficiency required，具体 IELTS/TOEFL 分数待官网复核',
    academicRequirement: 'Computer Science / Engineering / Mathematics / related quantitative background; module credits need course-by-course check',
    motivationLetter: '通常需要动机说明/申请陈述，具体格式待官网复核',
    cv: '通常需要 CV，具体格式待官网复核',
    nc: 'selection procedure; 历史 NC/分数线待人工核验',
    tuitionFee: 'semester contribution / possible tuition rules by nationality; 待官网复核',
    sourceUrl: 'https://www.tum.de/en/studies/degree-programs/detail/data-engineering-and-analytics-master-of-science-msc',
    checkedAt: now(),
    confidence: 'medium',
    fieldConfidence: {
      programName: '已核验',
      teachingLanguage: '待复核',
      deadline: '数据过期风险',
      applicationPath: '待复核',
      aps: '待复核',
      ects: '待复核',
      nc: '待人工核实'
    },
    reviewRequired: true,
    evidence: 'Demo seed: official program/admission pages must be verified during real application.'
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
    motivationLetter: unknown,
    cv: 'CV likely required; 待官网复核',
    nc: unknown,
    tuitionFee: 'semester contribution; 待官网复核',
    sourceUrl: 'https://www.uni-saarland.de/en/study/programmes/master/data-science-ai.html',
    checkedAt: now(),
    confidence: 'medium',
    fieldConfidence: {
      programName: '已核验',
      teachingLanguage: '待复核',
      deadline: '数据过期风险',
      applicationPath: '待复核',
      aps: '待复核',
      ects: '待复核',
      nc: '待人工核实'
    },
    reviewRequired: true,
    evidence: 'Demo seed: applicant should verify official admission URL before submission.'
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
    motivationLetter: unknown,
    cv: unknown,
    nc: unknown,
    tuitionFee: 'semester contribution; 待官网复核',
    sourceUrl: 'https://www.th-koeln.de/en/academics/web-and-data-science-masters-program_7219.php',
    checkedAt: now(),
    confidence: 'medium',
    fieldConfidence: {
      programName: '已核验',
      teachingLanguage: '待复核',
      deadline: '数据过期风险',
      applicationPath: '待复核',
      aps: '待复核',
      ects: '待复核',
      nc: '待人工核实'
    },
    reviewRequired: true,
    evidence: 'Demo seed: FH/HAW track included for portfolio diversity.'
  }
];

export function normalizeProfile(profile = {}) {
  const pick = (...keys) => keys.map(key => profile?.[key]).find(value => value !== undefined && value !== null && String(value).trim() !== '');
  return {
    ...profile,
    averageScore: pick('averageScore', 'average', 'avg', 'meanScore', 'score', 'rawAverage', 'gpaAverage'),
    maxScore: pick('maxScore', 'fullScore', 'maximumScore', 'highestScore', 'scoreMax', 'max'),
    passScore: pick('passScore', 'passingScore', 'minimumPassScore', 'passLine', 'minimumPassingScore', 'minPass', 'pass'),
    targetDirection: pick('targetDirection', 'direction', 'targetMajor', 'targetProgram', 'target') || profile.targetDirection || 'Data Science / AI'
  };
}

export function validateProfile(profile = {}) {
  const normalized = normalizeProfile(profile);
  const errors = [];
  const avg = Number(normalized.averageScore);
  const max = Number(normalized.maxScore);
  const pass = Number(normalized.passScore);
  if (!Number.isFinite(avg)) errors.push('均分必须为有效数字');
  if (!Number.isFinite(max)) errors.push('满分必须为有效数字');
  if (!Number.isFinite(pass)) errors.push('及格线必须为有效数字');
  if (Number.isFinite(max) && Number.isFinite(pass) && max <= pass) errors.push('满分必须高于及格线');
  if (Number.isFinite(avg) && Number.isFinite(max) && avg > max) errors.push('均分不能高于满分');
  if (Number.isFinite(avg) && Number.isFinite(pass) && avg < pass) errors.push('均分不能低于及格线');
  if (!String(normalized.targetDirection || '').trim()) errors.push('目标方向不能为空');
  return { valid: errors.length === 0, errors };
}

export function calculateGermanGrade(profile = {}) {
  const normalized = normalizeProfile(profile);
  const validation = validateProfile(normalized);
  const avg = Number(normalized.averageScore);
  const max = Number(normalized.maxScore);
  const pass = Number(normalized.passScore);
  if (!validation.valid) {
    return { value: null, formula: '1 + 3 × (最高分 - 申请者成绩) / (最高分 - 最低及格分)', note: validation.errors.join('；') };
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

function gradeScore(germanGrade) {
  if (!Number.isFinite(germanGrade)) return { score: 0, reason: '成绩参数无效，无法计算德国制参考成绩' };
  if (germanGrade <= 1.7) return { score: 20, reason: `德国制参考成绩 ${germanGrade.toFixed(2)}，成绩项较强` };
  if (germanGrade <= 2.2) return { score: 18, reason: `德国制参考成绩 ${germanGrade.toFixed(2)}，处于较有竞争力区间` };
  if (germanGrade <= 2.5) return { score: 15, reason: `德国制参考成绩 ${germanGrade.toFixed(2)}，可作为匹配项目初筛` };
  if (germanGrade <= 2.8) return { score: 12, reason: `德国制参考成绩 ${germanGrade.toFixed(2)}，部分项目需谨慎` };
  if (germanGrade <= 3.2) return { score: 8, reason: `德国制参考成绩 ${germanGrade.toFixed(2)}，成绩项存在压力` };
  return { score: 5, reason: `德国制参考成绩 ${germanGrade.toFixed(2)}，成绩项风险较高` };
}

function scoreProgram(program, profile = {}, index = 0, grade = calculateGermanGrade(profile)) {
  const text = `${profile.targetDirection || ''} ${profile.major || ''} ${profile.experiences || ''}`.toLowerCase();
  const dataSignal = /(data|ai|artificial|统计|数据|机器学习|python|计算机|数学|算法|编程|信息)/i.test(text);
  const strongDataSignal = /(python|机器学习|算法|统计|数学|计算机|data|ai)/i.test(text);
  const cross = String(profile.crossMajor || '部分跨专业');
  const crossRisk = /是|部分/.test(cross);
  const english = String(profile.english || '');
  const aps = String(profile.apsStatus || '');
  const exp = String(profile.experiences || '');
  const gradePart = gradeScore(grade.value);

  const parts = [];
  parts.push({ key: '成绩换算', weight: 20, score: gradePart.score, reason: `${gradePart.reason}；该项仅作为初筛参考，最终以学校认定为准。` });

  let majorScore = dataSignal ? (crossRisk ? 9 : 14) : 6;
  if (program.universityType === 'TU9' && crossRisk) majorScore -= 1;
  parts.push({ key: '专业相关度', weight: 15, score: Math.max(3, majorScore), reason: crossRisk ? '目标方向与背景部分相关，但跨专业逻辑需通过课程描述和项目经历解释。' : '本科背景与目标方向相关度较高，可支撑初筛推荐。' });

  let ectsScore = strongDataSignal ? 16 : dataSignal ? 13 : 9;
  if (program.universityType === 'TU9') ectsScore -= 2;
  parts.push({ key: '课程/ECTS 匹配', weight: 20, score: Math.max(6, ectsScore), reason: '当前仅基于用户输入识别课程线索；数学、统计、计算机与专业核心 ECTS 需用成绩单和课程描述复核。' });

  let langScore = 4;
  if (/(ielts\s*(6\.5|7|7\.5|8|9)|toefl\s*(8\d|9\d|10\d|11\d)|托福|雅思\s*6\.5|雅思\s*7)/i.test(english)) langScore = 10;
  else if (/(ielts|toefl|雅思|托福)/i.test(english)) langScore = 8;
  else if (/准备|报名/.test(english)) langScore = 6;
  else if (/未考|无/.test(english)) langScore = 3;
  parts.push({ key: '语言状态', weight: 10, score: langScore, reason: langScore >= 8 ? '已有语言成绩线索，仍需逐项目核对最低分与提交截止日期。' : '语言成绩可能成为硬性材料阻塞项，需优先确认考试与提交时间。' });

  let apsScore = /已通过/.test(aps) ? 10 : /已递交|等待/.test(aps) ? 8 : /准备/.test(aps) ? 6 : /未开始/.test(aps) ? 3 : 2;
  parts.push({ key: 'APS 状态', weight: 10, score: apsScore, reason: apsScore >= 8 ? 'APS 进度较好，仍需按具体申请路径确认提交方式。' : 'APS 可能影响中国申请者申请节奏，应作为前置任务处理。' });

  let expScore = /(实习|科研|项目|论文|毕业设计|competition|research|intern)/i.test(exp) ? 8 : 4;
  if (/(机器学习|数据分析|python|算法|统计|用户行为)/i.test(exp)) expScore = 10;
  parts.push({ key: '项目经历', weight: 10, score: expScore, reason: expScore >= 8 ? '相关项目/实习经历可增强动机信与课程匹配说明。' : '项目经历较弱，不应替代硬性课程要求，建议补充真实经历。' });

  const deadlineScore = program.deadline.includes('待') ? 4 : 7;
  parts.push({ key: 'Deadline 风险', weight: 8, score: deadlineScore, reason: 'deadline、VPD、uni-assist 和 APS 周期均可能影响申请节奏；当前演示数据需官网复核。' });

  const confidenceScore = program.confidence === 'high' ? 7 : program.confidence === 'medium' ? 4 : 2;
  parts.push({ key: '数据可信度', weight: 7, score: confidenceScore, reason: '项目要求来自演示种子数据，已保留来源链接与待复核标签，不作为最终申请依据。' });

  const total = Math.max(35, Math.min(92, parts.reduce((s, p) => s + p.score, 0) - (index === 0 ? 2 : 0)));
  const tier = total >= 85 ? '优先申请' : total >= 75 ? '匹配项目' : total >= 65 ? '谨慎申请' : total >= 50 ? '高风险' : '暂不建议';
  const riskLevel = total >= 78 ? '低' : total >= 65 ? '中' : total >= 50 ? '高' : '极高';
  const reasons = [
    `目标方向与 ${program.programName} 存在方向相关性，可进入初筛池。`,
    `德国制参考成绩为 ${grade.value ?? '待计算'}，与课程/ECTS 线索共同决定推荐梯度。`,
    program.universityType === 'FH / HAW' ? 'FH/HAW 项目可作为组合中的应用型稳妥选项。' : `${program.universityType} 项目可用于形成申请组合梯度。`
  ];
  const riskEvidence = [
    'deadline、NC/历史线、语言分数和申请路径仍需打开官网逐项复核。',
    crossRisk ? '存在跨专业或部分跨专业风险，需课程描述和文书解释支撑。' : '即使专业相关，也需核对具体模块和 ECTS 要求。',
    apsScore < 8 ? 'APS 尚未完成或状态不明确，可能影响申请节奏。' : 'APS 状态较好，但仍需按项目路径确认提交要求。',
    '当前项目数据为演示种子数据，不能替代当季官网页面。'
  ];
  const nextTasks = [
    '补充英文成绩单、课程描述和数学/统计/计算机学分表。',
    '打开项目 admission/deadline/language 页面，记录来源链接、抓取日期并保存截图。',
    '确认 APS、VPD、uni-assist 或直申路径，并倒排材料截止日期。',
    '基于评分短板更新 Motivation Letter 与课程匹配说明。'
  ];
  const gaps = riskEvidence.slice(0, 3);

  return {
    programId: program.id,
    university: program.university,
    programName: program.programName,
    matchScore: total,
    tier,
    scoreParts: parts,
    recommendationReasons: reasons,
    riskEvidence,
    nextTasks,
    satisfiedModules: dataSignal ? ['目标方向相关', '具备数据/AI方向素材', '可通过课程描述解释'] : ['申请目标已明确'],
    gapModules: gaps,
    strengthening: nextTasks,
    riskLevel,
    recommendation: total >= 55 ? '建议进入初筛组合，但需完成官网复核与材料补强' : '不建议作为主申项目'
  };
}

export function buildCourseMatching(profile = {}, programs = demoPrograms) {
  const grade = calculateGermanGrade(profile);
  return programs.map((p, i) => scoreProgram(p, profile, i, grade));
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
    overallCompetitiveness: matching[index]?.tier || '待评估',
    mainRisk: matching[index]?.riskEvidence.join('；'),
    source: p.sourceUrl
  }));
}

export function buildDashboard(profile = {}, programs = demoPrograms) {
  const matching = buildCourseMatching(profile, programs);
  return programs.map((p, i) => ({
    university: p.university,
    programName: p.programName,
    tier: matching[i]?.tier || (i === 0 ? '冲刺' : i === 1 ? '匹配' : '稳妥'),
    language: p.teachingLanguage,
    applicationPath: p.applicationPath,
    aps: p.aps,
    vpd: p.vpd,
    deadline: p.deadline,
    status: '待官网复核',
    blocker: matching[i]?.riskEvidence[0] || '待补充材料',
    nextStep: matching[i]?.nextTasks[1] || '打开官网 admission/deadline 页面逐项核验并保存截图',
    priority: i === 0 ? '高' : '中',
    lastChecked: today()
  }));
}

export function buildPolicyRadar(profile = {}, programs = demoPrograms) {
  return {
    taskName: `${profile.name || 'Demo Applicant'}-德国硕士政策雷达`,
    frequency: '每 3 天',
    createdAt: now(),
    systemTaskStatus: 'Vercel Demo 已生成任务配置与首次运行样例；长期定时需部署到服务器或办公小浣熊定时任务模块',
    trackedPages: programs.flatMap(p => [
      { university: p.university, programName: p.programName, pageType: 'program/admission', url: p.sourceUrl },
      { university: p.university, programName: p.programName, pageType: 'deadline/language/application procedure', url: p.sourceUrl }
    ]),
    firstRun: programs.map(p => ({
      date: today(),
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
    { stage: '背景建档', manual: '通常需要反复整理材料', system: '分钟级生成结构化摘要', evidence: '基于作者真实申请经历对比' },
    { stage: '官网核验', manual: '通常需要跨多个官网逐项查找', system: 'Demo 可集中列出核验字段与来源入口', evidence: '当前为示范院校流程验证' },
    { stage: '成绩换算', manual: '需要人工套公式并检查参数', system: '输入 84/100/60 后实时得到 2.20', evidence: '公式真实计算，参数来自用户输入' },
    { stage: '课程匹配', manual: '需要逐课程对照项目要求', system: '先生成启发式风险清单', evidence: '仍需成绩单与课程描述人工复核' },
    { stage: '材料任务', manual: '容易遗漏 APS/VPD/deadline', system: '自动生成下一步任务与阻塞项', evidence: 'Demo 配置展示' },
    { stage: '报告交付', manual: '需要重新整理成文档', system: '可下载初筛诊断报告', evidence: '当前 Web Demo 已支持' }
  ];
  return {
    rows,
    summary: {
      efficiencyStatement: '初筛从数天缩短到分钟级（基于作者真实申请经历对比）',
      quantificationBoundary: '未做大样本计时实验，因此不使用精确倍数、准确率或覆盖院校数量夸大表达。',
      projects: 'TUM / Saarland University / TH Köln 三个示范院校 + 引擎可扩展',
      highRisks: 'APS、deadline、VPD/uni-assist、课程/ECTS、语言要求等关键风险被集中列出',
      deliverables: '页面结果 + 可下载初筛诊断报告 + 后续 PPT 截图材料'
    },
    quality: [
      { metric: '示范院校数量', count: '3 个示范院校' },
      { metric: '成绩换算样例', count: '84/100/60 → 2.20' },
      { metric: '可信度机制', count: '来源链接 / 抓取日期 / 演示数据 / 待人工核实' },
      { metric: '准确率说明', count: '未做大样本验证，不声称准确率' },
      { metric: '政策雷达说明', count: 'Demo 配置展示，待长期运行验证' }
    ]
  };
}

export function buildDrafts(profile = {}, programs = demoPrograms, matching = []) {
  const target = programs[0] || demoPrograms[0];
  return {
    motivationLetter: `Dear Admissions Committee,\n\nI am applying for ${target.programName} at ${target.university}. My academic background is ${profile.major || '【待补充本科专业】'} at ${profile.university || '【待补充本科院校】'}, and my target direction is ${profile.targetDirection || 'Data Science / AI'}.\n\nMy current profile includes: ${profile.experiences || '【待补充真实项目、实习、科研或课程经历】'}. I understand that exact credit modules, language score thresholds, APS/VPD path and deadline must be verified against official program pages.\n\nWhere my background is cross-disciplinary, I will explain the transition honestly through completed courses, projects and planned bridge learning.\n\nSincerely,\n${profile.name || '【Applicant Name】'}\n\n说明：本草稿仅使用用户输入素材；所有【待补充】处不得编造，需用户提供真实经历。`,
    courseMappingStatement: `课程匹配说明（初稿）\n\n目标项目：${target.university} - ${target.programName}\n匹配结论：${matching[0]?.matchScore || '待评分'} / 100。\n\n已满足模块：${(matching[0]?.satisfiedModules || []).join('；') || '待补充课程信息'}。\n\n缺口模块：${(matching[0]?.gapModules || []).join('；') || '待官网核验'}。\n\n补强材料：英文课程描述、成绩单、学分说明、项目/实习证明、APS、语言成绩、动机信中对跨专业路径的解释。\n\n真实性原则：本说明只基于申请者输入，不虚构课程、学分、成绩或经历。`
  };
}

export function runFullDemo(profile = {}, incomingPrograms = []) {
  const normalizedProfile = normalizeProfile(profile);
  const validation = validateProfile(normalizedProfile);
  if (!validation.valid) {
    return { ok: false, generatedAt: now(), validation, error: validation.errors.join('；') };
  }
  const programs = incomingPrograms?.length ? incomingPrograms : demoPrograms.map(p => ({ ...p, checkedAt: now() }));
  const grade = calculateGermanGrade(normalizedProfile);
  const matching = buildCourseMatching(normalizedProfile, programs);
  const competition = buildCompetition(normalizedProfile, programs);
  const dashboard = buildDashboard(normalizedProfile, programs);
  const policyRadar = buildPolicyRadar(normalizedProfile, programs);
  const efficiency = buildEfficiencyReport();
  const drafts = buildDrafts(normalizedProfile, programs, matching);
  return {
    ok: true,
    generatedAt: now(),
    profile: {
      ...normalizedProfile,
      germanGrade: grade.value,
      profileCompleteness: normalizedProfile.university && normalizedProfile.major && normalizedProfile.experiences ? '较完整' : '需补充院校/专业/经历/课程描述'
    },
    grade,
    programs,
    competition,
    matching,
    dashboard,
    policyRadar,
    efficiency,
    drafts,
    executiveSummary: {
      title: '德国硕士申请初筛与材料管理工作台',
      positioning: '输入背景，生成申请梯度方案；输出推荐理由、风险证据与下一步任务。',
      mainConclusion: `参考德国制成绩 ${grade.value}；建议优先复核课程/ECTS、APS、语言和 deadline。`,
      boundary: '当前为 Vercel 在线 Demo：成绩与评分为真实计算，项目要求为演示种子数据，提交前必须官网复核。'
    },
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
