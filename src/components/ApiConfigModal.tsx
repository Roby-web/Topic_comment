import React, { useState } from 'react';
import { X, Key, Server, Check, Info, ShieldCheck, ExternalLink } from 'lucide-react';
import { ApiConfig } from '../services/apiService';

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
  const [useLiveApi, setUseLiveApi] = useState(config.useLiveApi);

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-100">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-[#9f224e]" />
            <h3 className="font-bold text-slate-900 text-sm">
              Cấu hình Kết nối 3 API Tòa soạn VnExpress
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
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          
          {/* Mode Switcher */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
            <span className="font-semibold text-slate-700 block">Chế độ nguồn dữ liệu:</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setUseLiveApi(false)}
                className={`p-2 rounded border text-left font-medium transition-all ${
                  !useLiveApi
                    ? 'bg-white border-[#9f224e] text-[#9f224e] shadow-xs'
                    : 'bg-slate-100/70 border-slate-200 text-slate-600'
                }`}
              >
                <div className="font-bold flex items-center justify-between">
                  <span>Dữ liệu chuẩn Tòa soạn</span>
                  {!useLiveApi && <Check className="w-3.5 h-3.5 text-[#9f224e]" />}
                </div>
                <div className="text-[11px] text-slate-500 font-normal mt-0.5">
                  Dữ liệu thực nghiệm 23/9 & 22/9 chuẩn xác 100% tài liệu
                </div>
              </button>

              <button
                type="button"
                onClick={() => setUseLiveApi(true)}
                className={`p-2 rounded border text-left font-medium transition-all ${
                  useLiveApi
                    ? 'bg-white border-[#9f224e] text-[#9f224e] shadow-xs'
                    : 'bg-slate-100/70 border-slate-200 text-slate-600'
                }`}
              >
                <div className="font-bold flex items-center justify-between">
                  <span>Kết nối Live API</span>
                  {useLiveApi && <Check className="w-3.5 h-3.5 text-[#9f224e]" />}
                </div>
                <div className="text-[11px] text-slate-500 font-normal mt-0.5">
                  Gọi trực tiếp server editor.vnexpress.net qua chữ ký
                </div>
              </button>
            </div>
          </div>

          {/* Endpoints overview info */}
          <div className="border border-slate-100 rounded-lg p-3 bg-slate-50/50 space-y-2">
            <span className="font-semibold text-slate-700 block">3 Endpoints tích hợp:</span>
            <ul className="space-y-1.5 text-slate-600 font-mono text-[11px]">
              <li className="flex items-start gap-1.5">
                <span className="font-bold text-[#9f224e] shrink-0">1.</span>
                <span>editor.vnexpress.net ... getListStoryImportant</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="font-bold text-[#9f224e] shrink-0">2.</span>
                <span>editor.vnexpress.net ... getAnalyticsNhanXet</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="font-bold text-[#9f224e] shrink-0">3.</span>
                <span>api-realtime.vnexpress.net ... get-engage-by-date</span>
              </li>
            </ul>
          </div>

          {/* app_id input */}
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
              <span>Chữ ký ứng dụng bí mật (app_sig):</span>
              <span className="text-[11px] text-slate-400 font-normal">API 1 & API 2</span>
            </label>
            <div className="relative">
              <Key className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={appSig}
                onChange={(e) => setAppSig(e.target.value)}
                placeholder="Nhập app_sig bí mật được cấp bởi IT VnExpress"
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded text-slate-800 focus:outline-none focus:border-[#9f224e]"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              * Khi chạy trên trình duyệt bên ngoài mạng nội bộ VnE hoặc thiếu app_sig, hệ thống tự động duy trì hoạt động với bộ dữ liệu demo chuẩn hóa.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-slate-600 hover:text-slate-900 border border-slate-200 rounded hover:bg-slate-50"
            >
              Đóng
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-[#9f224e] text-white rounded font-semibold hover:bg-[#83193e] transition-colors"
            >
              Lưu cấu hình
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
