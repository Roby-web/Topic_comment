import React from 'react';
import { X, Calendar, User, Tag, CheckCircle2, Clock, Globe, Smartphone, AlertTriangle } from 'lucide-react';
import { StoryItem } from '../types';

interface StoryDetailModalProps {
  story: StoryItem | null;
  onClose: () => void;
}

export const StoryDetailModal: React.FC<StoryDetailModalProps> = ({ story, onClose }) => {
  if (!story) return null;

  // Format timestamp according to Rule.md Section 2.1: {Thứ}, {Ngày}/{Tháng}/{Năm}, {Giờ}:{Phút} ({Timezone})
  const formatTimestamp = (ts?: string) => {
    if (!ts) return '-';
    try {
      const num = parseInt(ts, 10);
      if (isNaN(num)) return ts;
      const d = new Date(num * 1000);
      const dayNames = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
      const dayName = dayNames[d.getDay()];
      const day = d.getDate();
      const month = d.getMonth() + 1;
      const year = d.getFullYear();
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      return `${dayName}, ${day}/${month}/${year}, ${hours}:${minutes} (GMT+7)`;
    } catch {
      return ts;
    }
  };

  const isPublished = story.article_status_label === 'Published';
  const isOverdue = story.is_qua_han === '1';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-100">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-start justify-between p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="space-y-1 pr-6">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-2 py-0.5 bg-rose-50 text-[#9f224e] border border-rose-200 rounded">
                Đề tài quan trọng #{story.story_id}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Ban {story.ban_name}
              </span>
              {isOverdue && (
                <span className="text-[11px] font-semibold px-1.5 py-0.5 bg-rose-100 text-rose-700 rounded flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Quá hạn
                </span>
              )}
            </div>
            <h3 className="font-serif font-bold text-slate-900 text-base leading-snug">
              {story.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 text-xs">
          
          {/* Status & Reporter Row */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div>
              <span className="text-slate-500 block mb-1">Phóng viên triển khai:</span>
              <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>@{story.user_name}</span>
              </div>
            </div>

            <div>
              <span className="text-slate-500 block mb-1">Trạng thái đề tài:</span>
              <div className="font-semibold text-slate-900">
                {story.status_label}
              </div>
            </div>

            <div>
              <span className="text-slate-500 block mb-1">article_status_label:</span>
              <div className="flex items-center gap-1 font-semibold font-mono text-xs">
                {isPublished ? (
                  <span className="text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {story.article_status_label}
                  </span>
                ) : (
                  <span className="text-amber-700 flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    <Clock className="w-3.5 h-3.5" /> {story.article_status_label}
                  </span>
                )}
              </div>
            </div>

            <div>
              <span className="text-slate-500 block mb-1">Hạn hoàn thành (Deadline):</span>
              <div className="font-medium text-slate-800">
                {formatTimestamp(story.todate)}
              </div>
            </div>
          </div>

          {/* Build Top Info */}
          <div className="border border-slate-200 rounded-lg p-3">
            <span className="text-slate-500 block mb-1.5 font-semibold">Vị trí Build Top trên Trang chủ:</span>
            {story.buildtop_info ? (
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-rose-50/60 border border-rose-100 rounded">
                  <div className="flex items-center gap-1 text-[#9f224e] font-semibold">
                    <Globe className="w-3.5 h-3.5" />
                    <span>Trang chủ Web:</span>
                  </div>
                  <div className="text-slate-800 font-bold mt-0.5">
                    {story.buildtop_info.trangchu_beta?.position
                      ? `Vị trí #${story.buildtop_info.trangchu_beta.position}`
                      : 'Không có'}
                  </div>
                </div>

                <div className="p-2 bg-rose-50/60 border border-rose-100 rounded">
                  <div className="flex items-center gap-1 text-[#9f224e] font-semibold">
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Trang chủ Mobile:</span>
                  </div>
                  <div className="text-slate-800 font-bold mt-0.5">
                    {story.buildtop_info.trangchu_mobile?.position
                      ? `Vị trí #${story.buildtop_info.trangchu_mobile.position}`
                      : 'Không có'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-slate-500 italic">
                Chưa được đưa lên vị trí Build Top trang chủ.
              </div>
            )}
          </div>

          {/* Editorial / BBT Comment (nhan_xet / comment) */}
          {(story.nhan_xet || story.comment) && (
            <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-lg">
              <span className="font-semibold text-amber-900 block mb-1">Nhận xét & Chỉ đạo BBT:</span>
              <div
                className="text-slate-800 leading-relaxed text-xs [&_a]:text-blue-600 [&_a]:underline"
                dangerouslySetInnerHTML={{ __html: story.nhan_xet || story.comment || '' }}
              />
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 text-white rounded text-xs font-semibold hover:bg-slate-900 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
