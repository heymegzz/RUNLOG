import mongoose from 'mongoose';
const { Schema } = mongoose;

const WorkspaceMemberSchema = new Schema({
  workspace: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true },
  user:      { type: Schema.Types.ObjectId, ref: 'User', required: true },
  role:      { type: String, enum: ['owner', 'admin', 'developer'], required: true },
  invitedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  joinedAt:  { type: Date, default: Date.now },
});

// One user can only have one role per workspace
WorkspaceMemberSchema.index({ workspace: 1, user: 1 }, { unique: true });

export default mongoose.model('WorkspaceMember', WorkspaceMemberSchema);
