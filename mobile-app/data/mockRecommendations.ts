export type IntelligenceStatus = 'Excellent' | 'Good' | 'Moderate' | 'Poor' | 'High' | 'Available' | 'Limited' | 'None' | 'Clear';

export interface QuickIntelligence {
  weather: string;
  weatherStatus: IntelligenceStatus;
  aqi: string;
  aqiStatus: IntelligenceStatus;
  traffic: string;
  trafficStatus: IntelligenceStatus;
  parking: string;
  parkingStatus: IntelligenceStatus;
  safety: string;
  safetyStatus: IntelligenceStatus;
}

export interface RecommendationData {
  id: string;
  name: string;
  image: string;
  score: number;
  budget: string;
  travelTime: string;
  summary: string;
  intelligence: QuickIntelligence;
  keywords: string[]; // for matching against search queries
}

export const mockRecommendations: Record<string, RecommendationData> = {
  ooty: {
    id: "ooty",
    name: "Ooty",
    image: "https://images.unsplash.com/photo-1590413009513-41c1b1836c84?q=80&w=1200&auto=format&fit=crop",
    score: 95,
    budget: "₹4,500",
    travelTime: "6 hr 20 min",
    summary: "Pleasant weather, excellent air quality, and moderate visitor traffic make Ooty an ideal destination today. Road conditions are clear, and parking availability is high.",
    intelligence: {
      weather: "18°C",
      weatherStatus: "Excellent",
      aqi: "32",
      aqiStatus: "Excellent",
      traffic: "Moderate",
      trafficStatus: "Moderate",
      parking: "Available",
      parkingStatus: "Available",
      safety: "High",
      safetyStatus: "High"
    },
    keywords: ["ooty", "weekend", "hill", "hillstation", "nilgiris"]
  },
  coorg: {
    id: "coorg",
    name: "Coorg",
    image: "https://images.unsplash.com/photo-1595815771614-ade9d6527653?q=80&w=1200&auto=format&fit=crop",
    score: 88,
    budget: "₹5,200",
    travelTime: "5 hr 15 min",
    summary: "Lush green landscapes and pleasant weather make Coorg highly recommended. Traffic is light, but parking at major tourist spots can be limited.",
    intelligence: {
      weather: "20°C",
      weatherStatus: "Good",
      aqi: "45",
      aqiStatus: "Good",
      traffic: "Light",
      trafficStatus: "Clear",
      parking: "Limited",
      parkingStatus: "Limited",
      safety: "High",
      safetyStatus: "High"
    },
    keywords: ["coorg", "kodagu", "photography", "coffee", "nature"]
  },
  munnar: {
    id: "munnar",
    name: "Munnar",
    image: "https://images.unsplash.com/photo-1593693397690-362bcbf500f4?q=80&w=1200&auto=format&fit=crop",
    score: 92,
    budget: "₹4,800",
    travelTime: "9 hr 30 min",
    summary: "Breathtaking tea gardens with clear skies today. Long travel time but highly rewarding. Excellent safety and air quality.",
    intelligence: {
      weather: "16°C",
      weatherStatus: "Excellent",
      aqi: "28",
      aqiStatus: "Excellent",
      traffic: "Moderate",
      trafficStatus: "Moderate",
      parking: "Available",
      parkingStatus: "Available",
      safety: "High",
      safetyStatus: "High"
    },
    keywords: ["munnar", "kerala", "tea", "nature", "hills"]
  },
  goa: {
    id: "goa",
    name: "Goa",
    image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=1200&auto=format&fit=crop",
    score: 75,
    budget: "₹8,000",
    travelTime: "11 hr 00 min",
    summary: "Sunny and warm at the beaches. High crowd levels and limited parking expected today. Traffic is heavy near popular coastal areas.",
    intelligence: {
      weather: "31°C",
      weatherStatus: "Moderate",
      aqi: "55",
      aqiStatus: "Good",
      traffic: "Heavy",
      trafficStatus: "Poor",
      parking: "Limited",
      parkingStatus: "Limited",
      safety: "Moderate",
      safetyStatus: "Moderate"
    },
    keywords: ["goa", "beach", "adventure", "party", "sea"]
  },
  hampi: {
    id: "hampi",
    name: "Hampi",
    image: "https://images.unsplash.com/photo-1620766165457-a8025baa82e0?q=80&w=1200&auto=format&fit=crop",
    score: 82,
    budget: "₹3,500",
    travelTime: "6 hr 45 min",
    summary: "Clear sunny skies perfect for exploring the ruins. Very affordable budget today, but be prepared for moderate heat in the afternoon.",
    intelligence: {
      weather: "33°C",
      weatherStatus: "Moderate",
      aqi: "40",
      aqiStatus: "Good",
      traffic: "Light",
      trafficStatus: "Clear",
      parking: "Available",
      parkingStatus: "Available",
      safety: "High",
      safetyStatus: "High"
    },
    keywords: ["hampi", "ruins", "hidden", "temples", "history", "gems"]
  },
  mysore: {
    id: "mysore",
    name: "Mysore",
    image: "https://images.unsplash.com/photo-1588390647468-b7d16f39185a?q=80&w=1200&auto=format&fit=crop",
    score: 96,
    budget: "₹2,500",
    travelTime: "3 hr 15 min",
    summary: "Excellent short trip with incredible food and heritage. Highly accessible, very safe, and low cost. Palace parking is fully available.",
    intelligence: {
      weather: "26°C",
      weatherStatus: "Excellent",
      aqi: "35",
      aqiStatus: "Excellent",
      traffic: "Moderate",
      trafficStatus: "Moderate",
      parking: "Available",
      parkingStatus: "Available",
      safety: "High",
      safetyStatus: "High"
    },
    keywords: ["mysore", "mysuru", "food", "palace", "heritage", "short"]
  },
  pondicherry: {
    id: "pondicherry",
    name: "Pondicherry",
    image: "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?q=80&w=1200&auto=format&fit=crop",
    score: 89,
    budget: "₹4,000",
    travelTime: "6 hr 00 min",
    summary: "Perfect coastal getaway for family. Enjoy the French quarter and clean beaches. Traffic inside the city is slightly congested.",
    intelligence: {
      weather: "29°C",
      weatherStatus: "Good",
      aqi: "42",
      aqiStatus: "Good",
      traffic: "Moderate",
      trafficStatus: "Moderate",
      parking: "Limited",
      parkingStatus: "Limited",
      safety: "High",
      safetyStatus: "High"
    },
    keywords: ["pondicherry", "pondi", "family", "beach", "french", "auroville"]
  },
  kodaikanal: {
    id: "kodaikanal",
    name: "Kodaikanal",
    image: "https://images.unsplash.com/photo-1574682498218-c2b640822180?q=80&w=1200&auto=format&fit=crop",
    score: 65,
    budget: "₹5,000",
    travelTime: "7 hr 30 min",
    summary: "Warning: High traffic and limited parking currently. Weather is rainy and misty. Proceed with caution on the ghat roads.",
    intelligence: {
      weather: "14°C",
      weatherStatus: "Poor",
      aqi: "25",
      aqiStatus: "Excellent",
      traffic: "Heavy",
      trafficStatus: "Poor",
      parking: "None",
      parkingStatus: "Poor",
      safety: "Moderate",
      safetyStatus: "Moderate"
    },
    keywords: ["kodaikanal", "kodai", "lake", "mist"]
  }
};

/** Match a search string to a mock destination, returning ooty as a fallback */
export function getRecommendationForQuery(query: string): RecommendationData {
  const normalized = query.toLowerCase().trim();
  
  // Try to find a direct keyword match
  for (const key in mockRecommendations) {
    const dest = mockRecommendations[key];
    if (dest.keywords.some(k => normalized.includes(k))) {
      return dest;
    }
  }

  // Fallback to Ooty if no match is found, ensuring the UI always has a rich state
  return mockRecommendations.ooty;
}
