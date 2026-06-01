import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Workspace from '../models/Workspace.js';
import WorkspaceMember from '../models/WorkspaceMember.js';

export const DEMO_EMAIL = 'demo@runlog.dev';
export const DEMO_PASSWORD = 'demo123';

/**
 * Create demo@runlog.dev if missing (idempotent). Safe on every server start.
 */
export const ensureDemoUser = async () => {
  const existing = await User.findOne({ email: DEMO_EMAIL });
  if (existing) {
    return existing;
  }

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const user = await User.create({
    name: 'Demo User',
    email: DEMO_EMAIL,
    passwordHash,
  });

  const slug = `demo-workspace-${Date.now()}`;
  const workspace = await Workspace.create({
    name: "Demo User's Workspace",
    slug,
    owner: user._id,
  });

  await WorkspaceMember.create({
    workspace: workspace._id,
    user: user._id,
    role: 'owner',
  });

  user.activeWorkspace = workspace._id;
  await user.save();

  console.log(`✅ Demo user ready: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
  return user;
};
