import mongoose from 'mongoose';
const { Schema } = mongoose;

const WorkspaceSchema = new Schema({
  name:      { type: String, required: true },
  slug:      { type: String, required: true, unique: true },
  owner:     { type: Schema.Types.ObjectId, ref: 'User', required: true },
  plan:      { type: String, enum: ['free', 'pro'], default: 'free' },
  jobLimit:  { type: Number, default: 5 },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Workspace', WorkspaceSchema);
