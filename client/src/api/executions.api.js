import api from './axios';

export const listExecutions = (params) => api.get('/executions', { params });
export const getExecution = (id) => api.get(`/executions/${id}`);
export const getJobExecutions = (jobId, params) =>
  api.get(`/jobs/${jobId}/executions`, { params });
