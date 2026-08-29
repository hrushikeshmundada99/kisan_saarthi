// Logistics Freight & Vehicle Capacity Specifications
// Derived from APMC Regional Transport Guidelines & Vehicle Payloads

export interface VehicleOption {
  id: string;
  nameMr: string;
  nameEn: string;
  subTypeMr: string;
  subTypeEn: string;
  categoryTier: 'small' | 'medium' | 'large';
  capacityQuintals: number;
  minPayloadQuintals: number;
  maxPayloadQuintals: number;
  costPer100Km: number;
  costPerKm: number;
  bestSuitedForMr: string;
  bestSuitedForEn: string;
  icon: string;
}

export const VEHICLE_OPTIONS: VehicleOption[] = [
  {
    id: 'small_auto',
    nameMr: '३-चाकी ऑटो / चॅम्पियन (Payload: 5-7.5 क्विंटल)',
    nameEn: '3-Wheeler Auto (Payload: 5-7.5 Quintals)',
    subTypeMr: 'अति लहान भाजीपाला वाहन',
    subTypeEn: 'Mini Perishable Auto',
    categoryTier: 'small',
    capacityQuintals: 7.5,
    minPayloadQuintals: 5,
    maxPayloadQuintals: 7.5,
    costPer100Km: 2250,
    costPerKm: 22.5,
    bestSuitedForMr: 'कोथिंबीर, मिरच्या, टोमॅटो यांसारख्या जास्त मोलाच्या व नाशवंत भाज्यांसाठी.',
    bestSuitedForEn: 'High-value, highly perishable green vegetables (coriander, chilies, tomatoes).',
    icon: '🛺'
  },
  {
    id: 'small_pickup',
    nameMr: 'मिनी ट्रक / छोटा हत्ती (Payload: 15 क्विंटल)',
    nameEn: 'Mini Truck / Tata Ace (Payload: 15 Quintals)',
    subTypeMr: 'लहान टेम्पो / छोटा हत्ती',
    subTypeEn: 'Small Pickup (Tata Ace)',
    categoryTier: 'small',
    capacityQuintals: 15,
    minPayloadQuintals: 10,
    maxPayloadQuintals: 15,
    costPer100Km: 3050,
    costPerKm: 30.5,
    bestSuitedForMr: 'प्लास्टिक क्रेट्समधील भाज्या किंवा लहान धान्याची पोती.',
    bestSuitedForEn: 'Assorted vegetables in crates or small grain bags (onions, wheat).',
    icon: '🛻'
  },
  {
    id: 'medium_bolero',
    nameMr: 'बोलेरो पिकअप (Payload: 50 क्विंटल)',
    nameEn: 'Pick-up Truck / Bolero Maxi (Payload: 50 Quintals)',
    subTypeMr: 'मध्यम पिकअप (बोलेरो)',
    subTypeEn: 'Medium Pickup (Bolero Maxi)',
    categoryTier: 'medium',
    capacityQuintals: 50,
    minPayloadQuintals: 15,
    maxPayloadQuintals: 50,
    costPer100Km: 3850,
    costPerKm: 38.5,
    bestSuitedForMr: 'कोबी, फ्लॉवर किंवा अन्नधान्याची ४० मानकी पोती.',
    bestSuitedForEn: 'Bulky vegetables (cabbage, cauliflower) or up to 40 bags of foodgrain.',
    icon: '🚚'
  },
  {
    id: 'medium_tractor',
    nameMr: 'ट्रॅक्टर ट्रॉली (Payload: 100 क्विंटल)',
    nameEn: 'Double-Axle Tractor Trolley (Payload: 100 Quintals)',
    subTypeMr: 'शेती ट्रॅक्टर ट्रॉली',
    subTypeEn: 'Agricultural Tractor Trolley',
    categoryTier: 'medium',
    capacityQuintals: 100,
    minPayloadQuintals: 35,
    maxPayloadQuintals: 100,
    costPer100Km: 4750,
    costPerKm: 47.5,
    bestSuitedForMr: 'ग्रामीण रस्त्यांवरून सुट्टा किंवा पोत्यांमधील जड माल, कांदा व धान्य.',
    bestSuitedForEn: 'Loose or bagged heavy produce over rural roads; excellent for grains & potatoes.',
    icon: '🚜'
  },
  {
    id: 'large_truck_6w',
    nameMr: '६-चाकी ट्रक / आयशर (Payload: 150 क्विंटल)',
    nameEn: '6-Wheeler Commercial Truck (Payload: 150 Quintals)',
    subTypeMr: 'मोठा ६-चाकी ट्रक',
    subTypeEn: '6-Wheeler Medium Truck',
    categoryTier: 'large',
    capacityQuintals: 150,
    minPayloadQuintals: 75,
    maxPayloadQuintals: 150,
    costPer100Km: 8000,
    costPerKm: 80,
    bestSuitedForMr: 'मोठ्या प्रमाणातील धान्य (गहू, हरभरा) व कांद्याची ठोक वाहतूक.',
    bestSuitedForEn: 'Large-scale grain transport (wheat, pulses) or bulk storable vegetables (onion).',
    icon: '🚛'
  },
  {
    id: 'large_trailer_10w',
    nameMr: '१०/१२-चाकी बल्क ट्रक (Payload: 200 क्विंटल)',
    nameEn: '10/12-Wheeler Heavy Bulk Truck (Payload: 200 Quintals)',
    subTypeMr: 'भारी बल्क ट्रान्सपोर्टर',
    subTypeEn: 'Heavy Bulk Transporter',
    categoryTier: 'large',
    capacityQuintals: 200,
    minPayloadQuintals: 150,
    maxPayloadQuintals: 200,
    costPer100Km: 12500,
    costPerKm: 125,
    bestSuitedForMr: '२०० क्विंटलपेक्षा जास्त मोठ्या धान्याची दूरवरच्या बाजार समित्यांमध्ये ठोक वाहतूक.',
    bestSuitedForEn: 'Bulk long-distance grain transport exceeding 150-200 quintals.',
    icon: '🚛💨'
  }
];

export const CAPACITY_TIERS = [
  { id: 'small', labelMr: 'लहान वाहन (Small)', labelEn: 'Small (15 Q)', maxCap: 15, icon: '🛻' },
  { id: 'medium', labelMr: 'मध्यम वाहन (Medium)', labelEn: 'Medium (50-100 Q)', maxCap: 100, icon: '🚜' },
  { id: 'large', labelMr: 'मोठा बल्क ट्रक (Large)', labelEn: 'Large (150-200 Q)', maxCap: 200, icon: '🚛' }
];

export function getRecommendedVehicle(totalQuantityQuintals: number): VehicleOption {
  if (totalQuantityQuintals <= 10) return VEHICLE_OPTIONS[0]; // 3-Wheeler Auto
  if (totalQuantityQuintals <= 20) return VEHICLE_OPTIONS[1]; // Tata Ace
  if (totalQuantityQuintals <= 60) return VEHICLE_OPTIONS[2]; // Bolero Pickup
  if (totalQuantityQuintals <= 110) return VEHICLE_OPTIONS[3]; // Tractor Trolley
  if (totalQuantityQuintals <= 160) return VEHICLE_OPTIONS[4]; // 6-Wheeler Truck
  return VEHICLE_OPTIONS[5]; // 10-Wheeler Container
}

export function calculateFreight({
  distanceKm,
  totalQuantityQuintals,
  vehicle
}: {
  distanceKm: number;
  totalQuantityQuintals: number;
  vehicle: VehicleOption;
}) {
  if (distanceKm <= 0) {
    return {
      freightPerQuintal: 0,
      totalFreightCost: 0,
      tripsNeeded: 1,
      costPerTrip: 0,
      distanceKm: 0
    };
  }

  const tripsNeeded = Math.max(1, Math.ceil(totalQuantityQuintals / Math.max(1, vehicle.capacityQuintals)));
  const costPerTrip = Math.round(distanceKm * vehicle.costPerKm);
  const totalFreightCost = Math.round(tripsNeeded * costPerTrip);
  const freightPerQuintal = Math.round(totalFreightCost / Math.max(1, totalQuantityQuintals));

  return {
    freightPerQuintal,
    totalFreightCost,
    tripsNeeded,
    costPerTrip,
    distanceKm
  };
}
