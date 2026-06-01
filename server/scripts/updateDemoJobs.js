import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { parseCron } from '../src/utils/cronParse.js';
import Job from '../src/models/Job.js';

dotenv.config();

const update = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const jobs = await Job.find({ status: 'active' });
  let count = 0;
  for (const job of jobs) {
    if (!job.nextRunAt) {
      try {
        parseCron(job.schedule);
        job.nextRunAt = new Date();
        await job.save();
        count++;
      } catch {
        // skip invalid schedules
      }
    }
  }
  console.log(`Updated ${count} jobs to start firing immediately!`);
  process.exit(0);
};

update();
