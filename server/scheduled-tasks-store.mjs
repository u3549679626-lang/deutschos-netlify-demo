const now = () => new Date().toISOString();

const taskCatalog = [
  {
    taskId: 'application-deadline-radar',
    name: '申请项目 Deadline 雷达',
    frequency: '每日 / 每周',
    mapsTo: ['programs.deadline', 'risks', 'tasks'],
    description: '监控目标项目 deadline、申请路径和临近截止风险。'
  },
  {
    taskId: 'official-website-policy-radar',
    name: '项目官网政策变化雷达',
    frequency: '每 3 天 / 每周',
    mapsTo: ['programs.checkedAt', 'programs.status', 'risks', 'tasks'],
    description: '追踪官网 admission、language、application procedure、VPD/uni-assist 页面变化。'
  },
  {
    taskId: 'applicant-document-progress-check',
    name: '申请人材料进度巡检',
    frequency: '每周',
    mapsTo: ['materials', 'tasks', 'risks'],
    description: '检查成绩单、课程描述、语言、APS、CV、推荐信等材料状态。'
  },
  {
    taskId: 'hard-requirement-risk-radar',
    name: '硬性材料风险雷达',
    frequency: '每周 / 高风险触发',
    mapsTo: ['risks', 'tasks', 'expertOutputs'],
    description: '识别 APS、语言最低要求、专业背景、ECTS、deadline 等硬性阻断风险。'
  },
  {
    taskId: 'weekly-application-progress-report',
    name: '申请推进周报任务',
    frequency: '每周一 09:00',
    mapsTo: ['weeklyReport', 'tasks', 'risks'],
    description: '汇总本周进度、已完成事项、下周重点和风险提醒。'
  },
  {
    taskId: 'urgent-application-risk-alert',
    name: '申请突发风险预警',
    frequency: '突发触发 / 每日',
    mapsTo: ['risks', 'tasks', 'notifications'],
    description: '对 deadline 临近、政策变化、材料缺失等高优先级风险发出预警。'
  }
];

let memoryRuns = [];

function normalizeArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

export function getScheduledTaskStatus() {
  return {
    ok: true,
    step: 'scheduled-tasks-integration',
    bundle: 'deutschos-scheduled-tasks-bundle',
    mode: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'supabase-ready' : 'memory-fallback',
    taskCount: taskCatalog.length,
    taskCatalog,
    recentRuns: memoryRuns.slice(-10).reverse(),
    ingestEndpoint: '/api/scheduled-tasks/ingest',
    requiredPayload: ['schemaVersion', 'applicantId', 'taskId', 'runId', 'result'],
    note: '小浣熊平台定时任务已创建后，只需要把运行结果 POST 到 ingestEndpoint，或复制 JSON 到顾问工作台发布。'
  };
}

export function mapScheduledTaskPayload(payload = {}) {
  const result = payload.result || payload;
  const taskId = payload.taskId || result.taskId || 'manual-scheduled-task';
  const source = {
    system: '小浣熊平台定时任务',
    bundle: 'deutschos-scheduled-tasks-bundle',
    taskId,
    runId: payload.runId || result.runId || `run-${Date.now()}`,
    generatedAt: payload.generatedAt || result.generatedAt || now()
  };

  const risks = normalizeArray(result.risks || result.alerts).map((risk, index) => ({
    type: risk.type || risk.category || taskId,
    level: risk.level || risk.severity || '中',
    description: risk.description || risk.message || risk.title || `定时任务风险 ${index + 1}`,
    suggestedAction: risk.suggestedAction || risk.action || '请顾问复核后决定是否发布给申请者。',
    visibleToApplicant: risk.visibleToApplicant ?? risk.level === '高' ?? true,
    sourceTaskId: taskId
  }));

  const tasks = normalizeArray(result.tasks || result.todos || result.nextActions).map((task, index) => ({
    title: task.title || task.name || `定时任务生成待办 ${index + 1}`,
    owner: task.owner || '顾问',
    due: task.due || task.deadline || '待顾问确认',
    priority: task.priority || task.level || '中',
    status: task.status || '待处理',
    sourceTaskId: taskId
  }));

  const programs = normalizeArray(result.programs || result.projects).map((p) => ({
    university: p.university || p.school || '待确认学校',
    program: p.program || p.name || '待确认项目',
    tier: p.tier || '待分层',
    status: p.status || p.verificationStatus || '待顾问复核',
    deadline: p.deadline || '待官网确认',
    path: p.path || p.applicationPath || '待官网确认',
    risk: p.risk || p.riskLevel || '中',
    source: p.source || p.url || '待补充来源',
    checkedAt: p.checkedAt || source.generatedAt.slice(0, 10),
    consultantNote: p.consultantNote || p.note || '来自定时任务结果，需顾问复核后发布。'
  }));

  const materials = normalizeArray(result.materials).map((m) => ({
    name: m.name || m.material || '待确认材料',
    status: m.status || '待处理',
    owner: m.owner || '申请者',
    note: m.note || m.description || '来自材料巡检任务。'
  }));

  const weeklyReport = result.weeklyReport || (taskId === 'weekly-application-progress-report' ? {
    title: result.title || '定时任务生成申请周报',
    period: result.period || source.generatedAt.slice(0, 10),
    summary: result.summary || '小浣熊平台定时任务已生成本周申请推进摘要，待顾问审核。',
    done: normalizeArray(result.done),
    next: normalizeArray(result.next || result.nextActions),
    risks: risks.map(r => r.description)
  } : undefined);

  const expertOutputs = normalizeArray(result.expertOutputs || result.findings).map((item, index) => ({
    expert: item.expert || '定时任务监看专家',
    type: item.type || taskId,
    status: item.status || '待顾问审核',
    visible: item.visible ?? false,
    result: item.result || item.summary || item.description || `定时任务发现 ${index + 1}`
  }));

  const portalPatch = {
    schemaVersion: 'deutschos-sync-v1',
    applicantId: payload.applicantId || result.applicantId || 'app-001',
    source,
    reviewRequired: true,
    programs,
    materials,
    tasks,
    risks,
    weeklyReport,
    expertOutputs,
    consultantReview: {
      status: '定时任务结果待顾问审核',
      reviewer: 'DeutschOS 顾问',
      note: '来自小浣熊平台定时任务，需顾问审核后发布给申请者。'
    }
  };

  Object.keys(portalPatch).forEach((key) => {
    if (Array.isArray(portalPatch[key]) && portalPatch[key].length === 0) delete portalPatch[key];
    if (portalPatch[key] === undefined) delete portalPatch[key];
  });

  return {
    ok: true,
    taskId,
    runId: source.runId,
    applicantId: portalPatch.applicantId,
    portalPatch,
    mappedAt: now(),
    summary: {
      programs: programs.length,
      materials: materials.length,
      tasks: tasks.length,
      risks: risks.length,
      expertOutputs: expertOutputs.length,
      hasWeeklyReport: Boolean(weeklyReport)
    }
  };
}

export function ingestScheduledTaskResult(payload = {}) {
  const mapped = mapScheduledTaskPayload(payload);
  memoryRuns.push({
    taskId: mapped.taskId,
    runId: mapped.runId,
    applicantId: mapped.applicantId,
    mappedAt: mapped.mappedAt,
    summary: mapped.summary
  });
  if (memoryRuns.length > 100) memoryRuns = memoryRuns.slice(-100);
  return mapped;
}

export async function handleScheduledTaskRequest(req, res, path) {
  if (req.method === 'GET' && (path === '/scheduled-tasks/status' || path === '/scheduled-tasks')) {
    return res.status(200).json(getScheduledTaskStatus());
  }
  if (req.method === 'POST' && path === '/scheduled-tasks/ingest') {
    const result = ingestScheduledTaskResult(req.body || {});
    return res.status(200).json(result);
  }
  return res.status(404).json({ ok: false, error: `Unknown scheduled task route: ${path}` });
}
