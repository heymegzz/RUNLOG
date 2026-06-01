import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cronParser from 'cron-parser';
import Job from './src/models/Job.js';

dotenv.config();

const update = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const jobs = await Job.find({ status: 'active' });
  let count = 0;
  for (const job of jobs) {
    if (!job.nextRunAt) {
      try {
        const interval = cronParser.parseExpression(job.schedule);
        // Set it to run exactly now to trigger it immediately, then let cronScanner handle subsequent runs!
        job.nextRunAt = new Date();
        await job.save();
        count++;
      } catch(e) {}
    }
  }
  console.log(`Updated ${count} jobs to start firing immediately!`);
  process.exit(0);
};
update();
