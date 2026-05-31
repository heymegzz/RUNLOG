import mongoose from 'mongoose';
const { Schema } = mongoose;

const JobSchema = new Schema({
  workspace:       { type: Schema.Types.ObjectId, ref: 'Workspace', required: true },
  name:            { type: String, required: true },
  description:     { type: String, default: '' },
  callbackUrl:     { type: String, required: true },
  callbackMethod:  { type: String, enum: ['GET', 'POST', 'PUT', 'PATCH'], default: 'POST' },
  callbackHeaders: { type: Map, of: String, default: {} },
  callbackBody:    { type: String, default: '' },
  schedule:        { type: String, required: true }, // cron expression
  timezone:        { type: String, default: 'UTC' },
  status:          { type: String, enum: ['active', 'paused', 'archived'], default: 'active' },
  retryCount:      { type: Number, default: 3, max: 5 },
  timeout:         { type: Number, default: 30000 }, // ms
  nextRunAt:       { type: Date, default: null },
  alertEmail:      { type: String, default: null },
  alertSlack:      { type: String, default: null },
  lastRunAt:       { type: Date, default: null },
  lastRunStatus:   { type: String, enum: ['success', 'failed', null], default: null },
  successCount:    { type: Number, default: 0 },
  failureCount:    { type: Number, default: 0 },
  createdBy:       { type: Schema.Types.ObjectId, ref: 'User' },
  createdAt:       { type: Date, default: Date.now },
});

export default mongoose.model('Job', JobSchema);
