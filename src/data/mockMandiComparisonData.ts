export interface DateWiseMandiPrice {
  date: string; // YYYY-MM-DD
  formattedDate: string; // e.g. "28 Jul 2026"
  mandiName: string;
  crop: string;
  commodity?: string;
  modalPrice: number;
  minPrice: number;
  maxPrice: number;
  distanceFromKopargaon: number;
  arrivalsQuantity: number; // in quintals
}

export const CROPS = ['Onion', 'Soybean', 'Cotton', 'Sugarcane', 'Pomegranate', 'Wheat', 'Tomato'];
export const MANDIS = ['Kopargaon', 'Rahata', 'Shrirampur', 'Yeola', 'Sangamner', 'Nashik', 'Ahmednagar'];

const MANDI_BASE_OFFSETS: Record<string, number> = {
  Kopargaon: 0,
  Rahata: 70,
  Shrirampur: 15,
  Yeola: 130,
  Sangamner: -40,
  Nashik: 200,
  Ahmednagar: 40
};

const CROP_BASE_PRICES: Record<string, number> = {
  Onion: 1850,
  Soybean: 4620,
  Cotton: 7240,
  Sugarcane: 3150,
  Pomegranate: 8450,
  Wheat: 2480,
  Tomato: 1420
};

// Generate 30 days of historical date-wise comparison dataset
export const generate30DaysMandiComparisonData = (): DateWiseMandiPrice[] => {
  const records: DateWiseMandiPrice[] = [];
  const today = new Date(); // Dynamic today date

  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    const formattedDate = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

    // Sunday simulated holiday (no data on Sundays)
    const isSunday = d.getDay() === 0;

    CROPS.forEach((crop) => {
      const base = CROP_BASE_PRICES[crop] || 1800;

      MANDIS.forEach((mandi) => {
        if (isSunday && (mandi === 'Yeola' || mandi === 'Sangamner')) {
          // Simulate closed mandi on Sunday
          return;
        }

        const mandiOffset = MANDI_BASE_OFFSETS[mandi] || 0;
        const trendSignal = Math.sin((30 - i) * 0.4) * 45;
        const dayNoise = ((i * 7 + mandi.length * 3) % 15) - 7;
        const modal = Math.round(base + mandiOffset + trendSignal + dayNoise);

        const spread = Math.round(150 + ((modal * 0.04)));
        const minPrice = modal - spread;
        const maxPrice = modal + spread + 30;

        const distance = mandi === 'Kopargaon' ? 0 : mandi === 'Rahata' ? 14 : mandi === 'Shrirampur' ? 22 : mandi === 'Yeola' ? 28 : mandi === 'Sangamner' ? 38 : mandi === 'Nashik' ? 85 : 95;
        const arrivals = Math.round(1800 + Math.cos(i * 0.3 + mandi.length) * 500);

        records.push({
          date: dateStr,
          formattedDate,
          mandiName: mandi,
          crop,
          commodity: crop,
          modalPrice: modal,
          minPrice,
          maxPrice,
          distanceFromKopargaon: distance,
          arrivalsQuantity: arrivals
        });
      });
    });
  }

  return records;
};

export const MOCK_DATEWISE_COMPARISON_DATA = generate30DaysMandiComparisonData();
