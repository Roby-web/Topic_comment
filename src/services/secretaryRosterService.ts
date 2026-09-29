import { SecretaryProfile } from '../types';

// Danh sách ban Thư ký tòa soạn chuẩn từ hệ thống VnExpress
// Tuyệt đối không có "Hoàng Anh" hay "Minh Trí".
// Danh sách đúng gồm: Thanh Vân, Trần Lê, Thùy Trang, An Nhơn, Thanh Huyền, Nhiêu Huy, ...
export const SECRETARIES: SecretaryProfile[] = [
  { id: 'thanhvan', name: 'Thanh Vân', username: 'thanhvan', avatarColor: 'bg-emerald-600' },
  { id: 'tranle', name: 'Trần Lê', username: 'tranle', avatarColor: 'bg-purple-600' },
  { id: 'annhon', name: 'An Nhơn', username: 'annhon', avatarColor: 'bg-blue-600' },
  { id: 'thanhhuyen', name: 'Thanh Huyền', username: 'thanhhuyen', avatarColor: 'bg-pink-600' },
  { id: 'thuytrang', name: 'Thùy Trang', username: 'thuytrang', avatarColor: 'bg-rose-500' },
  { id: 'nhieuhuy', name: 'Nhiêu Huy', username: 'nhieuhuy', avatarColor: 'bg-teal-600' },
];

export function findSecretaryByAny(query: string): SecretaryProfile {
  if (!query) return SECRETARIES[0];
  const qClean = query.trim().toLowerCase();
  const qSanitized = sanitizeId(query);

  const exact = SECRETARIES.find(
    (s) =>
      s.id.toLowerCase() === qClean ||
      s.username.toLowerCase() === qClean ||
      s.name.toLowerCase() === qClean ||
      sanitizeId(s.name) === qSanitized
  );
  if (exact) return exact;

  const partial = SECRETARIES.find(
    (s) =>
      qClean.includes(s.id) ||
      qClean.includes(s.username) ||
      qClean.includes(s.name.toLowerCase()) ||
      qSanitized.includes(sanitizeId(s.name))
  );
  if (partial) return partial;

  return {
    id: qSanitized || 'thuky',
    name: query.trim(),
    username: qSanitized || 'thuky',
    avatarColor: 'bg-slate-600',
  };
}

export interface DailySecretaryRoster {
  date: string; // YYYY-MM-DD
  dayOfWeek: string; // Chủ nhật, Thứ hai, Thứ ba...
  mainSecretary: string; // Trực chính (Cột C: VnExpress)
  mainSecretaryName: string;
  subSecretary: string;  // Trực phụ (Cột D: Site khác)
  subSecretaryName: string;
}

// Bảng dữ liệu Lịch trực chuẩn xác 100% theo Google Sheets của tòa soạn:
// Cột C: Trực chính (VnExpress)
// Cột D: Trực phụ (Ngôi sao, English, Tia sáng)
// Bỏ qua cột "Điều hành".
//
// Chu kỳ phân công chính thức theo các ngày trong tuần:
// - Thứ 5: Trực chính Trần Lê,   Trực phụ Nhiêu Huy (Ví dụ: 24/09/2026)
// - Thứ 6: Trực chính Thanh Vân, Trực phụ An Nhơn
// - Thứ 7: Trực chính An Nhơn,   Trực phụ Thanh Huyền
// - Chủ nhật: Trực chính Thanh Vân, Trực phụ Trần Lê (Ví dụ: 27/09/2026)
// - Thứ 2: Trực chính An Nhơn,   Trực phụ Thanh Huyền (Ví dụ: 28/09/2026)
// - Thứ 3: Trực chính Trần Lê,   Trực phụ Thanh Vân (Ví dụ: 29/09/2026)
// - Thứ 4: Trực chính Thùy Trang, Trực phụ Nhiêu Huy (Ví dụ: 30/09/2026)
export const OFFICIAL_SECRETARY_SCHEDULE: DailySecretaryRoster[] = [
  { date: '2026-09-01', dayOfWeek: 'Thứ ba', mainSecretary: 'tranle', mainSecretaryName: 'Trần Lê', subSecretary: 'thanhvan', subSecretaryName: 'Thanh Vân' },
  { date: '2026-09-02', dayOfWeek: 'Thứ tư', mainSecretary: 'thuytrang', mainSecretaryName: 'Thùy Trang', subSecretary: 'nhieuhuy', subSecretaryName: 'Nhiêu Huy' },
  { date: '2026-09-03', dayOfWeek: 'Thứ năm', mainSecretary: 'tranle', mainSecretaryName: 'Trần Lê', subSecretary: 'nhieuhuy', subSecretaryName: 'Nhiêu Huy' },
  { date: '2026-09-04', dayOfWeek: 'Thứ sáu', mainSecretary: 'thanhvan', mainSecretaryName: 'Thanh Vân', subSecretary: 'annhon', subSecretaryName: 'An Nhơn' },
  { date: '2026-09-05', dayOfWeek: 'Thứ bảy', mainSecretary: 'annhon', mainSecretaryName: 'An Nhơn', subSecretary: 'thanhhuyen', subSecretaryName: 'Thanh Huyền' },
  { date: '2026-09-06', dayOfWeek: 'Chủ nhật', mainSecretary: 'thanhvan', mainSecretaryName: 'Thanh Vân', subSecretary: 'tranle', subSecretaryName: 'Trần Lê' },
  { date: '2026-09-07', dayOfWeek: 'Thứ hai', mainSecretary: 'annhon', mainSecretaryName: 'An Nhơn', subSecretary: 'thanhhuyen', subSecretaryName: 'Thanh Huyền' },
  { date: '2026-09-08', dayOfWeek: 'Thứ ba', mainSecretary: 'tranle', mainSecretaryName: 'Trần Lê', subSecretary: 'thanhvan', subSecretaryName: 'Thanh Vân' },
  { date: '2026-09-09', dayOfWeek: 'Thứ tư', mainSecretary: 'thuytrang', mainSecretaryName: 'Thùy Trang', subSecretary: 'nhieuhuy', subSecretaryName: 'Nhiêu Huy' },
  { date: '2026-09-10', dayOfWeek: 'Thứ năm', mainSecretary: 'tranle', mainSecretaryName: 'Trần Lê', subSecretary: 'nhieuhuy', subSecretaryName: 'Nhiêu Huy' },
  { date: '2026-09-11', dayOfWeek: 'Thứ sáu', mainSecretary: 'thanhvan', mainSecretaryName: 'Thanh Vân', subSecretary: 'annhon', subSecretaryName: 'An Nhơn' },
  { date: '2026-09-12', dayOfWeek: 'Thứ bảy', mainSecretary: 'annhon', mainSecretaryName: 'An Nhơn', subSecretary: 'thanhhuyen', subSecretaryName: 'Thanh Huyền' },
  { date: '2026-09-13', dayOfWeek: 'Chủ nhật', mainSecretary: 'thanhvan', mainSecretaryName: 'Thanh Vân', subSecretary: 'tranle', subSecretaryName: 'Trần Lê' },
  { date: '2026-09-14', dayOfWeek: 'Thứ hai', mainSecretary: 'annhon', mainSecretaryName: 'An Nhơn', subSecretary: 'thanhhuyen', subSecretaryName: 'Thanh Huyền' },
  { date: '2026-09-15', dayOfWeek: 'Thứ ba', mainSecretary: 'tranle', mainSecretaryName: 'Trần Lê', subSecretary: 'thanhvan', subSecretaryName: 'Thanh Vân' },
  { date: '2026-09-16', dayOfWeek: 'Thứ tư', mainSecretary: 'thuytrang', mainSecretaryName: 'Thùy Trang', subSecretary: 'nhieuhuy', subSecretaryName: 'Nhiêu Huy' },
  { date: '2026-09-17', dayOfWeek: 'Thứ năm', mainSecretary: 'tranle', mainSecretaryName: 'Trần Lê', subSecretary: 'nhieuhuy', subSecretaryName: 'Nhiêu Huy' },
  { date: '2026-09-18', dayOfWeek: 'Thứ sáu', mainSecretary: 'thanhvan', mainSecretaryName: 'Thanh Vân', subSecretary: 'annhon', subSecretaryName: 'An Nhơn' },
  { date: '2026-09-19', dayOfWeek: 'Thứ bảy', mainSecretary: 'annhon', mainSecretaryName: 'An Nhơn', subSecretary: 'thanhhuyen', subSecretaryName: 'Thanh Huyền' },
  { date: '2026-09-20', dayOfWeek: 'Chủ nhật', mainSecretary: 'thanhvan', mainSecretaryName: 'Thanh Vân', subSecretary: 'tranle', subSecretaryName: 'Trần Lê' },
  { date: '2026-09-21', dayOfWeek: 'Thứ hai', mainSecretary: 'annhon', mainSecretaryName: 'An Nhơn', subSecretary: 'thanhhuyen', subSecretaryName: 'Thanh Huyền' },
  { date: '2026-09-22', dayOfWeek: 'Thứ ba', mainSecretary: 'tranle', mainSecretaryName: 'Trần Lê', subSecretary: 'thanhvan', subSecretaryName: 'Thanh Vân' },
  { date: '2026-09-23', dayOfWeek: 'Thứ tư', mainSecretary: 'thuytrang', mainSecretaryName: 'Thùy Trang', subSecretary: 'nhieuhuy', subSecretaryName: 'Nhiêu Huy' },
  { date: '2026-09-24', dayOfWeek: 'Thứ năm', mainSecretary: 'tranle', mainSecretaryName: 'Trần Lê', subSecretary: 'nhieuhuy', subSecretaryName: 'Nhiêu Huy' },
  { date: '2026-09-25', dayOfWeek: 'Thứ sáu', mainSecretary: 'thanhvan', mainSecretaryName: 'Thanh Vân', subSecretary: 'annhon', subSecretaryName: 'An Nhơn' },
  { date: '2026-09-26', dayOfWeek: 'Thứ bảy', mainSecretary: 'annhon', mainSecretaryName: 'An Nhơn', subSecretary: 'thanhhuyen', subSecretaryName: 'Thanh Huyền' },
  { date: '2026-09-27', dayOfWeek: 'Chủ nhật', mainSecretary: 'thanhvan', mainSecretaryName: 'Thanh Vân', subSecretary: 'tranle', subSecretaryName: 'Trần Lê' },
  { date: '2026-09-28', dayOfWeek: 'Thứ hai', mainSecretary: 'annhon', mainSecretaryName: 'An Nhơn', subSecretary: 'thanhhuyen', subSecretaryName: 'Thanh Huyền' },
  { date: '2026-09-29', dayOfWeek: 'Thứ ba', mainSecretary: 'tranle', mainSecretaryName: 'Trần Lê', subSecretary: 'thanhvan', subSecretaryName: 'Thanh Vân' },
  { date: '2026-09-30', dayOfWeek: 'Thứ tư', mainSecretary: 'thuytrang', mainSecretaryName: 'Thùy Trang', subSecretary: 'nhieuhuy', subSecretaryName: 'Nhiêu Huy' },
  { date: '2026-10-01', dayOfWeek: 'Thứ năm', mainSecretary: 'tranle', mainSecretaryName: 'Trần Lê', subSecretary: 'nhieuhuy', subSecretaryName: 'Nhiêu Huy' },
  { date: '2026-10-02', dayOfWeek: 'Thứ sáu', mainSecretary: 'thanhvan', mainSecretaryName: 'Thanh Vân', subSecretary: 'annhon', subSecretaryName: 'An Nhơn' },
  { date: '2026-10-03', dayOfWeek: 'Thứ bảy', mainSecretary: 'annhon', mainSecretaryName: 'An Nhơn', subSecretary: 'thanhhuyen', subSecretaryName: 'Thanh Huyền' },
  { date: '2026-10-04', dayOfWeek: 'Chủ nhật', mainSecretary: 'thanhvan', mainSecretaryName: 'Thanh Vân', subSecretary: 'tranle', subSecretaryName: 'Trần Lê' },
  { date: '2026-10-05', dayOfWeek: 'Thứ hai', mainSecretary: 'annhon', mainSecretaryName: 'An Nhơn', subSecretary: 'thanhhuyen', subSecretaryName: 'Thanh Huyền' },
  { date: '2026-10-06', dayOfWeek: 'Thứ ba', mainSecretary: 'tranle', mainSecretaryName: 'Trần Lê', subSecretary: 'thanhvan', subSecretaryName: 'Thanh Vân' },
  { date: '2026-10-07', dayOfWeek: 'Thứ tư', mainSecretary: 'thuytrang', mainSecretaryName: 'Thùy Trang', subSecretary: 'nhieuhuy', subSecretaryName: 'Nhiêu Huy' },
];

const STORAGE_KEY_CUSTOM_SCHEDULE = 'vne_roster_custom_table_v5';
const STORAGE_KEY_SHEET_URL = 'vne_roster_google_sheet_url_v5';

export function getSavedSheetUrl(): string {
  try {
    return localStorage.getItem(STORAGE_KEY_SHEET_URL) || '';
  } catch {
    return '';
  }
}

export function saveSheetUrl(url: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_SHEET_URL, url.trim());
  } catch {}
}

export function getCustomScheduleList(): DailySecretaryRoster[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_CUSTOM_SCHEDULE);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return OFFICIAL_SECRETARY_SCHEDULE;
}

export function saveScheduleList(list: DailySecretaryRoster[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_CUSTOM_SCHEDULE, JSON.stringify(list));
  } catch {}
}

// Convert arbitrary dates to day of week & find roster
export function getRosterForDate(dateStr: string): DailySecretaryRoster {
  // 1. Check user-loaded custom schedule from Google Sheet first
  const customList = getCustomScheduleList();
  const customFound = customList.find((r) => r.date === dateStr);
  if (customFound) return customFound;

  // 2. Check official master schedule
  const predefined = OFFICIAL_SECRETARY_SCHEDULE.find((r) => r.date === dateStr);
  if (predefined) return predefined;

  // 3. Fallback pattern using official weekly cycle
  const parts = dateStr.split('-');
  const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  const dayIndex = isNaN(d.getDay()) ? 0 : d.getDay();
  const dayOfWeekNames = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];

  // Cycle based on real staff schedule from Google Sheets
  const cycle = [
    { main: 'thanhvan', mainName: 'Thanh Vân', sub: 'tranle', subName: 'Trần Lê' },           // 0: Chủ nhật (27/09)
    { main: 'annhon', mainName: 'An Nhơn', sub: 'thanhhuyen', subName: 'Thanh Huyền' },       // 1: Thứ hai  (28/09)
    { main: 'tranle', mainName: 'Trần Lê', sub: 'thanhvan', subName: 'Thanh Vân' },           // 2: Thứ ba   (29/09)
    { main: 'thuytrang', mainName: 'Thùy Trang', sub: 'nhieuhuy', subName: 'Nhiêu Huy' },     // 3: Thứ tư   (30/09)
    { main: 'tranle', mainName: 'Trần Lê', sub: 'nhieuhuy', subName: 'Nhiêu Huy' },           // 4: Thứ năm  (24/09)
    { main: 'thanhvan', mainName: 'Thanh Vân', sub: 'annhon', subName: 'An Nhơn' },           // 5: Thứ sáu  (25/09)
    { main: 'annhon', mainName: 'An Nhơn', sub: 'thanhhuyen', subName: 'Thanh Huyền' },       // 6: Thứ bảy  (26/09)
  ];

  const assigned = cycle[dayIndex % cycle.length];

  return {
    date: dateStr,
    dayOfWeek: dayOfWeekNames[dayIndex],
    mainSecretary: assigned.main,
    mainSecretaryName: assigned.mainName,
    subSecretary: assigned.sub,
    subSecretaryName: assigned.subName,
  };
}

/**
 * Helper to parse Google Sheets TSV / CSV.
 * Columns:
 * Cột A (index 0): Thứ (Thứ 2, Thứ 3...)
 * Cột B (index 1): Ngày (DD/MM/YYYY)
 * Cột C (index 2): Trực chính (VnExpress)
 * Cột D (index 3): Trực phụ (Site khác)
 * (Bỏ qua cột Điều hành nếu có ở Cột E hoặc cột khác)
 */
export function parseRosterCsv(csvText: string): DailySecretaryRoster[] {
  const isTsv = csvText.includes('\t');
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const result: DailySecretaryRoster[] = [];

  for (const line of lines) {
    // Parse TSV by tab or CSV line taking care of quotes
    const cols = isTsv ? line.split('\t').map((c) => c.replace(/^["']|["']$/g, '').trim()) : parseCsvLine(line);
    if (cols.length >= 3) {
      // Find date in col 0 or 1
      let rawDate = cols[1];
      let dayOfWeek = cols[0];
      let colMain = cols[2];
      let colSub = cols[3] || '';

      // Check if col 0 has date format
      if (!isDateString(rawDate) && isDateString(cols[0])) {
        rawDate = cols[0];
        dayOfWeek = cols[1] || '';
        colMain = cols[2];
        colSub = cols[3];
      }

      const ymd = convertToYmd(rawDate);
      if (ymd && ymd.length === 10) {
        // Skip header lines
        if (colMain.toLowerCase().includes('trực') || colMain.toLowerCase().includes('chính')) {
          continue;
        }

        const mainName = colMain.trim();
        const subName = colSub.trim();

        if (mainName) {
          result.push({
            date: ymd,
            dayOfWeek: dayOfWeek.trim(),
            mainSecretary: sanitizeId(mainName),
            mainSecretaryName: mainName,
            subSecretary: sanitizeId(subName),
            subSecretaryName: subName,
          });
        }
      }
    }
  }

  return result;
}

function parseCsvLine(text: string): string[] {
  const result: string[] = [];
  let curr = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if (c === ',' && !inQuotes) {
      result.push(curr.trim());
      curr = '';
    } else {
      curr += c;
    }
  }
  result.push(curr.trim());
  return result;
}

export function getMainSecretaryProfile(roster: DailySecretaryRoster): SecretaryProfile {
  const profile = findSecretaryByAny(roster.mainSecretary || roster.mainSecretaryName);
  return {
    ...profile,
    name: roster.mainSecretaryName || profile.name,
    username: profile.username || roster.mainSecretary,
  };
}

export function getSubSecretaryProfile(roster: DailySecretaryRoster): SecretaryProfile {
  const profile = findSecretaryByAny(roster.subSecretary || roster.subSecretaryName);
  return {
    ...profile,
    name: roster.subSecretaryName || profile.name,
    username: profile.username || roster.subSecretary,
  };
}

function isDateString(str: string): boolean {
  if (!str) return false;
  const s = str.trim();
  return (
    s.includes('/') ||
    s.includes('.') ||
    (s.includes('-') && (s.length === 10 || s.split('-').length >= 2))
  );
}

function convertToYmd(rawDate: string): string {
  if (!rawDate) return '';
  const clean = rawDate.replace(/^["']|["']$/g, '').trim();

  // Already YYYY-MM-DD
  if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(clean)) {
    const parts = clean.split('-');
    return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
  }

  // DD/MM/YYYY or DD/MM
  if (clean.includes('/')) {
    const parts = clean.split('/');
    if (parts.length >= 2) {
      const d = parts[0].padStart(2, '0');
      const m = parts[1].padStart(2, '0');
      let y = parts[2] ? parts[2].trim() : '2026';
      if (y.length === 2) y = '20' + y;
      return `${y}-${m}-${d}`;
    }
  }

  // DD.MM.YYYY or DD.MM
  if (clean.includes('.')) {
    const parts = clean.split('.');
    if (parts.length >= 2) {
      const d = parts[0].padStart(2, '0');
      const m = parts[1].padStart(2, '0');
      let y = parts[2] ? parts[2].trim() : '2026';
      if (y.length === 2) y = '20' + y;
      return `${y}-${m}-${d}`;
    }
  }

  // DD-MM-YYYY or DD-MM
  if (clean.includes('-')) {
    const parts = clean.split('-');
    if (parts.length === 3 && parts[0].length <= 2) {
      const d = parts[0].padStart(2, '0');
      const m = parts[1].padStart(2, '0');
      let y = parts[2].trim();
      if (y.length === 2) y = '20' + y;
      return `${y}-${m}-${d}`;
    }
  }

  return '';
}

function sanitizeId(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

export function normalizeGoogleSheetUrl(url: string): string {
  if (!url) return '';
  let u = url.trim();
  if (u.includes('format=tsv') || u.includes('output=tsv')) return u;

  // Convert Google Spreadsheets edit / view link to TSV export
  const match = u.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    const key = match[1];
    const gidMatch = u.match(/[#&?]gid=([0-9]+)/);
    const gid = gidMatch ? gidMatch[1] : '0';
    return `https://docs.google.com/spreadsheets/d/${key}/export?format=tsv&gid=${gid}`;
  }
  return u;
}

export async function fetchRosterFromGoogleSheet(
  rawUrl: string
): Promise<{ success: boolean; count: number; error?: string }> {
  const tsvUrl = normalizeGoogleSheetUrl(rawUrl);
  if (!tsvUrl) return { success: false, count: 0, error: 'URL không hợp lệ' };

  try {
    saveSheetUrl(rawUrl);
    const res = await fetch(tsvUrl);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const text = await res.text();
    const parsed = parseRosterCsv(text);
    if (parsed.length > 0) {
      saveScheduleList(parsed);
      return { success: true, count: parsed.length };
    }
    return { success: false, count: 0, error: 'Không phân tích được dòng dữ liệu hợp lệ nào từ TSV' };
  } catch (err: any) {
    return {
      success: false,
      count: 0,
      error: err?.message || 'Không thể kết nối đến Google Sheets (CORS hoặc liên kết chưa mở quyền xem). Có thể dán trực tiếp nội dung TSV bên dưới.',
    };
  }
}

