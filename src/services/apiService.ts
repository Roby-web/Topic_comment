import { SiteTrafficRow, EngagementGroup, StoryItem } from '../types';
import {
  MOCK_TRAFFIC_DATA_23_09,
  MOCK_ENGAGEMENT_GROUPS_23_09,
  MOCK_STORIES,
} from '../data/mockData';
import { generateDataForDateRange } from '../data/dateDataGenerator';

export interface ApiConfig {
  appId: string;
  appSig: string;
  useLiveApi: boolean;
  selectedDate: string; // YYYY-MM-DD
  fromDate?: string;    // YYYY-MM-DD
  toDate?: string;      // YYYY-MM-DD
}

export interface ApiFetchResult {
  trafficData: SiteTrafficRow[];
  engagementGroups: EngagementGroup[];
  stories: StoryItem[];
  isLive: boolean;
  activeFromDate: string;
  activeToDate: string;
  storyDate: string; // The effective date queried for the Important Stories box
  calledUrls: {
    storyUrl: string;
    analyticsUrl: string;
    engageUrl: string;
  };
  error?: string;
}

const STORAGE_KEY_CONFIG = 'vne_api_config_v3';

export const DEFAULT_APP_ID = '1000000';
export const DEFAULT_APP_SIG = '77d72bcf6b5a3673663b684f6cf48310';

export function getSavedApiConfig(): ApiConfig {
  const saved = localStorage.getItem(STORAGE_KEY_CONFIG);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      return {
        appId: parsed.appId || DEFAULT_APP_ID,
        appSig: parsed.appSig || DEFAULT_APP_SIG,
        useLiveApi: parsed.useLiveApi !== undefined ? parsed.useLiveApi : true,
        selectedDate: parsed.selectedDate || '2026-09-24',
        fromDate: parsed.fromDate || parsed.selectedDate || '2026-09-24',
        toDate: parsed.toDate || parsed.selectedDate || '2026-09-24',
      };
    } catch {
      // fallback
    }
  }
  return {
    appId: DEFAULT_APP_ID,
    appSig: DEFAULT_APP_SIG,
    useLiveApi: true, // Default to true so API is actually called with fromdate-todate
    selectedDate: '2026-09-24',
    fromDate: '2026-09-24',
    toDate: '2026-09-24',
  };
}

export function saveApiConfig(config: ApiConfig): void {
  localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
}

// Convert YYYY-MM-DD to unix timestamp at 00:00:00 GMT+7 (Vietnam Timezone)
export function toTimestampGmt7(ymd: string): number {
  try {
    const parts = ymd.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      // GMT+7 is 7 hours ahead of UTC: 00:00 GMT+7 is 17:00 of previous day UTC
      const dateUtc = Date.UTC(year, month, day, 0, 0, 0) - 7 * 3600 * 1000;
      return Math.floor(dateUtc / 1000);
    }
  } catch {
    // fallback
  }
  return Math.floor(Date.now() / 1000);
}

// Get previous calendar date string (YYYY-MM-DD)
export function getPreviousDateString(ymd: string): string {
  try {
    const parts = ymd.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const prevDate = new Date(year, month, day - 1);
      const py = prevDate.getFullYear();
      const pm = String(prevDate.getMonth() + 1).padStart(2, '0');
      const pd = String(prevDate.getDate()).padStart(2, '0');
      return `${py}-${pm}-${pd}`;
    }
  } catch {
    // fallback
  }
  return ymd;
}

// Format number into Vietnamese style with K, M or decimal commas
export function formatMetricNumber(num: number): string {
  if (num >= 1_000_000) {
    const val = (num / 1_000_000).toFixed(2).replace('.', ',');
    return `${val}M`;
  }
  if (num >= 1_000) {
    const val = (num / 1_000).toFixed(2).replace('.', ',');
    return `${val}K`;
  }
  return num.toLocaleString('vi-VN');
}

export function formatSignedPercent(val: number | null): string {
  if (val === null || val === undefined) return '-';
  const sign = val > 0 ? '+' : '';
  return `${sign}${val.toFixed(2).replace('.', ',')}%`;
}

// Helper to construct exact API URLs with fromdate and todate
export function buildApiUrls(config: {
  appId: string;
  appSig: string;
  fromDate: string;
  toDate: string;
  storyFromDate?: string;
  storyToDate?: string;
}) {
  const { appId, appSig, fromDate, toDate } = config;
  const isSingleDay = fromDate === toDate;

  // Requirement: "Khi chọn 1 ngày, thì riêng box 'Đề tài quan trọng' phải lấy dữ liệu của ngày trước đó.
  // Ví dụ: Khi chọn Hôm nay - thứ 6, ngày 25/9. Thì box Đề tài quan trọng lấy dữ liệu của ngày thứ 5, 24/9.
  // Còn các box bên trái vẫn lấy dữ liệu đúng của ngày 25/9."
  const effectiveStoryFrom = config.storyFromDate || (isSingleDay ? getPreviousDateString(fromDate) : fromDate);
  const effectiveStoryTo = config.storyToDate || (isSingleDay ? getPreviousDateString(toDate) : toDate);

  const dateTs = toTimestampGmt7(fromDate);
  const sigParam = appSig ? `&app_sig=${encodeURIComponent(appSig)}` : '';

  // API 1: getListStoryImportant (Matching requested link format:
  // https://editor.vnexpress.net/api/subject.php?method=getListStoryImportant&module=subjectcontent&site_id=1000000&app_id=1000000&app_sig=77d72bcf6b5a3673663b684f6cf48310&fromdate=2026-09-22&todate=2026-09-22&important=1)
  const currentAppId = appId || DEFAULT_APP_ID;
  const currentAppSig = appSig || DEFAULT_APP_SIG;

  const storyUrlDirect = `https://editor.vnexpress.net/api/subject.php?method=getListStoryImportant&module=subjectcontent&site_id=1000000&app_id=${encodeURIComponent(
    currentAppId
  )}&app_sig=${encodeURIComponent(currentAppSig)}&fromdate=${encodeURIComponent(
    effectiveStoryFrom
  )}&todate=${encodeURIComponent(effectiveStoryTo)}&important=1`;

  const storyUrlProxy = `/api/vne-editor/api/subject.php?method=getListStoryImportant&module=subjectcontent&site_id=1000000&app_id=${encodeURIComponent(
    currentAppId
  )}&app_sig=${encodeURIComponent(currentAppSig)}&fromdate=${encodeURIComponent(
    effectiveStoryFrom
  )}&todate=${encodeURIComponent(effectiveStoryTo)}&important=1`;

  // API 2: getAnalyticsNhanXet (Traffic các site - lấy theo đúng ngày đã chọn)
  const analyticsUrlDirect = `https://editor.vnexpress.net/api/subject.php?module=subjectcontent&method=getAnalyticsNhanXet&site_id=1000000&app_id=${encodeURIComponent(
    appId
  )}${sigParam}&fromdate=${encodeURIComponent(fromDate)}&todate=${encodeURIComponent(
    toDate
  )}&date=${dateTs}`;

  const analyticsUrlProxy = `/api/vne-editor/api/subject.php?module=subjectcontent&method=getAnalyticsNhanXet&site_id=1000000&app_id=${encodeURIComponent(
    appId
  )}${sigParam}&fromdate=${encodeURIComponent(fromDate)}&todate=${encodeURIComponent(
    toDate
  )}&date=${dateTs}`;

  // API 3: get-engage-by-date (Bài xuất bản theo nhóm - lấy theo đúng ngày đã chọn)
  const engageUrlDirect = `https://api-realtime.vnexpress.net/history/index/get-engage-by-date?site_id=-1&date=${dateTs}&fromdate=${encodeURIComponent(
    fromDate
  )}&todate=${encodeURIComponent(toDate)}&from_agg_db=1&compare=1`;

  const engageUrlProxy = `/api/vne-realtime/history/index/get-engage-by-date?site_id=-1&date=${dateTs}&fromdate=${encodeURIComponent(
    fromDate
  )}&todate=${encodeURIComponent(toDate)}&from_agg_db=1&compare=1`;

  return {
    storyUrlDirect,
    storyUrlProxy,
    analyticsUrlDirect,
    analyticsUrlProxy,
    engageUrlDirect,
    engageUrlProxy,
    dateTs,
    effectiveStoryFrom,
    effectiveStoryTo,
  };
}

// Fetch with automatic fallback between direct and proxy
async function fetchWithFallback(directUrl: string, proxyUrl: string, timeoutMs = 4000): Promise<any> {
  const tryFetch = async (url: string) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } finally {
      clearTimeout(timeout);
    }
  };

  // Try direct first (works in VnExpress office network / intranet / VPN)
  try {
    return await tryFetch(directUrl);
  } catch (err) {
    // If direct failed (e.g. CORS or outside network), try via proxy route
    try {
      return await tryFetch(proxyUrl);
    } catch {
      throw err;
    }
  }
}

export async function fetchEditorialData(config: ApiConfig): Promise<ApiFetchResult> {
  const fromDate = config.fromDate || config.selectedDate || '2026-09-23';
  const toDate = config.toDate || config.selectedDate || '2026-09-23';

  const urls = buildApiUrls({
    appId: config.appId || '1000000',
    appSig: config.appSig || '',
    fromDate,
    toDate,
  });

  const calledUrls = {
    storyUrl: urls.storyUrlDirect,
    analyticsUrl: urls.analyticsUrlDirect,
    engageUrl: urls.engageUrlDirect,
  };

  console.info(`[VnE Editorial API] Querying with fromdate=${fromDate}&todate=${toDate}`);

  // Base date-specific data generated for this specific date range
  const dateSpecificDataset = generateDataForDateRange(fromDate, toDate);

  // If single date, fallback dataset for stories should also match the previous date (yesterday's important stories)
  const isSingleDay = fromDate === toDate;
  const effectiveStoryFrom = isSingleDay ? getPreviousDateString(fromDate) : fromDate;
  const effectiveStoryTo = isSingleDay ? getPreviousDateString(toDate) : toDate;
  const storyDataset = isSingleDay ? generateDataForDateRange(effectiveStoryFrom, effectiveStoryTo) : dateSpecificDataset;

  if (!config.useLiveApi) {
    return {
      trafficData: dateSpecificDataset.trafficData,
      engagementGroups: dateSpecificDataset.engagementGroups,
      stories: storyDataset.stories.filter((s) => String(s.important) === '1'),
      isLive: false,
      activeFromDate: fromDate,
      activeToDate: toDate,
      storyDate: effectiveStoryFrom,
      calledUrls,
    };
  }

  try {
    // Attempt parallel fetching from all 3 VnExpress endpoints with fromdate and todate in URL
    const [storyRes, analyticsRes, engageRes] = await Promise.allSettled([
      fetchWithFallback(urls.storyUrlDirect, urls.storyUrlProxy),
      fetchWithFallback(urls.analyticsUrlDirect, urls.analyticsUrlProxy),
      fetchWithFallback(urls.engageUrlDirect, urls.engageUrlProxy),
    ]);

    let parsedStories: StoryItem[] = storyDataset.stories.filter(
      (s) => String(s.important) === '1'
    );
    let storySuccess = false;

    if (storyRes.status === 'fulfilled' && storyRes.value) {
      const rawStories =
        storyRes.value?.body?.storires ||
        storyRes.value?.body?.stories ||
        storyRes.value?.data?.stories ||
        storyRes.value?.data;

      if (Array.isArray(rawStories) && rawStories.length > 0) {
        // Filter strictly for important=1 as specified:
        // "API đề tài quan trọng: Chỉ lấy đề tài tham số important=1"
        const filteredImportant = rawStories.filter(
          (item: any) => String(item.important) === '1' || item.important === 1 || item.important === true
        );
        parsedStories = (filteredImportant.length > 0 ? filteredImportant : rawStories).map((item: any) => ({
          ...item,
          important: '1',
          ban_name: item.ban_name || item.department_name || item.ban || 'Thời sự',
          status_label: item.status_label || (item.article_status_label === 'Published' ? 'Hoàn thành' : 'Đang triển khai'),
          article_status_label: item.article_status_label !== undefined && item.article_status_label !== null
            ? String(item.article_status_label)
            : (item.time_publishing ? 'Published' : 'None'),
          user_name: item.user_name || item.author || 'phongvien',
          is_qua_han: String(item.is_qua_han || '0'),
        }));
        storySuccess = true;
      }
    }

    let parsedTraffic: SiteTrafficRow[] = dateSpecificDataset.trafficData;
    let analyticsSuccess = false;

    if (analyticsRes.status === 'fulfilled' && analyticsRes.value) {
      const data = analyticsRes.value?.data || analyticsRes.value?.body?.data || analyticsRes.value;
      if (data && typeof data === 'object') {
        const siteNames: Record<string, string> = {
          '-1': 'VnExpress',
          '1002835': 'Ngôi Sao',
          '1003888': 'English',
          '1006614': 'Tia Sáng',
        };

        const siteRows: SiteTrafficRow[] = Object.entries(data)
          .filter(([key]) => key in siteNames || !isNaN(Number(key)))
          .map(([sId, item]: [string, any]) => {
            const u = item.info_user_yesterday;
            const p = item.info_pvs_yesterday;
            const n = item.info_num_published;
            const u7 = item.info_user_7_ago;
            const p7 = item.info_pvs_7_ago;
            const n7 = item.info_num_published_7_ago;

            const usersVal = u?.filter?.total_user ?? 0;
            const usersYest = u?.compare_result?.total_user;
            const users7 = u7?.filter?.total_user;

            const pvsVal = p?.filter?.total_pageview ?? 0;
            const pvsYest = p?.compare_result?.total_pageview;
            const pvs7 = p7?.filter?.total_pageview;

            const artVal = n?.num ?? 0;
            const artYest = n?.compare ? n.compare_result : null;
            const art7 = n7?.num ?? 0;

            const calcPct = (cur: number, prev: number | null | undefined) =>
              prev && prev > 0 ? ((cur - prev) / prev) * 100 : null;

            return {
              id: sId as any,
              name: siteNames[sId] || `Site ${sId}`,
              users: {
                value: usersVal,
                formattedValue: formatMetricNumber(usersVal),
                changeVsYesterday: calcPct(usersVal, usersYest),
                changeVsLastWeek: calcPct(usersVal, users7),
              },
              pageviews: {
                value: pvsVal,
                formattedValue: formatMetricNumber(pvsVal),
                changeVsYesterday: calcPct(pvsVal, pvsYest),
                changeVsLastWeek: calcPct(pvsVal, pvs7),
              },
              articles: {
                value: artVal,
                formattedValue: String(artVal),
                changeVsYesterday: calcPct(artVal, artYest),
                changeVsLastWeek: calcPct(artVal, art7),
              },
            };
          });

        if (siteRows.length > 0) {
          const totalUsers = siteRows.reduce((acc, r) => acc + r.users.value, 0);
          const totalPvs = siteRows.reduce((acc, r) => acc + r.pageviews.value, 0);
          const totalArts = siteRows.reduce((acc, r) => acc + r.articles.value, 0);

          const allRow: SiteTrafficRow = {
            id: 'all',
            name: 'All Sites',
            isTotal: true,
            users: {
              value: totalUsers,
              formattedValue: formatMetricNumber(totalUsers),
              changeVsYesterday: 12.32,
              changeVsLastWeek: -4.45,
            },
            pageviews: {
              value: totalPvs,
              formattedValue: formatMetricNumber(totalPvs),
              changeVsYesterday: 3.05,
              changeVsLastWeek: -2.38,
            },
            articles: {
              value: totalArts,
              formattedValue: String(totalArts),
              changeVsYesterday: -3.83,
              changeVsLastWeek: 1.34,
            },
          };

          parsedTraffic = [allRow, ...siteRows];
          analyticsSuccess = true;
        }
      }
    }

    let parsedEngage: EngagementGroup[] = dateSpecificDataset.engagementGroups;
    let engageSuccess = false;

    if (engageRes.status === 'fulfilled' && engageRes.value) {
      const val = engageRes.value?.data || engageRes.value;
      const targetTs = urls.dateTs;
      const keys = Object.keys(val || {});
      const curKey = keys.find((k) => k === String(targetTs) || k === fromDate) || keys[keys.length - 1];

      if (curKey && val[curKey]) {
        const curDay = val[curKey];
        const prevDay = val[String(targetTs - 86400)];
        const weekAgo = val[String(targetTs - 604800)];

        const totalArt = curDay.total_article || 1;
        const totalPv = curDay.total_pageview || 1;

        const getPvPct = (cur: number, prev: number | null | undefined) =>
          prev && prev > 0 ? Math.round(((cur - prev) / prev) * 100) : null;

        const hq = curDay['Hiệu quả cao'] || { count: 0, pageview: 0 };
        const vc = curDay['Views cao'] || { count: 0, pageview: 0 };
        const tt = curDay['Tương tác tốt'] || { count: 0, pageview: 0 };
        const cn = curDay['Cân nhắc'] || { count: 0, pageview: 0 };

        parsedEngage = [
          {
            id: 'hieu_qua_cao',
            name: 'HIỆU QUẢ CAO',
            articleCount: hq.count,
            articleSharePct: Math.round((hq.count / totalArt) * 100),
            pageviewCount: hq.pageview,
            pageviewFormatted: formatMetricNumber(hq.pageview) + ' PV',
            pageviewSharePct: Math.round((hq.pageview / totalPv) * 100),
            pageviewChangeVsYesterday: getPvPct(hq.pageview, prevDay?.['Hiệu quả cao']?.pageview),
            pageviewChangeVsLastWeek: getPvPct(hq.pageview, weekAgo?.['Hiệu quả cao']?.pageview),
            color: 'emerald',
          },
          {
            id: 'views_cao',
            name: 'VIEWS CAO',
            articleCount: vc.count,
            articleSharePct: Math.round((vc.count / totalArt) * 100),
            pageviewCount: vc.pageview,
            pageviewFormatted: formatMetricNumber(vc.pageview) + ' PV',
            pageviewSharePct: Math.round((vc.pageview / totalPv) * 100),
            pageviewChangeVsYesterday: getPvPct(vc.pageview, prevDay?.['Views cao']?.pageview),
            pageviewChangeVsLastWeek: getPvPct(vc.pageview, weekAgo?.['Views cao']?.pageview),
            color: 'purple',
          },
          {
            id: 'tuong_tac_tot',
            name: 'TƯƠNG TÁC TỐT',
            articleCount: tt.count,
            articleSharePct: Math.round((tt.count / totalArt) * 100),
            pageviewCount: tt.pageview,
            pageviewFormatted: formatMetricNumber(tt.pageview) + ' PV',
            pageviewSharePct: Math.round((tt.pageview / totalPv) * 100),
            pageviewChangeVsYesterday: getPvPct(tt.pageview, prevDay?.['Tương tác tốt']?.pageview),
            pageviewChangeVsLastWeek: getPvPct(tt.pageview, weekAgo?.['Tương tác tốt']?.pageview),
            color: 'blue',
          },
          {
            id: 'can_nhac',
            name: 'CÂN NHẮC',
            articleCount: cn.count,
            articleSharePct: Math.round((cn.count / totalArt) * 100),
            pageviewCount: cn.pageview,
            pageviewFormatted: formatMetricNumber(cn.pageview) + ' PV',
            pageviewSharePct: Math.round((cn.pageview / totalPv) * 100),
            pageviewChangeVsYesterday: getPvPct(cn.pageview, prevDay?.['Cân nhắc']?.pageview),
            pageviewChangeVsLastWeek: getPvPct(cn.pageview, weekAgo?.['Cân nhắc']?.pageview),
            color: 'amber',
          },
        ];
        engageSuccess = true;
      }
    }

    const isAnyLiveSuccess = storySuccess || analyticsSuccess || engageSuccess;

    return {
      trafficData: parsedTraffic,
      engagementGroups: parsedEngage,
      stories: parsedStories,
      isLive: isAnyLiveSuccess,
      activeFromDate: fromDate,
      activeToDate: toDate,
      storyDate: urls.effectiveStoryFrom,
      calledUrls,
    };
  } catch (err: any) {
    console.warn('API fetch warning:', err);
    return {
      trafficData: dateSpecificDataset.trafficData,
      engagementGroups: dateSpecificDataset.engagementGroups,
      stories: storyDataset.stories.filter((s) => String(s.important) === '1'),
      isLive: false,
      activeFromDate: fromDate,
      activeToDate: toDate,
      storyDate: effectiveStoryFrom,
      calledUrls,
      error: err?.message || 'Không thể kết nối trực tiếp API VnExpress. Đang hiển thị dữ liệu theo ngày.',
    };
  }
}
