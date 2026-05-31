import mongoose from 'mongoose';
const { Schema } = mongoose;

const UserSchema = new Schema({
  name:         { type: String, required: true, trim: true },
  email:        { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  googleId:     { type: String, default: null },
  avatarUrl:    { type: String, default: null },
  refreshToken: { type: String, default: null },
  activeWorkspace: { type: Schema.Types.ObjectId, ref: 'Workspace' },
  createdAt:    { type: Date, default: Date.now },
});

export default mongoose.model('User', UserSchema);
