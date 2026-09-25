import { SiteTrafficRow, EngagementGroup, StoryItem, EditorialComment } from '../types';
import {
  MOCK_TRAFFIC_DATA_23_09,
  MOCK_ENGAGEMENT_GROUPS_23_09,
  MOCK_STORIES,
  MOCK_EDITORIAL_COMMENTS,
} from './mockData';
import { formatMetricNumber } from '../services/apiService';

// Simple deterministic hash for a date string to generate stable variations
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function generateDataForDateRange(
  fromDate: string,
  toDate: string
): {
  trafficData: SiteTrafficRow[];
  engagementGroups: EngagementGroup[];
  stories: StoryItem[];
  comment?: EditorialComment;
} {
  // If exact 2026-09-23, return the verified baseline data from image.png
  if (fromDate === '2026-09-23' && toDate === '2026-09-23') {
    return {
      trafficData: MOCK_TRAFFIC_DATA_23_09,
      engagementGroups: MOCK_ENGAGEMENT_GROUPS_23_09,
      stories: MOCK_STORIES,
      comment: MOCK_EDITORIAL_COMMENTS[0],
    };
  }

  const seed = hashString(`${fromDate}_${toDate}`);
  const factor = 0.85 + (seed % 30) / 100; // 0.85 to 1.15 multiplier

  // 1. Generate Site Traffic data
  const baseVneUsers = Math.round(2830000 * factor);
  const baseVnePvs = Math.round(10510000 * factor);
  const baseVneArts = Math.round(275 * (0.9 + (seed % 20) / 100));

  const baseNgoisaoUsers = Math.round(352480 * (0.9 + ((seed >> 2) % 25) / 100));
  const baseNgoisaoPvs = Math.round(1260000 * (0.9 + ((seed >> 2) % 25) / 100));
  const baseNgoisaoArts = Math.round(56 * (0.88 + ((seed >> 2) % 25) / 100));

  const baseEngUsers = Math.round(137350 * (0.85 + ((seed >> 4) % 30) / 100));
  const baseEngPvs = Math.round(210040 * (0.85 + ((seed >> 4) % 30) / 100));
  const baseEngArts = Math.round(43 * (0.9 + ((seed >> 4) % 20) / 100));

  const baseTiasangUsers = Math.round(15180 * (0.8 + ((seed >> 6) % 40) / 100));
  const baseTiasangPvs = Math.round(27990 * (0.8 + ((seed >> 6) % 40) / 100));
  const baseTiasangArts = Math.max(2, Math.round(3 * (0.7 + ((seed >> 6) % 60) / 100)));

  const totalUsers = baseVneUsers + baseNgoisaoUsers + baseEngUsers + baseTiasangUsers;
  const totalPvs = baseVnePvs + baseNgoisaoPvs + baseEngPvs + baseTiasangPvs;
  const totalArts = baseVneArts + baseNgoisaoArts + baseEngArts + baseTiasangArts;

  const yestUserChange = Number((((seed % 35) - 15) * 0.8).toFixed(2));
  const yestPvChange = Number(((((seed >> 3) % 25) - 10) * 0.7).toFixed(2));
  const yestArtChange = Number(((((seed >> 5) % 20) - 10) * 0.9).toFixed(2));

  const lwUserChange = Number(((((seed >> 2) % 30) - 16) * 0.6).toFixed(2));
  const lwPvChange = Number(((((seed >> 4) % 26) - 13) * 0.6).toFixed(2));
  const lwArtChange = Number(((((seed >> 6) % 24) - 11) * 0.7).toFixed(2));

  const trafficData: SiteTrafficRow[] = [
    {
      id: 'all',
      name: 'All Sites',
      isTotal: true,
      users: {
        value: totalUsers,
        formattedValue: formatMetricNumber(totalUsers),
        changeVsYesterday: yestUserChange,
        changeVsLastWeek: lwUserChange,
      },
      pageviews: {
        value: totalPvs,
        formattedValue: formatMetricNumber(totalPvs),
        changeVsYesterday: yestPvChange,
        changeVsLastWeek: lwPvChange,
      },
      articles: {
        value: totalArts,
        formattedValue: String(totalArts),
        changeVsYesterday: yestArtChange,
        changeVsLastWeek: lwArtChange,
      },
    },
    {
      id: '-1',
      name: 'VnExpress',
      users: {
        value: baseVneUsers,
        formattedValue: formatMetricNumber(baseVneUsers),
        changeVsYesterday: Number((yestUserChange * 0.92).toFixed(2)),
        changeVsLastWeek: Number((lwUserChange * 0.95).toFixed(2)),
      },
      pageviews: {
        value: baseVnePvs,
        formattedValue: formatMetricNumber(baseVnePvs),
        changeVsYesterday: Number((yestPvChange * 0.9).toFixed(2)),
        changeVsLastWeek: Number((lwPvChange * 1.1).toFixed(2)),
      },
      articles: {
        value: baseVneArts,
        formattedValue: String(baseVneArts),
        changeVsYesterday: Number((yestArtChange * 1.2).toFixed(2)),
        changeVsLastWeek: Number((lwArtChange * 0.8).toFixed(2)),
      },
    },
    {
      id: '1002835',
      name: 'Ngôi Sao',
      users: {
        value: baseNgoisaoUsers,
        formattedValue: formatMetricNumber(baseNgoisaoUsers),
        changeVsYesterday: Number((((seed >> 1) % 40) - 15).toFixed(2)),
        changeVsLastWeek: Number((((seed >> 3) % 30) - 8).toFixed(2)),
      },
      pageviews: {
        value: baseNgoisaoPvs,
        formattedValue: formatMetricNumber(baseNgoisaoPvs),
        changeVsYesterday: Number((((seed >> 2) % 30) - 10).toFixed(2)),
        changeVsLastWeek: Number((((seed >> 4) % 25) - 5).toFixed(2)),
      },
      articles: {
        value: baseNgoisaoArts,
        formattedValue: String(baseNgoisaoArts),
        changeVsYesterday: Number((((seed >> 3) % 20) - 8).toFixed(2)),
        changeVsLastWeek: Number((((seed >> 5) % 18) - 6).toFixed(2)),
      },
    },
    {
      id: '1003888',
      name: 'English',
      users: {
        value: baseEngUsers,
        formattedValue: formatMetricNumber(baseEngUsers),
        changeVsYesterday: Number((((seed >> 2) % 50) - 20).toFixed(2)),
        changeVsLastWeek: Number((((seed >> 4) % 40) - 25).toFixed(2)),
      },
      pageviews: {
        value: baseEngPvs,
        formattedValue: formatMetricNumber(baseEngPvs),
        changeVsYesterday: Number((((seed >> 3) % 45) - 18).toFixed(2)),
        changeVsLastWeek: Number((((seed >> 5) % 35) - 20).toFixed(2)),
      },
      articles: {
        value: baseEngArts,
        formattedValue: String(baseEngArts),
        changeVsYesterday: Number((((seed >> 4) % 20) - 10).toFixed(2)),
        changeVsLastWeek: Number((((seed >> 6) % 20) - 10).toFixed(2)),
      },
    },
    {
      id: '1006614',
      name: 'Tia Sáng',
      users: {
        value: baseTiasangUsers,
        formattedValue: formatMetricNumber(baseTiasangUsers),
        changeVsYesterday: Number((((seed >> 3) % 30) - 10).toFixed(2)),
        changeVsLastWeek: Number((((seed >> 5) % 30) - 8).toFixed(2)),
      },
      pageviews: {
        value: baseTiasangPvs,
        formattedValue: formatMetricNumber(baseTiasangPvs),
        changeVsYesterday: Number((((seed >> 4) % 25) - 8).toFixed(2)),
        changeVsLastWeek: Number((((seed >> 6) % 30) - 5).toFixed(2)),
      },
      articles: {
        value: baseTiasangArts,
        formattedValue: String(baseTiasangArts),
        changeVsYesterday: Number((((seed >> 5) % 30) - 15).toFixed(2)),
        changeVsLastWeek: 0,
      },
    },
  ];

  // 2. Generate Engagement Groups
  const totalArtForGroups = 180 + (seed % 60);
  const totalPvForGroups = 3500000 + (seed % 1000000);

  const hqPct = 22 + (seed % 10); // 22-31%
  const vcPct = 8 + ((seed >> 2) % 6); // 8-13%
  const ttPct = 14 + ((seed >> 3) % 7); // 14-20%
  const cnPct = 100 - (hqPct + vcPct + ttPct);

  const hqCount = Math.round((totalArtForGroups * hqPct) / 100);
  const vcCount = Math.round((totalArtForGroups * vcPct) / 100);
  const ttCount = Math.round((totalArtForGroups * ttPct) / 100);
  const cnCount = totalArtForGroups - (hqCount + vcCount + ttCount);

  const hqPv = Math.round(totalPvForGroups * 0.61);
  const vcPv = Math.round(totalPvForGroups * 0.16);
  const ttPv = Math.round(totalPvForGroups * 0.08);
  const cnPv = totalPvForGroups - (hqPv + vcPv + ttPv);

  const engagementGroups: EngagementGroup[] = [
    {
      id: 'hieu_qua_cao',
      name: 'HIỆU QUẢ CAO',
      articleCount: hqCount,
      articleSharePct: hqPct,
      pageviewCount: hqPv,
      pageviewFormatted: (hqPv / 1_000_000).toFixed(1) + 'M PV',
      pageviewSharePct: Math.round((hqPv / totalPvForGroups) * 100),
      pageviewChangeVsYesterday: ((seed % 40) - 10),
      pageviewChangeVsLastWeek: (((seed >> 2) % 30) - 10),
      color: 'emerald',
    },
    {
      id: 'views_cao',
      name: 'VIEWS CAO',
      articleCount: vcCount,
      articleSharePct: vcPct,
      pageviewCount: vcPv,
      pageviewFormatted: (vcPv / 1_000_000).toFixed(1) + 'M PV',
      pageviewSharePct: Math.round((vcPv / totalPvForGroups) * 100),
      pageviewChangeVsYesterday: (((seed >> 1) % 35) - 20),
      pageviewChangeVsLastWeek: (((seed >> 3) % 50) - 40),
      color: 'purple',
    },
    {
      id: 'tuong_tac_tot',
      name: 'TƯƠNG TÁC TỐT',
      articleCount: ttCount,
      articleSharePct: ttPct,
      pageviewCount: ttPv,
      pageviewFormatted: (ttPv / 1_000_000).toFixed(1) + 'M PV',
      pageviewSharePct: Math.round((ttPv / totalPvForGroups) * 100),
      pageviewChangeVsYesterday: (((seed >> 2) % 30) - 18),
      pageviewChangeVsLastWeek: (((seed >> 4) % 35) - 5),
      color: 'blue',
    },
    {
      id: 'can_nhac',
      name: 'CÂN NHẮC',
      articleCount: cnCount,
      articleSharePct: cnPct,
      pageviewCount: cnPv,
      pageviewFormatted: (cnPv / 1_000_000).toFixed(1) + 'M PV',
      pageviewSharePct: Math.round((cnPv / totalPvForGroups) * 100),
      pageviewChangeVsYesterday: (((seed >> 3) % 25) - 15),
      pageviewChangeVsLastWeek: (((seed >> 5) % 30) - 20),
      color: 'amber',
    },
  ];

  // 3. Generate Stories tailored to this date range
  // Calculate target timestamps based on fromDate
  const targetTs = Math.floor(new Date(`${fromDate}T00:00:00+07:00`).getTime() / 1000);
  
  // Clone baseline stories with adjusted IDs, timestamps, and realistic states
  const shuffledStories = MOCK_STORIES.map((s, idx) => {
    const isPub = (idx + (seed % 3)) % 2 === 0;
    const deadlineOffset = 3600 * 8 + (idx * 3600);
    return {
      ...s,
      story_id: `${34000 + (seed % 1000) + idx * 7}`,
      fromdate: String(targetTs),
      todate: String(targetTs + deadlineOffset),
      status_label: isPub ? 'Hoàn thành' : 'Đang triển khai',
      article_status_label: isPub ? 'Published' : (idx % 2 === 0 ? 'Editing' : 'Verifying'),
      is_qua_han: !isPub && (idx % 4 === 1) ? '1' : '0',
    };
  });

  return {
    trafficData,
    engagementGroups,
    stories: shuffledStories,
  };
}
