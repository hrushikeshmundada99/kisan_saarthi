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
export const MANDIS = ['Kopargaon', 'Rahata', 'Shrirampur', 'Yeola', 'Lasalgaon', 'Sangamner', 'Nashik', 'Ahilyanagar'];

const MANDI_BASE_OFFSETS: Record<string, number> = {
  Kopargaon: 0,
  Rahata: -150,
  Shrirampur: 20,
  Yeola: 50,
  Lasalgaon: 300,
  Sangamner: -150,
  Nashik: 50,
  Ahilyanagar: 750
};

const CROP_BASE_PRICES: Record<string, number> = {
  Onion: 3950,
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
          return;
        }

        const mandiOffset = MANDI_BASE_OFFSETS[mandi] || 0;
        const dayNoise = Math.sin((i + 1) * 0.7 + mandi.length) * 45;
        const modal = Math.round(base + mandiOffset + dayNoise);

        const spread = Math.round(modal * 0.08);
        const minPrice = modal - spread;
        const maxPrice = modal + spread;

        const distanceMap: Record<string, number> = {
          Kopargaon: 0,
          Rahata: 14,
          Shrirampur: 28,
          Yeola: 32,
          Lasalgaon: 48,
          Sangamner: 42,
          Nashik: 85,
          Ahilyanagar: 95
        };

        const arrivals = Math.round(400 + Math.abs(Math.cos(i * 0.5 + mandi.length) * 1800));

        records.push({
          date: dateStr,
          formattedDate,
          mandiName: mandi,
          crop,
          commodity: crop,
          modalPrice: modal,
          minPrice,
          maxPrice,
          distanceFromKopargaon: distanceMap[mandi] || 50,
          arrivalsQuantity: arrivals
        });
      });
    });
  }

  return records;
};

export const DATEWISE_COMPARISON_DATA = generate30DaysMandiComparisonData();
