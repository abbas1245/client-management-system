import mongoose, { Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export type UserRole = 'admin' | 'manager' | 'rep' | 'user';

export interface UserDocument extends Document {
  name?: string;
  email: string;
  passwordHash: string;
  // Legacy hashed password field from older schema (kept for backwards compatibility)
  password?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  createPasswordResetToken(): string;
}

const UserSchema = new mongoose.Schema<UserDocument>(
  {
    name: { type: String, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    // Legacy field: allow selecting when explicitly requested
    password: { type: String, select: false },
    role: { type: String, enum: ['admin', 'manager', 'rep', 'user'], default: 'user', index: true },
    passwordResetToken: { type: String, index: true, select: false },
    passwordResetExpires: { type: Date, select: false },
  },
  { timestamps: true }
);

UserSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.passwordHash);
};

UserSchema.methods.createPasswordResetToken = function (): string {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashed = crypto.createHash('sha256').update(rawToken).digest('hex');
  this.passwordResetToken = hashed;
  this.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000);
  return rawToken;
};

UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ role: 1 });
UserSchema.index({ createdAt: -1 });

export const User: Model<UserDocument> =
  mongoose.models.User || mongoose.model<UserDocument>('User', UserSchema);

export default User;


