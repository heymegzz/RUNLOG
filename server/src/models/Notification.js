import mongoose from 'mongoose';
const { Schema } = mongoose;

const NotificationSchema = new Schema({
  user:         { type: Schema.Types.ObjectId, ref: 'User' },
  workspace:    { type: Schema.Types.ObjectId, ref: 'Workspace' },
  type:         { type: String }, // 'job_failed', 'member_invited', 'job_recovered'
  title:        { type: String },
  body:         { type: String },
  read:         { type: Boolean, default: false },
  relatedJobId: { type: Schema.Types.ObjectId, ref: 'Job', default: null },
  createdAt:    { type: Date, default: Date.now },
});

export default mongoose.model('Notification', NotificationSchema);
