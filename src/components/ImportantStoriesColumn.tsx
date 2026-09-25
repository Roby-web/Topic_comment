import React, { useState, useMemo, useEffect } from 'react';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  User,
  Calendar,
  Layers,
  Globe,
  Smartphone,
} from 'lucide-react';
import { StoryItem } from '../types';
import { StoryDetailModal } from './StoryDetailModal';

interface ImportantStoriesColumnProps {
  stories: StoryItem[];
  selectedDate: string; // The main selected date (e.g. 2026-09-25)
  storyDate?: string;   // The effective date for stories (e.g. 2026-09-24)
}

// 3 groups: 'overdue' (Quá hạn), 'upcoming' (Chưa đến hạn), 'published' (Đã xuất bản)
type ActiveGroupType = 'overdue' | 'upcoming' | 'published';

export const ImportantStoriesColumn: React.FC<ImportantStoriesColumnProps> = ({
  stories,
  selectedDate,
  storyDate,
}) => {
  const [activeGroup, setActiveGroup] = useState<ActiveGroupType>('overdue');
  const [selectedBan, setSelectedBan] = useState<string>('all');
  const [selectedStoryForModal, setSelectedStoryForModal] = useState<StoryItem | null>(null);

  // Compute Vietnamese date string for the title format: (Thứ ba - 22/9)
  const effectiveDateYmd = storyDate || selectedDate;
  const getFormattedStoryDate = (ymd: string) => {
    try {
      const parts = ymd.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        const dayNames = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
        const dayName = dayNames[d.getDay()];
        return `${dayName} - ${parseInt(parts[2], 10)}/${parseInt(parts[1], 10)}`;
      }
    } catch {
      // fallback
    }
    return ymd;
  };

  const storyDateTitle = getFormattedStoryDate(effectiveDateYmd);

  // Filter only important stories (important === '1' or 1 as requested: "Chỉ lấy đề tài tham số important=1")
  const importantStories = useMemo(() => {
    return stories.filter((s) => String(s.important) === '1');
  }, [stories]);

  // Total important
  const totalImportant = importantStories.length;

  // Published stories (Đã xuất bản)
  const publishedStories = useMemo(() => {
    return importantStories.filter((s) => s.article_status_label === 'Published');
  }, [importantStories]);

  // Pending stories (Chưa xuất bản)
  const pendingStories = useMemo(() => {
    return importantStories.filter((s) => s.article_status_label !== 'Published');
  }, [importantStories]);

  // Helper to determine if a pending story is overdue
  // Condition: explicit is_qua_han === '1' OR todate timestamp is in the past
  const isStoryOverdue = (s: StoryItem): boolean => {
    if (String(s.is_qua_han) === '1') return true;
    if (s.todate) {
      const ts = parseInt(s.todate, 10);
      if (!isNaN(ts) && ts > 0) {
        // Compare with current timestamp in seconds
        const nowSec = Math.floor(Date.now() / 1000);
        return ts < nowSec;
      }
    }
    return false;
  };

  // Group 1: Quá hạn (Chưa xuất bản & Quá hạn)
  const overdueStories = useMemo(() => {
    return pendingStories.filter((s) => isStoryOverdue(s));
  }, [pendingStories]);

  // Group 2: Chưa đến hạn (Chưa xuất bản & Chưa quá hạn)
  const upcomingStories = useMemo(() => {
    return pendingStories.filter((s) => !isStoryOverdue(s));
  }, [pendingStories]);

  const overdueCount = overdueStories.length;
  const upcomingCount = upcomingStories.length;
  const publishedCount = publishedStories.length;

  // Build list of active cards with count > 0:
  // "Tab nào không có dữ liệu thì ẩn đi, điều chỉnh chiều rộng các tab còn lại full box"
  const visibleCards = useMemo(() => {
    const cards: Array<{
      key: ActiveGroupType;
      label: string;
      count: number;
      sharePct: number;
      activeTheme: string;
      restTheme: string;
      textCountColor: string;
      textShareColor: string;
      badgeColor: string;
    }> = [];

    if (overdueCount > 0) {
      cards.push({
        key: 'overdue',
        label: 'Quá hạn',
        count: overdueCount,
        sharePct: totalImportant > 0 ? Math.round((overdueCount / totalImportant) * 100) : 0,
        activeTheme: 'bg-rose-50/70 border-rose-500 ring-2 ring-rose-200 shadow-xs',
        restTheme: 'bg-white border-slate-200 hover:bg-rose-50/30',
        textCountColor: 'text-rose-700',
        textShareColor: 'text-rose-600',
        badgeColor: 'bg-rose-500',
      });
    }

    if (upcomingCount > 0) {
      cards.push({
        key: 'upcoming',
        label: 'Chưa đến hạn',
        count: upcomingCount,
        sharePct: totalImportant > 0 ? Math.round((upcomingCount / totalImportant) * 100) : 0,
        activeTheme: 'bg-amber-50/70 border-amber-500 ring-2 ring-amber-200 shadow-xs',
        restTheme: 'bg-white border-slate-200 hover:bg-amber-50/30',
        textCountColor: 'text-amber-700',
        textShareColor: 'text-amber-600',
        badgeColor: 'bg-amber-500',
      });
    }

    if (publishedCount > 0) {
      cards.push({
        key: 'published',
        label: 'Đã xuất bản',
        count: publishedCount,
        sharePct: totalImportant > 0 ? Math.round((publishedCount / totalImportant) * 100) : 0,
        activeTheme: 'bg-emerald-50/70 border-emerald-500 ring-2 ring-emerald-200 shadow-xs',
        restTheme: 'bg-white border-slate-200 hover:bg-emerald-50/30',
        textCountColor: 'text-emerald-700',
        textShareColor: 'text-emerald-600',
        badgeColor: 'bg-emerald-500',
      });
    }

    return cards;
  }, [overdueCount, upcomingCount, publishedCount, totalImportant]);

  // Ensure activeGroup is valid and points to a visible card
  useEffect(() => {
    if (visibleCards.length > 0) {
      const exists = visibleCards.some((c) => c.key === activeGroup);
      if (!exists) {
        setActiveGroup(visibleCards[0].key);
      }
    }
  }, [visibleCards, activeGroup]);

  // Reset selectedBan when activeGroup changes
  const handleSelectGroup = (groupKey: ActiveGroupType) => {
    setActiveGroup(groupKey);
    setSelectedBan('all');
  };

  // Stories belonging to currently active group
  const activeGroupStories = useMemo(() => {
    switch (activeGroup) {
      case 'overdue':
        return overdueStories;
      case 'upcoming':
        return upcomingStories;
      case 'published':
        return publishedStories;
      default:
        return overdueStories;
    }
  }, [activeGroup, overdueStories, upcomingStories, publishedStories]);

  // Thống kê số lượng đề tài theo ban trong nhóm đang active
  const banStatisticsForGroup = useMemo(() => {
    const map = new Map<string, number>();
    activeGroupStories.forEach((s) => {
      const ban = s.ban_name || 'Khác';
      map.set(ban, (map.get(ban) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'vi'));
  }, [activeGroupStories]);

  // Filtered stories to display (including ban filter)
  const displayedStories = useMemo(() => {
    if (selectedBan === 'all') return activeGroupStories;
    return activeGroupStories.filter((s) => s.ban_name === selectedBan);
  }, [activeGroupStories, selectedBan]);

  // Format deadline according to Rule.md Section 2: {Giờ}:{Phút}, {Ngày}/{Tháng}
  const formatDeadline = (todate?: string) => {
    if (!todate) return 'Chưa có hạn';
    try {
      const ts = parseInt(todate, 10);
      if (isNaN(ts)) return todate;
      const d = new Date(ts * 1000);
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      const day = d.getDate();
      const month = d.getMonth() + 1;
      return `${hours}:${minutes}, ${day}/${month}`;
    } catch {
      return todate;
    }
  };

  // Requirement: Sửa tên tag:
  // - Trạng thái bài viết sửa thành "Bài viết: [tên trạng thái]"
  // - Riêng trạng thái "None" của bài viết Việt hóa thành "Chưa tạo bài"
  // - Bỏ background tag đi
  const formatArticleStatusText = (status?: string) => {
    if (!status || status === 'None' || status === 'none' || status === '0') {
      return 'Bài viết: Chưa tạo bài';
    }
    return `Bài viết: ${status}`;
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden flex flex-col h-full">
      {/* Column Header */}
      <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-4 bg-[#9f224e] rounded-xs" />
            <h2 className="font-bold text-slate-900 text-sm tracking-tight">
              Đề tài quan trọng ({storyDateTitle})
            </h2>
          </div>
          <span className="text-[11px] text-slate-500 font-medium shrink-0">
            Tổng: <strong className="text-slate-900">{totalImportant}</strong> đề tài
          </span>
        </div>

        {/* Dynamic Summary Statistic Cards: Ẩn tab có count = 0, chia đều chiều rộng full box */}
        <div
          className={`grid gap-2 ${
            visibleCards.length === 1
              ? 'grid-cols-1'
              : visibleCards.length === 2
              ? 'grid-cols-2'
              : 'grid-cols-3'
          }`}
        >
          {visibleCards.map((card) => {
            const isActive = activeGroup === card.key;
            return (
              <div
                key={card.key}
                onClick={() => handleSelectGroup(card.key)}
                className={`p-2.5 rounded-lg border cursor-pointer transition-all text-center relative ${
                  isActive ? card.activeTheme : card.restTheme
                }`}
              >
                <div className="text-[10px] text-slate-700 font-bold uppercase tracking-wider flex items-center justify-center gap-0.5">
                  <span>{card.label}</span>
                </div>
                <div className={`text-lg font-extrabold mt-0.5 tabular-nums flex items-baseline justify-center gap-1.5 ${card.textCountColor}`}>
                  <span>{card.count}</span>
                  <span className={`text-xs font-semibold ${card.textShareColor}`}>
                    ({card.sharePct}%)
                  </span>
                </div>
                {isActive && (
                  <span className={`absolute -top-1.5 -right-1.5 w-3 h-3 ${card.badgeColor} rounded-full border-2 border-white`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Thống kê số lượng đề tài theo ban - Bấm vào sẽ active & lọc kết quả tương ứng (bấm lại để tắt lọc, không dùng nút 'Tất cả') */}
        {banStatisticsForGroup.length > 0 && (
          <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-medium mr-1 text-[11px]">Theo ban:</span>
            {banStatisticsForGroup.map((b) => {
              const isSelected = selectedBan === b.name;
              return (
                <button
                  key={b.name}
                  type="button"
                  onClick={() => setSelectedBan(isSelected ? 'all' : b.name)}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#9f224e] text-white font-bold shadow-2xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium'
                  }`}
                  title={isSelected ? `Bỏ lọc Ban ${b.name}` : `Lọc theo Ban ${b.name}`}
                >
                  <span>{b.name}:</span>
                  <span className="tabular-nums font-semibold">{b.count}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Stories List for Active Group */}
      <div className="p-3 space-y-2.5 overflow-y-auto max-h-[750px] divide-y divide-slate-100 flex-1">
        {displayedStories.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <FileText className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-xs">
              {selectedBan !== 'all'
                ? `Không có đề tài nào thuộc Ban ${selectedBan}`
                : activeGroup === 'overdue'
                ? 'Không có đề tài nào quá hạn'
                : activeGroup === 'upcoming'
                ? 'Không có đề tài nào chưa đến hạn'
                : 'Không có đề tài nào đã xuất bản'}
            </p>
          </div>
        ) : (
          displayedStories.map((story) => {
            const hasBuildTop = Boolean(story.buildtop_info?.trangchu_beta || story.buildtop_info?.trangchu_mobile);
            const isOverdue = isStoryOverdue(story);

            return (
              <div
                key={story.story_id}
                onClick={() => setSelectedStoryForModal(story)}
                className="pt-2.5 first:pt-0 group hover:bg-slate-50/70 p-2.5 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-slate-200"
              >
                {/* Row 1: Tên đề tài - Chuẩn Merriweather serif */}
                <h4 className="font-serif font-bold text-slate-900 text-sm leading-snug group-hover:text-[#9f224e] transition-colors mb-2">
                  {story.title}
                </h4>

                {/* Row 2: Chuyển các tag xuống dưới Tên đề tài, BỎ background tag; Đảo Đề tài lên trước Bài viết */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs mb-2">
                  {/* Ban phụ trách (không background) */}
                  <span className="font-medium text-slate-700">
                    Ban {story.ban_name}
                  </span>

                  <span className="text-slate-300">•</span>

                  {/* Trạng thái đề tài: "Đề tài: [tên trạng thái]" (được đảo lên trước) */}
                  <span className="font-medium text-slate-700">
                    Đề tài: {story.status_label || (story.article_status_label === 'Published' ? 'Hoàn thành' : 'Đang triển khai')}
                  </span>

                  <span className="text-slate-300">•</span>

                  {/* Trạng thái bài viết: "Bài viết: [tên trạng thái]" */}
                  <span className={`font-medium ${
                    story.article_status_label === 'Published'
                      ? 'text-emerald-700'
                      : story.article_status_label === 'Editing'
                      ? 'text-amber-700'
                      : 'text-slate-600'
                  }`}>
                    {formatArticleStatusText(story.article_status_label)}
                  </span>

                  {/* Cảnh báo quá hạn nếu có (không background) */}
                  {isOverdue && story.article_status_label !== 'Published' && (
                    <>
                      <span className="text-slate-300">•</span>
                      <span className="font-semibold text-rose-600 inline-flex items-center gap-0.5">
                        <AlertCircle className="w-3 h-3 text-rose-500" />
                        <span>Quá hạn</span>
                      </span>
                    </>
                  )}

                  {/* Vị trí Build Top nếu có (không background) */}
                  {hasBuildTop && (
                    <>
                      <span className="text-slate-300">•</span>
                      <span className="font-semibold text-[#9f224e] inline-flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        <span>
                          Top{' '}
                          {story.buildtop_info?.trangchu_beta?.position
                            ? `Web #${story.buildtop_info.trangchu_beta.position}`
                            : `Mobile #${story.buildtop_info?.trangchu_mobile?.position}`}
                        </span>
                      </span>
                    </>
                  )}
                </div>

                {/* Row 3: Acc phóng viên triển khai + Hạn hoàn thành */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1.5 border-t border-slate-100/80">
                  <div className="flex items-center gap-4">
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
