import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import * as jobsApi from '../../api/jobs.api';
import JobCard from '../../components/JobCard/JobCard';
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal';
import { useToast } from '../../hooks/useToast';
import EmptyState from '../../components/EmptyState/EmptyState';
import { IconJobs, IconPlus } from '../../components/Icons/Icons';

const JobList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '20', 10);

  const [jobs, setJobs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  
  const { showToast } = useToast();

  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await jobsApi.listJobs({ page, limit, search: searchTerm });
      const payload = data.data;
      if (Array.isArray(payload)) {
        setJobs(payload);
        setTotal(payload.length);
      } else {
        setJobs(payload?.jobs || []);
        setTotal(payload?.total ?? 0);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchJobs();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [page, limit, searchTerm]);

  const handleToggleStatus = async (id) => {
    try {
      const job = jobs.find(j => j._id === id);
      if (job.status === 'active') {
        await jobsApi.pauseJob(id);
        showToast({ message: 'Job paused', type: 'warning' });
      } else {
        await jobsApi.resumeJob(id);
        showToast({ message: 'Job resumed', type: 'success' });
      }
      fetchJobs();
    } catch (err) {
      showToast({ message: 'Failed to toggle job status: ' + err.message, type: 'error' });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await jobsApi.deleteJob(deleteTarget);
      setJobs((prev) => prev.filter((j) => j._id !== deleteTarget));
      setTotal((t) => Math.max(0, t - 1));
      showToast({ message: 'Job deleted', type: 'success' });
    } catch (err) {
      showToast({ message: 'Failed to delete job: ' + err.message, type: 'error' });
    } finally {
      setDeleteTarget(null);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Jobs</h1>
          <p className="page-subtitle">Manage your scheduled API requests.</p>
        </div>
        <Link to="/jobs/new" className="btn btn-primary btn-with-icon">
          <IconPlus size={16} />
          New job
        </Link>
      </div>

      <div className="filter-bar">
        <div className="search-input-wrap">
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            type="text" 
            className="form-input search-input" 
            placeholder="Search jobs..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="alert alert-error" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{error}</span>
          <button className="btn btn-ghost btn-sm" onClick={fetchJobs}>Retry</button>
        </div>
      )}

      {loading ? (
        <div className="flex-center" style={{ padding: '4rem' }}>
          <div className="spinner"></div>
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={IconJobs}
          title="No jobs found"
          text={searchTerm ? 'Try adjusting your search filters.' : 'Create your first scheduled job to get started.'}
        >
          {!searchTerm && (
            <Link to="/jobs/new" className="btn btn-primary btn-with-icon" style={{ marginTop: '1.25rem' }}>
              <IconPlus size={16} />
              Create job
            </Link>
          )}
        </EmptyState>
      ) : (
        <>
          <div className="jobs-grid">
            {jobs.map((job) => (
              <JobCard
                key={job._id}
                job={job}
                onToggleStatus={handleToggleStatus}
                onDelete={setDeleteTarget}
              />
            ))}
          </div>
          
          {totalPages > 1 && (
            <div className="pagination-bar" style={{ marginTop: '1rem', borderTop: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
              <button
                type="button"
                className="page-btn btn btn-secondary btn-sm"
                disabled={page <= 1}
                onClick={() => setSearchParams({ page: page - 1, limit })}
              >
                Prev
              </button>
              <span className="pagination-label">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                className="page-btn btn btn-secondary btn-sm"
                disabled={page >= totalPages}
                onClick={() => setSearchParams({ page: page + 1, limit })}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete job"
        message="Are you sure you want to delete this job? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default JobList;
