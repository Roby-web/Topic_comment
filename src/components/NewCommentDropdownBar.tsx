import React, { useState, useEffect } from 'react';
import {
  Calendar,
  ChevronDown,
  Plus,
  X,
  User,
  Sparkles,
  Building2,
  Globe,
} from 'lucide-react';
import { CommentCategory } from '../types';
import { getRosterForDate, DailySecretaryRoster } from '../services/secretaryRosterService';
import { RichCommentEditor } from './RichCommentEditor';

interface NewCommentDropdownBarProps {
  currentViewingDate: string; // The date currently being viewed in the app (e.g. 2026-09-24)
  availableDatesWithoutComments: string[]; // List of recent dates that have no comments
  onAddComment: (commentData: {
    title: string;
    html: string;
    category: CommentCategory;
    date: string;
    author: string;
  }) => void;
}

export const NewCommentDropdownBar: React.FC<NewCommentDropdownBarProps> = ({
  currentViewingDate,
  availableDatesWithoutComments,
  onAddComment,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<CommentCategory>('vnexpress');

  // Mặc định active vào ngày gần nhất chưa có nhận xét:
  // Nếu có danh sách ngày chưa có nhận xét thì lấy ngày đầu tiên, nếu không thì lấy ngày hôm qua / ngày đang xem
  const defaultTargetDate = availableDatesWithoutComments.length > 0
    ? availableDatesWithoutComments[0]
    : currentViewingDate;

  const [selectedTargetDate, setSelectedTargetDate] = useState<string>(defaultTargetDate);
  const [roster, setRoster] = useState<DailySecretaryRoster>(() => getRosterForDate(defaultTargetDate));

  // Sync date when availableDatesWithoutComments updates
  useEffect(() => {
    if (availableDatesWithoutComments.length > 0 && !isOpen) {
      setSelectedTargetDate(availableDatesWithoutComments[0]);
      setRoster(getRosterForDate(availableDatesWithoutComments[0]));
    }
  }, [availableDatesWithoutComments, isOpen]);

  // When selectedTargetDate changes, update roster from Google Sheets schedule
  const handleDateSelect = (dateStr: string) => {
    setSelectedTargetDate(dateStr);
    const newRoster = getRosterForDate(dateStr);
    setRoster(newRoster);
  };

  // Compute Vietnamese formatted date (e.g. "Thứ năm, 24/09/2026")
  const formatVietnameseDate = (ymd: string) => {
    try {
      const parts = ymd.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        const dayNames = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
        return `${dayNames[d.getDay()]}, ${parts[2]}/${parts[1]}/${parts[0]}`;
      }
    } catch {}
    return ymd;
  };

  const handleToggleDropdown = () => {
    if (!isOpen) {
      const target = availableDatesWithoutComments.length > 0 ? availableDatesWithoutComments[0] : currentViewingDate;
      setSelectedTargetDate(target);
      setRoster(getRosterForDate(target));
    }
    setIsOpen(!isOpen);
  };

  // Determine secretary based on active group tab:
  // "Trực chính" dành cho VnExpress & "Trực phụ" dành cho "Ngôi sao, English, Tia sáng"
  const currentSecretaryUsername = activeTab === 'vnexpress' ? roster.mainSecretary : roster.subSecretary;
  const currentSecretaryDisplayName = activeTab === 'vnexpress'
    ? (roster.mainSecretaryName || roster.mainSecretary)
    : (roster.subSecretaryName || roster.subSecretary);

  const handleSave = (content: { title: string; html: string; category?: CommentCategory }) => {
    onAddComment({
      title: activeTab === 'vnexpress' ? 'Nhận xét VnExpress' : 'Nhận xét Ngôi sao, English, Tia sáng',
      html: content.html,
      category: activeTab,
      date: selectedTargetDate,
      author: currentSecretaryUsername,
    });
    setIsOpen(false);
  };

  return (
    <div className="mb-4">
      {/* Button "Thêm nhận xét" ở ngoài (thêm mới 1 nhận xét cho ngày mới) ở trên cùng */}
      <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl p-3 sm:px-4 shadow-2xs hover:border-[#9f224e]/50 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#9f224e] text-white flex items-center justify-center font-bold shadow-2xs shrink-0">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm">Thêm mới Nhận xét Thư ký trực</span>
              <span className="text-[10px] uppercase font-bold text-[#9f224e] bg-rose-50 px-2 py-0.5 rounded border border-rose-200/60">
                Ngày mới
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Mặc định: <strong className="text-slate-700">{formatVietnameseDate(selectedTargetDate)}</strong> (ngày gần nhất chưa có nhận xét) • Trưởng ban trực: <span className="font-semibold text-slate-800">@{roster.mainSecretary}</span> / <span className="font-semibold text-slate-800">@{roster.subSecretary}</span>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleToggleDropdown}
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-xs cursor-pointer shrink-0 ${
            isOpen
              ? 'bg-slate-800 text-white hover:bg-slate-900'
              : 'bg-[#9f224e] text-white hover:bg-[#861b40]'
          }`}
        >
          {isOpen ? (
            <>
              <X className="w-3.5 h-3.5" />
              <span>Đóng form</span>
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm nhận xét</span>
              <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
            </>
          )}
        </button>
      </div>

      {/* Dropdown collapsible form */}
      {isOpen && (
        <div className="mt-2.5 bg-white rounded-xl border border-rose-300 p-4 sm:p-5 shadow-md animate-in slide-in-from-top-2 duration-150 space-y-3.5">
          
          {/* Header row inside form: Ngày nhận xét & Tên trưởng ban lấy theo file sheet */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
            
            {/* Trường ngày nhận xét: mặc định active vào ngày gần nhất chưa có nhận xét, bấm vào chọn ngày khác */}
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#9f224e]" />
              <span className="text-xs font-bold text-slate-700">Ngày nhận xét:</span>
              <input
                type="date"
                value={selectedTargetDate}
                onChange={(e) => e.target.value && handleDateSelect(e.target.value)}
                className="text-xs font-semibold py-1 px-2.5 bg-white border border-slate-300 rounded focus:outline-none focus:border-[#9f224e] text-slate-800 cursor-pointer shadow-2xs"
              />
              <span className="text-xs text-slate-500 font-medium">
                ({formatVietnameseDate(selectedTargetDate)})
              </span>
            </div>

            {/* Tên trưởng ban: lấy dữ liệu từ file sheet tương ứng ngày đã chọn */}
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded border border-slate-200">
                <span className="text-slate-500 text-[11px]">Trực chính (VnExpress):</span>
                <span className="font-bold text-slate-900 font-mono text-xs text-[#9f224e]">
                  @{roster.mainSecretary}
                </span>
                <span className="text-slate-600 font-medium">({roster.mainSecretaryName || roster.mainSecretary})</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded border border-slate-200">
                <span className="text-slate-500 text-[11px]">Trực phụ (Site khác):</span>
                <span className="font-bold text-slate-900 font-mono text-xs text-indigo-700">
                  @{roster.subSecretary}
                </span>
                <span className="text-slate-600 font-medium">({roster.subSecretaryName || roster.subSecretary})</span>
              </div>
            </div>
          </div>

          {/* Chọn site nhận xét: tab nhỏ lại */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
            <span className="text-xs font-semibold text-slate-500 mr-1">Chọn site nhận xét:</span>

            {/* Tab nhỏ 1: VnExpress */}
            <button
              type="button"
              onClick={() => setActiveTab('vnexpress')}
              className={`px-3 py-1 text-xs rounded-md font-semibold transition-all flex items-center gap-1.5 cursor-pointer border ${
                activeTab === 'vnexpress'
                  ? 'bg-rose-50 text-[#9f224e] border-[#9f224e] shadow-2xs font-bold'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${activeTab === 'vnexpress' ? 'bg-[#9f224e]' : 'bg-slate-300'}`} />
              <span>VnExpress</span>
              <span className="text-[10px] text-slate-500 font-mono">(@{roster.mainSecretary})</span>
            </button>

            {/* Tab nhỏ 2: Ngôi sao, English, Tia sáng */}
            <button
              type="button"
              onClick={() => setActiveTab('others')}
              className={`px-3 py-1 text-xs rounded-md font-semibold transition-all flex items-center gap-1.5 cursor-pointer border ${
                activeTab === 'others'
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-600 shadow-2xs font-bold'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${activeTab === 'others' ? 'bg-indigo-600' : 'bg-slate-300'}`} />
              <span>Ngôi sao, English, Tia sáng</span>
              <span className="text-[10px] text-slate-500 font-mono">(@{roster.subSecretary})</span>
            </button>
          </div>

          {/* Rich Editor nhập nội dung: Bỏ tiêu đề, Bỏ gắn nhãn tag, Thêm tính năng Insert ảnh */}
          <RichCommentEditor
            key={`${activeTab}-${selectedTargetDate}`}
            isEditing={false}
            initialCategory={activeTab}
            initialHtml={
              activeTab === 'vnexpress'
                ? `<p class="font-medium text-slate-900">Tổng quan:</p><ul class="list-none pl-0"><li>- </li></ul><p class="font-medium text-slate-900 mt-2">Lưu ý chung:</p><ul class="list-none pl-0"><li>- </li></ul>`
                : `<p class="font-medium text-slate-900">Nhận xét Ngôi sao, English, Tia sáng:</p><ul class="list-none pl-0"><li>- </li></ul>`
            }
            onSave={handleSave}
            onCancel={() => setIsOpen(false)}
          />
        </div>
      )}
    </div>
  );
};
