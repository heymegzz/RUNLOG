import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

import User from '../src/models/User.js';
import Workspace from '../src/models/Workspace.js';
import WorkspaceMember from '../src/models/WorkspaceMember.js';
import Job from '../src/models/Job.js';
import Execution from '../src/models/Execution.js';
import { seedDemoWorkspaceData } from '../src/utils/seedDemoData.js';

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clean up existing demo data
    const existingUser = await User.findOne({ email: 'demo@runlog.dev' });
    if (existingUser) {
      await Workspace.deleteMany({ owner: existingUser._id });
      await Job.deleteMany({ createdBy: existingUser._id });
      await User.deleteOne({ _id: existingUser._id });
    }

    // 1. Create User
    const hashedPassword = await bcrypt.hash('demo123', 10);
    const user = new User({
      name: 'Demo User',
      email: 'demo@runlog.dev',
      passwordHash: hashedPassword
    });
    await user.save();

    // 2. Create Workspace
    const workspace = new Workspace({
      name: 'Demo Workspace',
      slug: `demo-workspace-${Date.now()}`,
      owner: user._id,
    });
    await workspace.save();

    await WorkspaceMember.create({
      workspace: workspace._id,
      user: user._id,
      role: 'owner',
    });

    user.activeWorkspace = workspace._id;
    await user.save();

    await seedDemoWorkspaceData(workspace._id, user._id);

    console.log('✅ Demo seed complete!');
    console.log('Login: demo@runlog.dev / demo123');

    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
};

seed();
