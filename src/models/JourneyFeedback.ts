import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IJourneyFeedback extends Document {
  routeId: string;
  routeName: string;
  feedback: 'Exactly as predicted' | 'Better than expected' | 'Worse than expected';
  predictedScore: number;
  actualSignalNotes?: string;
  createdAt: Date;
}

const JourneyFeedbackSchema: Schema = new Schema(
  {
    routeId: { type: String, required: true },
    routeName: { type: String, required: true },
    feedback: { 
      type: String, 
      enum: ['Exactly as predicted', 'Better than expected', 'Worse than expected'], 
      required: true 
    },
    predictedScore: { type: Number, required: true },
    actualSignalNotes: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const JourneyFeedbackModel: Model<IJourneyFeedback> =
  mongoose.models.JourneyFeedback || mongoose.model<IJourneyFeedback>('JourneyFeedback', JourneyFeedbackSchema);
