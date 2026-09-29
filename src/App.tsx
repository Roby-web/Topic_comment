import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Header } from './components/Header';
import { TrafficSection } from './components/TrafficSection';
import { EngagementGroupsSection } from './components/EngagementGroupsSection';
import { EditorialCommentsSection } from './components/EditorialCommentsSection';
import { ImportantStoriesColumn } from './components/ImportantStoriesColumn';
import { ApiConfigModal } from './components/ApiConfigModal';
import { NewCommentDropdownBar } from './components/NewCommentDropdownBar';
import {
  SiteTrafficRow,
  EngagementGroup,
  StoryItem,
  EditorialComment,
  SecretaryProfile,
  CommentCategory,
} from './types';
import {
  SECRETARIES,
  MOCK_TRAFFIC_DATA_23_09,
  MOCK_ENGAGEMENT_GROUPS_23_09,
  MOCK_STORIES,
  MOCK_EDITORIAL_COMMENTS,
} from './data/mockData';
import {
  ApiConfig,
  getSavedApiConfig,
  saveApiConfig,
  fetchEditorialData,
  getImmediateEditorialData,
  getYesterdayYmd,
} from './services/apiService';
import {
  getRosterForDate,
  getSavedSheetUrl,
  fetchRosterFromGoogleSheet,
  getMainSecretaryProfile,
  getSubSecretaryProfile,
} from './services/secretaryRosterService';
import { AlertCircle, Check } from 'lucide-react';

const STORAGE_KEY_COMMENTS_PREFIX = 'vne_editorial_comments_by_date_v6';

export default function App() {
  const [apiConfig, setApiConfig] = useState<ApiConfig>(getSavedApiConfig);
  const defaultYesterday = getYesterdayYmd();
  const [selectedDate, setSelectedDate] = useState<string>(
    () => apiConfig.selectedDate || defaultYesterday
  );
  const [fromDate, setFromDate] = useState<string>(
    () => apiConfig.fromDate || apiConfig.selectedDate || defaultYesterday
  );
  const [toDate, setToDate] = useState<string>(
    () => apiConfig.toDate || apiConfig.selectedDate || defaultYesterday
  );

  const [selectedSecretary, setSelectedSecretary] = useState<SecretaryProfile>(() => {
    const initDate = apiConfig.fromDate || apiConfig.selectedDate || defaultYesterday;
    const roster = getRosterForDate(initDate);
    return getMainSecretaryProfile(roster);
  });
  const [subSecretary, setSubSecretary] = useState<SecretaryProfile>(() => {
    const initDate = apiConfig.fromDate || apiConfig.selectedDate || defaultYesterday;
    const roster = getRosterForDate(initDate);
    return getSubSecretaryProfile(roster);
  });
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  // Sync both main and sub secretaries automatically whenever date changes according to official roster
  const syncSecretaryForDate = useCallback((dateStr: string) => {
    const roster = getRosterForDate(dateStr);
    setSelectedSecretary(getMainSecretaryProfile(roster));
    setSubSecretary(getSubSecretaryProfile(roster));
  }, []);

  // Comments loaded by date:
  // If user has explicitly customized comments for this date, load customized version.
  // When no comment exists from API or user customization, leave it empty (never fabricate mock content).
  const loadCommentsForDate = useCallback((dateKey: string, apiComment?: EditorialComment, apiComments?: EditorialComment[]): EditorialComment[] => {
    try {
      const savedUserCustomized = localStorage.getItem(`${STORAGE_KEY_COMMENTS_PREFIX}_user_edited_${dateKey}`);
      if (savedUserCustomized) {
        const parsed = JSON.parse(savedUserCustomized);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}

    if (Array.isArray(apiComments) && apiComments.length > 0) {
      return apiComments;
    }

    // Only return comment if actually provided by API/database
    if (apiComment && apiComment.htmlContent && apiComment.htmlContent.trim()) {
      return [apiComment];
    }
    // Strictly return empty array if no comment for this date: "KHÔNG ĐƯỢC TỰ BỊA nội dung. Để trống & show text 'Chưa có nhận xét'"
    return [];
  }, []);

  // Compute immediate dataset for zero-latency initial load and switching
  const initialEditorialData = useMemo(() => {
    return getImmediateEditorialData({
      ...apiConfig,
      selectedDate,
      fromDate,
      toDate,
    });
  }, []);

  // Data states initialized immediately for the active date
  const [trafficData, setTrafficData] = useState<SiteTrafficRow[]>(() => initialEditorialData.trafficData);
  const [engagementGroups, setEngagementGroups] = useState<EngagementGroup[]>(() => initialEditorialData.engagementGroups);
  const [stories, setStories] = useState<StoryItem[]>(() => initialEditorialData.stories);
  const [comments, setComments] = useState<EditorialComment[]>(() =>
    loadCommentsForDate(fromDate, initialEditorialData.defaultComment, initialEditorialData.defaultComments)
  );

  const [isLoading, setIsLoading] = useState(false);
  const [isLiveApi, setIsLiveApi] = useState(false);
  const [storyDate, setStoryDate] = useState<string>(() => initialEditorialData.storyDate);
  const [calledUrls, setCalledUrls] = useState<{
    storyUrl?: string;
    analyticsUrl?: string;
    engageUrl?: string;
  }>(() => initialEditorialData.calledUrls);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Load data function with background sync (SWR pattern)
  const loadData = useCallback(async (cfg: ApiConfig, isManual = false) => {
    if (isManual) {
      setIsLoading(true);
    }
    const curFromDate = cfg.fromDate || cfg.selectedDate || '2026-09-24';
    try {
      const res = await fetchEditorialData(cfg, isManual);
      setTrafficData(res.trafficData);
      setEngagementGroups(res.engagementGroups);
      setStories(res.stories);
      setIsLiveApi(res.isLive);
      setStoryDate(res.storyDate || res.activeFromDate);
      setCalledUrls(res.calledUrls);

      // Synchronize comments for this date
      const dateComments = loadCommentsForDate(curFromDate, res.defaultComment, res.defaultComments);
      setComments(dateComments);

      // Synchronize duty secretary if provided by API (e.g. past dates with actual editorial comments)
      if (res.dutySecretary) {
        setSelectedSecretary(res.dutySecretary);
      }
      if (res.subSecretary) {
        setSubSecretary(res.subSecretary);
      }

      if (res.error) {
        console.info(res.error);
      }
    } catch (err: any) {
      console.warn('Error loading editorial data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [loadCommentsForDate]);

  // Background auto-sync with Google Sheet schedule if URL was saved
  useEffect(() => {
    const sheetUrl = getSavedSheetUrl();
    if (sheetUrl) {
      fetchRosterFromGoogleSheet(sheetUrl)
        .then((res) => {
          if (res.success) {
            syncSecretaryForDate(fromDate);
          }
        })
        .catch(() => {});
    }
  }, [fromDate, syncSecretaryForDate]);

  // Load / revalidate in background when dates or config change
  useEffect(() => {
    loadData({
      ...apiConfig,
      selectedDate,
      fromDate,
      toDate,
    });
  }, [selectedDate, fromDate, toDate, loadData, apiConfig]);

  // Instantaneous date change handler: Zero-latency UI response
  const handleDateChange = (newDate: string, newFromDate?: string, newToDate?: string) => {
    const fDate = newFromDate || newDate;
    const tDate = newToDate || newDate;
    setSelectedDate(newDate);
    setFromDate(fDate);
    setToDate(tDate);

    // ⚡ INSTANT UPDATE (0ms): render new date data IMMEDIATELY
    const immediateData = getImmediateEditorialData({
      ...apiConfig,
      selectedDate: newDate,
      fromDate: fDate,
      toDate: tDate,
    });
    setTrafficData(immediateData.trafficData);
    setEngagementGroups(immediateData.engagementGroups);
    setStories(immediateData.stories);
    setStoryDate(immediateData.storyDate);
    setCalledUrls(immediateData.calledUrls);

    // Sync secretary for this date immediately
    syncSecretaryForDate(fDate);

    // Sync comments for this date immediately
    const dateComments = loadCommentsForDate(fDate, immediateData.defaultComment, immediateData.defaultComments);
    setComments(dateComments);

    const updated = {
      ...apiConfig,
      selectedDate: newDate,
      fromDate: fDate,
      toDate: tDate,
    };
    setApiConfig(updated);
    saveApiConfig(updated);
    showToast(
      fDate === tDate
        ? `Đã chuyển sang ngày ${fDate}`
        : `Đã chọn khoảng từ ${fDate} đến ${tDate}`
    );
  };

  const handleSecretaryChange = (sec: SecretaryProfile) => {
    setSelectedSecretary(sec);
    showToast(`Đã chọn Thư ký trực chính: ${sec.name} (@${sec.username})`);
  };

  const handleSubSecretaryChange = (sec: SecretaryProfile) => {
    setSubSecretary(sec);
    showToast(`Đã chọn Thư ký trực phụ: ${sec.name} (@${sec.username})`);
  };

  const handleSaveConfig = (newConfig: ApiConfig) => {
    setApiConfig(newConfig);
    saveApiConfig(newConfig);
    loadData({ ...newConfig, selectedDate, fromDate, toDate });
    showToast('Đã lưu cấu hình API');
  };

  // Comment Handlers: explicitly save changes to user customized storage
  const handleUpdateComment = (id: string, updated: { title: string; html: string; category?: CommentCategory }) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    setComments((prev) => {
      const next = prev.map((c) =>
        c.id === id
          ? {
              ...c,
              summaryTitle: updated.title,
              htmlContent: updated.html,
              category: updated.category || c.category || 'vnexpress',
              updatedAt: timeStr,
              author: selectedSecretary.username,
            }
          : c
      );
      localStorage.setItem(`${STORAGE_KEY_COMMENTS_PREFIX}_user_edited_${fromDate}`, JSON.stringify(next));
      return next;
    });
    showToast('Đã lưu nội dung nhận xét!');
  };

  const handleDeleteComment = (id: string) => {
    setComments((prev) => {
      const next = prev.filter((c) => c.id !== id);
      localStorage.setItem(`${STORAGE_KEY_COMMENTS_PREFIX}_user_edited_${fromDate}`, JSON.stringify(next));
      return next;
    });
    showToast('Đã xóa khối nhận xét!');
  };

  const handleAddComment = (content: { title: string; html: string; category?: CommentCategory }) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const newComment: EditorialComment = {
      id: `cm-${Date.now()}`,
      author: selectedSecretary.username,
      role: 'Thư ký trực BBT',
      dateStr: fromDate,
      updatedAt: timeStr,
      summaryTitle: content.title,
      htmlContent: content.html,
      category: content.category || 'vnexpress',
    };
    setComments((prev) => {
      const next = [newComment, ...prev];
      localStorage.setItem(`${STORAGE_KEY_COMMENTS_PREFIX}_user_edited_${fromDate}`, JSON.stringify(next));
      return next;
    });
    showToast('Đã thêm nhận xét mới của Thư ký trực!');
  };

  // Handler for adding comment from the top dropdown bar (allows adding to any target date)
  const handleAddNewCommentFromTop = (data: {
    title: string;
    html: string;
    category: CommentCategory;
    date: string;
    author: string;
  }) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const targetDate = data.date;

    const newComment: EditorialComment = {
      id: `cm-${Date.now()}`,
      author: data.author || selectedSecretary.username,
      role: 'Thư ký trực BBT',
      dateStr: targetDate,
      updatedAt: timeStr,
      summaryTitle: data.title,
      htmlContent: data.html,
      category: data.category,
    };

    // Save to target date storage
    try {
      const existing = localStorage.getItem(`${STORAGE_KEY_COMMENTS_PREFIX}_user_edited_${targetDate}`);
      let list: EditorialComment[] = existing ? JSON.parse(existing) : [];
      if (!Array.isArray(list)) list = [];
      list = [newComment, ...list];
      localStorage.setItem(`${STORAGE_KEY_COMMENTS_PREFIX}_user_edited_${targetDate}`, JSON.stringify(list));
    } catch {}

    // If currently viewing targetDate, update state
    if (targetDate === fromDate) {
      setComments((prev) => [newComment, ...prev]);
    } else {
      // Switch view to the date user just added comment for!
      handleDateChange(targetDate, targetDate, targetDate);
    }

    showToast(`Đã thêm nhận xét cho ngày ${targetDate} (${data.category === 'vnexpress' ? 'VnExpress' : 'Site vệ tinh'})!`);
  };

  // Compute current and past dates (today and past 14 days) that have NO comments yet
  // "Chỉ cho chọn ngày hiện tại & quá khứ chưa có nhận xét, không cho chọn ngày tương lai."
  const availableDatesWithoutComments = useMemo(() => {
    const dates: string[] = [];
    const now = new Date();
    // i = 0 (hôm nay), i = 1..14 (các ngày quá khứ)
    for (let i = 0; i <= 14; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const ymd = `${y}-${m}-${day}`;

      // Check if localStorage has comments for this date
      const saved = localStorage.getItem(`${STORAGE_KEY_COMMENTS_PREFIX}_user_edited_${ymd}`);
      let hasComments = false;
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            hasComments = true;
          }
        } catch {}
      }
      if (!hasComments) {
        dates.push(ymd);
      }
    }
    return dates;
  }, [comments, fromDate]);

  // Quick export plain text summary for BBT group chat
  const handleExportSummary = () => {
    const textLines = [
      `=== BẢN TIN NHẬN XÉT ĐỀ TÀI VNEXPRESS (${fromDate}${fromDate !== toDate ? ` - ${toDate}` : ''}) ===`,
      `Thư ký trực: ${selectedSecretary.name} (@${selectedSecretary.username})`,
      '',
      `1. TRAFFIC TOÀN TRANG (All Sites):`,
      `- Users: ${trafficData[0]?.users.formattedValue} (${trafficData[0]?.users.changeVsYesterday}% vs hôm qua)`,
      `- Pageviews: ${trafficData[0]?.pageviews.formattedValue} (${trafficData[0]?.pageviews.changeVsYesterday}% vs hôm qua)`,
      `- Articles: ${trafficData[0]?.articles.formattedValue} bài`,
      '',
      `2. PHÂN LOẠI HIỆU QUẢ:`,
      ...engagementGroups.map(
        (g) =>
          `- ${g.name}: ${g.articleCount} bài (${g.articleSharePct}%), ${g.pageviewFormatted} (${g.pageviewSharePct}%)`
      ),
      '',
      `3. ĐỀ TÀI QUAN TRỌNG (${storyDate}):`,
      `- Chưa xuất bản: ${stories.filter((s) => String(s.important) === '1' && s.article_status_label !== 'Published').length} đề tài`,
      `- Đã xuất bản: ${stories.filter((s) => String(s.important) === '1' && s.article_status_label === 'Published').length} đề tài`,
    ];

    navigator.clipboard.writeText(textLines.join('\n'));
    showToast('Đã sao chép tóm tắt nhận xét vào Clipboard!');
  };

  // Compute date label for Card Header matching image.png (e.g. "Thứ tư, 23/9")
  const getDateLabel = () => {
    try {
      const parts = fromDate.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        const dayNames = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
        if (fromDate === toDate) {
          return `${dayNames[d.getDay()]}, ${parseInt(parts[2], 10)}/${parseInt(parts[1], 10)}`;
        }
        const toParts = toDate.split('-');
        return `${parseInt(parts[2], 10)}/${parseInt(parts[1], 10)} - ${parseInt(toParts[2], 10)}/${parseInt(toParts[1], 10)}`;
      }
    } catch {
      // fallback
    }
    return 'Thứ tư, 23/9';
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Top Application Bar */}
      <Header
        selectedDate={selectedDate}
        fromDate={fromDate}
        toDate={toDate}
        onDateChange={handleDateChange}
        selectedSecretary={selectedSecretary}
        onSecretaryChange={handleSecretaryChange}
        onRefresh={() => loadData({ ...apiConfig, selectedDate, fromDate, toDate }, true)}
        isLoading={isLoading}
        onOpenConfig={() => setIsConfigModalOpen(true)}
        isLiveApi={isLiveApi}
        onExportSummary={handleExportSummary}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto p-3 sm:p-5 lg:p-6">
        {/* Two-Column Responsive Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
          {/* LEFT COLUMN: Approximately 62% width */}
          <div className="xl:col-span-7 2xl:col-span-8 space-y-4">
            {/* Tính năng Thêm mới nhận xét đề tài ở đầu trang, dành cho ngày gần nhất chưa có nhận xét/đề tài */}
            {availableDatesWithoutComments.length > 0 && (
              <NewCommentDropdownBar
                currentViewingDate={fromDate}
                availableDatesWithoutComments={availableDatesWithoutComments}
                onAddComment={handleAddNewCommentFromTop}
              />
            )}

            {/* Master Card Enclosure matching image.png */}
            <div className="bg-white rounded-xl border border-slate-300 p-4 sm:p-6 shadow-xs space-y-5">
              {/* Card Header: Ngày đang xem + Thư ký trực */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl sm:text-2xl font-bold font-serif text-[#9f224e] tracking-tight">
                    {getDateLabel()}
                  </h2>
                  <span className="text-xs text-slate-400 font-mono">
                    ({fromDate})
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-700">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 font-normal">Trực chính (VnExpress):</span>
                    <button
                      onClick={() => {
                        const idx = SECRETARIES.findIndex((s) => s.id === selectedSecretary.id);
                        const next = SECRETARIES[(idx + 1) % SECRETARIES.length];
                        handleSecretaryChange(next);
                      }}
                      className="font-semibold text-slate-900 hover:text-[#9f224e] flex items-center gap-1.5 px-2 py-0.5 rounded-md hover:bg-slate-100 transition-colors cursor-pointer bg-slate-50 border border-slate-200"
                      title="Nhấn để đổi nhanh thư ký trực chính"
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block shrink-0"></span>
                      <span>{selectedSecretary.name} (@{selectedSecretary.username})</span>
                      <span className="text-slate-400">∨</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 font-normal">Trực phụ (Site khác):</span>
                    <button
                      onClick={() => {
                        const idx = SECRETARIES.findIndex((s) => s.id === subSecretary.id);
                        const next = SECRETARIES[(idx + 1) % SECRETARIES.length];
                        handleSubSecretaryChange(next);
                      }}
                      className="font-semibold text-slate-900 hover:text-[#9f224e] flex items-center gap-1.5 px-2 py-0.5 rounded-md hover:bg-slate-100 transition-colors cursor-pointer bg-slate-50 border border-slate-200"
                      title="Nhấn để đổi nhanh thư ký trực phụ"
                    >
                      <span className="w-2 h-2 rounded-full bg-purple-500 inline-block shrink-0"></span>
                      <span>{subSecretary.name} (@{subSecretary.username})</span>
                      <span className="text-slate-400">∨</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 1/ Thống kê traffic theo các kênh (Users, Pageviews, Articles) */}
              <div>
                <TrafficSection data={trafficData} lastUpdated={comments[0]?.updatedAt} />
              </div>

              {/* 2/ Thống kê bài xuất bản theo nhóm (Hiệu quả cao, Views cao, Tương tác tốt, Cân nhắc) */}
              <div>
                <EngagementGroupsSection groups={engagementGroups} />
              </div>

              {/* 3/ Nhận xét bài viết hôm qua (Rich Editor, format text cơ bản, + Thêm nhận xét) */}
              <div className="pt-2">
                <EditorialCommentsSection
                  comments={comments}
                  selectedSecretary={selectedSecretary}
                  subSecretary={subSecretary}
                  onUpdateComment={handleUpdateComment}
                  onDeleteComment={handleDeleteComment}
                  onAddComment={handleAddComment}
                />
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Important Stories */}
          <div className="xl:col-span-5 2xl:col-span-4 sticky top-20">
            <ImportantStoriesColumn stories={stories} selectedDate={fromDate} storyDate={storyDate} />
          </div>
        </div>
      </main>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-lg text-xs font-medium flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* API Configuration Modal */}
      <ApiConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        config={{
          ...apiConfig,
          selectedDate,
          fromDate,
          toDate,
        }}
        onSaveConfig={handleSaveConfig}
      />
    </div>
  );
}
