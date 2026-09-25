import React, { useState } from 'react';
import { X, Key, Server, Check, Info, Copy, ExternalLink, RefreshCw } from 'lucide-react';
import { ApiConfig, buildApiUrls } from '../services/apiService';

interface ApiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ApiConfig;
  onSaveConfig: (newConfig: ApiConfig) => void;
}

export const ApiConfigModal: React.FC<ApiConfigModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}) => {
  const [appId, setAppId] = useState(config.appId || '1000000');
  const [appSig, setAppSig] = useState(config.appSig || '');
  const [useLiveApi, setUseLiveApi] = useState(
    config.useLiveApi !== undefined ? config.useLiveApi : true
  );
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const fromDate = config.fromDate || config.selectedDate || '2026-09-23';
  const toDate = config.toDate || config.selectedDate || '2026-09-23';

  const urls = buildApiUrls({
    appId: appId.trim() || '1000000',
    appSig: appSig.trim(),
    fromDate,
    toDate,
  });

  const apiEndpoints = [
    {
      name: '1. getListStoryImportant (Danh sách đề tài quan trọng - ngày hôm trước)',
      desc: `Tham số: fromdate=${urls.effectiveStoryFrom}, todate=${urls.effectiveStoryTo}, important=1 (Lấy ngày hôm trước của ngày đang chọn)`,
      url: urls.storyUrlDirect,
      method: 'GET',
    },
    {
      name: '2. getAnalyticsNhanXet (Thống kê traffic các site - ngày đang chọn)',
      desc: `Users, Pageviews, Articles của ngày ${fromDate}, so sánh hôm qua & tuần trước`,
      url: urls.analyticsUrlDirect,
      method: 'GET',
    },
    {
      name: '3. get-engage-by-date (Phân loại hiệu quả bài viết - ngày đang chọn)',
      desc: `Hiệu quả cao, Views cao, Tương tác tốt, Cân nhắc của ngày ${fromDate}`,
      url: urls.engageUrlDirect,
      method: 'GET',
    },
  ];

  const handleCopyUrl = (url: string, idx: number) => {
    navigator.clipboard.writeText(url);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig({
      ...config,
      appId: appId.trim(),
      appSig: appSig.trim(),
      useLiveApi,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-100">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50 shrink-0">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-[#9f224e]" />
            <h3 className="font-bold text-slate-900 text-sm">
              Cấu hình & Kiểm tra 3 API Tòa soạn VnExpress
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs overflow-y-auto flex-1">
          
          {/* Active Date Query Indicator */}
          <div className="p-3 bg-rose-50/60 border border-rose-200 rounded-lg flex items-center justify-between">
            <div>
              <span className="font-bold text-[#9f224e] block text-xs">
                Khoảng ngày URL đang áp dụng:
              </span>
              <span className="font-mono text-slate-700 text-[11px] mt-0.5 block">
                fromdate = <strong className="text-slate-900">{fromDate}</strong> | todate ={' '}
                <strong className="text-slate-900">{toDate}</strong>
              </span>
            </div>
            <span className="text-[11px] text-rose-700 bg-white px-2 py-1 rounded border border-rose-200 font-medium">
              Tự động đổi khi chọn ngày khác
            </span>
          </div>

          {/* Mode Switcher */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
            <span className="font-semibold text-slate-700 block">Chế độ kết nối API:</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setUseLiveApi(true)}
                className={`p-2.5 rounded border text-left font-medium transition-all ${
                  useLiveApi
                    ? 'bg-white border-[#9f224e] text-[#9f224e] shadow-xs'
                    : 'bg-slate-100/70 border-slate-200 text-slate-600'
                }`}
              >
                <div className="font-bold flex items-center justify-between">
                  <span>Luôn gọi Live API VnExpress</span>
                  {useLiveApi && <Check className="w-3.5 h-3.5 text-[#9f224e]" />}
                </div>
                <div className="text-[11px] text-slate-500 font-normal mt-0.5">
                  Gọi trực tiếp 3 URL theo fromdate-todate
                </div>
              </button>

              <button
                type="button"
                onClick={() => setUseLiveApi(false)}
                className={`p-2.5 rounded border text-left font-medium transition-all ${
                  !useLiveApi
                    ? 'bg-white border-[#9f224e] text-[#9f224e] shadow-xs'
                    : 'bg-slate-100/70 border-slate-200 text-slate-600'
                }`}
              >
                <div className="font-bold flex items-center justify-between">
                  <span>Chế độ ngoại tuyến (Offline)</span>
                  {!useLiveApi && <Check className="w-3.5 h-3.5 text-[#9f224e]" />}
                </div>
                <div className="text-[11px] text-slate-500 font-normal mt-0.5">
                  Mô phỏng dữ liệu biến thiên theo từng ngày đã chọn
                </div>
              </button>
            </div>
          </div>

          {/* 3 Endpoints live URL inspection */}
          <div className="space-y-2.5">
            <span className="font-semibold text-slate-700 block">
              3 URL tương ứng theo fromdate-todate:
            </span>
            {apiEndpoints.map((ep, idx) => (
              <div
                key={idx}
                className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-[11px]">{ep.name}</span>
                  <button
                    type="button"
                    onClick={() => handleCopyUrl(ep.url, idx)}
                    className="flex items-center gap-1 text-[10px] text-[#9f224e] hover:text-[#83193e] font-medium bg-white px-2 py-0.5 border border-slate-200 rounded transition-colors"
                  >
                    {copiedIndex === idx ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-600">Đã sao chép</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Sao chép URL</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="font-mono text-[10px] bg-white border border-slate-200 rounded p-1.5 break-all text-slate-600 select-all">
                  {ep.url}
                </div>
                <div className="text-[10px] text-slate-400">{ep.desc}</div>
              </div>
            ))}
          </div>

          {/* app_id input */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Định danh ứng dụng (app_id):
              </label>
              <input
                type="text"
                value={appId}
                onChange={(e) => setAppId(e.target.value)}
                placeholder="1000000"
                className="w-full px-3 py-2 border border-slate-200 rounded text-slate-800 focus:outline-none focus:border-[#9f224e]"
              />
            </div>

            {/* app_sig input */}
            <div>
              <label className="block font-medium text-slate-700 mb-1 flex items-center justify-between">
                <span>Chữ ký bảo mật (app_sig):</span>
                <span className="text-[10px] text-slate-400 font-normal">Tùy chọn</span>
              </label>
              <div className="relative">
                <Key className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={appSig}
                  onChange={(e) => setAppSig(e.target.value)}
                  placeholder="Nhập nếu tòa soạn yêu cầu app_sig"
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded text-slate-800 focus:outline-none focus:border-[#9f224e]"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-slate-600 hover:text-slate-900 border border-slate-200 rounded hover:bg-slate-50 font-medium"
            >
              Đóng
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-[#9f224e] text-white rounded font-semibold hover:bg-[#83193e] transition-colors"
            >
              Lưu & Áp dụng
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
