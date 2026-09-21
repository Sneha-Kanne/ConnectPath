export interface LocationCoordinates {
  lat: number;
  lng: number;
}

export const indiaLocations: Record<string, LocationCoordinates> = {
  // MAJOR METROS
  "Mumbai": { lat: 19.0760, lng: 72.8777 },
  "Delhi": { lat: 28.7041, lng: 77.1025 },
  "Bangalore": { lat: 12.9716, lng: 77.5946 },
  "Chennai": { lat: 13.0827, lng: 80.2707 },
  "Kolkata": { lat: 22.5726, lng: 88.3639 },
  "Pune": { lat: 18.5204, lng: 73.8570 },
  "Ahmedabad": { lat: 23.0225, lng: 72.5714 },
  "Jaipur": { lat: 26.9124, lng: 75.7873 },
  "Surat": { lat: 21.1702, lng: 72.8311 },
  "Lucknow": { lat: 26.8467, lng: 80.9462 },

  // SOUTH INDIA
  "Hyderabad": { lat: 17.3850, lng: 78.4867 },
  "Visakhapatnam": { lat: 17.6868, lng: 83.2185 },
  "Vijayawada": { lat: 16.5062, lng: 80.6480 },
  "Tirupati": { lat: 13.6833, lng: 79.3500 },
  "Coimbatore": { lat: 11.0168, lng: 76.9558 },
  "Madurai": { lat: 9.9252, lng: 78.1198 },
  "Kochi": { lat: 9.9312, lng: 76.2673 },
  "Thiruvananthapuram": { lat: 8.5241, lng: 76.9366 },
  "Kozhikode": { lat: 11.2588, lng: 75.7804 },
  "Mysore": { lat: 12.2958, lng: 76.6394 },
  "Mangalore": { lat: 12.9141, lng: 74.8560 },
  "Hubli": { lat: 15.3647, lng: 75.1240 },

  // WEST INDIA
  "Goa": { lat: 15.2993, lng: 74.1240 },
  "Nagpur": { lat: 21.1458, lng: 79.0882 },
  "Nashik": { lat: 19.9975, lng: 73.7898 },
  "Aurangabad": { lat: 19.8762, lng: 75.3433 },
  "Rajkot": { lat: 22.3039, lng: 70.8022 },
  "Vadodara": { lat: 22.3072, lng: 73.1812 },

  // NORTH INDIA
  "Chandigarh": { lat: 30.7333, lng: 76.7794 },
  "Ludhiana": { lat: 30.9010, lng: 75.8573 },
  "Amritsar": { lat: 31.6340, lng: 74.8723 },
  "Jalandhar": { lat: 31.3260, lng: 75.5762 },
  "Patiala": { lat: 30.3398, lng: 76.3869 },
  "Shimla": { lat: 31.1048, lng: 77.1734 },
  "Manali": { lat: 32.2396, lng: 77.1887 },
  "Dharamshala": { lat: 32.2190, lng: 76.3234 },
  "Dehradun": { lat: 30.3165, lng: 78.0322 },
  "Haridwar": { lat: 29.9457, lng: 78.1642 },
  "Rishikesh": { lat: 30.0869, lng: 78.2676 },
  "Nainital": { lat: 29.3803, lng: 79.4536 },
  "Agra": { lat: 27.1767, lng: 78.0081 },
  "Varanasi": { lat: 25.3176, lng: 82.9739 },
  "Kanpur": { lat: 26.4499, lng: 80.3319 },
  "Allahabad": { lat: 25.4358, lng: 81.8463 },
  "Meerut": { lat: 29.0168, lng: 77.7056 },
  "Ghaziabad": { lat: 28.6692, lng: 77.4538 },

  // EAST INDIA
  "Bhubaneswar": { lat: 20.2961, lng: 85.8245 },
  "Cuttack": { lat: 20.4625, lng: 85.8828 },
  "Puri": { lat: 19.8135, lng: 85.8312 },
  "Ranchi": { lat: 23.3441, lng: 85.3096 },
  "Jamshedpur": { lat: 22.8046, lng: 86.2029 },
  "Dhanbad": { lat: 23.7957, lng: 86.4304 },
  "Patna": { lat: 25.5941, lng: 85.1376 },
  "Gaya": { lat: 24.7955, lng: 85.0002 },
  "Guwahati": { lat: 26.1445, lng: 91.7362 },
  "Siliguri": { lat: 26.7271, lng: 88.3953 },
  "Darjeeling": { lat: 27.0360, lng: 88.2627 },
  "Asansol": { lat: 23.6739, lng: 86.9524 },
  "Durgapur": { lat: 23.5204, lng: 87.3119 },

  // CENTRAL INDIA
  "Bhopal": { lat: 23.2599, lng: 77.4126 },
  "Indore": { lat: 22.7196, lng: 75.8577 },
  "Gwalior": { lat: 26.2183, lng: 78.1828 },
  "Jabalpur": { lat: 23.1815, lng: 79.9864 },
  "Raipur": { lat: 21.2514, lng: 81.6296 },
  "Bilaspur": { lat: 22.0797, lng: 82.1409 },

  // FAMOUS TOURIST DESTINATIONS
  "Taj Mahal": { lat: 27.1751, lng: 78.0421 },
  "Golden Temple": { lat: 31.6200, lng: 74.8765 },
  "Hawa Mahal": { lat: 26.9239, lng: 75.8267 },
  "Gateway of India": { lat: 18.9220, lng: 72.8347 },
  "India Gate Delhi": { lat: 28.6129, lng: 77.2295 },
  "Red Fort": { lat: 28.6562, lng: 77.2410 },
  "Qutub Minar": { lat: 28.5244, lng: 77.1855 },
  "Ajanta Caves": { lat: 20.5533, lng: 75.7000 },
  "Ellora Caves": { lat: 20.0244, lng: 75.1778 },
  "Konark Sun Temple": { lat: 19.8876, lng: 86.0945 },
  "Khajuraho": { lat: 24.8316, lng: 79.9197 },
  "Hampi": { lat: 15.3350, lng: 76.4600 },
  "Alleppey": { lat: 9.4981, lng: 76.3388 },
  "Munnar": { lat: 10.0889, lng: 77.0595 },
  "Ooty": { lat: 11.4102, lng: 76.6950 },
  "Kodaikanal": { lat: 10.2381, lng: 77.4892 },
  "Pondicherry": { lat: 11.9416, lng: 79.8083 },
  "Mahabalipuram": { lat: 12.6269, lng: 80.1928 },
  "Kanyakumari": { lat: 8.0883, lng: 77.5385 },
  "Rameswaram": { lat: 9.2876, lng: 79.3129 }
};

export interface IndiaPopularRoute {
  from: string;
  to: string;
  label: string;
}

// Inter-state popular routes
export const indiaPopularRoutes: IndiaPopularRoute[] = [
  // FROM TELANGANA TO OTHER STATES
  { from: "Hyderabad", to: "Bangalore", label: "Hyderabad ⇆ Bangalore" },
  { from: "Hyderabad", to: "Chennai", label: "Hyderabad ⇆ Chennai" },
  { from: "Hyderabad", to: "Mumbai", label: "Hyderabad ⇆ Mumbai" },
  { from: "Hyderabad", to: "Pune", label: "Hyderabad ⇆ Pune" },
  { from: "Hyderabad", to: "Vijayawada", label: "Hyderabad ⇆ Vijayawada" },
  { from: "Hyderabad", to: "Visakhapatnam", label: "Hyderabad ⇆ Vizag" },
  { from: "Hyderabad", to: "Nagpur", label: "Hyderabad ⇆ Nagpur" },

  // MAJOR INTER-CITY ROUTES
  { from: "Mumbai", to: "Pune", label: "Mumbai ⇆ Pune" },
  { from: "Delhi", to: "Jaipur", label: "Delhi ⇆ Jaipur" },
  { from: "Delhi", to: "Agra", label: "Delhi ⇆ Agra (Taj Mahal)" },
  { from: "Bangalore", to: "Mysore", label: "Bangalore ⇆ Mysore" },
  { from: "Chennai", to: "Bangalore", label: "Chennai ⇆ Bangalore" },
  { from: "Kolkata", to: "Durgapur", label: "Kolkata ⇆ Durgapur" },
  { from: "Pune", to: "Mumbai", label: "Pune ⇆ Mumbai" },
  { from: "Ahmedabad", to: "Mumbai", label: "Ahmedabad ⇆ Mumbai" }
];
