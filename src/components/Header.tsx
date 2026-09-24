import React, { useState } from 'react';
import { Calendar, RefreshCw, Settings, ChevronDown, Check, User, Share2, Sparkles } from 'lucide-react';
import { SecretaryProfile } from '../types';
import { SECRETARIES } from '../data/mockData';

interface HeaderProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  selectedSecretary: SecretaryProfile;
  onSecretaryChange: (sec: SecretaryProfile) => void;
  onRefresh: () => void;
  isLoading: boolean;
  onOpenConfig: () => void;
  isLiveApi: boolean;
  onExportSummary?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedDate,
  onDateChange,
  selectedSecretary,
  onSecretaryChange,
  onRefresh,
  isLoading,
  onOpenConfig,
  isLiveApi,
  onExportSummary,
}) => {
  const [showSecretaryDropdown, setShowSecretaryDropdown] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Compute formatted Vietnamese date string like "Thứ tư, 23/9"
  const getFormattedDateDisplay = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        const dayOfWeekNames = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
        const dayOfWeek = dayOfWeekNames[d.getDay()];
        return {
          title: `${dayOfWeek}, ${parseInt(parts[2], 10)}/${parseInt(parts[1], 10)}`,
          year: parts[0],
        };
      }
    } catch {
      // fallback
    }
    return { title: 'Thứ tư, 23/9', year: '2026' };
  };

  const dateInfo = getFormattedDateDisplay(selectedDate);

  const quickDates = [
    { label: 'Hôm nay (23/9)', value: '2026-09-23' },
    { label: 'Hôm qua (22/9)', value: '2026-09-22' },
    { label: '21/9 (Tuần trước)', value: '2026-09-21' },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-[1720px] mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Left Brand & Title */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-md bg-[#9f224e] text-white flex items-center justify-center font-bold text-sm tracking-wider font-serif shadow-xs">
                VnE
              </span>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                  <span>Nhận xét đề tài Tòa soạn</span>
                  <span className="hidden sm:inline-block text-xs font-medium px-2 py-0.5 bg-rose-50 text-[#9f224e] border border-rose-200 rounded-sm">
                    Bản tin ngày
                  </span>
                </h1>
                <p className="text-xs text-slate-500 font-sans">
                  Hệ thống điều hành sản xuất & đánh giá chất lượng xuất bản VnExpress
                </p>
              </div>
            </div>

            {/* Live / Demo Mode Badge */}
            <button
              onClick={onOpenConfig}
              className="hidden lg:flex items-center gap-1.5 text-xs px-2.5 py-1 rounded border border-slate-200 hover:bg-slate-50 transition-colors text-slate-600"
              title="Nhấn để cấu hình kết nối API"
            >
              <span className={`w-2 h-2 rounded-full ${isLiveApi ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
              <span className="font-medium">{isLiveApi ? 'Live API VnE' : 'Dữ liệu chuẩn VnE'}</span>
              <Settings className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>

          {/* Right Controls: Date Selector + Secretary + Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            
            {/* Date Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-sm font-medium text-slate-700 transition-colors"
              >
                <Calendar className="w-4 h-4 text-[#9f224e]" />
                <span className="text-[#9f224e] font-serif font-bold">{dateInfo.title}</span>
                <span className="text-xs text-slate-400">/{dateInfo.year}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </button>

              {showDatePicker && (
                <div className="absolute right-0 mt-1 w-64 bg-white border border-slate-200 rounded-lg shadow-lg p-3 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">
                    Chọn nhanh ngày báo cáo
                  </div>
                  <div className="space-y-1 mb-3">
                    {quickDates.map((item) => (
                      <button
                        key={item.value}
                        onClick={() => {
                          onDateChange(item.value);
                          setShowDatePicker(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded text-xs flex items-center justify-between transition-colors ${
                          selectedDate === item.value
                            ? 'bg-rose-50 text-[#9f224e] font-semibold'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>{item.label}</span>
                        {selectedDate === item.value && <Check className="w-3.5 h-3.5 text-[#9f224e]" />}
                      </button>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <label className="block text-xs font-medium text-slate-600 mb-1">Hoặc chọn ngày tùy ý:</label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => {
                        if (e.target.value) {
                          onDateChange(e.target.value);
                          setShowDatePicker(false);
                        }
                      }}
                      className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded text-slate-700 focus:outline-none focus:border-[#9f224e]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Secretary Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowSecretaryDropdown(!showSecretaryDropdown)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-sm text-slate-700 transition-colors"
              >
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-slate-500 text-xs">Thư ký trực:</span>
                <span className="font-semibold text-slate-900">{selectedSecretary.username}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </button>

              {showSecretaryDropdown && (
                <div className="absolute right-0 mt-1 w-56 bg-white border border-slate-200 rounded-lg shadow-lg py-1.5 z-50">
                  <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Chọn Thư ký trực ngày
                  </div>
                  {SECRETARIES.map((sec) => (
                    <button
                      key={sec.id}
                      onClick={() => {
                        onSecretaryChange(sec);
                        setShowSecretaryDropdown(false);
                      }}
                      className="w-full px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 text-slate-700 text-left transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-5 h-5 rounded-full ${sec.avatarColor} text-white text-[10px] font-bold flex items-center justify-center`}>
                          {sec.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{sec.username}</div>
                          <div className="text-[11px] text-slate-400">{sec.name}</div>
                        </div>
                      </div>
                      {selectedSecretary.id === sec.id && <Check className="w-4 h-4 text-[#9f224e]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={isLoading}
              title="Làm mới dữ liệu từ API"
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 rounded transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#9f224e]' : ''}`} />
            </button>

            {/* Quick Export / Copy summary */}
            {onExportSummary && (
              <button
                onClick={onExportSummary}
                className="flex items-center gap-1 px-3 py-1.5 bg-[#9f224e] text-white hover:bg-[#85183e] rounded text-xs font-medium transition-colors shadow-xs"
                title="Sao chép tóm tắt nhận xét gửi BBT / Telegram"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sao chép tóm tắt</span>
              </button>
            )}

            {/* Settings button */}
            <button
              onClick={onOpenConfig}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 rounded transition-colors"
              title="Cài đặt API"
            >
              <Settings className="w-4 h-4" />
            </button>

          </div>
        </div>
      </div>
    </header>
  );
};
