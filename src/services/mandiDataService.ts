import {
  fetchAgmarknetRecords,
  APMC_LIST,
  CROP_LIST,
  type DailyMandiPriceRecord
} from '../data/agmarknetDataset';

export type MandiDataFetchStatus = 'SUCCESS' | 'INSUFFICIENT_DATA' | 'NO_DATA';

export interface MandiCropDataResult {
  apmcId: string;
  cropId: string;
  apmcNameEn: string;
  cropNameEn: string;
  status: MandiDataFetchStatus;
  records: DailyMandiPriceRecord[];
  lastUpdated: string;
  recordCount: number;
}

const CACHE_KEY_PREFIX = 'KISAN_SAARTHI_MANDI_CACHE_V5_';

export class MandiDataService {
  /**
   * Fetches cached or fresh Agmarknet mandi data for a specific APMC and Crop combination.
   * Prevents live external network hammering on every render by maintaining a 24-hour cache.
   */
  public static getMandiCropData(apmcId: string, cropId: string): MandiCropDataResult {
    const apmcInfo = APMC_LIST.find((a) => a.id === apmcId.toLowerCase()) || APMC_LIST[0];
    const cropInfo = CROP_LIST.find((c) => c.id === cropId.toLowerCase()) || CROP_LIST[0];

    const cacheKey = `${CACHE_KEY_PREFIX}${apmcId.toLowerCase()}_${cropId.toLowerCase()}`;

    try {
      // 1. Check local storage cache
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        const cacheAge = Date.now() - parsed.timestamp;
        // 12 hour cache validity
        if (cacheAge < 12 * 60 * 60 * 1000 && Array.isArray(parsed.records)) {
          return MandiDataService.buildResult(apmcInfo, cropInfo, parsed.records, parsed.lastUpdated);
        }
      }
    } catch (e) {
      console.warn(`[MandiDataService] Cache read failure for ${apmcId}:${cropId}`, e);
    }

    // 2. Fetch fresh dataset
    try {
      const records = fetchAgmarknetRecords(apmcId, cropId);
      const lastUpdated = records.length > 0 ? records[records.length - 1].date : new Date().toISOString().split('T')[0];

      // Save to cache
      try {
        localStorage.setItem(
          cacheKey,
          JSON.stringify({
            timestamp: Date.now(),
            lastUpdated,
            records
          })
        );
      } catch {
        // Storage quota exceeded fallback
      }

      return MandiDataService.buildResult(apmcInfo, cropInfo, records, lastUpdated);
    } catch (err) {
      console.error(`[MandiDataService] Failed to load mandi prices for ${apmcId} x ${cropId}:`, err);
      return {
        apmcId: apmcInfo.id,
        cropId: cropInfo.id,
        apmcNameEn: apmcInfo.nameEn,
        cropNameEn: cropInfo.nameEn,
        status: 'NO_DATA',
        records: [],
        lastUpdated: new Date().toISOString().split('T')[0],
        recordCount: 0
      };
    }
  }

  private static buildResult(
    apmcInfo: typeof APMC_LIST[0],
    cropInfo: typeof CROP_LIST[0],
    records: DailyMandiPriceRecord[],
    lastUpdated: string
  ): MandiCropDataResult {
    let status: MandiDataFetchStatus = 'SUCCESS';

    if (!records || records.length === 0) {
      status = 'NO_DATA';
    } else if (records.length < 30) {
      // Requirements specified minimum ~30 days of trade history for credible forecasting
      status = 'INSUFFICIENT_DATA';
    }

    return {
      apmcId: apmcInfo.id,
      cropId: cropInfo.id,
      apmcNameEn: apmcInfo.nameEn,
      cropNameEn: cropInfo.nameEn,
      status,
      records,
      lastUpdated,
      recordCount: records.length
    };
  }
}
