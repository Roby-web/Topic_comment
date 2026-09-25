export type SiteId = '-1' | '1002835' | '1003888' | '1006614' | 'all';

export interface TrafficMetric {
  value: number;
  formattedValue: string;
  changeVsYesterday: number | null; // percentage e.g. +12.32
  changeVsLastWeek: number | null; // percentage e.g. -4.45
}

export interface SiteTrafficRow {
  id: SiteId;
  name: string;
  isTotal?: boolean;
  users: TrafficMetric;
  pageviews: TrafficMetric;
  articles: TrafficMetric;
}

export interface EngagementGroup {
  id: 'hieu_qua_cao' | 'views_cao' | 'tuong_tac_tot' | 'can_nhac' | 'none';
  name: string;
  articleCount: number;
  articleSharePct: number; // percentage e.g. 26
  pageviewCount: number;
  pageviewFormatted: string; // e.g. 2.4M PV
  pageviewSharePct: number; // percentage e.g. 63
  pageviewChangeVsYesterday: number | null; // e.g. +28%
  pageviewChangeVsLastWeek: number | null; // e.g. +6%
  color: 'emerald' | 'purple' | 'blue' | 'amber' | 'slate';
}

export interface BuildTopPosition {
  position: string;
  creation_time?: string;
  update_time?: string;
  status?: string;
}

export interface BuildTopInfo {
  trangchu_beta?: BuildTopPosition;
  trangchu_mobile?: BuildTopPosition;
}

export interface StoryItem {
  story_id: string;
  title: string;
  user_name: string;
  ban_name: string;
  status_label: 'Đang triển khai' | 'Hoàn thành' | string;
  article_status_label: 'None' | 'Editing' | 'Verifying' | 'Published' | string;
  important: '0' | '1' | string;
  is_qua_han: '0' | '1' | string;
  todate: string; // unix timestamp or string
  fromdate?: string;
  time_publishing?: string;
  comment?: string;
  nhan_xet?: string;
  buildtop_info?: BuildTopInfo;
}

export type CommentCategory = 'vnexpress' | 'others';

export interface EditorialComment {
  id: string;
  author: string;
  role: string;
  updatedAt: string;
  dateStr: string;
  htmlContent: string;
  summaryTitle?: string;
  category?: CommentCategory; // 'vnexpress' | 'others' (Ngôi sao, English, Tia sáng)
}

export interface SecretaryProfile {
  id: string;
  name: string;
  username: string;
  avatarColor: string;
}
