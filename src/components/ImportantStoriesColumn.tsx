import React, { useState, useMemo } from 'react';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  User,
  Calendar,
  Layers,
  ChevronRight,
  TrendingUp,
  Globe,
  Smartphone,
  Sparkles,
} from 'lucide-react';
import { StoryItem } from '../types';
import { StoryDetailModal } from './StoryDetailModal';

interface ImportantStoriesColumnProps {
  stories: StoryItem[];
  selectedDate: string;
}

type TabType = 'pending' | 'published' | 'all';

export const ImportantStoriesColumn: React.FC<ImportantStoriesColumnProps> = ({
  stories,
  selectedDate,
}) => {
  // Requirement: "Số lượng đề tài chưa lên trang, chiếm tỉ trọng bao nhiêu: active mặc định vào tab này"
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBan, setSelectedBan] = useState<string>('all');
  const [selectedStoryForModal, setSelectedStoryForModal] = useState<StoryItem | null>(null);

  // Filter only important stories (important === '1')
  const importantStories = useMemo(() => {
    return stories.filter((s) => s.important === '1');
  }, [stories]);

  // Total important
  const totalImportant = importantStories.length;

  // Pending (Chưa lên trang - Chưa xuất bản)
  const pendingStories = useMemo(() => {
    return importantStories.filter((s) => s.article_status_label !== 'Published');
  }, [importantStories]);

  // Published (Đã xuất bản)
  const publishedStories = useMemo(() => {
    return importantStories.filter((s) => s.article_status_label === 'Published');
  }, [importantStories]);

  const pendingCount = pendingStories.length;
  const publishedCount = publishedStories.length;

  const pendingSharePct = totalImportant > 0 ? Math.round((pendingCount / totalImportant) * 100) : 0;
  const publishedSharePct = totalImportant > 0 ? Math.round((publishedCount / totalImportant) * 100) : 0;

  // Extract unique departments (Ban phụ trách)
  const departments = useMemo(() => {
    const set = new Set<string>();
    importantStories.forEach((s) => {
      if (s.ban_name) set.add(s.ban_name);
    });
    return Array.from(set).sort();
  }, [importantStories]);

  // Stories to display based on active tab + filters
  const filteredStories = useMemo(() => {
    let list: StoryItem[] = [];
    if (activeTab === 'pending') {
      list = pendingStories;
    } else if (activeTab === 'published') {
      list = publishedStories;
    } else {
      list = importantStories;
    }

    if (selectedBan !== 'all') {
      list = list.filter((s) => s.ban_name === selectedBan);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.user_name.toLowerCase().includes(q) ||
          s.ban_name.toLowerCase().includes(q)
      );
    }

    return list;
  }, [activeTab, pendingStories, publishedStories, importantStories, selectedBan, searchQuery]);

  const formatDeadline = (todate?: string) => {
    if (!todate) return 'Chưa có hạn';
    try {
      const ts = parseInt(todate, 10);
      if (isNaN(ts)) return todate;
      const d = new Date(ts * 1000);
      return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' ' + d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    } catch {
      return todate;
    }
  };

  const getDepartmentColor = (banName: string) => {
    const lower = banName.toLowerCase();
    if (lower.includes('thời sự')) return 'bg-red-50 text-red-700 border-red-200';
    if (lower.includes('kinh doanh')) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (lower.includes('pháp luật')) return 'bg-amber-50 text-amber-700 border-amber-200';
    if (lower.includes('thế giới')) return 'bg-purple-50 text-purple-700 border-purple-200';
    if (lower.includes('sức khỏe')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (lower.includes('thể thao')) return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    return 'bg-slate-50 text-slate-700 border-slate-200';
  };

  const getArticleStatusBadge = (status: string) => {
    switch (status) {
      case 'Published':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Đã xuất bản</span>
          </span>
        );
      case 'Editing':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>Đang biên tập</span>
          </span>
        );
      case 'Verifying':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
            <Layers className="w-3 h-3 text-blue-600" />
            <span>Chờ thẩm định</span>
          </span>
        );
      case 'None':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>Chưa lên trang</span>
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden flex flex-col h-full">
      {/* Column Header */}
      <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-4 bg-[#9f224e] rounded-xs" />
            <h2 className="font-bold text-slate-900 text-sm tracking-tight">
              Đề tài Quan trọng ngày hôm qua
            </h2>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            Tổng cộng: <strong className="text-slate-900">{totalImportant}</strong> đề tài
          </span>
        </div>

        {/* 3 Summary Statistic Cards */}
        <div className="grid grid-cols-3 gap-2">
          
          {/* Card 1: Tổng số đề tài quan trọng */}
          <div
            onClick={() => setActiveTab('all')}
            className={`p-2.5 rounded-lg border cursor-pointer transition-all text-center ${
              activeTab === 'all'
                ? 'bg-slate-100 border-slate-400 shadow-xs'
                : 'bg-white border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
              Tổng số
            </div>
            <div className="text-xl font-bold text-slate-900 mt-0.5 tabular-nums">
              {totalImportant}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 font-medium">
              100% đề tài
            </div>
          </div>

          {/* Card 2: Số lượng đề tài CHƯA LÊN TRANG (Active Mặc định) */}
          <div
            onClick={() => setActiveTab('pending')}
            className={`p-2.5 rounded-lg border cursor-pointer transition-all text-center relative ${
              activeTab === 'pending'
                ? 'bg-amber-50/70 border-amber-400 ring-2 ring-amber-200 shadow-xs'
                : 'bg-white border-slate-200 hover:bg-amber-50/30'
            }`}
          >
            <div className="text-[10px] text-amber-800 font-bold uppercase tracking-wider flex items-center justify-center gap-0.5">
              <span>Chưa lên trang</span>
            </div>
            <div className="text-xl font-extrabold text-amber-700 mt-0.5 tabular-nums">
              {pendingCount}
            </div>
            <div className="text-[10px] font-bold text-amber-700 mt-0.5">
              Chiếm {pendingSharePct}%
            </div>
            {activeTab === 'pending' && (
              <span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-amber-500 rounded-full border-2 border-white" />
            )}
          </div>

          {/* Card 3: Số lượng ĐÃ XUẤT BẢN */}
          <div
            onClick={() => setActiveTab('published')}
            className={`p-2.5 rounded-lg border cursor-pointer transition-all text-center relative ${
              activeTab === 'published'
                ? 'bg-emerald-50/70 border-emerald-400 ring-2 ring-emerald-200 shadow-xs'
                : 'bg-white border-slate-200 hover:bg-emerald-50/30'
            }`}
          >
            <div className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider flex items-center justify-center gap-0.5">
              <span>Đã xuất bản</span>
            </div>
            <div className="text-xl font-extrabold text-emerald-700 mt-0.5 tabular-nums">
              {publishedCount}
            </div>
            <div className="text-[10px] font-bold text-emerald-700 mt-0.5">
              Chiếm {publishedSharePct}%
            </div>
            {activeTab === 'published' && (
              <span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
            )}
          </div>

        </div>

        {/* Search & Filter Toolbar */}
        <div className="mt-3 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên đề tài, phóng viên..."
              className="w-full text-xs pl-8 pr-2.5 py-1.5 bg-white border border-slate-200 rounded text-slate-700 focus:outline-none focus:border-[#9f224e]"
            />
          </div>

          <div className="relative shrink-0">
            <select
              value={selectedBan}
              onChange={(e) => setSelectedBan(e.target.value)}
              className="text-xs py-1.5 pl-2 pr-6 bg-white border border-slate-200 rounded text-slate-700 focus:outline-none focus:border-[#9f224e] cursor-pointer"
            >
              <option value="all">Tất cả Ban ({importantStories.length})</option>
              {departments.map((b) => (
                <option key={b} value={b}>
                  Ban {b}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabs Switcher Navigation */}
      <div className="border-b border-slate-200 bg-slate-50/60 px-4 flex items-center gap-4 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('pending')}
          className={`py-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'pending'
              ? 'border-amber-600 text-amber-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Chưa lên trang ({pendingCount})</span>
        </button>

        <button
          onClick={() => setActiveTab('published')}
          className={`py-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'published'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Đã xuất bản ({publishedCount})</span>
        </button>

        <button
          onClick={() => setActiveTab('all')}
          className={`py-2.5 border-b-2 transition-colors flex items-center gap-1.5 ml-auto ${
            activeTab === 'all'
              ? 'border-[#9f224e] text-[#9f224e]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Tất cả ({totalImportant})</span>
        </button>
      </div>

      {/* Stories List for Active Tab */}
      <div className="p-3 space-y-2.5 overflow-y-auto max-h-[750px] divide-y divide-slate-100 flex-1">
        {filteredStories.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <FileText className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-xs">Không có đề tài nào phù hợp với bộ lọc</p>
          </div>
        ) : (
          filteredStories.map((story) => {
            const hasBuildTop = Boolean(story.buildtop_info?.trangchu_beta || story.buildtop_info?.trangchu_mobile);
            const isOverdue = story.is_qua_han === '1';

            return (
              <div
                key={story.story_id}
                onClick={() => setSelectedStoryForModal(story)}
                className="pt-2.5 first:pt-0 group hover:bg-slate-50/70 p-2 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-slate-200"
              >
                {/* Row 1: Badges - Ban phụ trách & Trạng thái bài viết & Quá hạn */}
                <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                  {/* Ban phụ trách */}
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${getDepartmentColor(
                      story.ban_name
                    )}`}
                  >
                    Ban {story.ban_name}
                  </span>

                  {/* Tiến độ bài viết */}
                  {getArticleStatusBadge(story.article_status_label)}

                  {/* Trạng thái đề tài */}
                  <span className="text-[10px] text-slate-500 font-medium px-1.5 py-0.5 bg-slate-100 rounded">
                    {story.status_label}
                  </span>

                  {/* Cảnh báo quá hạn nếu có */}
                  {isOverdue && (
                    <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                      <AlertCircle className="w-2.5 h-2.5" /> Quá hạn
                    </span>
                  )}

                  {/* Vị trí Build Top nếu có */}
                  {hasBuildTop && (
                    <span className="ml-auto text-[10px] font-semibold text-[#9f224e] bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded flex items-center gap-1">
                      <Globe className="w-2.5 h-2.5" />
                      <span>
                        Top{' '}
                        {story.buildtop_info?.trangchu_beta?.position
                          ? `Web #${story.buildtop_info.trangchu_beta.position}`
                          : `Mobile #${story.buildtop_info?.trangchu_mobile?.position}`}
                      </span>
                    </span>
                  )}
                </div>

                {/* Row 2: Tên đề tài */}
                <h4 className="font-semibold text-slate-900 text-xs leading-snug group-hover:text-[#9f224e] transition-colors mb-1.5">
                  {story.title}
                </h4>

                {/* Row 3: Acc phóng viên triển khai + Hạn hoàn thành + Chi tiết */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-50">
                  <div className="flex items-center gap-3">
                    {/* Acc phóng viên */}
                    <div className="flex items-center gap-1 text-slate-700 font-medium">
                      <User className="w-3 h-3 text-slate-400" />
                      <span>@{story.user_name}</span>
                    </div>

                    {/* Hạn hoàn thành */}
                    <div className="flex items-center gap-1 text-slate-500">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>Hạn: {formatDeadline(story.todate)}</span>
                    </div>
                  </div>

                  <span className="text-[11px] text-slate-400 group-hover:text-slate-700 flex items-center gap-0.5 font-medium">
                    <span>Chi tiết</span>
                    <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Story Detail Modal */}
      <StoryDetailModal
        story={selectedStoryForModal}
        onClose={() => setSelectedStoryForModal(null)}
      />
    </div>
  );
};
