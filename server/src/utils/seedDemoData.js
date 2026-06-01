import Job from '../models/Job.js';
import Execution from '../models/Execution.js';
import { parseCron } from './cronParse.js';

const DEMO_JOBS = [
  { name: 'Health Check', schedule: '*/5 * * * *', method: 'GET', url: 'https://httpstat.us/200', type: 'health' },
  { name: 'Daily Report', schedule: '0 9 * * 1-5', method: 'POST', url: 'https://httpstat.us/200', type: 'daily' },
  { name: 'DB Cleanup', schedule: '0 2 * * *', method: 'POST', url: 'https://httpstat.us/200', type: 'daily' },
  { name: 'Cache Warmup', schedule: '*/15 * * * *', method: 'GET', url: 'https://httpstat.us/200', type: 'cache' },
  { name: 'Failing Webhook', schedule: '*/10 * * * *', method: 'GET', url: 'https://httpstat.us/500', type: 'fail' },
];

/**
 * Seed sample jobs + execution history for the demo workspace (idempotent).
 */
export const seedDemoWorkspaceData = async (workspaceId, userId) => {
  const existingJobs = await Job.countDocuments({ workspace: workspaceId });
  if (existingJobs > 0) {
    return { seeded: false, jobCount: existingJobs };
  }

  const createdJobs = [];

  for (const t of DEMO_JOBS) {
    let nextRunAt = null;
    try {
      nextRunAt = parseCron(t.schedule).next().toDate();
    } catch {
      nextRunAt = new Date();
    }

    const job = await Job.create({
      workspace: workspaceId,
      createdBy: userId,
      name: t.name,
      description: `Demo job — ${t.name}`,
      schedule: t.schedule,
      callbackMethod: t.method,
      callbackUrl: t.url,
      status: 'active',
      timeout: 10000,
      retryCount: 3,
      nextRunAt,
      successCount: 0,
      failureCount: 0,
    });
    createdJobs.push({ job, type: t.type });
  }

  const now = Date.now();
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

  for (let i = 0; i < 40; i++) {
    const template = createdJobs[Math.floor(Math.random() * createdJobs.length)];
    const randomPast = now - Math.floor(Math.random() * sevenDaysMs);

    let isSuccess = true;
    if (template.type === 'fail') isSuccess = false;
    else if (template.type === 'health' && Math.random() > 0.9) isSuccess = false;
    else if (Math.random() > 0.97) isSuccess = false;

    const status = isSuccess ? 'success' : 'failed';
    const statusCode = isSuccess ? 200 : 500;
    const durationMs = Math.floor(Math.random() * 400) + 60;

    await Execution.create({
      job: template.job._id,
      workspace: workspaceId,
      status,
      statusCode,
      executedAt: new Date(randomPast),
      durationMs,
      responsePayload: isSuccess ? 'OK' : 'Internal Server Error',
      errorDetails: isSuccess ? '' : 'Simulated failure for demo',
    });

    if (isSuccess) template.job.successCount += 1;
    else template.job.failureCount += 1;

    if (!template.job.lastRunAt || randomPast > template.job.lastRunAt.getTime()) {
      template.job.lastRunAt = new Date(randomPast);
      template.job.lastRunStatus = status;
    }
  }

  for (const { job } of createdJobs) {
    await job.save();
  }

  console.log(`✅ Demo workspace seeded: ${createdJobs.length} jobs, sample executions`);
  return { seeded: true, jobCount: createdJobs.length };
};
