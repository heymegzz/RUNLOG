import Workspace from '../models/Workspace.js';

/**
 * Attach workspace to req based on the x-workspace-id header.
 * Must run AFTER authenticate middleware.
 */
const requireWorkspace = async (req, res, next) => {
  const workspaceId = req.headers['x-workspace-id'] || req.params.id;

  if (!workspaceId) {
    return res.status(400).json({
      success: false,
      error: { code: 'MISSING_WORKSPACE', message: 'x-workspace-id header is required' },
    });
  }

  try {
    const workspace = await Workspace.findById(workspaceId).lean();

    if (!workspace) {
      return res.status(404).json({
        success: false,
        error: { code: 'WORKSPACE_NOT_FOUND', message: 'Workspace not found' },
      });
    }

    req.workspace = workspace;
    next();
  } catch {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_WORKSPACE', message: 'Invalid workspace ID' },
    });
  }
};

export default requireWorkspace;
