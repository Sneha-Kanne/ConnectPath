import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUserGamification extends Document {
  userId: string;
  userName: string;
  points: number;
  reportsCount: number;
  upvotesCount: number;
  badges: {
    id: string;
    name: string;
    description: string;
    icon: string;
    unlockedAt: Date;
  }[];
  reportedCities: string[];
  updatedAt: Date;
}

const UserGamificationSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, unique: true },
    userName: { type: String, default: 'Operator Node Alpha' },
    points: { type: Number, default: 0 },
    reportsCount: { type: Number, default: 0 },
    upvotesCount: { type: Number, default: 0 },
    badges: [
      {
        id: { type: String, required: true },
        name: { type: String, required: true },
        description: { type: String, required: true },
        icon: { type: String, required: true },
        unlockedAt: { type: Date, default: Date.now },
      },
    ],
    reportedCities: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const UserGamificationModel: Model<IUserGamification> =
  mongoose.models.UserGamification || mongoose.model<IUserGamification>('UserGamification', UserGamificationSchema);
