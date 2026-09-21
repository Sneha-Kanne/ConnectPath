import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISavedRoute extends Document {
  userId: string;
  name: string;
  start: {
    lat: number;
    lng: number;
    name: string;
  };
  end: {
    lat: number;
    lng: number;
    name: string;
  };
  coordinates: [number, number][];
  signalStrength: number;
  duration: number;
  distance: number;
  createdAt: Date;
}

const SavedRouteSchema: Schema = new Schema(
  {
    userId: { type: String, required: true },
    name: { type: String, required: true },
    start: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      name: { type: String, required: true },
    },
    end: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      name: { type: String, required: true },
    },
    coordinates: { type: [[Number]], required: true },
    signalStrength: { type: Number, required: true },
    duration: { type: Number, required: true },
    distance: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const SavedRoute: Model<ISavedRoute> = 
  mongoose.models.SavedRoute || mongoose.model<ISavedRoute>('SavedRoute', SavedRouteSchema);
