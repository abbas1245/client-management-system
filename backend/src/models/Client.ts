import mongoose, { Document, Model } from 'mongoose';

export interface ClientDocument extends Document {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  company?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ClientSchema = new mongoose.Schema<ClientDocument>(
  {
    name: { type: String, required: true, trim: true, index: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    company: { type: String, trim: true },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

// Indexes
ClientSchema.index({ name: 1 });
ClientSchema.index({ email: 1 });
ClientSchema.index({ createdAt: -1 });

export const Client: Model<ClientDocument> =
  mongoose.models.Client || mongoose.model<ClientDocument>('Client', ClientSchema);

export default Client;


