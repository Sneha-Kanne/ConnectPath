export interface TelanganaRouteData {
  from: string;
  to: string;
  via: string;
  bestProvider: 'Jio' | 'Airtel' | 'Vi' | 'BSNL';
  overallConnectivityScore: number;
  routeHealthScore: number;
  confidenceScore: number;
  signalStrengthPoints: number[]; // points 0-100 along the route
  deadZones: {
    name: string;
    coordinates: [number, number];
    expectedDurationMins: number;
    description: string;
  }[];
  whyThisRoute: string;
}

export const telanganaRoutesData: TelanganaRouteData[] = [
  {
    from: "Hyderabad",
    to: "Warangal",
    via: "NH163",
    bestProvider: "Jio",
    overallConnectivityScore: 82,
    routeHealthScore: 85,
    confidenceScore: 90,
    signalStrengthPoints: [95, 90, 85, 40, 20, 10, 30, 75, 80, 85, 95],
    deadZones: [
      {
        name: "Bhongir Rural Valley",
        coordinates: [17.5108, 78.8872],
        expectedDurationMins: 8,
        description: "Terrain shadows block primary tower connectivity. Expect weak handoffs."
      }
    ],
    whyThisRoute: "Maintains excellent high-speed Jio 5G signal through Hyderabad, Uppal, and Warangal urban areas, with a single weak zone near Bhongir."
  },
  {
    from: "Hyderabad",
    to: "Karimnagar",
    via: "NH163 / Siddipet bypass",
    bestProvider: "Airtel",
    overallConnectivityScore: 78,
    routeHealthScore: 80,
    confidenceScore: 85,
    signalStrengthPoints: [90, 88, 85, 92, 75, 35, 15, 45, 60, 80, 88],
    deadZones: [
      {
        name: "Siddipet-Karimnagar Forest Stretch",
        coordinates: [18.2561, 79.0142],
        expectedDurationMins: 12,
        description: "Dense vegetative cover and distance from highway towers result in weak carrier aggregation."
      }
    ],
    whyThisRoute: "Strong Airtel LTE/5G signal up until Siddipet bypass, with BSNL backup in the forest transit segment."
  },
  {
    from: "HITEC City",
    to: "Rajiv Gandhi Intl Airport",
    via: "Nehru Outer Ring Road (ORR)",
    bestProvider: "Jio",
    overallConnectivityScore: 98,
    routeHealthScore: 99,
    confidenceScore: 97,
    signalStrengthPoints: [98, 97, 99, 98, 96, 98, 97, 99, 98, 98, 99],
    deadZones: [],
    whyThisRoute: "Seamless Jio 5G ultra-broadband and fiber backhauls. Zero active dropouts or dead zones detected along the Nehru ORR."
  },
  {
    from: "Charminar",
    to: "Gachibowli",
    via: "Inner Ring Road",
    bestProvider: "Jio",
    overallConnectivityScore: 89,
    routeHealthScore: 92,
    confidenceScore: 94,
    signalStrengthPoints: [85, 70, 65, 80, 85, 90, 95, 98, 99, 99, 98],
    deadZones: [
      {
        name: "Old City High-Density Alleyways",
        coordinates: [17.3582, 78.4682],
        expectedDurationMins: 4,
        description: "Extreme structural density blocks direct line-of-sight to cellular micro-nodes."
      }
    ],
    whyThisRoute: "Exceptional 5G penetration from Mehdipatnam through Gachibowli, with minor structural attenuation in high-density Old City alleys."
  },
  {
    from: "Hyderabad",
    to: "Nizamabad",
    via: "NH44",
    bestProvider: "BSNL",
    overallConnectivityScore: 72,
    routeHealthScore: 75,
    confidenceScore: 82,
    signalStrengthPoints: [95, 88, 70, 75, 65, 45, 20, 30, 60, 75, 85],
    deadZones: [
      {
        name: "Medak Border Rural Stretches",
        coordinates: [18.2045, 78.1822],
        expectedDurationMins: 15,
        description: "Vast open rural flatlands with sparse telecom layouts. BSNL has best legacy sub-GHz coverage here."
      }
    ],
    whyThisRoute: "Highly reliable sub-GHz legacy penetrative waves from BSNL towers across rural sections of the Nizamabad transit highway."
  },
  {
    from: "Hyderabad",
    to: "Khammam",
    via: "NH65",
    bestProvider: "Airtel",
    overallConnectivityScore: 85,
    routeHealthScore: 88,
    confidenceScore: 92,
    signalStrengthPoints: [95, 92, 90, 88, 85, 45, 55, 70, 80, 82, 88],
    deadZones: [
      {
        name: "Suryapet Border Transit Gap",
        coordinates: [17.1625, 79.7212],
        expectedDurationMins: 6,
        description: "Border zone handoff delays between municipal circles."
      }
    ],
    whyThisRoute: "Excellent Airtel high-speed bandwidth and continuous cellular tracking along NH65 with minor transient latency near Suryapet."
  }
];

export function getTelanganaRouteDetails(from: string, to: string): TelanganaRouteData | null {
  if (!from || !to) return null;
  const f = from.toLowerCase().trim();
  const t = to.toLowerCase().trim();

  // Find exact or partial route match
  for (const route of telanganaRoutesData) {
    if (
      (route.from.toLowerCase().includes(f) && route.to.toLowerCase().includes(t)) ||
      (route.from.toLowerCase().includes(t) && route.to.toLowerCase().includes(f))
    ) {
      return route;
    }
  }

  return null;
}
