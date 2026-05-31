import Bull from 'bull';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const jobQueue = new Bull('runlog-jobs', REDIS_URL, {
  defaultJobOptions: {
    removeOnComplete: 100, // keep last 100 completed jobs in Redis
    removeOnFail: 200,     // keep last 200 failed for debugging
  },
});

jobQueue.on('error', (err) => {
  console.error('🔴 Bull queue error:', err.message);
});

export default jobQueue;
