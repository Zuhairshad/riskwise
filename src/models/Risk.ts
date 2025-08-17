import mongoose, { Schema, Document } from 'mongoose';

export interface IRisk extends Document {
  month: string;
  projectCode: string;
  riskStatus: 'Open' | 'Closed' | 'Mitigated' | 'Transferred';
  description: string;
  probability: number;
  impactRating: number;
  mitigationPlan?: string;
  contingencyPlan?: string;
  impactValue?: number;
  budgetContingency?: number;
  owner?: string;
  dueDate?: Date;
}

const RiskSchema: Schema = new Schema(
  {
    month: { type: String, required: true },
    projectCode: { type: String, required: true },
    riskStatus: {
      type: String,
      enum: ['Open', 'Closed', 'Mitigated', 'Transferred'],
      required: true,
    },
    description: { type: String, required: true },
    probability: { type: Number, required: true },
    impactRating: { type: Number, required: true },
    mitigationPlan: { type: String },
    contingencyPlan: { type: String },
    impactValue: { type: Number },
    budgetContingency: { type: Number },
    owner: { type: String },
    dueDate: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.models.Risk || mongoose.model<IRisk>('Risk', RiskSchema);
