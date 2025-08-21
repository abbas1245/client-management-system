import mongoose, { Document, Model, Types } from 'mongoose';

export type LeadSource = 'website' | 'referral' | 'facebook' | 'linkedin' | 'whatsapp' | 'marketing' | 'cold_call' | 'trade_show' | 'other';
export type LeadStatus = 'new' | 'contacted' | 'in_progress' | 'qualified' | 'proposal' | 'converted' | 'dropped';
export type LeadPriority = 'low' | 'medium' | 'high';

export interface LeadDocument extends Document {
  fullName?: string;
  email?: string;
  phone?: string;
  company?: string;
  source?: LeadSource;
  status?: LeadStatus;
  priority?: LeadPriority;
  notes?: string;
  estimated_value?: number;
  currency?: string;
  clientId?: Types.ObjectId;
  ownerId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const LeadSchema = new mongoose.Schema<LeadDocument>(
  {
    fullName: { type: String, trim: true, required: true },
    email: { type: String, trim: true, lowercase: true, sparse: true },
    phone: { type: String, trim: true, sparse: true },
    company: { type: String, trim: true, maxlength: 200 },
    source: { type: String, default: 'website', index: true },
    status: { type: String, enum: ['new', 'contacted', 'in_progress', 'qualified', 'proposal', 'converted', 'dropped'], default: 'new', index: true },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium', index: true },
    notes: { type: String, trim: true, maxlength: 2000 },
    estimated_value: { type: Number, min: 0 },
    currency: { type: String, maxlength: 3, uppercase: true },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', sparse: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  { timestamps: true }
);

// Indexes
LeadSchema.index({ email: 1, ownerId: 1 });
LeadSchema.index({ phone: 1, ownerId: 1 });
LeadSchema.index({ createdAt: -1 });
LeadSchema.index({ status: 1, ownerId: 1 });
LeadSchema.index({ source: 1, ownerId: 1 });
LeadSchema.index({ priority: 1, ownerId: 1 });

export const Lead: Model<LeadDocument> =
  mongoose.models.Lead || mongoose.model<LeadDocument>('Lead', LeadSchema);

export default Lead;


