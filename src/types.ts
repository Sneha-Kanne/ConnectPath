export type JourneyPurpose = 'Daily Commute' | 'Business' | 'Road Trip' | 'Delivery' | 'Emergency' | 'Custom';

export interface LocationData {
  name: string;
  lat: number;
  lng: number;
}

export interface WeatherPoint {
  point: 'start' | 'middle' | 'end';
  lat: number;
  lng: number;
  locationName?: string;
  temperature: number; // in Celsius
  condition: string;
  icon: string; // emoji or icon code
  isSevere: boolean;
  description: string;
  humidity?: number;
  windSpeed?: number;
}

export interface RouteWeatherSummary {
  summary: string;
  summaryText?: string;
  isSevere: boolean;
  hasSevereWeather?: boolean;
  severeAlertMessage?: string;
  severeWeatherAlert?: string;
  temperature: number;
  icon: string;
  condition: string;
  points: WeatherPoint[];
  healthScoreReductionApplied: boolean;
}

export interface PointOfInterest {
  id: string;
  name: string;
  type: 'fuel' | 'restaurant' | 'rest_area' | 'hotel';
  lat: number;
  lng: number;
  distanceKm: number; // from start or current position
  address?: string;
  icon: string;
  rating?: number;
  amenities?: string[];
}

export interface JourneyFeedback {
  id?: string;
  routeId: string;
  routeName: string;
  feedback: 'Exactly as predicted' | 'Better than expected' | 'Worse than expected';
  predictedScore: number;
  actualSignalNotes?: string;
  createdAt: string | Date;
}

export interface AccuracyStats {
  overallAccuracyPercent: number;
  totalReports: number;
  routeAccuracies: {
    routeName: string;
    routeId: string;
    accuracyPercent: number;
    reportCount: number;
  }[];
  recentFeedback: JourneyFeedback[];
}

export interface UserGamificationState {
  userId: string;
  userName: string;
  points: number;
  reportsCount: number;
  upvotesCount: number;
  badges: {
    id: string;
    name: 'Signal Scout' | 'Network Guardian' | 'Telangana Explorer';
    description: string;
    icon: string;
    unlockedAt?: string;
  }[];
  reportedCities: string[];
}

export interface JourneyRecord {
  id: string;
  routeId: string;
  routeName: string;
  distanceKm: number;
  durationMins: number;
  deadZoneMins: number;
  carrier: 'Jio' | 'Airtel' | 'Vi' | 'BSNL';
  avgSignalPercent: number;
  date: string;
}

export interface RouteOption {
  id: string;
  name: string;
  distance: number; // in km
  duration: number; // in mins
  signalStrength: number; // percentage 0-100
  emergencySafetyRating: number; // percentage 0-100
  coordinates: [number, number][]; // polyline coordinates
  elevations?: number[];
  description: string;
  bestProvider?: 'Jio' | 'Airtel' | 'Vi' | 'BSNL';
  routeHealth?: number;
  confidenceScore?: number;
  deadZonesCount?: number;
  whyThisRoute?: string;
  dataSource?: 'opencellid' | 'predicted';
  towerCount?: number;
  deadZones?: {
    name: string;
    coordinates: [number, number];
    expectedDurationMins?: number;
    description?: string;
  }[];
  weather?: RouteWeatherSummary;
  weatherSummary?: RouteWeatherSummary;
  accuracyBadge?: string;
  pointsOfInterest?: PointOfInterest[];
  recommendedStops?: PointOfInterest[];
}

export interface SavedPath {
  id: string;
  title: string;
  start: LocationData;
  end: LocationData;
  purpose: JourneyPurpose;
  preference: number; // 0-100: 0 = Fastest, 100 = Best Connectivity
  emergencySafe: boolean;
  selectedRouteId: string;
  createdAt: string;
}
