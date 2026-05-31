// Cron scanner — runs every minute, finds due jobs, pushes to Bull queue
// Implement in Phase 3

// import cron from 'node-cron';
// import { CronExpressionParser } from 'cron-parser';
// import Job from '../models/Job.js';
// import jobQueue from '../queues/jobQueue.js';

// cron.schedule('* * * * *', async () => {
//   const now = new Date();
//   const jobs = await Job.find({ status: 'active', nextRunAt: { $lte: now } }).lean();
//   for (const job of jobs) {
//     await jobQueue.add({ jobId: job._id }, { ... });
//   }
// });

console.log('🔧 Cron scanner file loaded — implement in Phase 3');
