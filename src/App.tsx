import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { TrafficSection } from './components/TrafficSection';
import { EngagementGroupsSection } from './components/EngagementGroupsSection';
import { EditorialCommentsSection } from './components/EditorialCommentsSection';
import { ImportantStoriesColumn } from './components/ImportantStoriesColumn';
import { ApiConfigModal } from './components/ApiConfigModal';
import {
  SiteTrafficRow,
  EngagementGroup,
  StoryItem,
  EditorialComment,
  SecretaryProfile,
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
} from './services/apiService';
import { Check, Copy, AlertCircle, Info } from 'lucide-react';

const STORAGE_KEY_COMMENTS = 'vne_editorial_comments_v1';

export default function App() {
  const [apiConfig, setApiConfig] = useState<ApiConfig>(getSavedApiConfig);
  const [selectedDate, setSelectedDate] = useState<string>('2026-09-23');
  const [selectedSecretary, setSelectedSecretary] = useState<SecretaryProfile>(SECRETARIES[0]);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  // Data states
  const [trafficData, setTrafficData] = useState<SiteTrafficRow[]>(MOCK_TRAFFIC_DATA_23_09);
  const [engagementGroups, setEngagementGroups] = useState<EngagementGroup[]>(MOCK_ENGAGEMENT_GROUPS_23_09);
  const [stories, setStories] = useState<StoryItem[]>(MOCK_STORIES);
  const [comments, setComments] = useState<EditorialComment[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_COMMENTS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return MOCK_EDITORIAL_COMMENTS;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isLiveApi, setIsLiveApi] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Save comments to localStorage when changed
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_COMMENTS, JSON.stringify(comments));
  }, [comments]);

  // Load data function
  const loadData = useCallback(async (cfg: ApiConfig) => {
    setIsLoading(true);
    try {
      const res = await fetchEditorialData(cfg);
      setTrafficData(res.trafficData);
      setEngagementGroups(res.engagementGroups);
      setStories(res.stories);
      setIsLiveApi(res.isLive);
      if (res.error) {
        console.info(res.error);
      }
    } catch (err: any) {
      console.warn('Error loading editorial data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData({ ...apiConfig, selectedDate });
  }, [selectedDate, loadData, apiConfig]);

  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    const updated = { ...apiConfig, selectedDate: newDate };
    setApiConfig(updated);
    saveApiConfig(updated);
    showToast(`Đã chuyển sang ngày ${newDate}`);
  };

  const handleSecretaryChange = (sec: SecretaryProfile) => {
    setSelectedSecretary(sec);
    showToast(`Đã chọn Thư ký trực: ${sec.name} (@${sec.username})`);
  };

  const handleSaveConfig = (newConfig: ApiConfig) => {
    setApiConfig(newConfig);
    saveApiConfig(newConfig);
    loadData({ ...newConfig, selectedDate });
    showToast(newConfig.useLiveApi ? 'Đã bật chế độ kết nối Live API' : 'Đã lưu cấu hình dữ liệu chuẩn');
  };

  // Comment Handlers
  const handleUpdateComment = (id: string, updated: { title: string; html: string }) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    setComments((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              summaryTitle: updated.title,
              htmlContent: updated.html,
              updatedAt: timeStr,
              author: selectedSecretary.username,
            }
          : c
      )
    );
    showToast('Đã lưu nội dung nhận xét!');
  };

  const handleDeleteComment = (id: string) => {
    setComments((prev) => prev.filter((c) => c.id !== id));
    showToast('Đã xóa khối nhận xét!');
  };

  const handleAddComment = (content: { title: string; html: string }) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const newComment: EditorialComment = {
      id: `cm-${Date.now()}`,
      author: selectedSecretary.username,
      role: 'Thư ký trực BBT',
      dateStr: selectedDate,
      updatedAt: timeStr,
      summaryTitle: content.title,
      htmlContent: content.html,
    };
    setComments((prev) => [newComment, ...prev]);
    showToast('Đã thêm nhận xét mới của Thư ký trực!');
  };

  // Quick export plain text summary for BBT group chat
  const handleExportSummary = () => {
    const textLines = [
      `=== BẢN TIN NHẬN XÉT ĐỀ TÀI VNEXPRESS (${selectedDate}) ===`,
      `Thư ký trực: ${selectedSecretary.name} (@${selectedSecretary.username})`,
      '',
      `1. TRAFFIC TOÀN TRANG (All Sites):`,
      `- Users: ${trafficData[0]?.users.formattedValue} (${trafficData[0]?.users.changeVsYesterday}% vs hôm qua)`,
      `- Pageviews: ${trafficData[0]?.pageviews.formattedValue} (${trafficData[0]?.pageviews.changeVsYesterday}% vs hôm qua)`,
      `- Articles: ${trafficData[0]?.articles.formattedValue} bài`,
      '',
      `2. PHÂN LOẠI HIỆU QUẢ:`,
      ...engagementGroups.map(
        (g) => `- ${g.name}: ${g.articleCount} bài (${g.articleSharePct}%), ${g.pageviewFormatted} (${g.pageviewSharePct}%)`
      ),
      '',
      `3. ĐỀ TÀI QUAN TRỌNG HÔM QUA:`,
      `- Chưa lên trang: ${stories.filter((s) => s.important === '1' && s.article_status_label !== 'Published').length} đề tài`,
      `- Đã xuất bản: ${stories.filter((s) => s.important === '1' && s.article_status_label === 'Published').length} đề tài`,
    ];

    navigator.clipboard.writeText(textLines.join('\n'));
    showToast('Đã sao chép tóm tắt nhận xét vào Clipboard!');
  };

  // Compute date label for Card Header matching image.png (e.g. "Thứ tư, 23/9")
  const getDateLabel = () => {
    try {
      const parts = selectedDate.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        const dayNames = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
        return `${dayNames[d.getDay()]}, ${parseInt(parts[2], 10)}/${parseInt(parts[1], 10)}`;
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
        onDateChange={handleDateChange}
        selectedSecretary={selectedSecretary}
        onSecretaryChange={handleSecretaryChange}
        onRefresh={() => loadData({ ...apiConfig, selectedDate })}
        isLoading={isLoading}
        onOpenConfig={() => setIsConfigModalOpen(true)}
        isLiveApi={isLiveApi}
        onExportSummary={handleExportSummary}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto p-3 sm:p-5 lg:p-6">
        
        {/* Two-Column Responsive Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
          
          {/* LEFT COLUMN: Exactly matching the layout, cards & info from image.png (approx 62% width) */}
          <div className="xl:col-span-7 2xl:col-span-8 space-y-4">
            
            {/* Master Card Enclosure matching image.png */}
            <div className="bg-white rounded-xl border border-slate-300 p-4 sm:p-6 shadow-xs space-y-5">
              
              {/* Card Header matching image.png: "Thứ tư, 23/9" in red + "Thư ký trực: thuytrang v" */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-xl sm:text-2xl font-bold font-serif text-[#9f224e] tracking-tight">
                  {getDateLabel()}
                </h2>

                <div className="flex items-center gap-1.5 text-xs text-slate-700">
                  <span className="text-slate-500 font-normal">Thư ký trực:</span>
                  <button
                    onClick={() => {
                      // Cycle to next secretary quickly
                      const idx = SECRETARIES.findIndex((s) => s.id === selectedSecretary.id);
                      const next = SECRETARIES[(idx + 1) % SECRETARIES.length];
                      handleSecretaryChange(next);
                    }}
                    className="font-semibold text-slate-900 hover:text-[#9f224e] flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-slate-100 transition-colors"
                    title="Nhấn để đổi nhanh thư ký trực"
                  >
                    <span>{selectedSecretary.username}</span>
                    <span className="text-slate-400">∨</span>
                  </button>
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
                  onUpdateComment={handleUpdateComment}
                  onDeleteComment={handleDeleteComment}
                  onAddComment={handleAddComment}
                />
              </div>

            </div>

          </div>

          {/* RIGHT COLUMN: Newly Added Feature per User Request (approx 38% width) */}
          <div className="xl:col-span-5 2xl:col-span-4 sticky top-20">
            <ImportantStoriesColumn
              stories={stories}
              selectedDate={selectedDate}
            />
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
        config={apiConfig}
        onSaveConfig={handleSaveConfig}
      />

    </div>
  );
}
