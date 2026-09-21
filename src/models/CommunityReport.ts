import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICommunityReport extends Document {
  userId: string;
  userName: string;
  locationName: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude] for GeoJSON
  };
  signalStatus: 'Strong' | 'Weak' | 'Dead' | 'None' | 'Slow' | 'Good';
  description: string;
  votes: number;
  votedUserIds: string[];
  createdAt: Date;
}

const CommunityReportSchema: Schema = new Schema(
  {
    userId: { type: String, required: true },
    userName: { type: String, required: true, default: 'Anonymous Operator' },
    locationName: { type: String, required: true },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
        required: true
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true
      }
    },
    signalStatus: {
      type: String,
      enum: ['Strong', 'Weak', 'Dead', 'None', 'Slow', 'Good'],
      required: true,
    },
    description: { type: String, required: true },
    votes: { type: Number, default: 1 },
    votedUserIds: { type: [String], default: [] }
  },
  { timestamps: true }
);

// Create spatial index for GeoJSON location searches
CommunityReportSchema.index({ location: '2dsphere' });

export const CommunityReport: Model<ICommunityReport> = 
  mongoose.models.CommunityReport || mongoose.model<ICommunityReport>('CommunityReport', CommunityReportSchema);
