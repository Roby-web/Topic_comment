import React, { useState } from 'react';
import { X, Calendar, RefreshCw, Check, Link as LinkIcon, AlertCircle } from 'lucide-react';
import {
  DailySecretaryRoster,
  getCustomScheduleList,
  saveScheduleList,
  parseRosterCsv,
  getSavedSheetUrl,
  saveSheetUrl,
} from '../services/secretaryRosterService';

interface SecretaryScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScheduleUpdated: () => void;
}

export const SecretaryScheduleModal: React.FC<SecretaryScheduleModalProps> = ({
  isOpen,
  onClose,
  onScheduleUpdated,
}) => {
  const [scheduleList, setScheduleList] = useState<DailySecretaryRoster[]>(getCustomScheduleList);
  const [sheetUrl, setSheetUrl] = useState<string>(getSavedSheetUrl);
  const [isSyncing, setIsSyncing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  if (!isOpen) return null;

  // Sync from published Google Sheet (CSV format or export link)
  const handleSyncFromGoogleSheet = async () => {
    if (!sheetUrl.trim()) {
      setStatusMessage({ text: 'Vui lòng nhập link file Google Sheets (hoặc link chia sẻ).', isError: true });
      return;
    }

    setIsSyncing(true);
    setStatusMessage(null);

    try {
      saveSheetUrl(sheetUrl);

      // Convert standard Google Spreadsheet URL to CSV export URL if needed
      let csvUrl = sheetUrl.trim();
      if (csvUrl.includes('docs.google.com/spreadsheets/d/')) {
        const matches = csvUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
        if (matches && matches[1]) {
          const docId = matches[1];
          // Try fetching published CSV
          csvUrl = `https://docs.google.com/spreadsheets/d/${docId}/export?format=csv`;
        }
      }

      const res = await fetch(csvUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      const parsed = parseRosterCsv(text);

      if (parsed.length > 0) {
        saveScheduleList(parsed);
        setScheduleList(parsed);
        setStatusMessage({ text: `Đã đồng bộ thành công ${parsed.length} ngày trực từ Google Sheet!` });
        onScheduleUpdated();
      } else {
        setStatusMessage({ text: 'Không đọc được dữ liệu ngày/thứ/trực chính/trực phụ từ sheet này.', isError: true });
      }
    } catch (err: any) {
      setStatusMessage({
        text: 'Không thể kết nối trực tiếp đến Google Sheet. Bạn có thể xuất sheet dưới dạng công khai (Publish to web) hoặc lưu trực tiếp bên dưới.',
        isError: true,
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleUpdateRow = (index: number, field: keyof DailySecretaryRoster, value: string) => {
    const updated = [...scheduleList];
    updated[index] = { ...updated[index], [field]: value };
    setScheduleList(updated);
  };

  const handleSaveAll = () => {
    saveScheduleList(scheduleList);
    saveSheetUrl(sheetUrl);
    onScheduleUpdated();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-100">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50 shrink-0">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#9f224e]" />
            <h3 className="font-bold text-slate-900 text-sm">
              Lịch trực Thư ký tòa soạn (Google Sheets)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs flex-1">
          
          {/* Link Google Sheet input */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-[#9f224e]" />
                <span>Link dữ liệu lịch trực (Google Sheets):</span>
              </label>
            </div>
            
            <div className="flex gap-2">
              <input
                type="text"
                value={sheetUrl}
                onChange={(e) => setSheetUrl(e.target.value)}
                placeholder="Dán link Google Sheet lịch trực tại đây..."
                className="flex-1 px-3 py-2 border border-slate-300 rounded bg-white text-slate-800 focus:outline-none focus:border-[#9f224e]"
              />
              <button
                type="button"
                onClick={handleSyncFromGoogleSheet}
                disabled={isSyncing}
                className="px-3.5 py-2 bg-[#9f224e] text-white rounded font-semibold hover:bg-[#861b40] transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Đang đọc...' : 'Đồng bộ'}</span>
              </button>
            </div>

            {statusMessage && (
              <div
                className={`p-2 rounded text-[11px] flex items-center gap-1.5 ${
                  statusMessage.isError
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                }`}
              >
                {statusMessage.isError ? (
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                ) : (
                  <Check className="w-3.5 h-3.5 shrink-0" />
                )}
                <span>{statusMessage.text}</span>
              </div>
            )}
          </div>

          {/* Roster table */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-900 text-xs">
                Bảng phân công theo ngày (Cột C: Trực chính • Cột D: Trực phụ):
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                (27/09: Thanh Vân - Trần Lê • 28/09: An Nhơn - Thanh Huyền • 30/09: Thùy Trang - Nhiêu Huy)
              </span>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                    <th className="py-2 px-3 font-semibold w-24">Thứ</th>
                    <th className="py-2 px-3 font-semibold w-28">Ngày</th>
                    <th className="py-2 px-3 font-semibold text-emerald-700">Trực chính (VnExpress)</th>
                    <th className="py-2 px-3 font-semibold text-purple-700">Trực phụ (Site khác)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {scheduleList.map((row, idx) => {
                    const isSun27 = row.date === '2026-09-27';
                    return (
                      <tr
                        key={row.date}
                        className={isSun27 ? 'bg-amber-50/70 font-medium' : 'hover:bg-slate-50'}
                      >
                        <td className="py-2 px-3 text-slate-600 font-medium">
                          {row.dayOfWeek}
                          {isSun27 && <span className="ml-1 text-[10px] text-amber-700 font-bold">★</span>}
                        </td>
                        <td className="py-2 px-3 font-mono text-slate-800">
                          {row.date}
                        </td>
                        <td className="py-1 px-2">
                          <input
                            type="text"
                            value={row.mainSecretaryName}
                            onChange={(e) => handleUpdateRow(idx, 'mainSecretaryName', e.target.value)}
                            className="w-full px-2 py-1 border border-slate-200 rounded bg-white text-slate-900 focus:outline-none focus:border-emerald-600 text-xs font-semibold"
                          />
                        </td>
                        <td className="py-1 px-2">
                          <input
                            type="text"
                            value={row.subSecretaryName}
                            onChange={(e) => handleUpdateRow(idx, 'subSecretaryName', e.target.value)}
                            className="w-full px-2 py-1 border border-slate-200 rounded bg-white text-slate-900 focus:outline-none focus:border-purple-600 text-xs font-semibold"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-3.5 bg-slate-50 border-t border-slate-200 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 rounded hover:bg-white font-medium cursor-pointer"
          >
            Đóng
          </button>
          <button
            type="button"
            onClick={handleSaveAll}
            className="px-4 py-1.5 text-xs bg-[#9f224e] text-white rounded font-semibold hover:bg-[#861b40] transition-colors cursor-pointer shadow-xs"
          >
            Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  );
};
