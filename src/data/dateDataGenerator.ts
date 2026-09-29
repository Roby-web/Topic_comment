import { SiteTrafficRow, EngagementGroup, StoryItem, EditorialComment } from '../types';
import {
  MOCK_TRAFFIC_DATA_23_09,
  MOCK_ENGAGEMENT_GROUPS_23_09,
  MOCK_ENGAGEMENT_GROUPS_25_09,
  MOCK_STORIES,
  MOCK_EDITORIAL_COMMENTS,
} from './mockData';

function isDateKey(dateStr: string, month: number, day: number): boolean {
  if (!dateStr) return false;
  const s = String(dateStr).trim();
  const m2 = String(month).padStart(2, '0');
  const d2 = String(day).padStart(2, '0');
  return (
    s === `2026-${m2}-${d2}` ||
    s === `2026-${month}-${day}` ||
    s === `${d2}/${m2}/2026` ||
    s === `${day}/${month}/2026` ||
    s === `${d2}-${m2}-2026` ||
    s === `${day}-${month}-2026` ||
    s === `${d2}/${m2}` ||
    s === `${day}/${month}` ||
    s === `2026${m2}${d2}` ||
    s.includes(`-${m2}-${d2}`) ||
    s.includes(`${d2}/${m2}`)
  );
}

/**
 * Tuân thủ Quy tắc Bất biến số 6 (Rule.md):
 * "KHÔNG TỰ Ý BỊA DỮ LIỆU & NỘI DUNG"
 * 
 * - Tuyệt đối không sinh số liệu ngẫu nhiên hoặc bịa đặt văn mẫu nhận xét.
 * - Chỉ dùng bộ dữ liệu chuẩn đã được người dùng cung cấp và xác thực.
 * - Ngày Thứ 6 (25/09/2026): 57 bài Hiệu quả cao (MOCK_ENGAGEMENT_GROUPS_25_09).
 * - Ngày Thứ 4 (23/09/2026): 101 bài Hiệu quả cao (MOCK_ENGAGEMENT_GROUPS_23_09).
 * - Các ngày chưa có dữ liệu nhận xét thực tế sẽ trả về mảng rỗng `comments: []`
 *   để giao diện hiển thị trạng thái "Chưa có nhận xét cho ngày này", cho phép Thư ký nhập thật.
 */
export function generateDataForDateRange(
  fromDate: string,
  toDate: string
): {
  trafficData: SiteTrafficRow[];
  engagementGroups: EngagementGroup[];
  stories: StoryItem[];
  comment?: EditorialComment;
  comments?: EditorialComment[];
} {
  const fDate = fromDate || '2026-09-25';

  // 1. Ngày Thứ 6 (25/09/2026): Bộ dữ liệu bài hiệu quả chuẩn xác thực từ tòa soạn (57 bài Hiệu quả cao)
  if (isDateKey(fDate, 9, 25)) {
    return {
      trafficData: MOCK_TRAFFIC_DATA_23_09,
      engagementGroups: MOCK_ENGAGEMENT_GROUPS_25_09,
      stories: MOCK_STORIES,
      comment: undefined,
      comments: [],
    };
  }

  // 2. Ngày Thứ 4 (23/09/2026): Bộ dữ liệu chuẩn xác thực mốc 23/9 (101 bài Hiệu quả cao)
  if (isDateKey(fDate, 9, 23)) {
    return {
      trafficData: MOCK_TRAFFIC_DATA_23_09,
      engagementGroups: MOCK_ENGAGEMENT_GROUPS_23_09,
      stories: MOCK_STORIES,
      comment: undefined,
      comments: [],
    };
  }

  // 3. Ngày Chủ nhật (27/09/2026): Nhận xét chuẩn của Thanh Vân (VnExpress) và Trần Lê (Site khác)
  if (isDateKey(fDate, 9, 27)) {
    return {
      trafficData: MOCK_TRAFFIC_DATA_23_09,
      engagementGroups: MOCK_ENGAGEMENT_GROUPS_25_09,
      stories: MOCK_STORIES,
      comment: MOCK_EDITORIAL_COMMENTS[0],
      comments: [MOCK_EDITORIAL_COMMENTS[0], MOCK_EDITORIAL_COMMENTS[1]],
    };
  }

  // 4. Ngày Thứ hai (28/09/2026): Nhận xét chuẩn của An Nhơn (VnExpress) và Thanh Huyền (Site khác)
  if (isDateKey(fDate, 9, 28)) {
    return {
      trafficData: MOCK_TRAFFIC_DATA_23_09,
      engagementGroups: MOCK_ENGAGEMENT_GROUPS_25_09,
      stories: MOCK_STORIES,
      comment: MOCK_EDITORIAL_COMMENTS[2],
      comments: [MOCK_EDITORIAL_COMMENTS[2], MOCK_EDITORIAL_COMMENTS[3]],
    };
  }

  // 5. Ngày Thứ năm (24/09/2026) & các ngày khác:
  // Thư ký trực: Trần Lê (chính), Nhiêu Huy (phụ).
  // Tuyệt đối không tự ý bịa nhận xét (để trống comments: [] để người dùng tự nhập).
  return {
    trafficData: MOCK_TRAFFIC_DATA_23_09,
    engagementGroups: MOCK_ENGAGEMENT_GROUPS_25_09,
    stories: MOCK_STORIES,
    comment: undefined,
    comments: [],
  };
}
