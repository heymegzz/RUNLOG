import api from './axios';

export const listJobs = (params) => api.get('/jobs', { params });
export const getJob = (id) => api.get(`/jobs/${id}`);
export const createJob = (data) => api.post('/jobs', data);
export const updateJob = (id, data) => api.patch(`/jobs/${id}`, data);
export const deleteJob = (id) => api.delete(`/jobs/${id}`);
export const pauseJob = (id) => api.post(`/jobs/${id}/pause`);
export const resumeJob = (id) => api.post(`/jobs/${id}/resume`);
export const triggerJob = (id) => api.post(`/jobs/${id}/trigger`);
