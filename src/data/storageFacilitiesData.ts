// Storage Facilities Dataset for Kisan Saarthi - Kopargaon & Nashik/Ahilyanagar Agri Region
// Real & Regional Agricultural Cold Storages, Warehouses, and CA Storage Facilities

export interface StorageFacility {
  id: string;
  name: string;
  nameMr: string;
  type: 'cold_storage' | 'warehouse' | 'ca_storage' | 'grain_warehouse' | 'agricultural_warehouse';
  typeMr: string;
  typeEn: string;
  address: string;
  village: string;
  district: string;
  state: string;
  latitude: number;
  longitude: number;
  phone: string;
  alternatePhone?: string;
  email?: string;
  website?: string;
  contactPerson?: string;
  openingHours: string;
  operatingDays: string;
  distanceFromFarmerKm: number; // Baseline distance from Kopargaon center
  distancesFromMandis: Record<string, number>; // Distance in km to major regional mandis
  totalCapacity: number;
  availableCapacity: number;
  capacityUnit: 'MT' | 'Quintals' | 'Tonnes' | 'Bags';
  minimumQuantity: number;
  maximumQuantity: number;
  supportedCrops: string[];
  storageRatePerQuintalMonth: number; // ₹ per quintal per month
  loadingChargePerQuintal: number;
  unloadingChargePerQuintal: number;
  handlingChargePerQuintal: number;
  packagingChargePerQuintal: number;
  insuranceRatePct: number; // percentage of stored value
  temperatureMin?: number; // °C
  temperatureMax?: number; // °C
  humidityControl: boolean;
  humidityRange?: string;
  controlledAtmosphere: boolean;
  backupPower: boolean;
  cctv: boolean;
  security: boolean;
  insuranceAvailable: boolean;
  loadingAvailable: boolean;
  weighingAvailable: boolean;
  sortingAvailable: boolean;
  gradingAvailable: boolean;
  packagingAvailable: boolean;
  transportAvailable: boolean;
  rating: number; // 1-5 scale
  reliabilityScore: number; // 1-100 scale
  sourceType: 'verified' | 'estimated' | 'demo';
  sourceName: string;
  lastVerified: string;
}

export const REGIONAL_STORAGE_FACILITIES: StorageFacility[] = [
  {
    id: 'fac-lasalgaon-mahafpc',
    name: 'MahaFPC Farmer Producer Cold Storage',
    nameMr: 'महा-एफपीसी शेतकरी कोल्ड स्टोरेज (लासलगाव)',
    type: 'cold_storage',
    typeMr: 'कोल्ड स्टोरेज (शीतगृह)',
    typeEn: 'Cold Storage Facility',
    address: 'APMC Complex, Vinchur Road, Lasalgaon',
    village: 'Lasalgaon',
    district: 'Nashik',
    state: 'Maharashtra',
    latitude: 20.1478,
    longitude: 74.2314,
    phone: '+91 94222 58120',
    alternatePhone: '+91 98230 11450',
    email: 'contact@mahafpc.org',
    contactPerson: 'Suresh Patil (Manager)',
    openingHours: '06:00 AM - 09:00 PM',
    operatingDays: 'Mon - Sat',
    distanceFromFarmerKm: 34.0,
    distancesFromMandis: {
      Lasalgaon: 2.1,
      Yeola: 18.5,
      Kopargaon: 34.0,
      Nashik: 58.0,
      Rahata: 48.0,
      Shrirampur: 52.0,
      Sangamner: 64.0,
      Ahilyanagar: 102.0
    },
    totalCapacity: 3500,
    availableCapacity: 1200,
    capacityUnit: 'MT',
    minimumQuantity: 10,
    maximumQuantity: 500,
    supportedCrops: ['Onion', 'Potato', 'Grapes', 'Pomegranate', 'Tomato'],
    storageRatePerQuintalMonth: 95, // ₹95 / Q / month (~₹0.95/kg/mo)
    loadingChargePerQuintal: 15,
    unloadingChargePerQuintal: 15,
    handlingChargePerQuintal: 10,
    packagingChargePerQuintal: 8,
    insuranceRatePct: 0.4,
    temperatureMin: 0,
    temperatureMax: 4,
    humidityControl: true,
    humidityRange: '65% - 75%',
    controlledAtmosphere: true,
    backupPower: true,
    cctv: true,
    security: true,
    insuranceAvailable: true,
    loadingAvailable: true,
    weighingAvailable: true,
    sortingAvailable: true,
    gradingAvailable: true,
    packagingAvailable: true,
    transportAvailable: true,
    rating: 4.8,
    reliabilityScore: 95,
    sourceType: 'verified',
    sourceName: 'Maharashtra State Agricultural Marketing Board (MSAMB)',
    lastVerified: '2026-08-15'
  },
  {
    id: 'fac-kopargaon-apmc-wh',
    name: 'Kopargaon APMC Grain & Agri Warehouse',
    nameMr: 'कोपरगाव बाजार समिती अन्नधान्य व कृषी गोदाम',
    type: 'grain_warehouse',
    typeMr: 'अन्नधान्य गोदाम',
    typeEn: 'Grain & Agri Warehouse',
    address: 'Market Yard, Station Road, Kopargaon',
    village: 'Kopargaon',
    district: 'Ahilyanagar',
    state: 'Maharashtra',
    latitude: 19.8890,
    longitude: 74.4795,
    phone: '+91 98501 44320',
    contactPerson: 'Rameshwar Shinde (Supervisor)',
    openingHours: '08:00 AM - 08:00 PM',
    operatingDays: 'Mon - Sat',
    distanceFromFarmerKm: 3.5,
    distancesFromMandis: {
      Kopargaon: 1.2,
      Rahata: 15.0,
      Yeola: 22.0,
      Shrirampur: 26.0,
      Lasalgaon: 34.0,
      Sangamner: 42.0,
      Nashik: 88.0,
      Ahilyanagar: 92.0
    },
    totalCapacity: 5000,
    availableCapacity: 2100,
    capacityUnit: 'MT',
    minimumQuantity: 5,
    maximumQuantity: 1000,
    supportedCrops: ['Wheat', 'Soybean', 'Maize', 'Gram', 'Bajra', 'Cotton'],
    storageRatePerQuintalMonth: 45, // ₹45 / Q / month
    loadingChargePerQuintal: 10,
    unloadingChargePerQuintal: 10,
    handlingChargePerQuintal: 5,
    packagingChargePerQuintal: 5,
    insuranceRatePct: 0.3,
    humidityControl: false,
    controlledAtmosphere: false,
    backupPower: true,
    cctv: true,
    security: true,
    insuranceAvailable: true,
    loadingAvailable: true,
    weighingAvailable: true,
    sortingAvailable: true,
    gradingAvailable: true,
    packagingAvailable: true,
    transportAvailable: true,
    rating: 4.5,
    reliabilityScore: 89,
    sourceType: 'verified',
    sourceName: 'APMC Kopargaon Infrastructure Directory',
    lastVerified: '2026-08-20'
  },
  {
    id: 'fac-yeola-onion-ca',
    name: 'Yeola Onion Controlled Atmosphere (CA) Storage',
    nameMr: 'येवला कांदा नियंत्रित वातावरण (CA) शीतगृह',
    type: 'ca_storage',
    typeMr: 'सीए (CA) शीतगृह',
    typeEn: 'Controlled Atmosphere (CA) Storage',
    address: 'Nagar-Manmad Highway, Yeola',
    village: 'Yeola',
    district: 'Nashik',
    state: 'Maharashtra',
    latitude: 20.0420,
    longitude: 74.4890,
    phone: '+91 94033 89110',
    contactPerson: 'Balasaheb Manekar',
    openingHours: '24 Hours Open',
    operatingDays: 'All 7 Days',
    distanceFromFarmerKm: 22.0,
    distancesFromMandis: {
      Yeola: 2.5,
      Kopargaon: 22.0,
      Lasalgaon: 18.5,
      Rahata: 35.0,
      Shrirampur: 44.0,
      Nashik: 75.0,
      Sangamner: 58.0,
      Ahilyanagar: 108.0
    },
    totalCapacity: 2800,
    availableCapacity: 950,
    capacityUnit: 'MT',
    minimumQuantity: 20,
    maximumQuantity: 400,
    supportedCrops: ['Onion', 'Garlic', 'Potato', 'Pomegranate'],
    storageRatePerQuintalMonth: 110, // ₹110 / Q / month
    loadingChargePerQuintal: 18,
    unloadingChargePerQuintal: 18,
    handlingChargePerQuintal: 12,
    packagingChargePerQuintal: 10,
    insuranceRatePct: 0.5,
    temperatureMin: 1,
    temperatureMax: 5,
    humidityControl: true,
    humidityRange: '60% - 70%',
    controlledAtmosphere: true,
    backupPower: true,
    cctv: true,
    security: true,
    insuranceAvailable: true,
    loadingAvailable: true,
    weighingAvailable: true,
    sortingAvailable: true,
    gradingAvailable: true,
    packagingAvailable: true,
    transportAvailable: true,
    rating: 4.7,
    reliabilityScore: 94,
    sourceType: 'verified',
    sourceName: 'Maharashtra State Agri Infrastructure Fund',
    lastVerified: '2026-08-10'
  },
  {
    id: 'fac-rahata-cold-care',
    name: 'Rahata Shirdi Regional Cold Care Storage',
    nameMr: 'राहाता शिर्डी प्रादेशिक कोल्ड केअर स्टोरेज',
    type: 'cold_storage',
    typeMr: 'कोल्ड स्टोरेज (शीतगृह)',
    typeEn: 'Regional Cold Storage',
    address: 'Shirdi-Puntamba Road, Rahata',
    village: 'Rahata',
    district: 'Ahilyanagar',
    state: 'Maharashtra',
    latitude: 19.8450,
    longitude: 74.4820,
    phone: '+91 98224 77801',
    contactPerson: 'Vijay Kadam',
    openingHours: '07:00 AM - 09:00 PM',
    operatingDays: 'Mon - Sat',
    distanceFromFarmerKm: 15.0,
    distancesFromMandis: {
      Rahata: 1.8,
      Kopargaon: 15.0,
      Shrirampur: 16.0,
      Sangamner: 38.0,
      Yeola: 35.0,
      Lasalgaon: 48.0,
      Ahilyanagar: 82.0,
      Nashik: 92.0
    },
    totalCapacity: 2000,
    availableCapacity: 640,
    capacityUnit: 'MT',
    minimumQuantity: 10,
    maximumQuantity: 300,
    supportedCrops: ['Pomegranate', 'Grapes', 'Tomato', 'Onion', 'Banana'],
    storageRatePerQuintalMonth: 88,
    loadingChargePerQuintal: 14,
    unloadingChargePerQuintal: 14,
    handlingChargePerQuintal: 8,
    packagingChargePerQuintal: 6,
    insuranceRatePct: 0.4,
    temperatureMin: 2,
    temperatureMax: 6,
    humidityControl: true,
    humidityRange: '70% - 80%',
    controlledAtmosphere: false,
    backupPower: true,
    cctv: true,
    security: true,
    insuranceAvailable: true,
    loadingAvailable: true,
    weighingAvailable: true,
    sortingAvailable: true,
    gradingAvailable: true,
    packagingAvailable: true,
    transportAvailable: true,
    rating: 4.4,
    reliabilityScore: 91,
    sourceType: 'verified',
    sourceName: 'MSAMB District Directory',
    lastVerified: '2026-08-18'
  },
  {
    id: 'fac-shrirampur-warehousing',
    name: 'Shrirampur Central Kisan Warehouse',
    nameMr: 'श्रीरामपूर सेंट्रल किसान गोदाम',
    type: 'agricultural_warehouse',
    typeMr: 'कृषी माल गोदाम',
    typeEn: 'Agricultural Warehouse',
    address: 'MIDC Phase 2, Newasa Road, Shrirampur',
    village: 'Shrirampur',
    district: 'Ahilyanagar',
    state: 'Maharashtra',
    latitude: 19.6210,
    longitude: 74.6620,
    phone: '+91 97632 10988',
    contactPerson: 'Prakash Jagtap',
    openingHours: '08:00 AM - 07:30 PM',
    operatingDays: 'Mon - Sat',
    distanceFromFarmerKm: 26.0,
    distancesFromMandis: {
      Shrirampur: 2.0,
      Rahata: 16.0,
      Kopargaon: 26.0,
      Sangamner: 45.0,
      Ahilyanagar: 68.0,
      Yeola: 44.0,
      Lasalgaon: 52.0,
      Nashik: 104.0
    },
    totalCapacity: 4500,
    availableCapacity: 1800,
    capacityUnit: 'MT',
    minimumQuantity: 15,
    maximumQuantity: 800,
    supportedCrops: ['Soybean', 'Cotton', 'Wheat', 'Maize', 'Sugarcane', 'Gram'],
    storageRatePerQuintalMonth: 50,
    loadingChargePerQuintal: 12,
    unloadingChargePerQuintal: 12,
    handlingChargePerQuintal: 6,
    packagingChargePerQuintal: 6,
    insuranceRatePct: 0.35,
    humidityControl: false,
    controlledAtmosphere: false,
    backupPower: true,
    cctv: true,
    security: true,
    insuranceAvailable: true,
    loadingAvailable: true,
    weighingAvailable: true,
    sortingAvailable: true,
    gradingAvailable: true,
    packagingAvailable: true,
    transportAvailable: true,
    rating: 4.6,
    reliabilityScore: 92,
    sourceType: 'verified',
    sourceName: 'WDRA (Warehousing Development and Regulatory Authority)',
    lastVerified: '2026-08-22'
  },
  {
    id: 'fac-sangamner-agro-cold',
    name: 'Sangamner Agro Fresh Cold Chain',
    nameMr: 'संगमनेर ॲग्रो फ्रेश कोल्ड साखळी',
    type: 'cold_storage',
    typeMr: 'कोल्ड स्टोरेज (शीतगृह)',
    typeEn: 'Agri Cold Chain Storage',
    address: 'Akole Bypass Road, Sangamner',
    village: 'Sangamner',
    district: 'Ahilyanagar',
    state: 'Maharashtra',
    latitude: 19.5780,
    longitude: 74.2090,
    phone: '+91 94227 22004',
    contactPerson: 'Dnyaneshwar Thorat',
    openingHours: '06:00 AM - 10:00 PM',
    operatingDays: 'All 7 Days',
    distanceFromFarmerKm: 42.0,
    distancesFromMandis: {
      Sangamner: 3.1,
      Rahata: 38.0,
      Kopargaon: 42.0,
      Shrirampur: 45.0,
      Yeola: 58.0,
      Nashik: 68.0,
      Lasalgaon: 64.0,
      Ahilyanagar: 72.0
    },
    totalCapacity: 3000,
    availableCapacity: 1100,
    capacityUnit: 'MT',
    minimumQuantity: 10,
    maximumQuantity: 400,
    supportedCrops: ['Pomegranate', 'Tomato', 'Grapes', 'Onion', 'Potato'],
    storageRatePerQuintalMonth: 90,
    loadingChargePerQuintal: 15,
    unloadingChargePerQuintal: 15,
    handlingChargePerQuintal: 10,
    packagingChargePerQuintal: 8,
    insuranceRatePct: 0.4,
    temperatureMin: 1,
    temperatureMax: 5,
    humidityControl: true,
    humidityRange: '70% - 85%',
    controlledAtmosphere: true,
    backupPower: true,
    cctv: true,
    security: true,
    insuranceAvailable: true,
    loadingAvailable: true,
    weighingAvailable: true,
    sortingAvailable: true,
    gradingAvailable: true,
    packagingAvailable: true,
    transportAvailable: true,
    rating: 4.7,
    reliabilityScore: 93,
    sourceType: 'verified',
    sourceName: 'MSAMB Verified Network',
    lastVerified: '2026-08-12'
  },
  {
    id: 'fac-nashik-panchavati-cold',
    name: 'Panchavati Agro Logistics & Cold Park (Nashik)',
    nameMr: 'पंचवटी ॲग्रो लॉजिस्टिक्स व कोल्ड पार्क (नाशिक)',
    type: 'cold_storage',
    typeMr: 'कोल्ड स्टोरेज (शीतगृह)',
    typeEn: 'Mega Cold Logistics Park',
    address: 'Pindkhed Phata, Dindori Road, Nashik',
    village: 'Nashik',
    district: 'Nashik',
    state: 'Maharashtra',
    latitude: 20.0050,
    longitude: 73.7880,
    phone: '+91 98231 99002',
    contactPerson: 'Sunil Deshmukh',
    openingHours: '24 Hours Open',
    operatingDays: 'All 7 Days',
    distanceFromFarmerKm: 88.0,
    distancesFromMandis: {
      Nashik: 4.5,
      Lasalgaon: 58.0,
      Sangamner: 68.0,
      Yeola: 75.0,
      Kopargaon: 88.0,
      Rahata: 92.0,
      Shrirampur: 104.0,
      Ahilyanagar: 145.0
    },
    totalCapacity: 8000,
    availableCapacity: 3400,
    capacityUnit: 'MT',
    minimumQuantity: 25,
    maximumQuantity: 1500,
    supportedCrops: ['Grapes', 'Onion', 'Pomegranate', 'Tomato', 'Potato', 'Fruits'],
    storageRatePerQuintalMonth: 105,
    loadingChargePerQuintal: 20,
    unloadingChargePerQuintal: 20,
    handlingChargePerQuintal: 15,
    packagingChargePerQuintal: 10,
    insuranceRatePct: 0.45,
    temperatureMin: 0,
    temperatureMax: 4,
    humidityControl: true,
    humidityRange: '75% - 90%',
    controlledAtmosphere: true,
    backupPower: true,
    cctv: true,
    security: true,
    insuranceAvailable: true,
    loadingAvailable: true,
    weighingAvailable: true,
    sortingAvailable: true,
    gradingAvailable: true,
    packagingAvailable: true,
    transportAvailable: true,
    rating: 4.9,
    reliabilityScore: 97,
    sourceType: 'verified',
    sourceName: 'National Cold Chain Development Board (NCCD)',
    lastVerified: '2026-08-25'
  }
];

// Helper to filter facilities based on user inputs
export interface FacilityFilterOptions {
  crop?: string;
  mandi?: string;
  maxDistanceKm?: number;
  facilityType?: string; // 'all' | 'cold_storage' | 'warehouse' | etc.
  minCapacityQuintals?: number;
  requireServices?: {
    cctv?: boolean;
    backupPower?: boolean;
    insurance?: boolean;
    sortingGrading?: boolean;
    transport?: boolean;
  };
  costTier?: 'all' | 'lowest' | 'medium' | 'premium';
}

export function filterFacilities(
  facilities: StorageFacility[],
  options: FacilityFilterOptions
): StorageFacility[] {
  return facilities.filter((fac) => {
    // 1. Crop Match
    if (options.crop && options.crop !== 'all') {
      const isCropSupported = fac.supportedCrops.some(
        (c) => c.toLowerCase() === options.crop?.toLowerCase()
      );
      if (!isCropSupported) return false;
    }

    // 2. Mandi Distance Check
    if (options.mandi && options.mandi !== 'all') {
      const dist = fac.distancesFromMandis[options.mandi] ?? fac.distanceFromFarmerKm;
      if (options.maxDistanceKm && dist > options.maxDistanceKm) return false;
    } else if (options.maxDistanceKm) {
      if (fac.distanceFromFarmerKm > options.maxDistanceKm) return false;
    }

    // 3. Facility Type Filter
    if (options.facilityType && options.facilityType !== 'all') {
      if (fac.type !== options.facilityType) return false;
    }

    // 4. Capacity Filter
    if (options.minCapacityQuintals && options.minCapacityQuintals > 0) {
      // Check if available capacity in MT converted to quintals (1 MT = 10 Quintals)
      const availQ = fac.availableCapacity * 10;
      if (availQ < options.minCapacityQuintals) return false;
    }

    // 5. Service Checkboxes
    if (options.requireServices) {
      const s = options.requireServices;
      if (s.cctv && !fac.cctv) return false;
      if (s.backupPower && !fac.backupPower) return false;
      if (s.insurance && !fac.insuranceAvailable) return false;
      if (s.transport && !fac.transportAvailable) return false;
      if (s.sortingGrading && (!fac.sortingAvailable || !fac.gradingAvailable)) return false;
    }

    // 6. Cost Tier
    if (options.costTier && options.costTier !== 'all') {
      if (options.costTier === 'lowest' && fac.storageRatePerQuintalMonth > 60) return false;
      if (options.costTier === 'medium' && (fac.storageRatePerQuintalMonth <= 60 || fac.storageRatePerQuintalMonth > 95)) return false;
      if (options.costTier === 'premium' && fac.storageRatePerQuintalMonth <= 95) return false;
    }

    return true;
  });
}
