import { Router } from 'express';
// import authenticate from '../middleware/authenticate.js';
// import requireWorkspace from '../middleware/requireWorkspace.js';
// import requireRole from '../middleware/requireRole.js';

const router = Router();

// Workspace CRUD
// router.get('/', authenticate, listWorkspaces);
// router.post('/', authenticate, createWorkspace);
// router.get('/:id', authenticate, getWorkspace);
// router.patch('/:id', authenticate, requireWorkspace, requireRole(['owner']), updateWorkspace);
// router.delete('/:id', authenticate, requireWorkspace, requireRole(['owner']), deleteWorkspace);

// Members
// router.get('/:id/members', authenticate, requireWorkspace, listMembers);
// router.post('/:id/invite', authenticate, requireWorkspace, requireRole(['admin', 'owner']), inviteMember);
// router.patch('/:id/members/:userId', authenticate, requireWorkspace, requireRole(['owner']), changeRole);
// router.delete('/:id/members/:userId', authenticate, requireWorkspace, requireRole(['admin', 'owner']), removeMember);

export default router;
