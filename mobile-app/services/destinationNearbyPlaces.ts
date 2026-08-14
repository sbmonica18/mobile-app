import { haversineKm, type LatLng } from '@/services/routeService';

export type NearbyAttraction = {
  id: string;
  name: string;
  category: string;
  distanceKm: number;
  image?: string;
  latitude: number;
  longitude: number;
};

export type NearbyService = {
  id: string;
  type: string;
  name: string;
  distanceKm: number;
  latitude: number;
  longitude: number;
};

type OverpassElement = {
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

function elementCoords(el: OverpassElement): LatLng | null {
  const lat = el.lat ?? el.center?.lat;
  const lon = el.lon ?? el.center?.lon;
  if (lat == null || lon == null || !Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  return { latitude: lat, longitude: lon };
}

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

function normName(s: string) {
  return s.toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
}

/** Real tourist-spot coordinates (Wikipedia / OSM). Distance is computed, not invented. */
const CURATED_POI: Record<string, Array<[string, number, number]>> = {
  delhi: [['India Gate', 28.6129, 77.2295], ['Red Fort', 28.6562, 77.241], ['Qutub Minar', 28.5245, 77.1855], ["Humayun's Tomb", 28.5933, 77.2507], ['Lotus Temple', 28.5535, 77.2588], ['Chandni Chowk', 28.6506, 77.2303]],
  agra: [['Taj Mahal', 27.1751, 78.0421], ['Agra Fort', 27.1795, 78.0211], ['Mehtab Bagh', 27.1797, 78.0422], ['Itimad-ud-Daulah', 27.1927, 78.0309], ["Akbar's Tomb", 27.2206, 77.9505], ['Fatehpur Sikri', 27.094, 77.668]],
  jaipur: [['Amer Fort', 26.9855, 75.8513], ['Hawa Mahal', 26.9239, 75.8267], ['City Palace', 26.9258, 75.8236], ['Nahargarh Fort', 26.9373, 75.8155], ['Jantar Mantar', 26.9248, 75.8246], ['Johari Bazaar', 26.919, 75.826]],
  goa: [['Palolem Beach', 15.01, 74.0232], ['Basilica of Bom Jesus', 15.5009, 73.9116], ['Fort Aguada', 15.4924, 73.7731], ['Dudhsagar Falls', 15.3144, 74.3143], ['Anjuna Flea Market', 15.5802, 73.7435], ['Chapora Fort', 15.6037, 73.7363]],
  mumbai: [['Gateway of India', 18.922, 72.8347], ['Marine Drive', 18.9432, 72.8236], ['Elephanta Caves', 18.9633, 72.9315], ['Crawford Market', 18.9474, 72.834], ['Haji Ali Dargah', 18.9827, 72.8089], ['Bandra-Worli Sea Link', 19.0304, 72.8155]],
  varanasi: [['Dashashwamedh Ghat', 25.3066, 83.0107], ['Kashi Vishwanath', 25.3109, 83.0107], ['Assi Ghat', 25.282, 83.0064], ['Sarnath', 25.3808, 83.0214], ['Manikarnika Ghat', 25.3108, 83.014], ['Ramnagar Fort', 25.2692, 83.026]],
  haridwar: [['Har Ki Pauri', 29.9567, 78.171], ['Mansa Devi Temple', 29.958, 78.1574], ['Chandi Devi', 29.9336, 78.1808], ['Rajaji National Park', 29.97, 78.32], ['Bharat Mata Mandir', 29.9322, 78.138], ['Maya Devi Temple', 29.947, 78.16]],
  rishikesh: [['Lakshman Jhula', 30.1265, 78.3301], ['Ram Jhula', 30.1232, 78.314], ['Triveni Ghat', 30.1035, 78.2948], ['Neelkanth Mahadev', 30.0819, 78.3784], ['Beatles Ashram', 30.1194, 78.323], ['Shivpuri Rafting', 30.136, 78.391]],
  manali: [['Solang Valley', 32.3161, 77.157], ['Hadimba Temple', 32.2486, 77.1816], ['Rohtang Pass', 32.3669, 77.248], ['Old Manali', 32.248, 77.1835], ['Vashisht Hot Springs', 32.266, 77.188], ['Jogini Falls', 32.2705, 77.188]],
  shimla: [['The Ridge', 31.1046, 77.1734], ['Mall Road', 31.1048, 77.171], ['Jakhoo Temple', 31.1006, 77.184], ['Kufri', 31.0976, 77.2674], ['Christ Church', 31.1043, 77.1752], ['Shimla Railway Station', 31.092, 77.185]],
  udaipur: [['City Palace', 24.5764, 73.6835], ['Lake Pichola', 24.572, 73.68], ['Jag Mandir', 24.5672, 73.678], ['Saheliyon Ki Bari', 24.5995, 73.6858], ['Sajjangarh Monsoon Palace', 24.5939, 73.6389], ['Bagore Ki Haveli', 24.5798, 73.6826]],
  jodhpur: [['Mehrangarh Fort', 26.298, 73.0183], ['Jaswant Thada', 26.2967, 73.0244], ['Umaid Bhawan', 26.281, 73.0477], ['Clock Tower Market', 26.294, 73.024], ['Mandore Gardens', 26.334, 73.033], ['Toorji Ka Jhalra', 26.291, 73.024]],
  jaisalmer: [['Jaisalmer Fort', 26.9127, 70.9126], ['Sam Sand Dunes', 26.881, 70.613], ['Patwon Ki Haveli', 26.916, 70.916], ['Gadisar Lake', 26.9085, 70.9168], ['Kuldhara Village', 26.8606, 70.783], ['Salim Singh Haveli', 26.9155, 70.914]],
  amritsar: [['Golden Temple', 31.62, 74.8765], ['Wagah Border', 31.6047, 74.574], ['Jallianwala Bagh', 31.6206, 74.8801], ['Partition Museum', 31.6258, 74.877], ['Gobindgarh Fort', 31.626, 74.874], ['Hall Bazaar', 31.634, 74.876]],
  bangalore: [['Lalbagh Botanical Garden', 12.9507, 77.5848], ['Cubbon Park', 12.9763, 77.5929], ['Bangalore Palace', 12.9987, 77.592], ['Nandi Hills', 13.3702, 77.6835], ['ISKCON Temple', 13.0098, 77.5511], ['KR Market', 12.965, 77.577]],
  mysore: [['Mysore Palace', 12.3052, 76.6552], ['Chamundi Hills', 12.2724, 76.6708], ['Brindavan Gardens', 12.4216, 76.572], ["St. Philomena's Church", 12.3212, 76.6581], ['Devaraja Market', 12.310, 76.655], ['Karanji Lake', 12.3028, 76.673]],
  ooty: [['Ooty Lake', 11.4064, 76.6932], ['Government Botanical Garden', 11.4189, 76.711], ['Doddabetta Peak', 11.4024, 76.735], ['Rose Garden', 11.411, 76.71], ['Nilgiri Mountain Railway', 11.4105, 76.695], ['Tea Museum', 11.412, 76.705]],
  munnar: [['Tea Museum', 10.088, 77.062], ['Eravikulam National Park', 10.184, 77.083], ['Mattupetty Dam', 10.106, 77.123], ['Echo Point', 10.109, 77.13], ['Top Station', 10.1226, 77.247], ['Attukad Waterfalls', 10.059, 77.066]],
  kochi: [['Fort Kochi Beach', 9.9658, 76.242], ['Chinese Fishing Nets', 9.968, 76.243], ['Mattancherry Palace', 9.958, 76.2594], ['Jew Town', 9.957, 76.259], ['Marine Drive', 9.981, 76.275], ['Jew Street Spice Market', 9.9568, 76.2596]],
  alleppey: [['Alleppey Beach', 9.490, 76.322], ['Vembanad Lake', 9.59, 76.39], ['Alappuzha Houseboat Jetty', 9.498, 76.338], ['Pathiramanal Island', 9.617, 76.385], ['Krishnapuram Palace', 9.207, 76.501], ['Marari Beach', 9.605, 76.3]],
  darjeeling: [['Tiger Hill', 27.007, 88.263], ['Batasia Loop', 27.016, 88.243], ['Peace Pagoda', 27.051, 88.267], ['Happy Valley Tea Estate', 27.048, 88.248], ['Padmaja Naidu Himalayan Zoo', 27.039, 88.267], ['Mall Road', 27.041, 88.266]],
  gangtok: [['Rumtek Monastery', 27.288, 88.561], ['MG Marg', 27.331, 88.612], ['Tsomgo Lake', 27.375, 88.764], ['Enchey Monastery', 27.342, 88.619], ['Ganesh Tok', 27.352, 88.619], ['Baba Harbhajan Mandir', 27.372, 88.745]],
  nainital: [['Naini Lake', 29.3803, 79.4636], ['Snow View Point', 29.392, 79.457], ['Mall Road', 29.382, 79.46], ['Naina Devi Temple', 29.391, 79.455], ['Eco Cave Gardens', 29.377, 79.45], ['Tiffin Top', 29.383, 79.441]],
  mussoorie: [["Camel's Back Road", 30.4598, 78.0644], ['Kempty Falls', 30.486, 78.037], ['Gun Hill', 30.458, 78.068], ['Lal Tibba', 30.47, 78.08], ['Company Garden', 30.455, 78.07], ['Library Bazaar', 30.456, 78.076]],
  leh: [['Pangong Lake', 33.759, 78.671], ['Nubra Valley', 34.6, 77.55], ['Khardung La', 34.278, 77.605], ['Shanti Stupa', 34.1716, 77.577], ['Magnetic Hill', 34.166, 77.341], ['Leh Palace', 34.1659, 77.586]],
  shirdi: [['Sai Baba Samadhi Mandir', 19.7645, 74.477], ['Dwarkamai', 19.766, 74.476], ['Chavadi', 19.767, 74.475], ['Shani Shingnapur', 19.387, 74.836], ['Lendi Baug', 19.765, 74.478], ['Sai Heritage Village', 19.76, 74.48]],
  tirupati: [['Tirumala Temple', 13.6832, 79.347], ['Silathoranam', 13.678, 79.351], ['Akasa Ganga', 13.676, 79.345], ['Kapila Theertham', 13.65, 79.42], ['Alipiri Footpath', 13.65, 79.419], ['Sri Venkateswara Museum', 13.65, 79.42]],
  'vaishno-devi': [['Vaishno Devi Cave', 33.0308, 74.949], ['Ardhkuwari', 33.02, 74.94], ['Bhairavnath Temple', 33.038, 74.952], ['Banganga', 33.013, 74.931], ['Sanjichhat', 33.025, 74.945], ['Katra Market', 32.991, 74.931]],
  'bodh-gaya': [['Mahabodhi Temple', 24.6959, 84.9914], ['Bodhi Tree', 24.6958, 84.9913], ['Great Buddha Statue', 24.6968, 84.986], ['Thai Monastery', 24.699, 84.988], ['Archaeological Museum', 24.696, 84.99], ['Muchalinda Lake', 24.694, 84.992]],
  puri: [['Jagannath Temple', 19.8048, 85.818], ['Puri Beach', 19.798, 85.825], ['Konark Sun Temple', 19.8876, 86.0945], ['Chilika Lake', 19.715, 85.32], ['Raghurajpur', 19.88, 85.82], ['Swargadwar Beach', 19.793, 85.831]],
  khajuraho: [['Western Group Temples', 24.853, 79.9196], ['Lakshmana Temple', 24.852, 79.922], ['Kandariya Mahadev', 24.853, 79.92], ['Archaeological Museum', 24.85, 79.933], ['Raneh Falls', 24.89, 80.05], ['Panna National Park', 24.72, 80.0]],
  hampi: [['Virupaksha Temple', 15.335, 76.46], ['Vittala Temple', 15.342, 76.474], ['Matanga Hill', 15.334, 76.466], ['Lotus Mahal', 15.321, 76.469], ['Hemakuta Hill', 15.333, 76.458], ['Tungabhadra River', 15.338, 76.465]],
  'ajanta-ellora': [['Ajanta Caves', 20.5519, 75.7033], ['Ellora Caves', 20.0268, 75.179], ['Kailasa Temple', 20.0237, 75.179], ['Grishneshwar', 20.025, 75.17], ['Daulatabad Fort', 19.942, 75.213], ['Bibi Ka Maqbara', 19.901, 75.32]],
  kolkata: [['Victoria Memorial', 22.5448, 88.3426], ['Howrah Bridge', 22.5851, 88.3468], ['Dakshineswar Kali Temple', 22.655, 88.357], ['Indian Museum', 22.5579, 88.351], ['Park Street', 22.553, 88.351], ['Kumortuli', 22.6, 88.37]],
  chennai: [['Marina Beach', 13.05, 80.2824], ['Kapaleeshwarar Temple', 13.0336, 80.2697], ['Fort St. George', 13.08, 80.287], ['Government Museum', 13.07, 80.257], ['San Thome Basilica', 13.0335, 80.278], ['Mylapore Tank', 13.0339, 80.2705]],
  hyderabad: [['Charminar', 17.3616, 78.4747], ['Golconda Fort', 17.3833, 78.4011], ['Hussain Sagar', 17.4239, 78.4738], ['Salar Jung Museum', 17.3714, 78.4804], ['Ramoji Film City', 17.2543, 78.6808], ['Laad Bazaar', 17.361, 78.475]],
  pondicherry: [['Promenade Beach', 11.933, 79.835], ['French Quarter', 11.934, 79.834], ['Sri Aurobindo Ashram', 11.936, 79.836], ['Auroville', 12.007, 79.810], ['Paradise Beach', 11.88, 79.826], ['Botanical Garden', 11.93, 79.83]],
  kovalam: [['Lighthouse Beach', 8.4004, 76.9787], ['Hawah Beach', 8.403, 76.978], ['Samudra Beach', 8.408, 76.973], ['Vizhinjam Lighthouse', 8.383, 76.98], ['Vellayani Lake', 8.44, 76.99], ['Padmanabhaswamy Temple', 8.4828, 76.9436]],
  andaman: [['Radhanagar Beach', 11.984, 92.953], ['Cellular Jail', 11.675, 92.748], ['Havelock Island', 12.03, 92.98], ['Ross Island', 11.678, 92.763], ['North Bay Island', 11.7, 92.76], ['Corbyn Cove', 11.64, 92.75]],
  'mount-abu': [['Nakki Lake', 24.5925, 72.7156], ['Dilwara Temples', 24.609, 72.723], ['Sunset Point', 24.6, 72.7], ['Guru Shikhar', 24.66, 72.78], ['Achalgarh Fort', 24.64, 72.76], ["Trevor's Tank", 24.61, 72.73]],
  pushkar: [['Pushkar Lake', 26.4892, 74.5511], ['Brahma Temple', 26.487, 74.554], ['Savitri Temple', 26.48, 74.55], ['Pushkar Bazaar', 26.49, 74.552], ['Man Mahal', 26.489, 74.551], ['Camel Fair Ground', 26.5, 74.56]],
  dwarka: [['Dwarkadhish Temple', 22.237, 68.967], ['Nageshwar Jyotirlinga', 22.34, 69.087], ['Beyt Dwarka', 22.445, 69.088], ['Rukmini Temple', 22.239, 68.98], ['Gomti Ghat', 22.24, 68.968], ['Sudama Setu', 22.24, 68.96]],
  rameswaram: [['Ramanathaswamy Temple', 9.288, 79.317], ['Pamban Bridge', 9.282, 79.209], ['Dhanushkodi', 9.216, 79.358], ['Agni Theertham', 9.288, 79.321], ['Gandhamadhana Parvatham', 9.29, 79.3], ['Ariyaman Beach', 9.34, 78.98]],
  madurai: [['Meenakshi Temple', 9.9195, 78.1193], ['Thirumalai Nayakkar Palace', 9.915, 78.124], ['Gandhi Museum', 9.931, 78.138], ['Alagar Kovil', 10.074, 78.214], ['Vaigai Dam viewpoint', 10.053, 77.59], ['Pudhu Mandapam', 9.919, 78.12]],
  coorg: [['Abbey Falls', 12.454, 75.721], ["Raja's Seat", 12.418, 75.739], ['Talakaveri', 12.383, 75.49], ['Dubare Elephant Camp', 12.37, 75.9], ['Namdroling Monastery', 12.42, 75.72], ['Mallalli Falls', 12.68, 75.72]],
  wayanad: [['Edakkal Caves', 11.626, 76.235], ['Soochipara Falls', 11.512, 76.163], ['Banasura Sagar Dam', 11.671, 75.958], ['Muthanga Wildlife Sanctuary', 11.655, 76.248], ['Chembra Peak', 11.512, 76.087], ['Pookode Lake', 11.532, 76.027]],
  kodaikanal: [['Kodaikanal Lake', 10.2381, 77.4892], ["Coaker's Walk", 10.234, 77.493], ['Pillar Rocks', 10.216, 77.478], ['Bryant Park', 10.236, 77.49], ['Guna Caves', 10.216, 77.48], ['Silver Cascade Falls', 10.238, 77.51]],
  mahabaleshwar: [['Venna Lake', 17.9239, 73.6586], ["Arthur's Seat", 17.967, 73.66], ["Elephant's Head Point", 17.94, 73.64], ['Mapro Garden', 17.94, 73.63], ['Pratapgad Fort', 17.936, 73.58], ['Wilson Point', 17.93, 73.66]],
  'rann-of-kutch': [['White Rann Dhordo', 23.828, 69.752], ['Kalo Dungar', 23.93, 69.75], ['Kutch Museum', 23.25, 69.67], ['Mandvi Beach', 22.831, 69.355], ['Bhujodi Village', 23.22, 69.72], ['Narayan Sarovar', 23.68, 68.54]],
  ranthambore: [['Ranthambore Fort', 26.0173, 76.5026], ['Padam Talao', 26.017, 76.51], ['Trinetra Ganesh Temple', 26.02, 76.5], ['Surwal Lake', 26.05, 76.48], ['Jogi Mahal', 26.018, 76.505], ['Kachida Valley', 26.04, 76.52]],
};

/**
 * Pin catalogue sights to real coordinates and compute true km from the city hub.
 */
export function enrichCatalogueAttractions<T extends {
  id: string;
  name: string;
  category: string;
  distanceKm: number;
  image?: string;
  latitude?: number;
  longitude?: number;
}>(
  destId: string,
  items: T[],
  center: LatLng,
): (T & { latitude: number; longitude: number; distanceKm: number })[] {
  const curated = CURATED_POI[destId] || [];
  const byName = new Map(curated.map(([n, lat, lon]) => [normName(n), { latitude: lat, longitude: lon }]));

  const source = (items?.length ? items : curated.map(([name], i) => ({
    id: String(i + 1),
    name,
    category: 'Attraction',
    distanceKm: 0,
  }))) as T[];

  return source.map((item, i) => {
    const n = normName(item.name);
    let coords = byName.get(n);
    if (!coords) {
      for (const [key, value] of byName) {
        if (n.includes(key) || key.includes(n)) {
          coords = value;
          break;
        }
      }
    }
    if (!coords && typeof item.latitude === 'number' && typeof item.longitude === 'number') {
      coords = { latitude: item.latitude, longitude: item.longitude };
    }
    if (!coords) coords = offsetFromCenter(center, Math.max(0.8, item.distanceKm || 1.5), i);
    const distanceKm = round1(
      haversineKm(center.latitude, center.longitude, coords.latitude, coords.longitude),
    );
    return { ...item, ...coords, distanceKm };
  });
}

/** Deterministic fallback coords near a destination when Overpass is unavailable. */
export function offsetFromCenter(center: LatLng, distanceKm: number, index: number): LatLng {
  const angle = ((index * 57 + 13) % 360) * (Math.PI / 180);
  const km = Math.max(0.4, distanceKm || (index + 1) * 1.8);
  const dLat = (km / 111) * Math.cos(angle);
  const cosLat = Math.cos((center.latitude * Math.PI) / 180) || 0.01;
  const dLng = (km / (111 * cosLat)) * Math.sin(angle);
  return {
    latitude: center.latitude + dLat,
    longitude: center.longitude + dLng,
  };
}

/** Ensure every attraction keeps lat/lng (never discard after distance calc). */
export function ensureAttractionCoords<T extends {
  id: string;
  name: string;
  category: string;
  distanceKm: number;
  image?: string;
  latitude?: number;
  longitude?: number;
}>(items: T[], center: LatLng): (T & { latitude: number; longitude: number; distanceKm: number })[] {
  return (items || []).map((item, i) => {
    const hasCoords =
      typeof item.latitude === 'number' &&
      typeof item.longitude === 'number' &&
      Number.isFinite(item.latitude) &&
      Number.isFinite(item.longitude);
    const coords = hasCoords
      ? { latitude: item.latitude!, longitude: item.longitude! }
      : offsetFromCenter(center, item.distanceKm, i);
    const distanceKm = round1(
      haversineKm(center.latitude, center.longitude, coords.latitude, coords.longitude),
    );
    return { ...item, ...coords, distanceKm };
  });
}

/** Ensure every service keeps lat/lng. */
export function ensureServiceCoords<T extends {
  id: string;
  type: string;
  name: string;
  distanceKm: number;
  latitude?: number;
  longitude?: number;
}>(items: T[], center: LatLng): (T & { latitude: number; longitude: number; distanceKm: number })[] {
  return (items || []).map((item, i) => {
    const hasCoords =
      typeof item.latitude === 'number' &&
      typeof item.longitude === 'number' &&
      Number.isFinite(item.latitude) &&
      Number.isFinite(item.longitude);
    const coords = hasCoords
      ? { latitude: item.latitude!, longitude: item.longitude! }
      : offsetFromCenter(center, item.distanceKm || 1 + i * 0.4, i + 10);
    const distanceKm = round1(
      haversineKm(center.latitude, center.longitude, coords.latitude, coords.longitude),
    );
    return { ...item, ...coords, distanceKm };
  });
}

function mapAmenityType(tags: Record<string, string> | undefined): string | null {
  const a = tags?.amenity;
  if (a === 'hospital' || a === 'clinic') return 'Hospital';
  if (a === 'police') return 'Police Station';
  if (a === 'fuel') return 'Petrol Pump';
  if (a === 'charging_station') return 'EV Charging';
  if (a === 'atm') return 'ATM';
  if (a === 'pharmacy') return 'Pharmacy';
  return null;
}

function mapAttractionCategory(tags: Record<string, string> | undefined): string {
  if (tags?.tourism === 'viewpoint') return 'Viewpoint';
  if (tags?.tourism === 'museum') return 'Museum';
  if (tags?.tourism === 'zoo') return 'Wildlife';
  if (tags?.natural === 'beach') return 'Beach';
  if (tags?.historic) return 'Heritage';
  if (tags?.leisure === 'park') return 'Park';
  return 'Attraction';
}

/**
 * Live Overpass query around a destination — keeps lat/lng on every result
 * (same pattern as route-navigation smart stops).
 */
export async function fetchDestinationNearbyPlaces(
  center: LatLng,
  radiusM = 12000,
): Promise<{ attractions: NearbyAttraction[]; services: NearbyService[] }> {
  const { latitude: lat, longitude: lon } = center;
  const query = `
    [out:json][timeout:25];
    (
      node["tourism"~"attraction|museum|viewpoint|zoo|theme_park"](around:${radiusM},${lat},${lon});
      way["tourism"~"attraction|museum|viewpoint|zoo|theme_park"](around:${radiusM},${lat},${lon});
      node["historic"~"monument|castle|fort|ruins|memorial"](around:${radiusM},${lat},${lon});
      way["historic"~"monument|castle|fort|ruins|memorial"](around:${radiusM},${lat},${lon});
      node["natural"="beach"](around:${radiusM},${lat},${lon});
      node["amenity"~"hospital|clinic|police|fuel|charging_station|atm|pharmacy"](around:${radiusM},${lat},${lon});
      way["amenity"~"hospital|clinic|police|fuel|charging_station|atm|pharmacy"](around:${radiusM},${lat},${lon});
    );
    out center 40;
  `;

  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: query,
    headers: { 'User-Agent': 'UrbanLens/1.0', 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  if (!res.ok) throw new Error(`Overpass ${res.status}`);
  const data = (await res.json()) as { elements?: OverpassElement[] };
  const elements = data.elements || [];

  const attractions: NearbyAttraction[] = [];
  const servicesByType = new Map<string, NearbyService>();

  for (const el of elements) {
    const coords = elementCoords(el);
    const name = el.tags?.name?.trim();
    if (!coords || !name) continue;

    const distanceKm = round1(
      haversineKm(center.latitude, center.longitude, coords.latitude, coords.longitude),
    );
    const serviceType = mapAmenityType(el.tags);
    if (serviceType) {
      const prev = servicesByType.get(serviceType);
      if (!prev || distanceKm < prev.distanceKm) {
        servicesByType.set(serviceType, {
          id: `ov-${el.id}`,
          type: serviceType,
          name,
          distanceKm,
          latitude: coords.latitude,
          longitude: coords.longitude,
        });
      }
      continue;
    }

    attractions.push({
      id: `ov-${el.id}`,
      name,
      category: mapAttractionCategory(el.tags),
      distanceKm,
      latitude: coords.latitude,
      longitude: coords.longitude,
    });
  }

  attractions.sort((a, b) => a.distanceKm - b.distanceKm);

  return {
    attractions: attractions.slice(0, 8),
    services: Array.from(servicesByType.values()).sort((a, b) => a.distanceKm - b.distanceKm),
  };
}
