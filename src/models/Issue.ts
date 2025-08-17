import mongoose, { Schema, Document } from 'mongoose';

export interface IIssue extends Document {
  month: string;
  category: 'Technical' | 'Contractual' | 'Resource' | 'Schedule';
  portfolio?: string;
  title: string;
  discussion: string;
  resolution?: string;
  dueDate?: Date;
  owner: string;
  response: 'Under Review' | 'In Progress' | 'Closed';
  impact: 'Low' | 'Medium' | 'High';
  impactValue?: number;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  projectName: string;
  status: 'Open' | 'Resolved' | 'Escalated' | 'Closed';
}

const IssueSchema: Schema = new Schema(
  {
    month: { type: String, required: true },
    category: {
      type: String,
      enum: ['Technical', 'Contractual', 'Resource', 'Schedule'],
      required: true,
    },
    portfolio: { type: String },
    title: { type: String, required: true },
    discussion: { type: String, required: true },
    resolution: { type: String },
    dueDate: { type: Date },
    owner: { type: String, required: true },
    response: {
      type: String,
      enum: ['Under Review', 'In Progress', 'Closed'],
      required: true,
    },
    impact: { type: String, enum: ['Low', 'Medium', 'High'], required: true },
    impactValue: { type: Number },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      required: true,
    },
    projectName: { type: String, required: true },
    status: {
      type: String,
      enum: ['Open', 'Resolved', 'Escalated', 'Closed'],
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Issue || mongoose.model<IIssue>('Issue', IssueSchema);
