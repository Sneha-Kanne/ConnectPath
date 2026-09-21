import { JourneyPurpose, LocationData, RouteOption } from '../types';

export interface CommunityReport {
  id: string;
  user: {
    name: string;
    avatarUrl?: string;
  };
  locationName: string;
  signalStatus: 'Weak' | 'None' | 'Slow' | 'Good';
  description: string;
  timeAgo: string;
  votes: number;
}

export const MOCK_COMMUNITY_REPORTS: CommunityReport[] = [
  {
    id: 'rep-1',
    user: { name: 'Ravi Kumar' },
    locationName: 'Uppal Ring Road (Near Metro Station)',
    signalStatus: 'None',
    description: 'Sudden cellular blackout. Fiber cut near the metro pillar, expect zero signal for 500m.',
    timeAgo: '15m ago',
    votes: 24,
  },
  {
    id: 'rep-2',
    user: { name: 'Sarah Naidu' },
    locationName: 'Bhongir Fort Entrance',
    signalStatus: 'Slow',
    description: 'Slow data speeds during peak tourist hours. Buffer times on Jio are around 20s.',
    timeAgo: '1h ago',
    votes: 12,
  },
  {
    id: 'rep-3',
    user: { name: 'Srinivas Rao' },
    locationName: 'HITEC City Cyber Towers',
    signalStatus: 'Good',
    description: 'New Airtel 5G microcell active! Extremely low latency and 800Mbps downloads.',
    timeAgo: '2h ago',
    votes: 38,
  },
  {
    id: 'rep-4',
    user: { name: 'Elena Rostova' },
    locationName: 'Medak Border Highway',
    signalStatus: 'Weak',
    description: 'BSNL legacy band-8 coverage is active, but Airtel/Jio are failing in rural stretches.',
    timeAgo: '4h ago',
    votes: 15,
  }
];

export const MOCK_TELANGANA_ROUTES = [
  {
    from: "Hyderabad",
    to: "Warangal",
    via: "NH163",
    bestProvider: "Jio" as const,
    overallConnectivityScore: 82,
    routeHealthScore: 85,
    confidenceScore: 90,
    whyThisRoute: "Maintains excellent high-speed Jio 5G signal through Hyderabad, Uppal, and Warangal urban areas, with a single weak zone near Bhongir."
  },
  {
    from: "Hyderabad",
    to: "Karimnagar",
    via: "NH163 / Siddipet bypass",
    bestProvider: "Airtel" as const,
    overallConnectivityScore: 78,
    routeHealthScore: 80,
    confidenceScore: 85,
    whyThisRoute: "Strong Airtel LTE/5G signal up until Siddipet bypass, with BSNL backup in the forest transit segment."
  },
  {
    from: "HITEC City",
    to: "Rajiv Gandhi Intl Airport",
    via: "Nehru Outer Ring Road (ORR)",
    bestProvider: "Jio" as const,
    overallConnectivityScore: 98,
    routeHealthScore: 99,
    confidenceScore: 97,
    whyThisRoute: "Seamless Jio 5G ultra-broadband and fiber backhauls. Zero active dropouts or dead zones detected along the Nehru ORR."
  },
  {
    from: "Charminar",
    to: "Gachibowli",
    via: "Inner Ring Road",
    bestProvider: "Jio" as const,
    overallConnectivityScore: 89,
    routeHealthScore: 92,
    confidenceScore: 94,
    whyThisRoute: "Exceptional 5G penetration from Mehdipatnam through Gachibowli, with minor structural attenuation in high-density Old City alleys."
  }
];

