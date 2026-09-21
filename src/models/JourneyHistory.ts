import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IJourneyHistory extends Document {
  userId: string;
  routeId: string;
  routeName: string;
  distanceKm: number;
  durationMins: number;
  deadZoneMins: number;
  carrier: 'Jio' | 'Airtel' | 'Vi' | 'BSNL';
  avgSignalPercent: number;
  date: Date;
}

const JourneyHistorySchema: Schema = new Schema(
  {
    userId: { type: String, required: true },
    routeId: { type: String, required: true },
    routeName: { type: String, required: true },
    distanceKm: { type: Number, required: true },
    durationMins: { type: Number, required: true },
    deadZoneMins: { type: Number, default: 0 },
    carrier: { type: String, enum: ['Jio', 'Airtel', 'Vi', 'BSNL'], default: 'Jio' },
    avgSignalPercent: { type: Number, required: true },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const JourneyHistoryModel: Model<IJourneyHistory> =
  mongoose.models.JourneyHistory || mongoose.model<IJourneyHistory>('JourneyHistory', JourneyHistorySchema);
