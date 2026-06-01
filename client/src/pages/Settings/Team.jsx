import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../hooks/useToast';
import api from '../../api/axios';

const roleBadgeClass = (role) => {
  if (role === 'owner') return 'badge-success';
  if (role === 'admin') return 'badge-warning';
  return 'badge-info';
};

const Team = () => {
  const { user } = useAuthStore();
  const { showToast } = useToast();

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('developer');
  const [inviting, setInviting] = useState(false);

  const workspaceId = user?.activeWorkspace;

  const fetchMembers = async () => {
    if (!workspaceId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get(`/workspaces/${workspaceId}/members`);
      setMembers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      showToast({ message: 'Failed to load members: ' + (err.message || err), type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [workspaceId]);

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!workspaceId) return;

    setInviting(true);
    try {
      await api.post(`/workspaces/${workspaceId}/invite`, { email: inviteEmail, role: inviteRole });
      showToast({ message: `Invitation sent to ${inviteEmail}`, type: 'success' });
      setShowModal(false);
      setInviteEmail('');
      setInviteRole('developer');
      fetchMembers();
    } catch (err) {
      showToast({ message: 'Failed to invite: ' + (err.message || err), type: 'error' });
    } finally {
      setInviting(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Team Settings</h1>
          <p className="page-subtitle">Manage members in your workspace.</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Workspace Members</h3>
          <button type="button" className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
            Invite Member
          </button>
        </div>

        <div className="table-wrapper">
          {loading ? (
            <div className="flex-center" style={{ padding: '2rem' }}>
              <div className="spinner" />
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => {
                  const isSelf = m.user?._id === user?._id || m.user === user?._id;
                  const displayName = m.user?.name || 'Unknown';
                  const displayEmail = m.user?.email || '';
                  const initials = displayName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2);

                  return (
                    <tr key={m._id}>
                      <td>
                        <div className="flex" style={{ gap: '0.75rem', alignItems: 'center' }}>
                          <div className="user-avatar" style={{ width: '28px', height: '28px', fontSize: '0.65rem' }}>
                            {initials}
                          </div>
                          <div>
                            <div style={{ fontWeight: 500 }}>{displayName}</div>
                            <div className="text-muted" style={{ fontSize: '0.75rem' }}>{displayEmail}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${roleBadgeClass(m.role)}`}>
                          {m.role.charAt(0).toUpperCase() + m.role.slice(1)}
                        </span>
                      </td>
                      <td className="text-muted" style={{ fontSize: '0.85rem' }}>
                        {m.joinedAt ? new Date(m.joinedAt).toLocaleDateString() : '—'}
                      </td>
                      <td>
                        {isSelf ? (
                          <span className="text-muted" style={{ fontSize: '0.85rem' }}>It&apos;s you</span>
                        ) : (
                          <span className="text-muted" style={{ fontSize: '0.85rem' }}>—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Invite Member</h2>
              <button type="button" className="modal-close" onClick={() => setShowModal(false)}>
                &times;
              </button>
            </div>
            <form onSubmit={handleInvite}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                  placeholder="colleague@company.com"
                />
              </div>
              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label className="form-label">Role</label>
                <select
                  className="form-select"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                >
                  <option value="developer">Developer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="form-actions" style={{ marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={inviting}>
                  {inviting ? 'Inviting…' : 'Send Invite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Team;
