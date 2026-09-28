import { SiteTrafficRow, EngagementGroup, StoryItem, EditorialComment, SecretaryProfile } from '../types';

export const SECRETARIES: SecretaryProfile[] = [
  { id: 'thanhvan', name: 'Thanh Vân', username: 'thanhvan', avatarColor: 'bg-emerald-600' },
  { id: 'tranle', name: 'Trần Lê', username: 'tranle', avatarColor: 'bg-purple-600' },
  { id: 'annhon', name: 'An Nhơn', username: 'annhon', avatarColor: 'bg-blue-600' },
  { id: 'thanhhuyen', name: 'Thanh Huyền', username: 'thanhhuyen', avatarColor: 'bg-pink-600' },
  { id: 'thuytrang', name: 'Thùy Trang', username: 'thuytrang', avatarColor: 'bg-rose-500' },
  { id: 'nhieuhuy', name: 'Nhiêu Huy', username: 'nhieuhuy', avatarColor: 'bg-teal-600' },
];

export const MOCK_TRAFFIC_DATA_23_09: SiteTrafficRow[] = [
  {
    id: 'all',
    name: 'All Sites',
    isTotal: true,
    users: { value: 3409156, formattedValue: '3.41M', changeVsYesterday: 5.12, changeVsLastWeek: -1.2 },
    pageviews: { value: 12560300, formattedValue: '12.56M', changeVsYesterday: 3.45, changeVsLastWeek: -0.8 },
    articles: { value: 385, formattedValue: '385', changeVsYesterday: 2.1, changeVsLastWeek: 1.0 },
  },
  {
    id: '-1',
    name: 'VnExpress',
    users: { value: 2891400, formattedValue: '2.89M', changeVsYesterday: 5.34, changeVsLastWeek: -0.9 },
    pageviews: { value: 10842000, formattedValue: '10.84M', changeVsYesterday: 3.65, changeVsLastWeek: -0.6 },
    articles: { value: 280, formattedValue: '280', changeVsYesterday: 2.0, changeVsLastWeek: 1.1 },
  },
  {
    id: '1002835',
    name: 'Ngôi Sao',
    users: { value: 361200, formattedValue: '361.2K', changeVsYesterday: 3.2, changeVsLastWeek: -2.1 },
    pageviews: { value: 1290000, formattedValue: '1.29M', changeVsYesterday: 2.5, changeVsLastWeek: -1.4 },
    articles: { value: 58, formattedValue: '58', changeVsYesterday: 3.5, changeVsLastWeek: 0.0 },
  },
  {
    id: '1003888',
    name: 'English',
    users: { value: 141000, formattedValue: '141K', changeVsYesterday: 2.8, changeVsLastWeek: 1.2 },
    pageviews: { value: 215000, formattedValue: '215K', changeVsYesterday: 2.1, changeVsLastWeek: 0.9 },
    articles: { value: 44, formattedValue: '44', changeVsYesterday: 2.3, changeVsLastWeek: -1.5 },
  },
  {
    id: '1006614',
    name: 'Tia Sáng',
    users: { value: 15800, formattedValue: '15.8K', changeVsYesterday: 1.2, changeVsLastWeek: 0.5 },
    pageviews: { value: 28500, formattedValue: '28.5K', changeVsYesterday: 1.1, changeVsLastWeek: 0.2 },
    articles: { value: 3, formattedValue: '3', changeVsYesterday: 0.0, changeVsLastWeek: 0.0 },
  },
];

export const MOCK_ENGAGEMENT_GROUPS_23_09: EngagementGroup[] = [
  {
    id: 'hieu_qua_cao',
    name: 'HIỆU QUẢ CAO',
    articleCount: 101,
    articleSharePct: 26,
    pageviewCount: 7850000,
    pageviewFormatted: '7.85M PV',
    pageviewSharePct: 63,
    pageviewChangeVsYesterday: 28,
    pageviewChangeVsLastWeek: 6,
    color: 'emerald',
  },
  {
    id: 'views_cao',
    name: 'VIEWS CAO',
    articleCount: 52,
    articleSharePct: 14,
    pageviewCount: 2450000,
    pageviewFormatted: '2.45M PV',
    pageviewSharePct: 20,
    pageviewChangeVsYesterday: 15,
    pageviewChangeVsLastWeek: 3,
    color: 'purple',
  },
  {
    id: 'tuong_tac_tot',
    name: 'TƯƠNG TÁC TỐT',
    articleCount: 68,
    articleSharePct: 18,
    pageviewCount: 1200000,
    pageviewFormatted: '1.20M PV',
    pageviewSharePct: 10,
    pageviewChangeVsYesterday: -4,
    pageviewChangeVsLastWeek: 2,
    color: 'blue',
  },
  {
    id: 'can_nhac',
    name: 'CÂN NHẮC',
    articleCount: 164,
    articleSharePct: 42,
    pageviewCount: 1060300,
    pageviewFormatted: '1.06M PV',
    pageviewSharePct: 7,
    pageviewChangeVsYesterday: -8,
    pageviewChangeVsLastWeek: -12,
    color: 'amber',
  },
];

export const MOCK_STORIES: StoryItem[] = [
  {
    story_id: '1001',
    title: 'Hà Nội đón đợt không khí lạnh đầu mùa kèm mưa dông diện rộng',
    user_name: 'thanhvan',
    ban_name: 'Thời sự',
    status_label: 'Hoàn thành',
    article_status_label: 'Published',
    important: '1',
    is_qua_han: '0',
    todate: '1727409600',
    comment: 'Lượng view cao vào đầu buổi sáng, độc giả quan tâm diễn biến giao thông và thời tiết.',
  },
  {
    story_id: '1002',
    title: 'Giá vàng nhẫn và vàng miếng SJC biến động mạnh theo xu hướng thế giới',
    user_name: 'annhon',
    ban_name: 'Kinh doanh',
    status_label: 'Hoàn thành',
    article_status_label: 'Published',
    important: '1',
    is_qua_han: '0',
    todate: '1727413200',
    comment: 'Chủ đề hot của tuần, liên tục cập nhật biểu giá tại các ngân hàng lớn.',
  },
  {
    story_id: '1003',
    title: 'Khi người trẻ tính chuyện tích lũy và an cư tại đô thị lớn',
    user_name: 'tranle',
    ban_name: 'Góc nhìn',
    status_label: 'Hoàn thành',
    article_status_label: 'Published',
    important: '1',
    is_qua_han: '0',
    todate: '1727416800',
    comment: 'Tương tác bình luận rất sôi nổi, nhiều ý kiến đa chiều.',
  },
  {
    story_id: '1004',
    title: 'Tháo gỡ điểm nghẽn hạ tầng giao thông kết nối các vùng kinh tế trọng điểm',
    user_name: 'thuytrang',
    ban_name: 'Thời sự',
    status_label: 'Hoàn thành',
    article_status_label: 'Published',
    important: '1',
    is_qua_han: '0',
    todate: '1727420400',
    comment: 'Bài phân tích chính sách chuyên sâu, tỷ lệ đọc hết trang cao.',
  },
];

export const MOCK_EDITORIAL_COMMENTS: EditorialComment[] = [
  {
    id: 'c-vne-27',
    author: 'Thanh Vân',
    role: 'Thư ký trực chính (VnExpress)',
    updatedAt: '27/09/2026 21:30',
    dateStr: '2026-09-27',
    summaryTitle: 'Nhận xét VnExpress',
    category: 'vnexpress',
    htmlContent:
      '<p><strong>Tổng quan:</strong> Tin bài thời sự thời tiết và giá vàng duy trì lượng traffic cao suốt ban ngày. Luồng thông tin cập nhật liên tục, đảm bảo tính chuẩn xác và kịp thời.</p>' +
      '<p class="mt-2"><strong>Lưu ý:</strong> Cần rà soát kỹ các tiêu đề tin bài trực tiếp trên mobile và bổ sung infographic minh họa cho các bài kinh tế chuyên sâu.</p>',
  },
  {
    id: 'c-oth-27',
    author: 'Trần Lê',
    role: 'Thư ký trực phụ (Ngôi sao, English, Tia sáng)',
    updatedAt: '27/09/2026 21:45',
    dateStr: '2026-09-27',
    summaryTitle: 'Nhận xét Ngôi sao, English, Tia sáng',
    category: 'others',
    htmlContent:
      '<p><strong>Ngôi sao:</strong> Loạt bài giải trí cuối tuần có tương tác mạng xã hội tốt, tỷ lệ giữ chân độc giả ổn định.</p>' +
      '<p class="mt-2"><strong>English &amp; Tia sáng:</strong> Các bài phóng sự ảnh và góc nhìn văn hóa được bạn đọc đón nhận tích cực.</p>',
  },
  {
    id: 'c-vne-28',
    author: 'An Nhơn',
    role: 'Thư ký trực chính (VnExpress)',
    updatedAt: '28/09/2026 20:30',
    dateStr: '2026-09-28',
    summaryTitle: 'Nhận xét VnExpress',
    category: 'vnexpress',
    htmlContent:
      '<p><strong>Điểm tin ngày 28/9:</strong> Dòng sự kiện đầu tuần tập trung vào phát triển kinh tế xã hội và dự thảo chính sách mới.</p>',
  },
  {
    id: 'c-oth-28',
    author: 'Thanh Huyền',
    role: 'Thư ký trực phụ (Ngôi sao, English, Tia sáng)',
    updatedAt: '28/09/2026 20:45',
    dateStr: '2026-09-28',
    summaryTitle: 'Nhận xét Ngôi sao, English, Tia sáng',
    category: 'others',
    htmlContent:
      '<p><strong>Lưu ý:</strong> Đẩy mạnh các bài dịch độc quyền trên VnExpress International.</p>',
  },
];

export const MOCK_EDITORIAL_COMMENTS_24_09: EditorialComment[] = [
  {
    id: 'c-vne-24',
    author: 'Thanh Vân',
    role: 'Thư ký trực chính (VnExpress)',
    updatedAt: '24/09/2026 21:00',
    dateStr: '2026-09-24',
    summaryTitle: 'Nhận xét VnExpress',
    category: 'vnexpress',
    htmlContent: '<p>Lượng traffic ngày 24/09 tăng trưởng đều ở các luồng tin kinh tế và công nghệ.</p>',
  },
];
