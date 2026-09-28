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
// Đối chiếu dữ liệu chính xác:
// - Chủ nhật 27/09/2026: Trực chính: Thanh Vân, Trực phụ: Trần Lê
// - Thứ 2    28/09/2026: Trực chính: An Nhơn,  Trực phụ: Thanh Huyền
// - Thứ 3    29/09/2026: Trực chính: Trần Lê,   Trực phụ: Thanh Vân
// - Thứ 4    30/09/2026: Trực chính: Thùy Trang, Trực phụ: Nhiêu Huy
export const OFFICIAL_SECRETARY_SCHEDULE: DailySecretaryRoster[] = [
  {
    date: '2026-09-21',
    dayOfWeek: 'Thứ hai',
    mainSecretary: 'thuytrang',
    mainSecretaryName: 'Thùy Trang',
    subSecretary: 'tranle',
    subSecretaryName: 'Trần Lê',
  },
  {
    date: '2026-09-22',
    dayOfWeek: 'Thứ ba',
    mainSecretary: 'annhon',
    mainSecretaryName: 'An Nhơn',
    subSecretary: 'thanhhuyen',
    subSecretaryName: 'Thanh Huyền',
  },
  {
    date: '2026-09-23',
    dayOfWeek: 'Thứ tư',
    mainSecretary: 'thuytrang',
    mainSecretaryName: 'Thùy Trang',
    subSecretary: 'annhon',
    subSecretaryName: 'An Nhơn',
  },
  {
    date: '2026-09-24',
    dayOfWeek: 'Thứ năm',
    mainSecretary: 'thanhvan',
    mainSecretaryName: 'Thanh Vân',
    subSecretary: 'thanhhuyen',
    subSecretaryName: 'Thanh Huyền',
  },
  {
    date: '2026-09-25',
    dayOfWeek: 'Thứ sáu',
    mainSecretary: 'thanhvan',
    mainSecretaryName: 'Thanh Vân',
    subSecretary: 'annhon',
    subSecretaryName: 'An Nhơn',
  },
  {
    date: '2026-09-26',
    dayOfWeek: 'Thứ bảy',
    mainSecretary: 'annhon',
    mainSecretaryName: 'An Nhơn',
    subSecretary: 'thanhhuyen',
    subSecretaryName: 'Thanh Huyền',
  },
  {
    date: '2026-09-27',
    dayOfWeek: 'Chủ nhật',
    mainSecretary: 'thanhvan',
    mainSecretaryName: 'Thanh Vân',
    subSecretary: 'tranle',
    subSecretaryName: 'Trần Lê',
  },
  {
    date: '2026-09-28',
    dayOfWeek: 'Thứ hai',
    mainSecretary: 'annhon',
    mainSecretaryName: 'An Nhơn',
    subSecretary: 'thanhhuyen',
    subSecretaryName: 'Thanh Huyền',
  },
  {
    date: '2026-09-29',
    dayOfWeek: 'Thứ ba',
    mainSecretary: 'tranle',
    mainSecretaryName: 'Trần Lê',
    subSecretary: 'thanhvan',
    subSecretaryName: 'Thanh Vân',
  },
  {
    date: '2026-09-30',
    dayOfWeek: 'Thứ tư',
    mainSecretary: 'thuytrang',
    mainSecretaryName: 'Thùy Trang',
    subSecretary: 'nhieuhuy',
    subSecretaryName: 'Nhiêu Huy',
  },
];

const STORAGE_KEY_CUSTOM_SCHEDULE = 'vne_roster_custom_table_v4';
const STORAGE_KEY_SHEET_URL = 'vne_roster_google_sheet_url_v4';

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
  const customList = getCustomScheduleList();
  const found = customList.find((r) => r.date === dateStr);
  if (found) return found;

  const predefined = OFFICIAL_SECRETARY_SCHEDULE.find((r) => r.date === dateStr);
  if (predefined) return predefined;

  // Fallback pattern
  const parts = dateStr.split('-');
  const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  const dayIndex = isNaN(d.getDay()) ? 0 : d.getDay();
  const dayOfWeekNames = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];

  // Cycle based on real staff
  const cycle = [
    { main: 'thanhvan', mainName: 'Thanh Vân', sub: 'tranle', subName: 'Trần Lê' },           // 0: Chủ nhật (27/09)
    { main: 'annhon', mainName: 'An Nhơn', sub: 'thanhhuyen', subName: 'Thanh Huyền' },       // 1: Thứ hai  (28/09)
    { main: 'tranle', mainName: 'Trần Lê', sub: 'thanhvan', subName: 'Thanh Vân' },           // 2: Thứ ba   (29/09)
    { main: 'thuytrang', mainName: 'Thùy Trang', sub: 'nhieuhuy', subName: 'Nhiêu Huy' },       // 3: Thứ tư   (30/09)
    { main: 'annhon', mainName: 'An Nhơn', sub: 'thanhhuyen', subName: 'Thanh Huyền' },       // 4: Thứ năm
    { main: 'thanhvan', mainName: 'Thanh Vân', sub: 'annhon', subName: 'An Nhơn' },           // 5: Thứ sáu
    { main: 'thuytrang', mainName: 'Thùy Trang', sub: 'tranle', subName: 'Trần Lê' },         // 6: Thứ bảy
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
 * Helper to parse Google Sheets CSV.
 * Columns:
 * Cột A (index 0): Thứ (Thứ 2, Thứ 3...)
 * Cột B (index 1): Ngày (DD/MM/YYYY)
 * Cột C (index 2): Trực chính (VnExpress)
 * Cột D (index 3): Trực phụ (Site khác)
 * (Bỏ qua cột Điều hành nếu có ở Cột E hoặc cột khác)
 */
export function parseRosterCsv(csvText: string): DailySecretaryRoster[] {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const result: DailySecretaryRoster[] = [];

  for (const line of lines) {
    // Parse CSV line taking care of quotes
    const cols = parseCsvLine(line);
    if (cols.length >= 4) {
      // Find date in col 0 or 1
      let rawDate = cols[1];
      let dayOfWeek = cols[0];
      let colMain = cols[2];
      let colSub = cols[3];

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

function isDateString(str: string): boolean {
  if (!str) return false;
  return str.includes('/') || (str.includes('-') && str.length === 10);
}

function convertToYmd(rawDate: string): string {
  if (!rawDate) return '';
  const clean = rawDate.replace(/^["']|["']$/g, '').trim();
  if (clean.includes('/')) {
    const parts = clean.split('/');
    if (parts.length === 3) {
      const d = parts[0].padStart(2, '0');
      const m = parts[1].padStart(2, '0');
      let y = parts[2];
      if (y.length === 2) y = '20' + y;
      return `${y}-${m}-${d}`;
    }
  }
  if (clean.includes('-') && clean.length === 10) {
    return clean;
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
