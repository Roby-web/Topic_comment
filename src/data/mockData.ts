import { SiteTrafficRow, EngagementGroup, StoryItem, EditorialComment, SecretaryProfile } from '../types';

export const SECRETARIES: SecretaryProfile[] = [
  { id: 'thuytrang', name: 'Thùy Trang', username: 'thuytrang', avatarColor: 'bg-rose-500' },
  { id: 'annhon', name: 'An Nhơn', username: 'annhon', avatarColor: 'bg-blue-600' },
  { id: 'hoanganh', name: 'Hoàng Anh', username: 'hoanganh', avatarColor: 'bg-emerald-600' },
  { id: 'minhtri', name: 'Minh Trí', username: 'minhtri', avatarColor: 'bg-purple-600' },
];

export const MOCK_TRAFFIC_DATA_23_09: SiteTrafficRow[] = [
  {
    id: 'all',
    name: 'All Sites',
    isTotal: true,
    users: {
      value: 3340000,
      formattedValue: '3,34M',
      changeVsYesterday: 12.32,
      changeVsLastWeek: -4.45,
    },
    pageviews: {
      value: 12010000,
      formattedValue: '12,01M',
      changeVsYesterday: 3.05,
      changeVsLastWeek: -2.38,
    },
    articles: {
      value: 377,
      formattedValue: '377',
      changeVsYesterday: -3.83,
      changeVsLastWeek: 1.34,
    },
  },
  {
    id: '-1',
    name: 'VnExpress',
    users: {
      value: 2830000,
      formattedValue: '2,83M',
      changeVsYesterday: 10.42,
      changeVsLastWeek: -4.41,
    },
    pageviews: {
      value: 10510000,
      formattedValue: '10,51M',
      changeVsYesterday: 2.54,
      changeVsLastWeek: -2.96,
    },
    articles: {
      value: 275,
      formattedValue: '275',
      changeVsYesterday: -5.5,
      changeVsLastWeek: 3.38,
    },
  },
  {
    id: '1002835',
    name: 'Ngôi Sao',
    users: {
      value: 352480,
      formattedValue: '352,48K',
      changeVsYesterday: 21.27,
      changeVsLastWeek: 15.78,
    },
    pageviews: {
      value: 1260000,
      formattedValue: '1,26M',
      changeVsYesterday: 3.34,
      changeVsLastWeek: 9.69,
    },
    articles: {
      value: 56,
      formattedValue: '56',
      changeVsYesterday: 7.69,
      changeVsLastWeek: 1.82,
    },
  },
  {
    id: '1003888',
    name: 'English',
    users: {
      value: 137350,
      formattedValue: '137,35K',
      changeVsYesterday: 34.01,
      changeVsLastWeek: -35.29,
    },
    pageviews: {
      value: 210040,
      formattedValue: '210,04K',
      changeVsYesterday: 33.58,
      changeVsLastWeek: -29.78,
    },
    articles: {
      value: 43,
      formattedValue: '43',
      changeVsYesterday: -4.44,
      changeVsLastWeek: -10.42,
    },
  },
  {
    id: '1006614',
    name: 'Tia Sáng',
    users: {
      value: 15180,
      formattedValue: '15,18K',
      changeVsYesterday: 16.55,
      changeVsLastWeek: 16.33,
    },
    pageviews: {
      value: 27990,
      formattedValue: '27,99K',
      changeVsYesterday: 5.29,
      changeVsLastWeek: 24.19,
    },
    articles: {
      value: 3,
      formattedValue: '3',
      changeVsYesterday: -25.0,
      changeVsLastWeek: 0.0,
    },
  },
];

export const MOCK_ENGAGEMENT_GROUPS_23_09: EngagementGroup[] = [
  {
    id: 'hieu_qua_cao',
    name: 'HIỆU QUẢ CAO',
    articleCount: 54,
    articleSharePct: 26,
    pageviewCount: 2400000,
    pageviewFormatted: '2.4M PV',
    pageviewSharePct: 63,
    pageviewChangeVsYesterday: 28,
    pageviewChangeVsLastWeek: 6,
    color: 'emerald',
  },
  {
    id: 'views_cao',
    name: 'VIEWS CAO',
    articleCount: 18,
    articleSharePct: 9,
    pageviewCount: 600000,
    pageviewFormatted: '0.6M PV',
    pageviewSharePct: 15,
    pageviewChangeVsYesterday: -19,
    pageviewChangeVsLastWeek: -52,
    color: 'purple',
  },
  {
    id: 'tuong_tac_tot',
    name: 'TƯƠNG TÁC TỐT',
    articleCount: 32,
    articleSharePct: 16,
    pageviewCount: 300000,
    pageviewFormatted: '0.3M PV',
    pageviewSharePct: 7,
    pageviewChangeVsYesterday: -26,
    pageviewChangeVsLastWeek: 22,
    color: 'blue',
  },
  {
    id: 'can_nhac',
    name: 'CÂN NHẮC',
    articleCount: 95,
    articleSharePct: 45,
    pageviewCount: 600000,
    pageviewFormatted: '0.6M PV',
    pageviewSharePct: 15,
    pageviewChangeVsYesterday: -15,
    pageviewChangeVsLastWeek: -19,
    color: 'amber',
  },
];

export const MOCK_EDITORIAL_COMMENTS_24_09: EditorialComment[] = [
  {
    id: 'cm-24-09',
    author: 'thuytrang',
    role: 'Thư ký trực BBT',
    dateStr: '24/09/2026',
    updatedAt: '07:49',
    summaryTitle: 'Nhận xét Thư ký trực ngày 24/9',
    htmlContent: `<p class="font-medium text-slate-900 mb-2.5">Tổng quan: 69 bài TV trong đó 32 HQ (46%), 2 TT (2,9%), 17 VC (24,6%), 18 CN (26%)</p>
<ul class="space-y-2 text-slate-800 leading-relaxed list-none pl-0">
  <li>- Cụm tin, bài thượng đỉnh Mỹ - Trung các ban Thế giới, VnEGO, Giải trí cùng khai thác hiệu quả, từ cuộc Trump tiếp đón Tập tại sân bay, màn biểu diễn oanh tạc cơ, tới nhận xét về biểu cảm và trang phục các nhân vật.</li>
  <li>- Tin, bài Bí thư Thành uỷ Tp HCM tiếp xúc cử tri: Thời sự có bài sớm nhất, Giáo dục và VnEGO cũng phát huy tốt, đều có bài Hiệu quả.</li>
  <li>- Tin giá xăng dầu tăng: Kinh doanh của VnE lên thuộc tốp sớm nhất trong các báo, và nội dung tương đối đầy đủ hơn, chỉ ra nguyên nhân liên quan tới diễn biến phức tạp đàm phán Mỹ - Iran. Tin đạt View cao.</li>
  <li>- Tin vụ giết người ở TP HCM: Pháp luật lên sớm, bài Hiệu quả và đạt gần 185k view. Tuy nhiên thư ký trực sơ suất không trao đổi với Pháp luật / thời sự TP HCM tiếp tục tìm hiểu.</li>
  <li>- Đời sống có bài tốt về người nước ngoài ngạc nhiên với mô hình người già trông cậy vào con cái ở VN, tìm được điểm chạm với độc giả quan tâm tới yếu tố khác biệt văn hoá, từ đó mở ra vấn đề an sinh đáng quan tâm đối với người cao tuổi.</li>
  <li>- Pháp luật hôm qua hoạt động rất hiệu quả, cung cấp nhiều bài cho tốp 5 thượng viện hơn thường lệ. Pháp luật, Thời sự đóng góp chính cho các bài đặt trên tốp 5 thượng viện, bên cạnh đó Thế giới, Thể thao, VnEGO, Kinh doanh hỗ trợ đắc lực.</li>
  <li>- Xét tổng thể, hôm qua 6 ban đóng góp nhiều View nhất cho thượng viện lần lượt là Thế giới, Pháp luật, VnEGO, Kinh doanh, Thể thao, Thời sự. Nếu chỉ xét View từ các bài Hiệu quả trên thượng viện, thì Pháp luật vượt trội các ban khác.</li>
</ul>
<p class="mt-3 font-medium text-slate-900">Có 2 lưu ý chung:</p>
<ul class="mt-1 space-y-2 text-slate-800 leading-relaxed list-none pl-0">
  <li>- VnEGO có cách tính chỉ số engage có lẽ khắt khe hơn mức hợp lý, khiến bài dễ thành cân nhắc. Tầm cuối giờ chiều độc giả cần các video ngắn, khi đăng vào thời gian này phát huy được nhiều giá trị nội dung cho mặt trang và tạo nhiều lượt xem. Tuy nhiên với cách tính hiện nay, thực tế cho thấy thời gian buổi tối lthường không đủ để sản phẩm vượt trên ngưỡng Cân nhắc.</li>
  <li>- Các lựa chọn cho tốp 5 của VnE hiện nay đang bị giới hạn, chủ yếu do Thời sự, Thế giới, Pháp luật, Kinh doanh gánh, do các ban này thường có nội dung có sức nặng phù hợp (không kể thể thao theo đặc thù riêng). Giới hạn này ảnh hưởng tới tính linh hoạt và sinh động cho mặt trang. Vì vậy, nên có chính sách khuyến khích để các ban khác có động lực để chú trọng hơn việc sản xuất các nội dung phù hợp dành cho tốp 5.</li>
</ul>`,
  },
];

export const MOCK_EDITORIAL_COMMENTS: EditorialComment[] = [
  {
    id: 'cm-1',
    author: 'thuytrang',
    role: 'Thư ký trực BBT',
    dateStr: '23/09/2026',
    updatedAt: '08:11',
    summaryTitle: 'Nhận xét tổng quan & Đề tài nổi bật ngày 23/9',
    htmlContent: `<p class="font-medium text-slate-800 mb-2"><strong>Build Top: 59/224 bài. HQ: 34 bài, Views cao: 7, Tương tác: 8; Cân nhắc: 10.</strong></p>
<ul class="space-y-2 text-slate-700 leading-relaxed list-disc list-outside pl-4">
  <li><strong>Breaking News trong ngày Thứ trưởng Y tế Nguyễn Tri Thức nghỉ việc:</strong> VnE chậm hơn các báo. Thời sự giải thích do pv theo dõi mảng chậm phát hiện. Nguồn phát từ cổng chính phủ =&gt; rà quét, bổ sung cho Trendsense.</li>
  <li><strong>Mưa ngập ở TP HCM:</strong> Có bài ảnh tốt. Đời sống cần triển khai các lát cắt con người (đã trao đổi).</li>
  <li><strong>Đại hội đồng LHQ:</strong> Follow hoạt động của TBT theo nguồn chính thức (tiếp tục lưu ý về biên tập thông cáo). Bài điểm nhất phát biểu của Trump tốt. Cũng có bài educate thú vị về chuyên cơ chở ông Tập nhân chuyến thăm Mỹ. Bài review tốt: 39 bác sĩ, nhân viên y tế 'biến' Viện pháp y tâm thần Trung ương thành nơi dưỡng tội phạm.</li>
  <li><a href="https://vnexpress.net" target="_blank" rel="noreferrer" class="text-blue-600 hover:text-blue-800 underline font-medium">Tiến sĩ Việt chế tạo chip giúp bệnh nhân mù đọc chữ</a>: Bài riêng tốt, tiếc là có sai sót: 2 tuần =&gt; 2 ngày. Thông tin đầu tiên từ Tia sáng đưa một tuần trước. Hai ban Sức khỏe và Tia sáng sau đó cùng phỏng vấn. Tuy nhiên, chưa có sự phân công rõ ràng ban nào nên làm gì nên khi Sức khỏe lên bài, Tia sáng claim nội dung trùng với bài Tia sáng dự kiến lên. Hai ban giải thích thêm để phối hợp tốt hơn lần sau.</li>
</ul>
<p class="mt-4 text-slate-800 font-medium"><strong>Các site:</strong> Không có gì đặc biệt.</p>`,
  },
];

export const MOCK_STORIES: StoryItem[] = [
  {
    story_id: '34379',
    title: 'Cải tạo rạp Hoà Bình Đà Lạt: Dự án bảo tồn kiến trúc di sản trung tâm thành phố hoa',
    user_name: 'dangkhoa',
    ban_name: 'Thời sự Hồ Chí Minh',
    status_label: 'Hoàn thành',
    article_status_label: 'Published',
    important: '1',
    is_qua_han: '0',
    todate: '1790074800', // 22/09/2026 18:00
    fromdate: '1790010000',
    comment: 'Lưu ý ảnh phối cảnh kiến trúc & ý kiến chuyên gia bảo tồn Lâm Đồng',
    buildtop_info: {
      trangchu_beta: { position: '27', creation_time: '1790063133', update_time: '1790083126', status: '0' },
      trangchu_mobile: { position: '31', creation_time: '1790063138', update_time: '1790090976', status: '0' },
    },
  },
  {
    story_id: '34382',
    title: 'Thứ trưởng Y tế Nguyễn Tri Thức thôi giữ chức vụ: Toàn cảnh điều động & công tác cán bộ',
    user_name: 'vietdung',
    ban_name: 'Thời sự',
    status_label: 'Hoàn thành',
    article_status_label: 'Published',
    important: '1',
    is_qua_han: '0',
    todate: '1790060400',
    fromdate: '1790010000',
    comment: 'Phát từ Cổng TTĐT Chính phủ. Cần bổ sung ngay bối cảnh ngành y tế và quá trình công tác.',
    buildtop_info: {
      trangchu_beta: { position: '2', creation_time: '1790059200', update_time: '1790070000', status: '0' },
      trangchu_mobile: { position: '1', creation_time: '1790059200', update_time: '1790070000', status: '0' },
    },
  },
  {
    story_id: '34390',
    title: 'Tiến sĩ Việt chế tạo chip kích thích thị giác hỗ trợ bệnh nhân mù đọc chữ',
    user_name: 'bichngoc',
    ban_name: 'Khoa học & Đời sống',
    status_label: 'Hoàn thành',
    article_status_label: 'Published',
    important: '1',
    is_qua_han: '0',
    todate: '1790067600',
    fromdate: '1790010000',
    comment: 'Phối hợp với Tia Sáng. Đính chính mốc thời gian thử nghiệm lâm sàng.',
    buildtop_info: {
      trangchu_beta: { position: '6', creation_time: '1790068000', update_time: '1790080000', status: '0' },
      trangchu_mobile: { position: '5', creation_time: '1790068000', update_time: '1790080000', status: '0' },
    },
  },
  {
    story_id: '34401',
    title: 'Đại hội đồng LHQ Khóa 81: Tổng Bí thư dự và phát biểu thông điệp chiến lược của Việt Nam',
    user_name: 'thanhhuyen',
    ban_name: 'Thế giới',
    status_label: 'Hoàn thành',
    article_status_label: 'Published',
    important: '1',
    is_qua_han: '0',
    todate: '1790082000',
    fromdate: '1790010000',
    comment: 'Cập nhật trực tiếp theo thông cáo phái đoàn ngoại giao Việt Nam.',
    buildtop_info: {
      trangchu_beta: { position: '1', creation_time: '1790080000', update_time: '1790095000', status: '0' },
      trangchu_mobile: { position: '1', creation_time: '1790080000', update_time: '1790095000', status: '0' },
    },
  },
  {
    story_id: '34405',
    title: '39 cán bộ y tế cấu kết làm sai lệch hồ sơ tâm thần tại Viện Pháp y Tâm thần Trung ương',
    user_name: 'haiyen',
    ban_name: 'Pháp luật',
    status_label: 'Hoàn thành',
    article_status_label: 'Published',
    important: '1',
    is_qua_han: '0',
    todate: '1790071200',
    fromdate: '1790010000',
    comment: 'Review chi tiết hành vi nhận hối lộ và đường dây chạy bệnh án tâm thần.',
    buildtop_info: {
      trangchu_beta: { position: '9', creation_time: '1790072000', update_time: '1790088000', status: '0' },
      trangchu_mobile: { position: '8', creation_time: '1790072000', update_time: '1790088000', status: '0' },
    },
  },
  {
    story_id: '34410',
    title: 'Mưa kỷ lục ngập sâu diện rộng tại TP HCM: Cuộc sống người dân đảo lộn sau triều cường',
    user_name: 'huuhiep',
    ban_name: 'Thời sự Hồ Chí Minh',
    status_label: 'Hoàn thành',
    article_status_label: 'Published',
    important: '1',
    is_qua_han: '0',
    todate: '1790064000',
    fromdate: '1790010000',
    comment: 'Có chùm ảnh tốt. Cần bổ sung góc nhìn phỏng vấn người dân bị ngập xe và sập nhà.',
    buildtop_info: {
      trangchu_beta: { position: '12', creation_time: '1790065000', update_time: '1790082000', status: '0' },
      trangchu_mobile: { position: '14', creation_time: '1790065000', update_time: '1790082000', status: '0' },
    },
  },
  // Un-published / Pending important stories ("Chưa lên trang")
  {
    story_id: '34415',
    title: 'Giải ngân đầu tư công đường Vành đai 4: Tắc nghẽn mỏ vật liệu cát san lấp',
    user_name: 'tuananh',
    ban_name: 'Kinh doanh',
    status_label: 'Đang triển khai',
    article_status_label: 'Editing',
    important: '1',
    is_qua_han: '0',
    todate: '1790096400',
    fromdate: '1790010000',
    comment: 'Chờ số liệu đối soát từ Sở GTVT Hà Nội và Bắc Ninh.',
  },
  {
    story_id: '34418',
    title: 'Điều tra đường dây nhập khẩu pin xe điện phế liệu gắn mác thiết bị mới qua cảng Hải Phòng',
    user_name: 'quocviet',
    ban_name: 'Pháp luật',
    status_label: 'Đang triển khai',
    article_status_label: 'Verifying',
    important: '1',
    is_qua_han: '1',
    todate: '1790056800',
    fromdate: '1790010000',
    comment: 'Đang gửi luật sư tham vấn về chứng cứ hải quan và công văn kiểm định.',
  },
  {
    story_id: '34422',
    title: 'Chính sách thuế tối thiểu toàn cầu tác động đến thu hút FDI công nghệ cao năm 2027',
    user_name: 'minhtam',
    ban_name: 'Kinh doanh',
    status_label: 'Đang triển khai',
    article_status_label: 'Editing',
    important: '1',
    is_qua_han: '0',
    todate: '1790092800',
    fromdate: '1790010000',
    comment: 'Phỏng vấn đại diện Samsung, Intel và Bộ Kế hoạch Đầu tư.',
  },
  {
    story_id: '34426',
    title: 'Viêm phổi lạ do Mycoplasma bùng phát ở trường mầm non: Bác sĩ cảnh báo kháng thuốc',
    user_name: 'lananh',
    ban_name: 'Sức khỏe',
    status_label: 'Đang triển khai',
    article_status_label: 'Editing',
    important: '1',
    is_qua_han: '0',
    todate: '1790089200',
    fromdate: '1790010000',
    comment: 'Lấy khuyến cáo điều trị từ Viện Nhi Trung ương.',
  },
  {
    story_id: '34430',
    title: 'Phát hiện hang động núi lửa mới tại Đắk Nông dài hơn 1km với thạch nhũ nguyên sinh',
    user_name: 'nguyenthao',
    ban_name: 'Du lịch & Môi trường',
    status_label: 'Đang triển khai',
    article_status_label: 'None',
    important: '1',
    is_qua_han: '0',
    todate: '1790100000',
    fromdate: '1790010000',
    comment: 'Đang chờ đoàn chuyên gia Nhật Bản gửi file đo đạc 3D.',
  },
  {
    story_id: '34435',
    title: 'Cựu tổng thống Mỹ tranh luận trực tiếp trước thềm bầu cử: Các đòn công kích then chốt',
    user_name: 'vanphu',
    ban_name: 'Thế giới',
    status_label: 'Đang triển khai',
    article_status_label: 'Verifying',
    important: '1',
    is_qua_han: '0',
    todate: '1790078400',
    fromdate: '1790010000',
    comment: 'Biên tập viên quốc tế duyệt câu chữ dịch thuật.',
  },
  {
    story_id: '34440',
    title: 'Chấn thương dây chằng của tiền đạo Nguyễn Xuân Son: Khả năng lỡ hẹn AFF Cup',
    user_name: 'ducmanh',
    ban_name: 'Thể thao',
    status_label: 'Đang triển khai',
    article_status_label: 'None',
    important: '1',
    is_qua_han: '1',
    todate: '1790053200',
    fromdate: '1790010000',
    comment: 'Liên hệ bác sĩ CLB Nam Định lấy kết quả chụp MRI.',
  },
  {
    story_id: '34444',
    title: 'Thực hư phương pháp cấy chỉ giảm béo thần tốc tại các spa chui gây hoại tử',
    user_name: 'hongdiem',
    ban_name: 'Sức khỏe',
    status_label: 'Đang triển khai',
    article_status_label: 'Editing',
    important: '1',
    is_qua_han: '0',
    todate: '1790096400',
    fromdate: '1790010000',
    comment: 'Phóng viên thâm nhập thực tế tại quận 10 và phản ánh của bệnh nhân BV Da Liễu.',
  },
];
