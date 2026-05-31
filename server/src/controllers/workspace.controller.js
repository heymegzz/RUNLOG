import Workspace from '../models/Workspace.js';
import WorkspaceMember from '../models/WorkspaceMember.js';
import User from '../models/User.js';
import { success, error } from '../utils/apiResponse.js';

export const listWorkspaces = async (req, res, next) => {
  try {
    const memberships = await WorkspaceMember.find({ user: req.user._id })
      .populate('workspace')
      .lean();
    
    const workspaces = memberships.map((m) => ({
      ...m.workspace,
      role: m.role,
    }));

    return success(res, workspaces);
  } catch (err) {
    next(err);
  }
};

export const createWorkspace = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) return error(res, 'VALIDATION_ERROR', 'Workspace name is required');

    const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`;
    
    const workspace = new Workspace({
      name,
      slug,
      owner: req.user._id,
    });
    await workspace.save();

    const member = new WorkspaceMember({
      workspace: workspace._id,
      user: req.user._id,
      role: 'owner',
    });
    await member.save();

    return success(res, workspace, 201);
  } catch (err) {
    next(err);
  }
};

export const getWorkspace = async (req, res, next) => {
  try {
    // req.workspace is populated by requireWorkspace middleware
    return success(res, req.workspace);
  } catch (err) {
    next(err);
  }
};

export const updateWorkspace = async (req, res, next) => {
  try {
    const { name, plan } = req.body;
    const workspace = await Workspace.findById(req.workspace._id);

    if (name) workspace.name = name;
    if (plan) workspace.plan = plan;

    await workspace.save();
    return success(res, workspace);
  } catch (err) {
    next(err);
  }
};

export const deleteWorkspace = async (req, res, next) => {
  try {
    await Workspace.findByIdAndDelete(req.workspace._id);
    await WorkspaceMember.deleteMany({ workspace: req.workspace._id });
    
    // Switch active workspace for users if they were using this one
    await User.updateMany(
      { activeWorkspace: req.workspace._id },
      { $set: { activeWorkspace: null } }
    );

    return success(res, { message: 'Workspace deleted successfully' });
  } catch (err) {
    next(err);
  }
};

export const listMembers = async (req, res, next) => {
  try {
    const members = await WorkspaceMember.find({ workspace: req.workspace._id })
      .populate('user', 'name email avatarUrl')
      .lean();
    return success(res, members);
  } catch (err) {
    next(err);
  }
};

export const inviteMember = async (req, res, next) => {
  try {
    const { email, role } = req.body;
    if (!email || !role) return error(res, 'VALIDATION_ERROR', 'Email and role are required');

    const userToInvite = await User.findOne({ email });
    if (!userToInvite) {
      return error(res, 'USER_NOT_FOUND', 'User must be registered first to be invited');
    }

    const existingMember = await WorkspaceMember.findOne({
      workspace: req.workspace._id,
      user: userToInvite._id,
    });

    if (existingMember) {
      return error(res, 'ALREADY_MEMBER', 'User is already a member of this workspace');
    }

    const newMember = new WorkspaceMember({
      workspace: req.workspace._id,
      user: userToInvite._id,
      role,
      invitedBy: req.user._id,
    });
    await newMember.save();

    return success(res, newMember, 201);
  } catch (err) {
    next(err);
  }
};

export const changeRole = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!role) return error(res, 'VALIDATION_ERROR', 'Role is required');

    const member = await WorkspaceMember.findOne({
      workspace: req.workspace._id,
      user: userId,
    });

    if (!member) return error(res, 'NOT_FOUND', 'Member not found');
    
    // Prevent removing the last owner
    if (member.role === 'owner' && role !== 'owner') {
      const ownerCount = await WorkspaceMember.countDocuments({
        workspace: req.workspace._id,
        role: 'owner',
      });
      if (ownerCount <= 1) {
        return error(res, 'BAD_REQUEST', 'Cannot change the role of the last owner');
      }
    }

    member.role = role;
    await member.save();

    return success(res, member);
  } catch (err) {
    next(err);
  }
};

export const removeMember = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const member = await WorkspaceMember.findOne({
      workspace: req.workspace._id,
      user: userId,
    });

    if (!member) return error(res, 'NOT_FOUND', 'Member not found');

    if (member.role === 'owner') {
      const ownerCount = await WorkspaceMember.countDocuments({
        workspace: req.workspace._id,
        role: 'owner',
      });
      if (ownerCount <= 1) {
        return error(res, 'BAD_REQUEST', 'Cannot remove the last owner');
      }
    }

    await WorkspaceMember.deleteOne({ _id: member._id });
    return success(res, { message: 'Member removed successfully' });
  } catch (err) {
    next(err);
  }
};
