import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Job from './src/models/Job.js';

dotenv.config();

const check = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const jobs = await Job.find().sort({ createdAt: -1 }).limit(5);
  for (const job of jobs) {
    console.log(`Job: ${job.name}, status: ${job.status}, schedule: ${job.schedule}, nextRunAt: ${job.nextRunAt}, now: ${new Date()}`);
  }
  process.exit(0);
};
check();
