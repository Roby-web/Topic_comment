// Roster mapping from "Lịch chính thức" sheet:
// Columns: Ngày, Thứ, Trực chính (VnExpress), Trực phụ (Ngôi sao, English, Tia sáng)

export interface DailySecretaryRoster {
  date: string; // YYYY-MM-DD
  dayOfWeek: string; // Thứ hai, Thứ ba...
  mainSecretary: string; // Trực chính (VnExpress)
  subSecretary: string;  // Trực phụ (Ngôi sao, English, Tia sáng)
  mainSecretaryName?: string;
  subSecretaryName?: string;
}

// Default roster based on official editorial schedule
export const OFFICIAL_SECRETARY_SCHEDULE: DailySecretaryRoster[] = [
  {
    date: '2026-09-21',
    dayOfWeek: 'Thứ hai',
    mainSecretary: 'thuytrang',
    mainSecretaryName: 'Thùy Trang',
    subSecretary: 'minhtri',
    subSecretaryName: 'Minh Trí',
  },
  {
    date: '2026-09-22',
    dayOfWeek: 'Thứ ba',
    mainSecretary: 'annhon',
    mainSecretaryName: 'An Nhơn',
    subSecretary: 'hoanganh',
    subSecretaryName: 'Hoàng Anh',
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
    mainSecretary: 'hoanganh',
    mainSecretaryName: 'Hoàng Anh',
    subSecretary: 'thuytrang',
    subSecretaryName: 'Thùy Trang',
  },
  {
    date: '2026-09-25',
    dayOfWeek: 'Thứ sáu',
    mainSecretary: 'minhtri',
    mainSecretaryName: 'Minh Trí',
    subSecretary: 'annhon',
    subSecretaryName: 'An Nhơn',
  },
  {
    date: '2026-09-26',
    dayOfWeek: 'Thứ bảy',
    mainSecretary: 'annhon',
    mainSecretaryName: 'An Nhơn',
    subSecretary: 'hoanganh',
    subSecretaryName: 'Hoàng Anh',
  },
  {
    date: '2026-09-27',
    dayOfWeek: 'Chủ nhật',
    mainSecretary: 'thuytrang',
    mainSecretaryName: 'Thùy Trang',
    subSecretary: 'minhtri',
    subSecretaryName: 'Minh Trí',
  },
  {
    date: '2026-09-28',
    dayOfWeek: 'Thứ hai',
    mainSecretary: 'hoanganh',
    mainSecretaryName: 'Hoàng Anh',
    subSecretary: 'thuytrang',
    subSecretaryName: 'Thùy Trang',
  },
  {
    date: '2026-09-29',
    dayOfWeek: 'Thứ ba',
    mainSecretary: 'annhon',
    mainSecretaryName: 'An Nhơn',
    subSecretary: 'minhtri',
    subSecretaryName: 'Minh Trí',
  },
  {
    date: '2026-09-30',
    dayOfWeek: 'Thứ tư',
    mainSecretary: 'minhtri',
    mainSecretaryName: 'Minh Trí',
    subSecretary: 'hoanganh',
    subSecretaryName: 'Hoàng Anh',
  },
];

const STORAGE_KEY_ROSTER = 'vne_secretary_roster_schedule_v1';

export function getRosterForDate(dateStr: string): DailySecretaryRoster {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_ROSTER);
    if (saved) {
      const parsed: DailySecretaryRoster[] = JSON.parse(saved);
      const found = parsed.find((r) => r.date === dateStr);
      if (found) return found;
    }
  } catch {}

  const predefined = OFFICIAL_SECRETARY_SCHEDULE.find((r) => r.date === dateStr);
  if (predefined) return predefined;

  // Fallback calculation based on day of week
  const parts = dateStr.split('-');
  const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  const dayIndex = isNaN(d.getDay()) ? 0 : d.getDay();
  const dayOfWeekNames = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];

  const cycle = [
    { main: 'thuytrang', mainName: 'Thùy Trang', sub: 'minhtri', subName: 'Minh Trí' },
    { main: 'hoanganh', mainName: 'Hoàng Anh', sub: 'thuytrang', subName: 'Thùy Trang' },
    { main: 'annhon', mainName: 'An Nhơn', sub: 'hoanganh', subName: 'Hoàng Anh' },
    { main: 'thuytrang', mainName: 'Thùy Trang', sub: 'annhon', subName: 'An Nhơn' },
    { main: 'hoanganh', mainName: 'Hoàng Anh', sub: 'thuytrang', subName: 'Thùy Trang' },
    { main: 'minhtri', mainName: 'Minh Trí', sub: 'annhon', subName: 'An Nhơn' },
    { main: 'annhon', mainName: 'An Nhơn', sub: 'hoanganh', subName: 'Hoàng Anh' },
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

export function saveCustomRoster(rosterList: DailySecretaryRoster[]): void {
  localStorage.setItem(STORAGE_KEY_ROSTER, JSON.stringify(rosterList));
}
