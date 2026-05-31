import mongoose from 'mongoose';
const { Schema } = mongoose;

const ApiKeySchema = new Schema({
  workspace:  { type: Schema.Types.ObjectId, ref: 'Workspace' },
  name:       { type: String, required: true },
  keyHash:    { type: String, required: true },
  keyPrefix:  { type: String }, // first 8 chars — shown in UI for identification
  createdBy:  { type: Schema.Types.ObjectId, ref: 'User' },
  lastUsedAt: { type: Date, default: null },
  expiresAt:  { type: Date, default: null }, // null = never expires
  createdAt:  { type: Date, default: Date.now },
});

export default mongoose.model('ApiKey', ApiKeySchema);
