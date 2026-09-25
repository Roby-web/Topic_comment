import React, { useState } from 'react';
import {
  Calendar,
  RefreshCw,
  ChevronDown,
  Check,
} from 'lucide-react';
import { SecretaryProfile } from '../types';

interface HeaderProps {
  selectedDate: string;
  fromDate: string;
  toDate: string;
  onDateChange: (newDate: string, newFromDate?: string, newToDate?: string) => void;
  selectedSecretary?: SecretaryProfile;
  onSecretaryChange?: (sec: SecretaryProfile) => void;
  onRefresh: () => void;
  isLoading: boolean;
  onOpenConfig: () => void;
  isLiveApi: boolean;
  onExportSummary?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedDate,
  fromDate,
  toDate,
  onDateChange,
  onRefresh,
  isLoading,
  onOpenConfig,
  isLiveApi,
  onExportSummary,
}) => {
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
          short: `${parseInt(parts[2], 10)}/${parseInt(parts[1], 10)}`,
          year: parts[0],
        };
      }
    } catch {
      // fallback
    }
    return { title: 'Thứ tư, 23/9', short: '23/9', year: '2026' };
  };

  const isRange = fromDate !== toDate;
  const fromInfo = getFormattedDateDisplay(fromDate);
  const toInfo = getFormattedDateDisplay(toDate);

  const displayLabel = isRange
    ? `${fromInfo.short} - ${toInfo.short}/${fromInfo.year}`
    : `${fromInfo.title}`;

  // Helper to format date string to YYYY-MM-DD
  const formatDateToYMD = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // Today and Yesterday dates dynamically calculated from real local date or 2026-09-25 reference
  const todayDateObj = new Date();
  const yesterdayDateObj = new Date();
  yesterdayDateObj.setDate(todayDateObj.getDate() - 1);

  const todayYMD = formatDateToYMD(todayDateObj);
  const yesterdayYMD = formatDateToYMD(yesterdayDateObj);

  const todayInfo = getFormattedDateDisplay(todayYMD);
  const yesterdayInfo = getFormattedDateDisplay(yesterdayYMD);

  const isToday = fromDate === todayYMD;
  const isYesterday = fromDate === yesterdayYMD;
  const isOtherDay = !isToday && !isYesterday;

  const [showOtherDayInput, setShowOtherDayInput] = useState(false);
  const [otherDayVal, setOtherDayVal] = useState(fromDate);
  const dateInputRef = React.useRef<HTMLInputElement>(null);

  const handleSelectSingleDate = (ymd: string) => {
    onDateChange(ymd, ymd, ymd);
    setShowDatePicker(false);
    setShowOtherDayInput(false);
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-[1720px] mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Left Title: "Nhận xét đề tài" */}
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                Nhận xét đề tài
              </h1>
            </div>
          </div>

          {/* Right Controls: Date Selector + Refresh Button */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            
            {/* Date Selector Popover */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setOtherDayVal(fromDate);
                  setShowDatePicker(!showDatePicker);
                  setShowOtherDayInput(false);
                }}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-sm font-medium text-slate-700 transition-colors"
                title="Chọn ngày nhận xét"
              >
                <Calendar className="w-4 h-4 text-[#9f224e]" />
                <span className="text-[#9f224e] font-serif font-bold">{displayLabel}</span>
                {!isRange && <span className="text-xs text-slate-400">/{fromInfo.year}</span>}
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </button>

              {showDatePicker && (
                <div className="absolute right-0 mt-1 w-72 bg-white border border-slate-200 rounded-lg shadow-xl p-2.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="space-y-1">
                    {/* Option 1: Hôm nay - ngày tương ứng */}
                    <button
                      type="button"
                      onClick={() => handleSelectSingleDate(todayYMD)}
                      className={`w-full text-left px-3 py-2 rounded text-xs flex items-center justify-between transition-colors ${
                        isToday
                          ? 'bg-rose-50 text-[#9f224e] font-semibold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium">Hôm nay</span>
                        <span className="text-slate-500 font-normal">({todayInfo.title})</span>
                      </div>
                      {isToday && <Check className="w-4 h-4 text-[#9f224e]" />}
                    </button>

                    {/* Option 2: Hôm qua - ngày tương ứng */}
                    <button
                      type="button"
                      onClick={() => handleSelectSingleDate(yesterdayYMD)}
                      className={`w-full text-left px-3 py-2 rounded text-xs flex items-center justify-between transition-colors ${
                        isYesterday
                          ? 'bg-rose-50 text-[#9f224e] font-semibold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium">Hôm qua</span>
                        <span className="text-slate-500 font-normal">({yesterdayInfo.title})</span>
                      </div>
                      {isYesterday && <Check className="w-4 h-4 text-[#9f224e]" />}
                    </button>

                    {/* Option 3: Ngày khác - bấm vào xổ ra calendar chọn 1 ngày */}
                    <div className="pt-1 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          setShowOtherDayInput(!showOtherDayInput);
                          setTimeout(() => {
                            if (dateInputRef.current) {
                              try {
                                dateInputRef.current.showPicker?.();
                              } catch {
                                dateInputRef.current.focus();
                              }
                            }
                          }, 50);
                        }}
                        className={`w-full text-left px-3 py-2 rounded text-xs flex items-center justify-between transition-colors ${
                          isOtherDay
                            ? 'bg-rose-50 text-[#9f224e] font-semibold'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium">Ngày khác</span>
                          {isOtherDay && (
                            <span className="text-[#9f224e] font-normal">({fromInfo.title})</span>
                          )}
                        </div>
                        <Calendar className="w-4 h-4 text-slate-400" />
                      </button>

                      {/* Expandable Calendar Picker */}
                      {showOtherDayInput && (
                        <div className="mt-2 p-2.5 bg-slate-50 border border-slate-200 rounded-md space-y-2">
                          <label className="block text-[11px] font-semibold text-slate-700">
                            Chọn ngày trên lịch:
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              ref={dateInputRef}
                              type="date"
                              value={otherDayVal}
                              onChange={(e) => {
                                const val = e.target.value;
                                setOtherDayVal(val);
                                if (val) {
                                  handleSelectSingleDate(val);
                                }
                              }}
                              className="flex-1 text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded text-slate-800 focus:outline-none focus:border-[#9f224e] cursor-pointer"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (otherDayVal) {
                                  handleSelectSingleDate(otherDayVal);
                                }
                              }}
                              className="px-2.5 py-1.5 bg-[#9f224e] text-white rounded text-xs font-semibold hover:bg-[#85183e] transition-colors whitespace-nowrap shadow-xs"
                            >
                              Chọn
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={isLoading}
              title="Gọi lại 3 API VnExpress với fromdate-todate hiện tại"
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 rounded transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#9f224e]' : ''}`} />
            </button>

          </div>
        </div>
      </div>
    </header>
  );
};
