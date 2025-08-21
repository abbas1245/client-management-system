import mongoose, { Document, Model, Types } from 'mongoose';

export type ProjectStatus = 'planned' | 'in_progress' | 'done';

export interface ProjectDocument extends Document {
  name: string;
  dueDate?: Date;
  clientId?: Types.ObjectId;
  status: ProjectStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new mongoose.Schema<ProjectDocument>(
  {
    name: { type: String, required: true, trim: true },
    dueDate: { type: Date, index: true },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', index: true },
    status: { type: String, enum: ['planned', 'in_progress', 'done'], default: 'planned', index: true },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

// Indexes
ProjectSchema.index({ dueDate: 1 });
ProjectSchema.index({ status: 1 });
ProjectSchema.index({ createdAt: -1 });

export const Project: Model<ProjectDocument> =
  mongoose.models.Project || mongoose.model<ProjectDocument>('Project', ProjectSchema);

export default Project;


