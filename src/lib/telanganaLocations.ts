export interface LocationCoordinates {
  lat: number;
  lng: number;
}

export const telanganaLocations: Record<string, LocationCoordinates> = {
  // MAJOR CITIES & DISTRICT HEADQUARTERS
  "Hyderabad": { lat: 17.3850, lng: 78.4867 },
  "Secunderabad": { lat: 17.4341, lng: 78.4974 },
  "Warangal": { lat: 17.9689, lng: 79.5941 },
  "Karimnagar": { lat: 18.4386, lng: 79.1288 },
  "Nizamabad": { lat: 18.6725, lng: 78.0941 },
  "Khammam": { lat: 17.2473, lng: 80.1514 },
  "Nalgonda": { lat: 16.3427, lng: 79.2663 },
  "Mahbubnagar": { lat: 16.7492, lng: 77.9810 },
  "Adilabad": { lat: 19.6760, lng: 78.5317 },
  "Medak": { lat: 18.0533, lng: 78.2622 },
  "Sangareddy": { lat: 17.6897, lng: 78.0742 },
  "Siddipet": { lat: 18.0667, lng: 78.8667 },
  "Suryapet": { lat: 17.1500, lng: 79.6167 },
  "Kamareddy": { lat: 18.3214, lng: 78.3333 },
  "Bhongir": { lat: 17.5108, lng: 78.8872 },
  "Mancherial": { lat: 18.8667, lng: 79.4667 },
  "Nirmal": { lat: 19.0833, lng: 78.3333 },
  "Jagtial": { lat: 18.8000, lng: 78.9333 },
  "Peddapalli": { lat: 18.3333, lng: 79.0833 },
  "Rajanna Sircilla": { lat: 18.1667, lng: 78.8167 },
  "Jayashankar Bhupalpally": { lat: 18.0167, lng: 79.8333 },
  "Mulugu": { lat: 17.7167, lng: 80.0167 },
  "Mahabubabad": { lat: 17.3333, lng: 79.6167 },
  "Wanaparthy": { lat: 16.3667, lng: 78.0667 },
  "Nagarkurnool": { lat: 16.6167, lng: 77.9000 },
  "Vikarabad": { lat: 17.3333, lng: 77.9000 },
  "Tandur": { lat: 17.3333, lng: 77.8333 },
  "Kodad": { lat: 16.8833, lng: 79.4833 },
  "Miryalguda": { lat: 16.8667, lng: 79.1667 },
  "Narayanpet": { lat: 16.7167, lng: 77.5000 },
  "Jogulamba Gadwal": { lat: 16.2833, lng: 77.8000 },
  "Asifabad": { lat: 19.4833, lng: 78.7833 },
  "Kumuram Bheem": { lat: 19.3167, lng: 79.2167 },

  // HYDERABAD LOCALITIES & LANDMARKS
  "HITEC City": { lat: 17.4475, lng: 78.3808 },
  "Gachibowli": { lat: 17.4400, lng: 78.3489 },
  "Banjara Hills": { lat: 17.4239, lng: 78.4482 },
  "Jubilee Hills": { lat: 17.4300, lng: 78.4300 },
  "Madhapur": { lat: 17.4475, lng: 78.3908 },
  "Kondapur": { lat: 17.4667, lng: 78.3667 },
  "Kukatpally": { lat: 17.4833, lng: 78.4000 },
  "Miyapur": { lat: 17.5000, lng: 78.3667 },
  "Kompally": { lat: 17.5167, lng: 78.4833 },
  "Secunderabad Railway Station": { lat: 17.4341, lng: 78.5000 },
  "Hyderabad Railway Station": { lat: 17.3750, lng: 78.4750 },
  "LB Nagar": { lat: 17.3500, lng: 78.5333 },
  "Dilsukhnagar": { lat: 17.3667, lng: 78.5167 },
  "Ameerpet": { lat: 17.4333, lng: 78.4500 },
  "Begumpet": { lat: 17.4500, lng: 78.4667 },

  // TOURIST DESTINATIONS
  "Charminar": { lat: 17.3616, lng: 78.4747 },
  "Golconda Fort": { lat: 17.3833, lng: 78.4011 },
  "Ramoji Film City": { lat: 17.3753, lng: 78.6311 },
  "Hussain Sagar Lake": { lat: 17.4239, lng: 78.4739 },
  "Qutb Shahi Tombs": { lat: 17.3833, lng: 78.4000 },
  "Chowmahalla Palace": { lat: 17.3600, lng: 78.4750 },
  "Salar Jung Museum": { lat: 17.3650, lng: 78.4800 },
  "Birla Mandir": { lat: 17.4000, lng: 78.4700 },
  "Nehru Zoological Park": { lat: 17.3500, lng: 78.4900 },
  "Lumbini Park": { lat: 17.4200, lng: 78.4700 },
  "Warangal Fort": { lat: 17.9833, lng: 79.5667 },
  "Kakatiya Rock Garden": { lat: 17.9667, lng: 79.5833 },
  "Bhadrakali Temple Warangal": { lat: 18.0000, lng: 79.5667 },
  "Laknavaram Lake": { lat: 18.0167, lng: 79.8000 },
  "Pakhal Lake": { lat: 17.9333, lng: 79.8833 },
  "Kuntala Waterfalls": { lat: 17.8833, lng: 79.9167 },
  "Eturnagaram Wildlife Sanctuary": { lat: 18.0833, lng: 79.9167 },
  "Kawal Wildlife Sanctuary": { lat: 19.2167, lng: 78.9167 },
  "Pandavula Gutta": { lat: 17.2167, lng: 79.0833 },
  "Bogatha Waterfalls": { lat: 17.8167, lng: 79.9833 },

  // AIRPORTS & TRANSPORT
  "Rajiv Gandhi Intl Airport": { lat: 17.2403, lng: 78.4294 },
  "Begumpet Airport": { lat: 17.4500, lng: 78.4667 },
  "Kacheguda Railway Station": { lat: 17.3750, lng: 78.5000 },

  // TECHNOLOGY & BUSINESS
  "T-Hub": { lat: 17.4475, lng: 78.3850 },
  "Financial District": { lat: 17.4333, lng: 78.3833 },
  "Nanakramguda": { lat: 17.4333, lng: 78.3667 },
  "Manikonda": { lat: 17.4167, lng: 78.3667 },

  // RELIGIOUS PLACES
  "Tirupati (AP Border)": { lat: 13.6833, lng: 79.3500 },
  "Yadadri Temple": { lat: 17.4167, lng: 79.0667 },
  "Bhadrachalam Temple": { lat: 17.6667, lng: 80.8833 },
  "Alampur Jogulamba Temple": { lat: 16.1667, lng: 77.7833 },
  "Vemulawada Temple": { lat: 18.2833, lng: 78.5833 },
  "Dharmapuri Temple": { lat: 18.2500, lng: 79.2667 }
};

/**
 * Returns coordinates for a given location name (case-insensitive, supports partial matches).
 * Searches both Telangana and combined locations.
 */
export function getCoordinates(name: string): { lat: number, lng: number } | null {
  if (!name) return null;
  const searchName = name.toLowerCase().trim();

  // Exact match
  for (const [key, coords] of Object.entries(telanganaLocations)) {
    if (key.toLowerCase() === searchName) {
      return coords;
    }
  }

  // Partial match
  for (const [key, coords] of Object.entries(telanganaLocations)) {
    if (key.toLowerCase().includes(searchName)) {
      return coords;
    }
  }

  return null;
}

/**
 * Returns all location names.
 */
export function getAllLocationNames(): string[] {
  return Object.keys(telanganaLocations);
}

export interface PopularRoute {
  from: string;
  to: string;
  label: string;
}

export const popularRoutes: PopularRoute[] = [
  // HYDERABAD TO DISTRICTS
  { from: "Hyderabad", to: "Warangal", label: "Hyderabad ⇆ Warangal" },
  { from: "Hyderabad", to: "Karimnagar", label: "Hyderabad ⇆ Karimnagar" },
  { from: "Hyderabad", to: "Nizamabad", label: "Hyderabad ⇆ Nizamabad" },
  { from: "Hyderabad", to: "Khammam", label: "Hyderabad ⇆ Khammam" },
  { from: "Hyderabad", to: "Nalgonda", label: "Hyderabad ⇆ Nalgonda" },
  { from: "Hyderabad", to: "Mahbubnagar", label: "Hyderabad ⇆ Mahbubnagar" },
  { from: "Hyderabad", to: "Adilabad", label: "Hyderabad ⇆ Adilabad" },
  { from: "Hyderabad", to: "Siddipet", label: "Hyderabad ⇆ Siddipet" },
  { from: "Hyderabad", to: "Suryapet", label: "Hyderabad ⇆ Suryapet" },
  { from: "Hyderabad", to: "Medak", label: "Hyderabad ⇆ Medak" },

  // LOCAL HYDERABAD ROUTES
  { from: "HITEC City", to: "Rajiv Gandhi Intl Airport", label: "HITEC City ⇆ Airport" },
  { from: "Charminar", to: "Gachibowli", label: "Charminar ⇆ Gachibowli" },
  { from: "Secunderabad", to: "Banjara Hills", label: "Secunderabad ⇆ Banjara Hills" },
  { from: "Kukatpally", to: "HITEC City", label: "Kukatpally ⇆ HITEC City" },
  { from: "LB Nagar", to: "Miyapur", label: "LB Nagar ⇆ Miyapur" },

  // INTER-DISTRICT ROUTES
  { from: "Warangal", to: "Khammam", label: "Warangal ⇆ Khammam" },
  { from: "Karimnagar", to: "Nirmal", label: "Karimnagar ⇆ Nirmal" },
  { from: "Nizamabad", to: "Kamareddy", label: "Nizamabad ⇆ Kamareddy" },
  { from: "Mahbubnagar", to: "Nagarkurnool", label: "Mahbubnagar ⇆ Nagarkurnool" },

  // TOURIST ROUTES
  { from: "Hyderabad", to: "Ramoji Film City", label: "Hyderabad ⇆ Ramoji Film City" },
  { from: "Hyderabad", to: "Golconda Fort", label: "Hyderabad ⇆ Golconda Fort" },
  { from: "Warangal", to: "Laknavaram Lake", label: "Warangal ⇆ Laknavaram Lake" }
];
