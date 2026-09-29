import { SiteTrafficRow, EngagementGroup, StoryItem, EditorialComment, SecretaryProfile } from '../types';
import {
  MOCK_TRAFFIC_DATA_23_09,
  MOCK_ENGAGEMENT_GROUPS_23_09,
  MOCK_STORIES,
} from '../data/mockData';
import { generateDataForDateRange } from '../data/dateDataGenerator';
import {
  getRosterForDate,
  findSecretaryByAny,
  SECRETARIES,
  getMainSecretaryProfile,
  getSubSecretaryProfile,
} from './secretaryRosterService';

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
  defaultComment?: EditorialComment;
  defaultComments?: EditorialComment[];
  dutySecretary?: SecretaryProfile;
  subSecretary?: SecretaryProfile;
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

export const getYesterdayYmd = (): string => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export function getSavedApiConfig(): ApiConfig {
  const defaultYesterday = getYesterdayYmd();
  const saved = localStorage.getItem(STORAGE_KEY_CONFIG);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      return {
        appId: parsed.appId || DEFAULT_APP_ID,
        appSig: parsed.appSig || DEFAULT_APP_SIG,
        useLiveApi: parsed.useLiveApi !== undefined ? parsed.useLiveApi : true,
        selectedDate: parsed.selectedDate || defaultYesterday,
        fromDate: parsed.fromDate || parsed.selectedDate || defaultYesterday,
        toDate: parsed.toDate || parsed.selectedDate || defaultYesterday,
      };
    } catch {
      // fallback
    }
  }
  return {
    appId: DEFAULT_APP_ID,
    appSig: DEFAULT_APP_SIG,
    useLiveApi: true, // Default to true so API is actually called with fromdate-todate
    selectedDate: defaultYesterday,
    fromDate: defaultYesterday,
    toDate: defaultYesterday,
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

// Format number into Vietnamese style with K, M or decimal commas according to Rule.md
export function formatMetricNumber(num: number): string {
  if (num >= 1_000_000) {
    const val = (num / 1_000_000).toFixed(1).replace('.', ',');
    return `${val}M`;
  }
  if (num >= 1_000) {
    const val = (num / 1_000).toFixed(1).replace('.', ',');
    return `${val}K`;
  }
  return num.toLocaleString('vi-VN');
}

export function formatSignedPercent(val: number | null): string {
  if (val === null || val === undefined) return '-';
  const sign = val > 0 ? '+' : '';
  return `${sign}${val.toFixed(1).replace('.', ',')}%`;
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

  // Synchronized: Khi chọn 1 ngày thì toàn bộ các box (kể cả Đề tài quan trọng) đều lấy theo ngày đó
  const effectiveStoryFrom = config.storyFromDate || fromDate;
  const effectiveStoryTo = config.storyToDate || toDate;

  const dateTs = toTimestampGmt7(fromDate);
  const currentAppId = appId || DEFAULT_APP_ID;
  const currentAppSig = appSig || DEFAULT_APP_SIG;
  const sigParam = `&app_sig=${encodeURIComponent(currentAppSig)}`;

  // API 1: getListStoryImportant (Đồng bộ theo ngày đang chọn)
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
    currentAppId
  )}${sigParam}&fromdate=${encodeURIComponent(fromDate)}&todate=${encodeURIComponent(
    toDate
  )}&date=${dateTs}`;

  const analyticsUrlProxy = `/api/vne-editor/api/subject.php?module=subjectcontent&method=getAnalyticsNhanXet&site_id=1000000&app_id=${encodeURIComponent(
    currentAppId
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

// Fast In-Memory Cache for editorial data by date range
const editorialDataCache = new Map<string, ApiFetchResult>();

// Returns immediate dataset synchronously (0ms latency) for any requested date
export function getImmediateEditorialData(config: Partial<ApiConfig>): ApiFetchResult {
  const fromDate = config.fromDate || config.selectedDate || '2026-09-25';
  const toDate = config.toDate || config.selectedDate || '2026-09-25';
  const cacheKey = `${fromDate}_${toDate}_${config.appId || DEFAULT_APP_ID}`;

  if (editorialDataCache.has(cacheKey) && editorialDataCache.get(cacheKey)!.isLive) {
    return editorialDataCache.get(cacheKey)!;
  }

  const dateSpecificDataset = generateDataForDateRange(fromDate, toDate);
  const urls = buildApiUrls({
    appId: config.appId || DEFAULT_APP_ID,
    appSig: config.appSig || DEFAULT_APP_SIG,
    fromDate,
    toDate,
  });

  const dutyRoster = getRosterForDate(fromDate);
  const result: ApiFetchResult = {
    trafficData: dateSpecificDataset.trafficData,
    engagementGroups: dateSpecificDataset.engagementGroups,
    stories: dateSpecificDataset.stories.filter((s) => String(s.important) === '1'),
    isLive: false,
    activeFromDate: fromDate,
    activeToDate: toDate,
    storyDate: urls.effectiveStoryFrom,
    defaultComment: dateSpecificDataset.comment,
    defaultComments: dateSpecificDataset.comments || (dateSpecificDataset.comment ? [dateSpecificDataset.comment] : undefined),
    dutySecretary: getMainSecretaryProfile(dutyRoster),
    subSecretary: getSubSecretaryProfile(dutyRoster),
    calledUrls: {
      storyUrl: urls.storyUrlDirect,
      analyticsUrl: urls.analyticsUrlDirect,
      engageUrl: urls.engageUrlDirect,
    },
  };

  editorialDataCache.set(cacheKey, result);
  return result;
}

// Fetch with automatic fallback between proxy and direct with resilient timeout (5000ms)
async function fetchWithFallback(directUrl: string, proxyUrl: string, timeoutMs = 5000): Promise<any> {
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

  // Try both proxy and direct URL concurrently; resolve as soon as either succeeds
  try {
    return await Promise.any([tryFetch(proxyUrl), tryFetch(directUrl)]);
  } catch {
    // If concurrent attempt fails, try directUrl once more as fallback
    return await tryFetch(directUrl);
  }
}

export async function fetchEditorialData(config: ApiConfig, forceRefresh = false): Promise<ApiFetchResult> {
  const fromDate = config.fromDate || config.selectedDate || '2026-09-25';
  const toDate = config.toDate || config.selectedDate || '2026-09-25';
  const cacheKey = `${fromDate}_${toDate}_${config.appId || DEFAULT_APP_ID}`;

  // If already cached and not force refreshing, return instantly
  if (!forceRefresh && editorialDataCache.has(cacheKey) && editorialDataCache.get(cacheKey)!.isLive) {
    return editorialDataCache.get(cacheKey)!;
  }

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

  // Base date-specific data generated for this specific date range
  const dateSpecificDataset = generateDataForDateRange(fromDate, toDate);

  // Synchronized date: Tất cả các box (Traffic, Nhóm bài, Đề tài quan trọng, Nhận xét) đều lấy theo đúng ngày đã chọn
  const effectiveStoryFrom = urls.effectiveStoryFrom;
  const effectiveStoryTo = urls.effectiveStoryTo;
  const storyDataset = dateSpecificDataset;

  if (!config.useLiveApi) {
    const dutyRoster = getRosterForDate(fromDate);
    const fallbackResult: ApiFetchResult = {
      trafficData: dateSpecificDataset.trafficData,
      engagementGroups: dateSpecificDataset.engagementGroups,
      stories: storyDataset.stories.filter((s) => String(s.important) === '1'),
      isLive: false,
      activeFromDate: fromDate,
      activeToDate: toDate,
      storyDate: effectiveStoryFrom,
      defaultComment: dateSpecificDataset.comment,
      defaultComments: dateSpecificDataset.comments,
      dutySecretary: getMainSecretaryProfile(dutyRoster),
      subSecretary: getSubSecretaryProfile(dutyRoster),
      calledUrls,
    };
    editorialDataCache.set(cacheKey, fallbackResult);
    return fallbackResult;
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
    let extractedApiComment: EditorialComment | undefined = undefined;
    const dutyRoster = getRosterForDate(fromDate);
    let extractedDutySecretary: SecretaryProfile = getMainSecretaryProfile(dutyRoster);
    let extractedSubSecretary: SecretaryProfile = getSubSecretaryProfile(dutyRoster);

    if (storyRes.status === 'fulfilled' && storyRes.value) {
      const apiBody = storyRes.value?.body || storyRes.value?.data || storyRes.value;
      const rawStories =
        storyRes.value?.body?.storires ||
        storyRes.value?.body?.stories ||
        storyRes.value?.data?.stories ||
        storyRes.value?.data ||
        apiBody?.stories;

      // Extract "nhanxet" or "nhan_xet" from the API response
      // "Lấy đúng dữ liệu từ tham số nhanxet theo tham số thời gian fromdate & todate tương ứng"
      const rawNhanXet =
        apiBody?.nhanxet ||
        apiBody?.nhan_xet ||
        storyRes.value?.nhanxet ||
        storyRes.value?.nhan_xet ||
        storyRes.value?.body?.nhanxet ||
        storyRes.value?.body?.nhan_xet ||
        storyRes.value?.data?.nhanxet ||
        storyRes.value?.data?.nhan_xet ||
        (rawStories && !Array.isArray(rawStories) ? (rawStories.nhanxet || rawStories.nhan_xet) : null);

      if (rawNhanXet) {
        let commentHtml = '';
        let commentTitle = `Nhận xét Thư ký trực ngày ${fromDate}`;
        let author = dutyRoster.mainSecretary;
        let updatedAt = '07:49';

        // Extract author from API response: rawNhanXet string/object or apiBody
        let detectedAuthor = '';
        if (typeof rawNhanXet === 'string') {
          try {
            const parsed = JSON.parse(rawNhanXet);
            if (parsed.author) detectedAuthor = String(parsed.author);
            else if (parsed.user_name) detectedAuthor = String(parsed.user_name);
            else if (parsed.fullname) detectedAuthor = String(parsed.fullname);
            else if (parsed.author_name) detectedAuthor = String(parsed.author_name);
          } catch {
            const authorM = rawNhanXet.match(/"author"\s*:\s*"([^"]+)"/i) ||
                            rawNhanXet.match(/"user_name"\s*:\s*"([^"]+)"/i) ||
                            rawNhanXet.match(/"fullname"\s*:\s*"([^"]+)"/i) ||
                            rawNhanXet.match(/"author_name"\s*:\s*"([^"]+)"/i);
            if (authorM) detectedAuthor = authorM[1].trim();
          }
        } else if (typeof rawNhanXet === 'object' && rawNhanXet !== null) {
          detectedAuthor = rawNhanXet.author || rawNhanXet.user_name || rawNhanXet.fullname || rawNhanXet.author_name || '';
        }

        if (!detectedAuthor && apiBody) {
          detectedAuthor = apiBody.author || apiBody.user_name || apiBody.duty_secretary || '';
        }

        if (detectedAuthor) {
          const cleanDet = detectedAuthor.trim().toLowerCase();
          const recognizedSec = SECRETARIES.find(
            (s) =>
              s.id.toLowerCase() === cleanDet ||
              s.username.toLowerCase() === cleanDet ||
              s.name.toLowerCase() === cleanDet
          );
          if (recognizedSec) {
            author = recognizedSec.username;
          }
        }

        // Helper to strip JSON fragments like {"subject_id":"...", "comments":" ... "}
        const cleanRawEditorialText = (input: string): string => {
          let str = input.trim();

          // 1. Try parsing full JSON if the entire string is valid JSON object
          if (str.startsWith('{') && str.endsWith('}')) {
            try {
              const parsed = JSON.parse(str);
              if (parsed.comments !== undefined) return String(parsed.comments);
              if (parsed.nhanxet !== undefined) return String(parsed.nhanxet);
              if (parsed.content !== undefined) return String(parsed.content);
            } catch {}
          }

          // 2. Remove JSON prefix such as: {"subject_id":"...", ..., "comments":"
          str = str.replace(/^{\s*"subject_id"[\s\S]*?"comments"\s*:\s*"/i, '');
          str = str.replace(/^{\s*"subject_id"[\s\S]*?"nhanxet"\s*:\s*"/i, '');
          // Remove any single-line JSON header if present at top
          str = str.replace(/^{"subject_id"[^}\n]*"comments":"/i, '');

          // 3. Remove JSON suffix such as: ","status":"1", ... "user_need":"0"}
          str = str.replace(/"\s*,\s*"status"[\s\S]*$/i, '');
          str = str.replace(/"\s*,\s*"author_id"[\s\S]*$/i, '');
          str = str.replace(/"\s*}\s*$/i, '');

          // 4. Handle escaped newlines, quotes or tabs
          str = str.replace(/\\r\\n/g, '\n').replace(/\\n/g, '\n').replace(/\\t/g, ' ').replace(/\\"/g, '"');

          return str.trim();
        };

        if (typeof rawNhanXet === 'string') {
          const cleanedText = cleanRawEditorialText(rawNhanXet);

          // If cleaned content already has rich HTML tags
          if (cleanedText.includes('<p') || cleanedText.includes('<ul') || cleanedText.includes('<li') || cleanedText.includes('<br')) {
            commentHtml = cleanedText;
          } else {
            // Convert newline-separated text into structured paragraphs
            const paragraphs = cleanedText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
            commentHtml = paragraphs
              .map((line) => {
                if (line.startsWith('-') || line.startsWith('•')) {
                  return `<p class="leading-relaxed pl-1">${line}</p>`;
                }
                if (line.toLowerCase().startsWith('tổng quan:') || line.toLowerCase().startsWith('có ') || line.toLowerCase().startsWith('lưu ý')) {
                  return `<p class="font-medium text-slate-900 mt-2 mb-1.5 leading-relaxed">${line}</p>`;
                }
                return `<p class="text-slate-800 leading-relaxed mb-1">${line}</p>`;
              })
              .join('');
          }
        } else if (typeof rawNhanXet === 'object') {
          // If object or array
          if (Array.isArray(rawNhanXet)) {
            commentHtml = rawNhanXet
              .map((item: any) => {
                const text = typeof item === 'string' ? cleanRawEditorialText(item) : cleanRawEditorialText(item.comments || item.content || item.comment || item.nhanxet || JSON.stringify(item));
                return `<p class="leading-relaxed">${text}</p>`;
              })
              .join('');
          } else {
            const rawInner = rawNhanXet.comments !== undefined ? rawNhanXet.comments : (rawNhanXet.nhanxet !== undefined ? rawNhanXet.nhanxet : (rawNhanXet.content || rawNhanXet.html || rawNhanXet.text || rawNhanXet.comment));
            const cleanedInner = typeof rawInner === 'string' ? cleanRawEditorialText(rawInner) : cleanRawEditorialText(JSON.stringify(rawNhanXet));

            if (cleanedInner.includes('<p') || cleanedInner.includes('<ul') || cleanedInner.includes('<li')) {
              commentHtml = cleanedInner;
            } else {
              commentHtml = cleanedInner
                .split(/\r?\n/)
                .map((l) => l.trim())
                .filter(Boolean)
                .map((line) => {
                  if (line.startsWith('-') || line.startsWith('•')) {
                    return `<p class="leading-relaxed pl-1">${line}</p>`;
                  }
                  return `<p class="font-medium text-slate-900 mb-1 leading-relaxed">${line}</p>`;
                })
                .join('');
            }

            if (rawNhanXet.title) commentTitle = rawNhanXet.title;
            if (rawNhanXet.author) author = rawNhanXet.author;
            if (rawNhanXet.updated_at || rawNhanXet.time) updatedAt = rawNhanXet.updated_at || rawNhanXet.time;
          }
        }

        if (commentHtml.trim()) {
          extractedApiComment = {
            id: `cm-api-${fromDate}`,
            author,
            role: 'Thư ký trực BBT',
            dateStr: fromDate,
            updatedAt,
            summaryTitle: commentTitle,
            htmlContent: commentHtml,
          };
        }
      }

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
          nhan_xet: item.nhan_xet || item.comment || '',
          comment: item.nhan_xet || item.comment || '',
        }));
        storySuccess = true;
      }
    }

// Helper to safely extract metrics & comparisons from VnExpress analytics endpoints
function extractMetric(
  curItem: any,
  weekAgoItem: any,
  valueField: 'total_user' | 'total_pageview' | 'num'
): { value: number; changeVsYesterday: number | null; changeVsLastWeek: number | null } {
  // 1. Current value
  let val = 0;
  if (curItem?.filter?.[valueField] !== undefined) val = Number(curItem.filter[valueField]);
  else if (curItem?.[valueField] !== undefined) val = Number(curItem[valueField]);
  else if (curItem?.num !== undefined && valueField === 'num') val = Number(curItem.num);
  else if (curItem?.value !== undefined) val = Number(curItem.value);

  // 2. Change vs Yesterday
  let yestChange: number | null = null;
  if (typeof curItem?.compare === 'number') {
    yestChange = curItem.compare;
  } else if (typeof curItem?.compare_percent === 'number') {
    yestChange = curItem.compare_percent;
  } else if (typeof curItem?.percent === 'number') {
    yestChange = curItem.percent;
  } else if (typeof curItem?.rate === 'number') {
    yestChange = curItem.rate;
  } else if (typeof curItem?.compare === 'string' && curItem.compare.trim()) {
    const parsed = parseFloat(curItem.compare.replace('%', '').replace(',', '.'));
    if (!isNaN(parsed)) yestChange = parsed;
  } else if (curItem?.compare_result !== undefined) {
    let prevVal: number | null = null;
    if (typeof curItem.compare_result === 'number') prevVal = curItem.compare_result;
    else if (curItem.compare_result?.[valueField] !== undefined) prevVal = Number(curItem.compare_result[valueField]);
    else if (curItem.compare_result?.num !== undefined && valueField === 'num') prevVal = Number(curItem.compare_result.num);

    if (prevVal && prevVal > 0) {
      yestChange = Number((((val - prevVal) / prevVal) * 100).toFixed(1));
    }
  }

  // 3. Change vs Last Week
  let lwChange: number | null = null;
  if (typeof weekAgoItem?.compare === 'number') {
    lwChange = weekAgoItem.compare;
  } else if (typeof weekAgoItem?.compare_percent === 'number') {
    lwChange = weekAgoItem.compare_percent;
  } else if (typeof weekAgoItem?.percent === 'number') {
    lwChange = weekAgoItem.percent;
  } else if (typeof weekAgoItem?.rate === 'number') {
    lwChange = weekAgoItem.rate;
  } else if (typeof curItem?.compare_7_ago === 'number') {
    lwChange = curItem.compare_7_ago;
  } else if (typeof weekAgoItem?.compare === 'string' && weekAgoItem.compare.trim()) {
    const parsed = parseFloat(weekAgoItem.compare.replace('%', '').replace(',', '.'));
    if (!isNaN(parsed)) lwChange = parsed;
  } else {
    let weekAgoVal: number | null = null;
    if (weekAgoItem?.filter?.[valueField] !== undefined) weekAgoVal = Number(weekAgoItem.filter[valueField]);
    else if (weekAgoItem?.[valueField] !== undefined) weekAgoVal = Number(weekAgoItem[valueField]);
    else if (weekAgoItem?.num !== undefined && valueField === 'num') weekAgoVal = Number(weekAgoItem.num);
    else if (typeof weekAgoItem === 'number') weekAgoVal = weekAgoItem;

    if (weekAgoVal && weekAgoVal > 0) {
      lwChange = Number((((val - weekAgoVal) / weekAgoVal) * 100).toFixed(1));
    }
  }

  return { value: val, changeVsYesterday: yestChange, changeVsLastWeek: lwChange };
}

    let parsedTraffic: SiteTrafficRow[] = dateSpecificDataset.trafficData;
    let analyticsSuccess = false;

    if (analyticsRes.status === 'fulfilled' && analyticsRes.value) {
      const data = analyticsRes.value?.data || analyticsRes.value?.body?.data || analyticsRes.value;
      if (data && typeof data === 'object') {
        const siteNames: Record<string, string> = {
          '-1': 'VnExpress',
          '1000000': 'VnExpress',
          '1002835': 'Ngôi Sao',
          '1003888': 'English',
          '1006614': 'Tia Sáng',
        };

        const siteOrder = ['-1', '1000000', '1002835', '1003888', '1006614'];

        const siteRows: SiteTrafficRow[] = Object.entries(data)
          .filter(([key]) => key in siteNames || !isNaN(Number(key)))
          .map(([sId, item]: [string, any]) => {
            const u = item.info_user_yesterday;
            const p = item.info_pvs_yesterday;
            const n = item.info_num_published;
            const u7 = item.info_user_7_ago;
            const p7 = item.info_pvs_7_ago;
            const n7 = item.info_num_published_7_ago;

            const userM = extractMetric(u, u7, 'total_user');
            const pvsM = extractMetric(p, p7, 'total_pageview');
            const artM = extractMetric(n, n7, 'num');

            return {
              id: sId as any,
              name: siteNames[sId] || `Site ${sId}`,
              users: {
                value: userM.value,
                formattedValue: formatMetricNumber(userM.value),
                changeVsYesterday: userM.changeVsYesterday,
                changeVsLastWeek: userM.changeVsLastWeek,
              },
              pageviews: {
                value: pvsM.value,
                formattedValue: formatMetricNumber(pvsM.value),
                changeVsYesterday: pvsM.changeVsYesterday,
                changeVsLastWeek: pvsM.changeVsLastWeek,
              },
              articles: {
                value: artM.value,
                formattedValue: String(artM.value),
                changeVsYesterday: artM.changeVsYesterday,
                changeVsLastWeek: artM.changeVsLastWeek,
              },
            };
          });

        const sortedSiteRows = siteRows.sort((a, b) => {
          const idxA = siteOrder.indexOf(String(a.id));
          const idxB = siteOrder.indexOf(String(b.id));
          return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
        });

        if (sortedSiteRows.length > 0) {
          const totalUsers = sortedSiteRows.reduce((acc, r) => acc + r.users.value, 0);
          const totalPvs = sortedSiteRows.reduce((acc, r) => acc + r.pageviews.value, 0);
          const totalArts = sortedSiteRows.reduce((acc, r) => acc + r.articles.value, 0);

          let sumUsersYest = 0;
          let sumUsers7 = 0;
          let sumPvsYest = 0;
          let sumPvs7 = 0;
          let sumArtsYest = 0;
          let sumArts7 = 0;

          sortedSiteRows.forEach((r) => {
            const uY = r.users.changeVsYesterday !== null ? r.users.value / (1 + r.users.changeVsYesterday / 100) : r.users.value;
            const u7 = r.users.changeVsLastWeek !== null ? r.users.value / (1 + r.users.changeVsLastWeek / 100) : r.users.value;
            const pY = r.pageviews.changeVsYesterday !== null ? r.pageviews.value / (1 + r.pageviews.changeVsYesterday / 100) : r.pageviews.value;
            const p7 = r.pageviews.changeVsLastWeek !== null ? r.pageviews.value / (1 + r.pageviews.changeVsLastWeek / 100) : r.pageviews.value;
            const aY = r.articles.changeVsYesterday !== null ? r.articles.value / (1 + r.articles.changeVsYesterday / 100) : r.articles.value;
            const a7 = r.articles.changeVsLastWeek !== null ? r.articles.value / (1 + r.articles.changeVsLastWeek / 100) : r.articles.value;

            sumUsersYest += uY;
            sumUsers7 += u7;
            sumPvsYest += pY;
            sumPvs7 += p7;
            sumArtsYest += aY;
            sumArts7 += a7;
          });

          const allRow: SiteTrafficRow = {
            id: 'all',
            name: 'All Sites',
            isTotal: true,
            users: {
              value: totalUsers,
              formattedValue: formatMetricNumber(totalUsers),
              changeVsYesterday: sumUsersYest > 0 ? Number((((totalUsers - sumUsersYest) / sumUsersYest) * 100).toFixed(1)) : null,
              changeVsLastWeek: sumUsers7 > 0 ? Number((((totalUsers - sumUsers7) / sumUsers7) * 100).toFixed(1)) : null,
            },
            pageviews: {
              value: totalPvs,
              formattedValue: formatMetricNumber(totalPvs),
              changeVsYesterday: sumPvsYest > 0 ? Number((((totalPvs - sumPvsYest) / sumPvsYest) * 100).toFixed(1)) : null,
              changeVsLastWeek: sumPvs7 > 0 ? Number((((totalPvs - sumPvs7) / sumPvs7) * 100).toFixed(1)) : null,
            },
            articles: {
              value: totalArts,
              formattedValue: String(totalArts),
              changeVsYesterday: sumArtsYest > 0 ? Number((((totalArts - sumArtsYest) / sumArtsYest) * 100).toFixed(1)) : null,
              changeVsLastWeek: sumArts7 > 0 ? Number((((totalArts - sumArts7) / sumArts7) * 100).toFixed(1)) : null,
            },
          };

          parsedTraffic = [allRow, ...sortedSiteRows];
          analyticsSuccess = true;
        }
      }
    }

    let parsedEngage: EngagementGroup[] = dateSpecificDataset.engagementGroups;
    let engageSuccess = false;

    if (engageRes.status === 'fulfilled' && engageRes.value) {
      const val =
        engageRes.value?.data?.data ||
        engageRes.value?.data ||
        engageRes.value?.body?.data ||
        engageRes.value?.body ||
        engageRes.value;
      const targetTs = urls.dateTs;
      const prevDate = getPreviousDateString(fromDate);
      const d7 = new Date(toTimestampGmt7(fromDate) * 1000 - 7 * 86400 * 1000);
      const weekAgoDate = `${d7.getFullYear()}-${String(d7.getMonth() + 1).padStart(2, '0')}-${String(d7.getDate()).padStart(2, '0')}`;

      const isDateMatch = (v: any, targetYmd: string): boolean => {
        if (v === null || v === undefined) return false;
        const targetParts = targetYmd.split('-');
        if (targetParts.length !== 3) return false;
        const tY = parseInt(targetParts[0], 10);
        const tM = parseInt(targetParts[1], 10);
        const tD = parseInt(targetParts[2], 10);

        const s = String(v).trim();
        if (s === targetYmd) return true;
        if (s === `${tD}/${tM}/${tY}` || s === `${String(tD).padStart(2, '0')}/${String(tM).padStart(2, '0')}/${tY}`) return true;
        if (s === `${tD}-${tM}-${tY}` || s === `${String(tD).padStart(2, '0')}-${String(tM).padStart(2, '0')}-${tY}`) return true;
        if (s === `${tY}${String(tM).padStart(2, '0')}${String(tD).padStart(2, '0')}`) return true;
        if (s === `${String(tD).padStart(2, '0')}/${String(tM).padStart(2, '0')}` || s === `${tD}/${tM}`) return true;

        const num = typeof v === 'number' ? v : (parseFloat(s) > 100000000 ? parseFloat(s) : NaN);
        if (!isNaN(num)) {
          const ms = num > 1e11 ? num : num * 1000;
          const gmt7 = new Date(ms + 7 * 3600 * 1000);
          if (gmt7.getUTCFullYear() === tY && gmt7.getUTCMonth() + 1 === tM && gmt7.getUTCDate() === tD) {
            return true;
          }
        }
        return false;
      };

      const isGroupItem = (item: any): boolean => {
        if (!item || typeof item !== 'object') return false;
        const name = String(item.name || item.title || item.label || item.group_name || item.id || '').toLowerCase();
        return (
          name.includes('hiệu quả') || name.includes('hieu qua') || name.includes('effective') ||
          name.includes('views') || name.includes('view') ||
          name.includes('tương tác') || name.includes('tuong tac') || name.includes('engage') ||
          name.includes('cân nhắc') || name.includes('can nhac') || name.includes('consider') ||
          item.id === 1 || item.id === 2 || item.id === 3 || item.id === 4 ||
          item.group_id === 1 || item.group_id === 2 || item.group_id === 3 || item.group_id === 4
        );
      };

      // Helper to check if an object directly contains engagement group keys
      const hasDirectGroupKeys = (obj: any): boolean => {
        if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return false;
        return (
          'Hiệu quả cao' in obj ||
          'HIỆU QUẢ CAO' in obj ||
          'hieu_qua_cao' in obj ||
          'hieuqua' in obj ||
          'hieu_qua' in obj ||
          'Views cao' in obj ||
          'VIEWS CAO' in obj ||
          'views_cao' in obj ||
          'Tương tác tốt' in obj ||
          'TƯƠNG TÁC TỐT' in obj ||
          'tuong_tac_tot' in obj ||
          'Cân nhắc' in obj ||
          'CÂN NHẮC' in obj ||
          'can_nhac' in obj ||
          'groups' in obj ||
          'items' in obj ||
          ('1' in obj && '2' in obj)
        );
      };

      // Handle nested site_id object (e.g. val['-1'] or val['1000000'])
      const siteVal = (val && typeof val === 'object' && !Array.isArray(val) && (val['-1'] || val['1000000'])) ? (val['-1'] || val['1000000']) : val;

      const findDayObj = (source: any, ts: number, ymd: string) => {
        if (!source || typeof source !== 'object') return null;
        if (Array.isArray(source)) {
          if (source.some(isGroupItem)) {
            return { items: source };
          }
          return source.find((item: any) =>
            isDateMatch(item?.date || item?.timestamp || item?.time || item?.date_str || item?.day, ymd)
          );
        }
        if (hasDirectGroupKeys(source)) {
          return source;
        }
        // Match keys of object by date
        for (const [key, valItem] of Object.entries(source)) {
          if (isDateMatch(key, ymd)) return valItem;
          if (valItem && typeof valItem === 'object' && isDateMatch((valItem as any)?.date || (valItem as any)?.timestamp, ymd)) {
            return valItem;
          }
        }
        return null;
      };

      let curDay = findDayObj(siteVal, targetTs, fromDate);
      if (!curDay && siteVal && typeof siteVal === 'object') {
        if (Array.isArray(siteVal) && siteVal.some(isGroupItem)) {
          curDay = { items: siteVal };
        } else if (hasDirectGroupKeys(siteVal)) {
          curDay = siteVal;
        }
      }

      const prevDay = findDayObj(siteVal, targetTs - 86400, prevDate);
      const weekAgo = findDayObj(siteVal, targetTs - 604800, weekAgoDate);

      if (curDay) {
        const parseNum = (v: any): number => {
          if (v === null || v === undefined) return 0;
          if (typeof v === 'number') return isNaN(v) ? 0 : v;
          if (typeof v === 'string') {
            const clean = v.replace(/[^0-9.-]/g, '');
            const parsed = parseFloat(clean);
            return isNaN(parsed) ? 0 : parsed;
          }
          return 0;
        };

        const parsePct = (v: any): number | null => {
          if (v === null || v === undefined) return null;
          if (typeof v === 'number') return isNaN(v) ? null : v;
          if (typeof v === 'string') {
            const clean = v.replace('%', '').replace(',', '.').trim();
            const parsed = parseFloat(clean);
            return isNaN(parsed) ? null : parsed;
          }
          return null;
        };

        const getGroupMetrics = (names: string[]) => {
          let g: any = null;
          const itemsArr = curDay.items || curDay.groups || curDay.data || (Array.isArray(curDay) ? curDay : null);
          if (Array.isArray(itemsArr)) {
            g = itemsArr.find((item: any) => {
              const itemNames = [
                item?.name,
                item?.title,
                item?.label,
                item?.group_name,
                item?.group_title,
                item?.id,
                item?.group_id,
                item?.type,
                item?.key,
              ].filter(Boolean).map(v => String(v).trim().toLowerCase());

              return names.some(n => {
                const nl = n.toLowerCase();
                return itemNames.some(inm => inm === nl || inm.includes(nl));
              });
            });
          }
          if (!g) {
            for (const n of names) {
              if (curDay[n] !== undefined) {
                g = curDay[n];
                break;
              }
            }
          }
          g = g || {};

          let prevG: any = null;
          if (prevDay) {
            const pItems = prevDay.items || prevDay.groups || prevDay.data;
            if (Array.isArray(pItems)) {
              prevG = pItems.find((item: any) => {
                const itemNames = [item?.name, item?.title, item?.label, item?.id, item?.key].filter(Boolean).map(v => String(v).trim().toLowerCase());
                return names.some(n => itemNames.some(inm => inm === n.toLowerCase() || inm.includes(n.toLowerCase())));
              });
            }
            if (!prevG) {
              for (const n of names) {
                if (prevDay[n] !== undefined) {
                  prevG = prevDay[n];
                  break;
                }
              }
            }
          }

          let weekG: any = null;
          if (weekAgo) {
            const wItems = weekAgo.items || weekAgo.groups || weekAgo.data;
            if (Array.isArray(wItems)) {
              weekG = wItems.find((item: any) => {
                const itemNames = [item?.name, item?.title, item?.label, item?.id, item?.key].filter(Boolean).map(v => String(v).trim().toLowerCase());
                return names.some(n => itemNames.some(inm => inm === n.toLowerCase() || inm.includes(n.toLowerCase())));
              });
            }
            if (!weekG) {
              for (const n of names) {
                if (weekAgo[n] !== undefined) {
                  weekG = weekAgo[n];
                  break;
                }
              }
            }
          }

          const count = parseNum(
            g.count ??
            g.article ??
            g.articles ??
            g.num_article ??
            g.num_articles ??
            g.article_count ??
            g.num ??
            g.sl_bai ??
            g.total_article ??
            g.total_articles ??
            g.total_num ??
            g.total ??
            g.num_published ??
            g.info_num_published ??
            g.value ??
            g.quantity
          );

          const pv = parseNum(
            g.pageview ??
            g.pageviews ??
            g.pvs ??
            g.total_pageview ??
            g.total_pageviews ??
            g.total_pvs ??
            g.views ??
            g.total_views ??
            g.pv ??
            g.view ??
            g.total_view
          );

          const apiArtShare = parsePct(
            g.rate_article ??
            g.percent_article ??
            g.article_rate ??
            g.article_percent ??
            g.share_article ??
            g.art_rate ??
            g.rate_num ??
            g.percent_num
          );

          const apiPvShare = parsePct(
            g.rate_pageview ??
            g.percent_pageview ??
            g.pageview_rate ??
            g.pageview_percent ??
            g.share_pageview ??
            g.pv_rate
          );

          let yestChange = parsePct(
            g.compare_yesterday ??
            g.change_yesterday ??
            g.rate_yesterday ??
            g.diff_yesterday ??
            g.compare?.yesterday ??
            g.compare?.pvs?.yesterday ??
            g.compare_pvs_yesterday ??
            g.yesterday?.compare ??
            g.compare
          );
          if (yestChange === null && prevG) {
            const prevPv = parseNum(prevG.pageview ?? prevG.pvs ?? prevG.views);
            if (prevPv > 0) {
              yestChange = Math.round(((pv - prevPv) / prevPv) * 100);
            }
          }

          let lwChange = parsePct(
            g.compare_lastweek ??
            g.change_lastweek ??
            g.rate_lastweek ??
            g.diff_lastweek ??
            g.compare?.last_week ??
            g.compare?.lastweek ??
            g.compare?.pvs?.last_week ??
            g.compare_pvs_lastweek ??
            g.lastweek?.compare ??
            g.compare_7_ago
          );
          if (lwChange === null && weekG) {
            const weekPv = parseNum(weekG.pageview ?? weekG.pvs ?? weekG.views);
            if (weekPv > 0) {
              lwChange = Math.round(((pv - weekPv) / weekPv) * 100);
            }
          }

          return { count, pv, apiArtShare, apiPvShare, yestChange, lwChange };
        };

        const hq = getGroupMetrics([
          'Hiệu quả cao', 'hiệu quả cao', 'HIỆU QUẢ CAO', 'Hieu qua cao', 'hieu qua cao',
          'hieu_qua_cao', 'hieuquacao', 'hieuqua', 'hieu_qua', 'high_effective', '1', 'hq'
        ]);
        const vc = getGroupMetrics([
          'Views cao', 'views cao', 'VIEWS CAO', 'View cao', 'view cao',
          'views_cao', 'viewscao', 'high_views', 'views', 'view', '2', 'vc'
        ]);
        const tt = getGroupMetrics([
          'Tương tác tốt', 'tương tác tốt', 'TƯƠNG TÁC TỐT', 'Tuong tac tot', 'tuong tac tot',
          'tuong_tac_tot', 'tuongtactot', 'tuongtac', 'tuong_tac', 'high_engage', '3', 'tt'
        ]);
        const cn = getGroupMetrics([
          'Cân nhắc', 'cân nhắc', 'CÂN NHẮC', 'Can nhac', 'can nhac',
          'can_nhac', 'cannhac', 'consider', '4', 'cn', 'other'
        ]);

        const totalEvaluatedArt = (hq.count + vc.count + tt.count + cn.count) || parseNum(curDay.total_article || curDay.total_articles);
        const totalEvaluatedPv = (hq.pv + vc.pv + tt.pv + cn.pv) || parseNum(curDay.total_pageview || curDay.total_pageviews);

        // Only consider engage API successful if real non-zero values were actually found
        if (totalEvaluatedArt > 0 || totalEvaluatedPv > 0) {
          const totArt = totalEvaluatedArt || 1;
          const totPv = totalEvaluatedPv || 1;

          let hqArtPct = hq.apiArtShare !== null ? Math.round(hq.apiArtShare) : Math.round((hq.count / totArt) * 100);
          let vcArtPct = vc.apiArtShare !== null ? Math.round(vc.apiArtShare) : Math.round((vc.count / totArt) * 100);
          let ttArtPct = tt.apiArtShare !== null ? Math.round(tt.apiArtShare) : Math.round((tt.count / totArt) * 100);
          let cnArtPct = cn.apiArtShare !== null ? Math.round(cn.apiArtShare) : Math.max(0, 100 - (hqArtPct + vcArtPct + ttArtPct));

          let hqPvPct = hq.apiPvShare !== null ? Math.round(hq.apiPvShare) : Math.round((hq.pv / totPv) * 100);
          let vcPvPct = vc.apiPvShare !== null ? Math.round(vc.apiPvShare) : Math.round((vc.pv / totPv) * 100);
          let ttPvPct = tt.apiPvShare !== null ? Math.round(tt.apiPvShare) : Math.round((tt.pv / totPv) * 100);
          let cnPvPct = cn.apiPvShare !== null ? Math.round(cn.apiPvShare) : Math.max(0, 100 - (hqPvPct + vcPvPct + ttPvPct));

          parsedEngage = [
            {
              id: 'hieu_qua_cao',
              name: 'HIỆU QUẢ CAO',
              articleCount: hq.count,
              articleSharePct: hqArtPct,
              pageviewCount: hq.pv,
              pageviewFormatted: formatMetricNumber(hq.pv) + ' PV',
              pageviewSharePct: hqPvPct,
              pageviewChangeVsYesterday: hq.yestChange,
              pageviewChangeVsLastWeek: hq.lwChange,
              color: 'emerald',
            },
            {
              id: 'views_cao',
              name: 'VIEWS CAO',
              articleCount: vc.count,
              articleSharePct: vcArtPct,
              pageviewCount: vc.pv,
              pageviewFormatted: formatMetricNumber(vc.pv) + ' PV',
              pageviewSharePct: vcPvPct,
              pageviewChangeVsYesterday: vc.yestChange,
              pageviewChangeVsLastWeek: vc.lwChange,
              color: 'purple',
            },
            {
              id: 'tuong_tac_tot',
              name: 'TƯƠNG TÁC TỐT',
              articleCount: tt.count,
              articleSharePct: ttArtPct,
              pageviewCount: tt.pv,
              pageviewFormatted: formatMetricNumber(tt.pv) + ' PV',
              pageviewSharePct: ttPvPct,
              pageviewChangeVsYesterday: tt.yestChange,
              pageviewChangeVsLastWeek: tt.lwChange,
              color: 'blue',
            },
            {
              id: 'can_nhac',
              name: 'CÂN NHẮC',
              articleCount: cn.count,
              articleSharePct: cnArtPct,
              pageviewCount: cn.pv,
              pageviewFormatted: formatMetricNumber(cn.pv) + ' PV',
              pageviewSharePct: cnPvPct,
              pageviewChangeVsYesterday: cn.yestChange,
              pageviewChangeVsLastWeek: cn.lwChange,
              color: 'amber',
            },
          ];
          engageSuccess = true;
        }
      }
    }

    const isAnyLiveSuccess = storySuccess || analyticsSuccess || engageSuccess;

    const finalResult: ApiFetchResult = {
      trafficData: parsedTraffic,
      engagementGroups: parsedEngage,
      stories: parsedStories,
      isLive: isAnyLiveSuccess,
      activeFromDate: fromDate,
      activeToDate: toDate,
      storyDate: urls.effectiveStoryFrom,
      defaultComment: extractedApiComment || dateSpecificDataset.comment,
      defaultComments: extractedApiComment ? [extractedApiComment] : dateSpecificDataset.comments,
      dutySecretary: extractedDutySecretary,
      subSecretary: extractedSubSecretary,
      calledUrls,
    };
    editorialDataCache.set(cacheKey, finalResult);
    return finalResult;
  } catch (err: any) {
    console.warn('API fetch warning:', err);
    const dutyRoster = getRosterForDate(fromDate);
    const fallbackResult: ApiFetchResult = {
      trafficData: dateSpecificDataset.trafficData,
      engagementGroups: dateSpecificDataset.engagementGroups,
      stories: storyDataset.stories.filter((s) => String(s.important) === '1'),
      isLive: false,
      activeFromDate: fromDate,
      activeToDate: toDate,
      storyDate: effectiveStoryFrom,
      defaultComment: dateSpecificDataset.comment,
      defaultComments: dateSpecificDataset.comments,
      dutySecretary: getMainSecretaryProfile(dutyRoster),
      subSecretary: getSubSecretaryProfile(dutyRoster),
      calledUrls,
      error: err?.message || 'Không thể kết nối trực tiếp API VnExpress. Đang hiển thị dữ liệu theo ngày.',
    };
    editorialDataCache.set(cacheKey, fallbackResult);
    return fallbackResult;
  }
}
