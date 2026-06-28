const now = () => new Date().toISOString();
const today = () => now().slice(0, 10);
const unknown = '待人工核验';

const verificationTemplate = {
  status: '待人工复核',
  checkedAt: today(),
  evidenceLevel: 'Demo 种子数据：已保留官网入口，正式申请前必须逐页核验',
  manualReviewRequired: true
};

export const workflowSteps = [
  '申请者录入',
  '画像建档',
  '成绩换算',
  '课程匹配',
  '官网核验',
  '申请看板',
  '政策雷达'
];

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
    applicationPlatform: 'TUMonline + VPD 待复核',
    deadline: unknown,
    aps: '中国学历申请者通常需关注 APS；是否可后补待官网复核',
    apsRequired: '通常需要，待官网复核',
    vpd: '可能涉及 VPD；需按当季 TUM 要求核验',
    vpdRequired: '待复核',
    uniAssist: '可能涉及 VPD，不等同于正式申请',
    language: 'English proficiency required，具体 IELTS/TOEFL 分数待官网复核',
    languageRequirement: 'IELTS/TOEFL 最低分待官网复核',
    academicRequirement: 'Computer Science / Engineering / Mathematics / related quantitative background; module credits need course-by-course check',
    coreCreditRequirement: '数学、统计、计算机、工程/数据相关模块需逐项 ECTS 对照',
    materials: ['成绩单', '课程描述', 'CV', 'Motivation Letter', 'APS/VPD 文件', '语言成绩'],
    motivationLetter: '通常需要动机说明/申请陈述，具体格式待官网复核',
    cv: '通常需要 CV，具体格式待官网复核',
    nc: 'selection procedure; 历史 NC/分数线待人工核验',
    ncStatus: 'Selection procedure，历史线未确认',
    historicalNC: '未在 Demo 中确认，待人工核实',
    tuitionFee: 'semester contribution / possible tuition rules by nationality; 待官网复核',
    semesterContribution: '待官网复核',
    sourceUrl: 'https://www.tum.de/en/studies/degree-programs/detail/data-engineering-and-analytics-master-of-science-msc',
    sourcePage: 'official program page / admission page',
    checkedAt: now(),
    confidence: 'medium',
    verification: { ...verificationTemplate, keyRisks: ['VPD 是否适用', 'deadline 当季变化', 'ECTS 模块要求', 'NC/Selection procedure'] },
    fieldConfidence: {
      programName: '已核验入口', teachingLanguage: '待复核', deadline: '数据过期风险', applicationPath: '待复核', aps: '待复核', ects: '待复核', nc: '待人工核实'
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
    applicationPlatform: 'Online application / uni-assist 适用性待复核',
    deadline: unknown,
    aps: '中国学历申请者通常需 APS；待官网复核',
    apsRequired: '通常需要，待官网复核',
    vpd: unknown,
    vpdRequired: '待复核',
    uniAssist: unknown,
    language: 'English proficiency required，分数待官网复核',
    languageRequirement: 'IELTS/TOEFL 或等效英语证明待官网复核',
    academicRequirement: 'Computer science, mathematics, statistics and data-oriented modules; exact credits need official module matching',
    coreCreditRequirement: '计算机、数学、统计和数据科学基础需课程级匹配',
    materials: ['成绩单', '模块手册/课程描述', 'CV', '语言成绩', 'APS', '可能需要动机材料'],
    motivationLetter: unknown,
    cv: 'CV likely required; 待官网复核',
    nc: unknown,
    ncStatus: 'NC / selection rule 未确认',
    historicalNC: '官网未确认则不得推断，待人工核实',
    tuitionFee: 'semester contribution; 待官网复核',
    semesterContribution: '待官网复核',
    sourceUrl: 'https://www.uni-saarland.de/en/study/programmes/master/data-science-ai.html',
    sourcePage: 'official programme page',
    checkedAt: now(),
    confidence: 'medium',
    verification: { ...verificationTemplate, keyRisks: ['课程先修模块', '申请路径', '语言提交截止', 'APS 文件'] },
    fieldConfidence: {
      programName: '已核验入口', teachingLanguage: '待复核', deadline: '数据过期风险', applicationPath: '待复核', aps: '待复核', ects: '待复核', nc: '待人工核实'
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
    applicationPlatform: 'uni-assist / Hochschulportal 适用性待复核',
    deadline: unknown,
    aps: '中国学历申请者通常需 APS；待官网复核',
    apsRequired: '通常需要，待官网复核',
    vpd: unknown,
    vpdRequired: '待复核',
    uniAssist: '可能涉及 uni-assist，需以官网为准',
    language: 'English proficiency required，分数待官网复核',
    languageRequirement: '英语证明要求待官网复核',
    academicRequirement: 'Bachelor with CS/data/web-related background and sufficient credits; exact credit match needed',
    coreCreditRequirement: 'Web、数据库、编程、数据科学相关学分需逐项核验',
    materials: ['成绩单', '课程描述', 'CV', '语言成绩', 'APS', '申请平台材料'],
    motivationLetter: unknown,
    cv: unknown,
    nc: unknown,
    ncStatus: 'NC/Selection rule 待人工核实',
    historicalNC: '待人工核实',
    tuitionFee: 'semester contribution; 待官网复核',
    semesterContribution: '待官网复核',
    sourceUrl: 'https://www.th-koeln.de/en/academics/web-and-data-science-masters-program_7219.php',
    sourcePage: 'official programme page',
    checkedAt: now(),
    confidence: 'medium',
    verification: { ...verificationTemplate, keyRisks: ['uni-assist 路径', '冬季 deadline', 'FH/HAW 学分匹配', '语言证明'] },
    fieldConfidence: {
      programName: '已核验入口', teachingLanguage: '待复核', deadline: '数据过期风险', applicationPath: '待复核', aps: '待复核', ects: '待复核', nc: '待人工核实'
    },
    reviewRequired: true,
    evidence: 'Demo seed: FH/HAW track included for portfolio diversity.'
  }
];


export const courseTaxonomy = [
  { key: 'math_foundation', label: '数学基础', keywords: ['高等数学', '微积分', '线性代数', '离散数学', '优化', 'calculus', 'linear algebra', 'discrete', 'optimization'], minDemoCredits: 6 },
  { key: 'statistics_probability', label: '统计与概率', keywords: ['概率', '统计', '数理统计', '计量', '回归', 'statistics', 'probability', 'regression', 'econometrics'], minDemoCredits: 6 },
  { key: 'computer_science', label: '计算机基础', keywords: ['程序设计', '编程', '数据结构', '算法', '软件工程', '计算机', 'python', 'java', 'c++', 'algorithm', 'data structure', 'software'], minDemoCredits: 8 },
  { key: 'data_database', label: '数据与数据库', keywords: ['数据库', '数据仓库', 'sql', 'data management', 'database', 'data warehouse'], minDemoCredits: 4 },
  { key: 'data_ai', label: 'AI / 数据科学', keywords: ['机器学习', '人工智能', '深度学习', '数据挖掘', '数据科学', 'machine learning', 'artificial intelligence', 'deep learning', 'data mining'], minDemoCredits: 4 },
  { key: 'domain_core', label: '专业核心', keywords: ['管理', '经济', '金融', '工程', '商业', '专业核心', 'management', 'economics', 'finance', 'engineering'], minDemoCredits: 6 },
  { key: 'research_methods', label: '研究方法', keywords: ['研究方法', '学术写作', '论文', 'research method', 'academic writing', 'thesis'], minDemoCredits: 2 },
  { key: 'project_practice', label: '项目实践', keywords: ['实习', '项目', '毕设', '毕业设计', '科研', '实践', 'internship', 'project', 'capstone', 'research'], minDemoCredits: 2 }
];

export const sampleCourses = [
  { name: '高等数学', credits: 4, grade: 86, description: '微积分、函数、极限与多元微积分基础' },
  { name: '线性代数', credits: 3, grade: 88, description: '矩阵、向量空间、特征值与线性变换' },
  { name: '概率论与数理统计', credits: 4, grade: 85, description: '概率分布、参数估计、假设检验与统计推断' },
  { name: 'Python 程序设计', credits: 3, grade: 90, description: 'Python 编程、数据处理与基础算法实现' },
  { name: '数据库系统', credits: 3, grade: 87, description: '关系数据库、SQL、数据建模与事务处理' },
  { name: '机器学习导论', credits: 3, grade: 89, description: '监督学习、模型评估、聚类和特征工程' },
  { name: '数据分析课程项目', credits: 2, grade: 91, description: '使用 Python 完成数据清洗、建模和可视化报告' }
];

export const programRequirementProfiles = {
  'tum-data-engineering-analytics': {
    profileLabel: 'TU9 强理论型要求画像',
    sourceStatus: 'Demo 要求画像，正式申请前需官网复核',
    checkedAt: today(),
    requirementNote: '强调数学、计算机和数据工程基础；硬性 ECTS 需按官网 admission 页面逐项确认。',
    modules: [
      { module: 'math_foundation', label: '数学基础', requiredCredits: 8, type: 'hard', evidence: '项目通常要求定量/数学基础，Demo 按课程级证据建模' },
      { module: 'statistics_probability', label: '统计与概率', requiredCredits: 6, type: 'hard', evidence: '数据工程/分析方向需要统计与概率基础' },
      { module: 'computer_science', label: '计算机基础', requiredCredits: 10, type: 'hard', evidence: '编程、算法、数据库等需课程证明' },
      { module: 'data_database', label: '数据与数据库', requiredCredits: 4, type: 'soft', evidence: '数据工程方向加分模块' },
      { module: 'data_ai', label: 'AI / 数据科学', requiredCredits: 4, type: 'soft', evidence: '数据分析方向相关模块' }
    ]
  },
  'saarland-data-science-ai': {
    profileLabel: '综合大学 AI/CS 平衡型要求画像',
    sourceStatus: 'Demo 要求画像，正式申请前需官网复核',
    checkedAt: today(),
    requirementNote: '强调计算机、数学统计和 AI 基础的组合匹配。',
    modules: [
      { module: 'math_foundation', label: '数学基础', requiredCredits: 6, type: 'hard', evidence: 'AI/CS 硕士常见数学基础要求' },
      { module: 'statistics_probability', label: '统计与概率', requiredCredits: 6, type: 'hard', evidence: '数据科学方向需要统计推断能力' },
      { module: 'computer_science', label: '计算机基础', requiredCredits: 8, type: 'hard', evidence: 'CS/AI 项目需要编程和算法基础' },
      { module: 'data_ai', label: 'AI / 数据科学', requiredCredits: 6, type: 'soft', evidence: 'AI 方向核心相关课程' },
      { module: 'research_methods', label: '研究方法', requiredCredits: 2, type: 'soft', evidence: '研究型大学对学术能力有加分价值' }
    ]
  },
  'th-koeln-web-data-science': {
    profileLabel: 'FH/HAW 应用实践型要求画像',
    sourceStatus: 'Demo 要求画像，正式申请前需官网复核',
    checkedAt: today(),
    requirementNote: '强调 Web、数据库、编程和项目实践，适合作为应用型组合。',
    modules: [
      { module: 'computer_science', label: '计算机基础', requiredCredits: 8, type: 'hard', evidence: 'Web/Data 项目需要编程基础' },
      { module: 'data_database', label: '数据与数据库', requiredCredits: 6, type: 'hard', evidence: 'Web and Data Science 对数据库/数据管理敏感' },
      { module: 'data_ai', label: 'AI / 数据科学', requiredCredits: 4, type: 'soft', evidence: '数据科学方向相关课程' },
      { module: 'project_practice', label: '项目实践', requiredCredits: 4, type: 'soft', evidence: 'FH/HAW 更强调应用项目和实践材料' },
      { module: 'statistics_probability', label: '统计与概率', requiredCredits: 4, type: 'soft', evidence: '数据分析基础模块' }
    ]
  }
};

function parseCourseLines(text = '') {
  return String(text || '').split(/\n|；|;/).map(line => line.trim()).filter(Boolean).map((line, index) => {
    const creditMatch = line.match(/(\d+(?:\.\d+)?)\s*(学分|credit|credits|ECTS)/i);
    const gradeMatch = line.match(/成绩?[:：]?\s*(\d+(?:\.\d+)?)/) || line.match(/\b(\d{2,3})(?:\s*$)/);
    const name = line.replace(/\d+(?:\.\d+)?\s*(学分|credit|credits|ECTS)/ig, '').replace(/成绩?[:：]?\s*\d+(?:\.\d+)?/g, '').trim();
    return { name: name || `课程 ${index + 1}`, credits: creditMatch ? Number(creditMatch[1]) : 3, grade: gradeMatch ? Number(gradeMatch[1]) : null, description: line };
  });
}

function getApplicantCourses(profile = {}) {
  if (Array.isArray(profile.courses) && profile.courses.length) return profile.courses;
  const fromText = parseCourseLines(`${profile.courseSummary || ''}\n${profile.experiences || ''}`);
  return fromText.length ? fromText : sampleCourses;
}

export function classifyCourse(course = {}) {
  const text = `${course.name || ''} ${course.description || ''}`.toLowerCase();
  const scored = courseTaxonomy.map(module => {
    const hits = module.keywords.filter(k => text.includes(k.toLowerCase()));
    return { module, hits, score: hits.length };
  }).sort((a, b) => b.score - a.score);
  const best = scored[0];
  const selected = best?.score ? best.module : courseTaxonomy.find(m => m.key === 'domain_core');
  const confidence = best?.score >= 2 ? 0.92 : best?.score === 1 ? 0.74 : 0.45;
  return {
    ...course,
    credits: Number(course.credits || 3),
    moduleKey: selected.key,
    moduleLabel: selected.label,
    confidence,
    evidence: best?.score ? `命中关键词：${best.hits.join('、')}` : '未命中明确关键词，暂归为专业核心，需顾问复核',
    reviewRequired: confidence < 0.75 || !course.description
  };
}

export function buildCourseEvidence(profile = {}) {
  const classifiedCourses = getApplicantCourses(profile).map(classifyCourse);
  const moduleSummary = courseTaxonomy.map(module => {
    const courses = classifiedCourses.filter(c => c.moduleKey === module.key);
    const credits = courses.reduce((sum, c) => sum + Number(c.credits || 0), 0);
    return {
      moduleKey: module.key,
      moduleLabel: module.label,
      credits,
      courseCount: courses.length,
      courses: courses.map(c => c.name),
      confidence: courses.length ? Number((courses.reduce((s, c) => s + c.confidence, 0) / courses.length).toFixed(2)) : 0,
      status: credits >= module.minDemoCredits ? '证据较充分' : credits > 0 ? '部分证据' : '缺口明显'
    };
  });
  const manualReviewQueue = classifiedCourses.filter(c => c.reviewRequired).map(c => ({ courseName: c.name, module: c.moduleLabel, reason: c.confidence < 0.75 ? '课程归类置信度较低' : '缺少课程描述或大纲' }));
  return { classifiedCourses, moduleSummary, manualReviewQueue };
}

function moduleCredits(moduleSummary, key) {
  return moduleSummary.find(m => m.moduleKey === key)?.credits || 0;
}

function matchedCourses(classifiedCourses, key) {
  return classifiedCourses.filter(c => c.moduleKey === key).map(c => c.name);
}

function statusFromRatio(ratio, type) {
  if (ratio >= 1) return '满足';
  if (ratio >= 0.6) return '部分满足';
  return type === 'hard' ? '高风险缺口' : '可补强缺口';
}

function buildRequirementProfiles(programs = demoPrograms) {
  return programs.map(program => {
    const profile = programRequirementProfiles[program.id] || { modules: [], sourceStatus: '待建立画像', profileLabel: '待建模项目', requirementNote: '该项目尚未维护课程要求画像。' };
    return {
      programId: program.id,
      university: program.university,
      programName: program.programName,
      requirementSource: profile.profileLabel || '项目课程要求画像',
      evidenceUrl: profile.requirementNote || 'Demo 静态画像，正式申请前需官网复核',
      reviewStatus: profile.sourceStatus || '待人工复核',
      requirements: profile.modules.map(req => ({
        module: req.module,
        label: req.label,
        requiredCredits: req.requiredCredits,
        requirementType: req.type,
        evidence: req.evidence
      }))
    };
  });
}

export function matchCoursesToProgram(program, evidence) {
  const profile = programRequirementProfiles[program.id] || { modules: [], sourceStatus: '待建立画像', profileLabel: '待建模项目', requirementNote: '该项目尚未维护课程要求画像。' };
  const rows = profile.modules.map(req => {
    const credits = moduleCredits(evidence.moduleSummary, req.module);
    const ratio = req.requiredCredits ? credits / req.requiredCredits : 0;
    return {
      moduleKey: req.module,
      moduleLabel: req.label,
      requirementType: req.type,
      requiredCredits: req.requiredCredits,
      matchedCredits: credits,
      matchedCourses: matchedCourses(evidence.classifiedCourses, req.module),
      status: statusFromRatio(ratio, req.type),
      ratio: Number(Math.min(ratio, 1).toFixed(2)),
      evidence: req.evidence,
      manualReviewRequired: req.type === 'hard' && ratio < 1
    };
  });
  const hardRows = rows.filter(r => r.requirementType === 'hard');
  const hardScore = hardRows.length ? hardRows.reduce((s, r) => s + r.ratio, 0) / hardRows.length : 0;
  const allScore = rows.length ? rows.reduce((s, r) => s + r.ratio, 0) / rows.length : 0;
  const confidencePenalty = evidence.manualReviewQueue.length ? 6 : 0;
  const score = clamp(Math.round(hardScore * 55 + allScore * 35 + 10 - confidencePenalty), 35, 96);
  const riskLevel = score >= 85 ? '低' : score >= 75 ? '中低' : score >= 65 ? '中' : score >= 50 ? '高' : '极高';
  const gaps = rows.filter(r => r.status !== '满足').map(r => `${r.moduleLabel}：要求 ${r.requiredCredits}，已证明 ${r.matchedCredits}`);
  return {
    programId: program.id,
    university: program.university,
    programName: program.programName,
    profileLabel: profile.profileLabel,
    sourceStatus: profile.sourceStatus,
    checkedAt: profile.checkedAt || today(),
    requirementNote: profile.requirementNote,
    evidenceRows: rows,
    evidenceScore: score,
    riskLevel,
    decision: score >= 85 ? '强匹配' : score >= 75 ? '匹配' : score >= 65 ? '谨慎匹配' : score >= 50 ? '高风险' : '暂不建议',
    gaps,
    explanation: [`${program.university} 使用“${profile.profileLabel}”，不是套用通用权重。`, gaps.length ? `主要缺口：${gaps.slice(0, 2).join('；')}` : '核心模块已形成较完整证据链。', '所有 Demo 要求画像均需在正式申请前按官网逐项复核。'],
    manualReviewRequired: rows.some(r => r.manualReviewRequired) || evidence.manualReviewQueue.length > 0
  };
}

export function buildCourseMatchingEngine(profile = {}, programs = demoPrograms) {
  const evidence = buildCourseEvidence(profile);
  const programMatches = programs.map(program => matchCoursesToProgram(program, evidence));
  return {
    version: 'v0.5 课程匹配证据引擎',
    mode: '规则引擎 + 项目级要求画像；无需 API Key。AI/API 仅作为课程描述理解增强，不作为最终裁判。',
    inputMode: Array.isArray(profile.courses) && profile.courses.length ? '结构化课程表' : profile.courseSummary ? '课程文本解析' : 'Demo 示例课程',
    taxonomy: courseTaxonomy.map(({ key, label }) => ({ key, label })),
    moduleSummary: evidence.moduleSummary,
    classifiedCourses: evidence.classifiedCourses,
    requirementProfiles: buildRequirementProfiles(programs),
    programMatches,
    manualReviewQueue: evidence.manualReviewQueue,
    scientificNotes: ['项目级要求画像解决不同德国学校要求不同的问题。', '课程级证据链保证每个结论可回溯到具体课程、学分和项目要求。', '硬性课程缺口不能被项目经历完全抵消。', '低置信度课程和官网未核验字段必须进入顾问复核。']
  };
}

export function validateProfile(profile = {}) {
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
  return { valid: errors.length === 0, errors };
}

export function calculateGermanGrade(profile = {}) {
  const validation = validateProfile(profile);
  const avg = Number(profile.averageScore);
  const max = Number(profile.maxScore);
  const pass = Number(profile.passScore);
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

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
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

function detectSignals(profile = {}) {
  const text = `${profile.targetDirection || ''} ${profile.major || ''} ${profile.experiences || ''}`.toLowerCase();
  return {
    text,
    dataSignal: /(data|ai|artificial|统计|数据|机器学习|python|计算机|数学|算法|编程|信息|database)/i.test(text),
    mathSignal: /(数学|统计|概率|线性代数|微积分|math|statistics|probability)/i.test(text),
    csSignal: /(python|java|c\+\+|算法|数据结构|编程|计算机|database|sql|software)/i.test(text),
    projectSignal: /(实习|科研|项目|论文|毕业设计|competition|research|intern|project)/i.test(text),
    strongProjectSignal: /(机器学习|数据分析|python|算法|统计|用户行为|模型|research|paper)/i.test(text)
  };
}
function scoreProgram(program, profile = {}, index = 0, grade = calculateGermanGrade(profile)) {
  const signals = detectSignals(profile);
  const cross = String(profile.crossMajor || '部分跨专业');
  const crossRisk = /是|部分/.test(cross);
  const english = String(profile.english || '');
  const aps = String(profile.apsStatus || '');
  const gradePart = gradeScore(grade.value);
  const weights = { majorFit: 20, coreCourses: 30, mathStats: 15, csTech: 15, projects: 10, languageMaterials: 10 };

  const majorScore = clamp(signals.dataSignal ? (crossRisk ? 13 : 18) : 8, 4, weights.majorFit);
  const coreScore = clamp(signals.dataSignal ? (signals.mathSignal || signals.csSignal ? 22 : 18) : 12, 6, weights.coreCourses);
  const mathScore = clamp(signals.mathSignal ? 13 : signals.dataSignal ? 10 : 6, 3, weights.mathStats);
  const csScore = clamp(signals.csSignal ? 13 : signals.dataSignal ? 10 : 6, 3, weights.csTech);
  const projectScore = clamp(signals.strongProjectSignal ? 9 : signals.projectSignal ? 7 : 4, 2, weights.projects);

  let langBase = 3;
  if (/(ielts\s*(6\.5|7|7\.5|8|9)|toefl\s*(8\d|9\d|10\d|11\d)|托福|雅思\s*6\.5|雅思\s*7)/i.test(english)) langBase = 7;
  else if (/(ielts|toefl|雅思|托福)/i.test(english)) langBase = 6;
  else if (/准备|报名/.test(english)) langBase = 4;
  const apsBonus = /已通过/.test(aps) ? 3 : /已递交|等待/.test(aps) ? 2 : /准备/.test(aps) ? 1 : 0;
  const languageMaterialsScore = clamp(langBase + apsBonus, 2, weights.languageMaterials);

  const scoreParts = [
    { key: '本科专业相关性', weight: weights.majorFit, score: majorScore, reason: crossRisk ? '存在跨专业/部分跨专业风险，需要课程描述与动机信解释路径。' : '专业方向相关度较高，可支撑初筛。' },
    { key: '核心课程匹配', weight: weights.coreCourses, score: coreScore, reason: '基于输入文本识别课程线索；正式申请需逐项核对官方 ECTS/模块要求。' },
    { key: '数学/统计学分', weight: weights.mathStats, score: mathScore, reason: signals.mathSignal ? '已有数学/统计线索，需补充成绩单学分证明。' : '数学/统计先修课线索不足，需补充课程描述。' },
    { key: '计算机/技术学分', weight: weights.csTech, score: csScore, reason: signals.csSignal ? '已有编程/计算机线索，需映射到项目要求。' : '计算机/技术模块线索不足，存在硬性学分风险。' },
    { key: '项目/实习/科研经历', weight: weights.projects, score: projectScore, reason: projectScore >= 7 ? '相关经历可增强文书与课程匹配说明。' : '经历较弱，不应替代硬性课程学分要求。' },
    { key: '语言与硬性材料', weight: weights.languageMaterials, score: languageMaterialsScore, reason: languageMaterialsScore >= 8 ? '语言/APS 线索较好，仍需按项目核对提交截止。' : '语言或 APS 可能成为申请阻塞项。' }
  ];

  const baseTotal = scoreParts.reduce((s, p) => s + p.score, 0);
  const total = clamp(baseTotal + (gradePart.score >= 18 ? 3 : gradePart.score <= 8 ? -5 : 0) + (program.universityType === 'TU9' && crossRisk ? -4 : 0) - (program.reviewRequired ? 3 : 0), 35, 94);
  const tier = total >= 85 ? '冲刺/优先' : total >= 75 ? '匹配' : total >= 65 ? '稳妥/谨慎' : total >= 50 ? '高风险备选' : '暂不建议';
  const riskLevel = total >= 80 ? '低' : total >= 68 ? '中' : total >= 55 ? '高' : '极高';
  const satisfiedModules = [signals.dataSignal ? '目标方向相关素材' : null, signals.mathSignal ? '数学/统计线索' : null, signals.csSignal ? '计算机/技术线索' : null, signals.projectSignal ? '项目/实习/科研线索' : null, grade.value ? `德国制成绩 ${grade.value}` : null].filter(Boolean);
  const gapModules = [!signals.mathSignal ? '数学/统计 ECTS 待证明' : null, !signals.csSignal ? '计算机/编程 ECTS 待证明' : null, crossRisk ? '跨专业解释与课程桥接' : null, languageMaterialsScore < 8 ? '语言/APS 硬性材料' : null, 'deadline、VPD/uni-assist、NC/selection 需官网复核'].filter(Boolean);
  const strengthening = ['补充英文成绩单、课程描述和学分表。', '将数学、统计、计算机、专业核心课逐项映射到项目要求。', '打开 official admission/deadline/language 页面核验并保存截图。', '基于缺口模块更新 Motivation Letter 与课程匹配说明。'];

  return { programId: program.id, university: program.university, programName: program.programName, matchScore: total, tier, riskLevel, scoreParts, weights,
    recommendationReasons: [`与 ${program.programName} 存在方向相关性，可进入 ${tier} 梯度。`, `${gradePart.reason}；成绩换算为参考值，最终以学校认定为准。`, program.universityType === 'FH / HAW' ? 'FH/HAW 项目可作为应用型组合选项。' : `${program.universityType} 项目用于形成申请组合梯度。`],
    riskEvidence: gapModules, nextTasks: strengthening, satisfiedModules, gapModules, strengthening, manualReviewRequired: true,
    recommendation: total >= 65 ? '建议申请，但必须完成官网核验与材料补强' : total >= 55 ? '可作为备选，高度依赖课程描述和硬性材料' : '暂不建议作为主申项目' };
}

export function buildCourseMatching(profile = {}, programs = demoPrograms) {
  const grade = calculateGermanGrade(profile);
  const engine = buildCourseMatchingEngine(profile, programs);
  return programs.map((p, i) => {
    const legacy = scoreProgram(p, profile, i, grade);
    const evidence = engine.programMatches[i];
    return {
      ...legacy,
      matchScore: evidence?.evidenceScore ?? legacy.matchScore,
      riskLevel: evidence?.riskLevel || legacy.riskLevel,
      tier: evidence?.decision || legacy.tier,
      evidenceRows: evidence?.evidenceRows || [],
      projectRequirementProfile: evidence?.profileLabel,
      requirementSourceStatus: evidence?.sourceStatus,
      scientificExplanation: evidence?.explanation || [],
      gapModules: evidence?.gaps?.length ? evidence.gaps : legacy.gapModules,
      manualReviewRequired: evidence?.manualReviewRequired ?? legacy.manualReviewRequired
    };
  });
}
export function buildApplicantProfile(profile = {}, matching = []) {
  const signals = detectSignals(profile);
  const strongest = [...matching].sort((a, b) => b.matchScore - a.matchScore)[0];
  return {
    education: `${profile.university || '院校待补充'} / ${profile.major || '专业待补充'}`,
    targetDirection: profile.targetDirection || '待补充',
    crossMajor: profile.crossMajor || '部分跨专业',
    language: profile.english || '待补充',
    apsStatus: profile.apsStatus || '待补充',
    strengths: [signals.dataSignal ? '目标方向素材明确' : null, signals.projectSignal ? '已有项目/经历线索' : null, strongest ? `最高匹配项目：${strongest.university}` : null].filter(Boolean),
    risks: [!signals.mathSignal ? '数学/统计学分待证明' : null, !signals.csSignal ? '计算机/技术学分待证明' : null, /是|部分/.test(profile.crossMajor || '') ? '跨专业解释风险' : null, !/(ielts|toefl|雅思|托福)/i.test(profile.english || '') ? '语言成绩待补齐' : null].filter(Boolean),
    nextAction: '优先补充成绩单、课程描述、语言成绩和 APS 状态，并逐项目做官网核验。'
  };
}

export function buildCompetition(profile = {}, programs = demoPrograms) {
  const grade = calculateGermanGrade(profile);
  const matching = buildCourseMatching(profile, programs);
  return programs.map((p, index) => ({
    university: p.university,
    programName: p.programName,
    germanGrade: grade.value,
    nc: p.ncStatus || p.nc || unknown,
    historicalLine: p.historicalNC || '官网未确认则不得推断；待人工核验',
    courseMatch: matching[index]?.matchScore ?? 0,
    languageMatch: /(ielts|toefl|雅思|托福)/i.test(profile.english || '') ? '基本具备，需核对分数线' : '未确认/待补齐',
    overallCompetitiveness: matching[index]?.tier || '待评估',
    mainRisk: matching[index]?.riskEvidence.join('；'),
    source: p.sourceUrl,
    checkedAt: today(),
    manualReviewRequired: true
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
    aps: p.apsRequired || p.aps,
    vpd: p.vpdRequired || p.vpd,
    deadline: p.deadline,
    status: p.verification?.status || '待官网复核',
    blocker: matching[i]?.riskEvidence[0] || '待补充材料',
    nextStep: matching[i]?.nextTasks[2] || '打开官网 admission/deadline 页面逐项核验并保存截图',
    priority: matching[i]?.riskLevel === '高' || i === 0 ? '高' : '中',
    lastChecked: today(),
    source: p.sourceUrl
  }));
}

export function buildPolicyRadar(profile = {}, programs = demoPrograms) {
  return {
    taskName: `${profile.name || 'Demo Applicant'}-德国硕士政策雷达`,
    frequency: '每 3 天',
    createdAt: now(),
    systemTaskStatus: 'Netlify Demo 已生成可复制任务配置与首次运行记录；长期定时需部署到服务器或办公小浣熊定时任务模块，不能假装已真实创建。',
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
      currentInfo: '首次基线：已记录追踪页面与关键字段，具体字段需打开官网或接入抓取后复核。',
      changed: '首次基线',
      impact: '高',
      suggestedAction: '保存官网截图，补齐 deadline 与材料清单，设置正式定时巡检。',
      source: p.sourceUrl
    }))
  };
}
export function buildWritingSamples(profile = {}, matching = []) {
  const target = matching[0] || {};
  return {
    materialSources: ['申请者输入的目标方向/专业背景', '德国制成绩换算结果', '课程匹配缺口', '目标项目官网核验字段'],
    motivationLetterExcerpt: `My motivation for applying to ${target.programName || 'the target programme'} is built on a clear transition plan: I will connect my prior academic background with data-oriented coursework, project evidence, and a transparent explanation of remaining module gaps. Rather than overstating my profile, I will use the application documents to show which mathematics, statistics and computing modules can be verified by transcript and which parts require supplementary course descriptions.`,
    courseMatchStatement: `课程匹配说明应围绕 ${target.university || '目标院校'} 的 admission requirements 展开：先列出已满足模块，再列出数学/统计、计算机/技术、专业核心课缺口，最后说明补充材料和人工复核页面。`,
    noFabricationNotice: '文书只使用申请者已提供素材；实习、科研、获奖、语言成绩和 APS 状态不得编造。'
  };
}

export function buildEfficiencyReport(programs = demoPrograms) {
  const items = [
    ['背景建档', 2, 0.18, '结构化输入生成画像与风险摘要'],
    ['官网核验', 6, 0.75, 'Demo 记录入口与待复核字段；真实申请需逐页截图'],
    ['成绩换算', 0.5, 0.05, '修正巴伐利亚公式自动计算'],
    ['课程匹配', 4, 0.4, '按权重输出匹配分与缺口'],
    ['文书初稿', 3, 0.35, '基于真实素材与匹配结果生成片段'],
    ['作战看板', 2, 0.2, '自动生成优先级、阻塞项和下一步'],
    ['政策雷达', 1.5, 0.15, '生成追踪配置和首次基线记录'],
    ['对照报告', 1, 0.12, '统计可溯源与交付指标']
  ];
  const totalTraditional = items.reduce((s, i) => s + i[1], 0);
  const totalSystem = items.reduce((s, i) => s + i[2], 0);
  return {
    timeComparison: items.map(([step, traditionalHours, systemHours, note]) => ({ step, traditionalHours, systemHours, improvement: Number((traditionalHours / systemHours).toFixed(1)), note })),
    summary: {
      traditional: `${totalTraditional.toFixed(1)} 小时`,
      system: `${totalSystem.toFixed(1)} 小时`,
      improvement: Number((totalTraditional / totalSystem).toFixed(1)),
      programCount: programs.length,
      traceableItems: programs.length * 12,
      manualReviewItems: programs.length * 7,
      highRiskItems: programs.length * 3,
      deliverables: 8
    },
    qualityMetrics: {
      officialSourceItems: programs.length * 6,
      checkedDateItems: programs.length * 6,
      manualReviewItems: programs.length * 7,
      screenshots: '待真实浏览器核验后生成',
      tables: 5,
      writingSamples: 2,
      visualFiles: '待生成',
      pptPages: '待生成'
    }
  };
}

function buildExecutiveSummary(profile, grade, matching, programs) {
  const best = [...matching].sort((a, b) => b.matchScore - a.matchScore)[0];
  const highestRisk = matching.flatMap(m => m.gapModules || []).slice(0, 4);
  return {
    version: 'v0.5 课程匹配证据引擎版',
    headline: `${profile.name || '申请者'} 可进入 ${programs.length} 个德国公立大学项目的初筛组合`,
    germanGrade: grade.value,
    bestFit: best ? `${best.university} / ${best.programName}` : '待评估',
    workflow: workflowSteps,
    topRisks: highestRisk,
    nextAction: '先完成官网逐项核验和课程 ECTS 对照，再锁定冲刺/匹配/稳妥申请组合。',
    guardrail: '本 Demo 不替代学校最终审核；所有 deadline、NC、VPD、APS 和语言要求均需以官网当季页面为准。'
  };
}

export function runFullDemo(profile = {}) {
  profile = {
    ...profile,
    targetDirection: profile.targetDirection || profile.target || profile.targetMajor || '数据科学与人工智能',
    averageScore: Number(profile.averageScore ?? profile.score ?? 84),
    maxScore: Number(profile.maxScore ?? profile.fullScore ?? 100),
    passScore: Number(profile.passScore ?? profile.minPassScore ?? 60),
  };
  const validation = validateProfile(profile);
  const germanGrade = calculateGermanGrade(profile);
  const programs = demoPrograms;
  const courseMatchingEngine = buildCourseMatchingEngine(profile, programs);
  const courseMatching = buildCourseMatching(profile, programs);
  const applicantProfile = buildApplicantProfile(profile, courseMatching);
  return {
    ok: validation.valid,
    validation,
    generatedAt: now(),
    workflowSteps,
    executiveSummary: buildExecutiveSummary(profile, germanGrade, courseMatching, programs),
    applicantProfile,
    profile,
    germanGrade,
    programs,
    courseMatching,
    courseMatchingEngine,
    competition: buildCompetition(profile, programs),
    dashboard: buildDashboard(profile, programs),
    policyRadar: buildPolicyRadar(profile, programs),
    writingSamples: buildWritingSamples(profile, courseMatching),
    efficiencyReport: buildEfficiencyReport(programs),
    privacyAndCompliance: {
      principles: ['最小化采集', '角色权限隔离', '敏感字段脱敏', '人工复核关键官网信息', '申请结束后可删除材料'],
      demoBoundary: '当前为 Netlify Demo 原型，未接入真实数据库；商业化前需补充隐私政策、审计日志和数据删除机制。'
    },
    commercialization: {
      studentPackage: ['申请诊断报告', '项目匹配建议', '课程缺口清单', '文书方向建议'],
      consultantWorkspace: ['多学生管理', '项目库核验', '任务看板', '政策雷达', '交付记录'],
      value: '从单次问答升级为可核验、可追踪、可复用的德国硕士申请 Agent 工作台。'
    }
  };
}
