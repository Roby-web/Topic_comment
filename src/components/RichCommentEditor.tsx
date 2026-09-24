import React, { useState, useRef, useEffect } from 'react';
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link as LinkIcon,
  Tag,
  Eye,
  Edit3,
  X,
  Check,
  Sparkles,
} from 'lucide-react';

interface RichCommentEditorProps {
  initialHtml: string;
  initialTitle?: string;
  onSave: (content: { title: string; html: string }) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

export const RichCommentEditor: React.FC<RichCommentEditorProps> = ({
  initialHtml,
  initialTitle = '',
  onSave,
  onCancel,
  isEditing = false,
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [previewMode, setPreviewMode] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && !previewMode) {
      editorRef.current.innerHTML = initialHtml || '<p>Nhập nhận xét của Thư ký trực...</p>';
    }
  }, [initialHtml, previewMode]);

  // Execute standard formatting commands
  const executeCommand = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  const handleInsertLink = () => {
    const url = prompt('Nhập đường dẫn liên kết bài viết (URL):', 'https://vnexpress.net/');
    if (url) {
      executeCommand('createLink', url);
    }
  };

  const handleInsertTag = (tagText: string) => {
    const tagHtml = `<strong>[${tagText}]:</strong> `;
    document.execCommand('insertHTML', false, tagHtml);
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  const handleSave = () => {
    const contentHtml = editorRef.current ? editorRef.current.innerHTML : initialHtml;
    onSave({
      title: title.trim() || 'Nhận xét Thư ký trực',
      html: contentHtml,
    });
  };

  const quickTags = [
    'Build Top',
    'Breaking News',
    'Bài riêng tốt',
    'Chậm thông tin',
    'Thời sự',
    'Kinh doanh',
    'Sức khỏe',
    'Lưu ý phối hợp',
  ];

  return (
    <div className="bg-white border border-slate-300 rounded-lg shadow-md p-4 animate-in fade-in duration-150">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Edit3 className="w-4 h-4 text-[#9f224e]" />
          <h3 className="font-semibold text-slate-900 text-sm">
            {isEditing ? 'Chỉnh sửa nhận xét Thư ký trực' : 'Thêm mới nhận xét Thư ký trực'}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPreviewMode(!previewMode)}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded border transition-colors ${
              previewMode
                ? 'bg-rose-50 text-[#9f224e] border-rose-200'
                : 'text-slate-600 hover:bg-slate-50 border-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{previewMode ? 'Chế độ soạn thảo' : 'Xem trước'}</span>
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="p-1 text-slate-400 hover:text-slate-700 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Title Input */}
      <div className="mb-3">
        <label className="block text-xs font-semibold text-slate-600 mb-1">
          Tiêu đề / Tóm tắt nhận xét:
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ví dụ: Nhận xét tổng quan & Đề tài nổi bật trong ngày"
          className="w-full text-xs px-3 py-2 border border-slate-200 rounded focus:outline-none focus:border-[#9f224e] text-slate-800"
        />
      </div>

      {/* Editor Toolbar */}
      {!previewMode && (
        <div className="border border-slate-200 rounded-t-md bg-slate-50 p-1.5 flex flex-wrap items-center gap-1 border-b-0">
          <button
            type="button"
            onClick={() => executeCommand('bold')}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded border border-transparent hover:border-slate-200 font-bold text-xs"
            title="In đậm (Ctrl+B)"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('italic')}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded border border-transparent hover:border-slate-200 italic text-xs"
            title="In nghiêng (Ctrl+I)"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('underline')}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded border border-transparent hover:border-slate-200 underline text-xs"
            title="Gạch chân (Ctrl+U)"
          >
            <Underline className="w-3.5 h-3.5" />
          </button>

          <span className="w-px h-4 bg-slate-300 mx-1" />

          <button
            type="button"
            onClick={() => executeCommand('insertUnorderedList')}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded border border-transparent hover:border-slate-200 text-xs"
            title="Danh sách gạch đầu dòng"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('insertOrderedList')}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded border border-transparent hover:border-slate-200 text-xs"
            title="Danh sách số"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>

          <span className="w-px h-4 bg-slate-300 mx-1" />

          <button
            type="button"
            onClick={handleInsertLink}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded border border-transparent hover:border-slate-200 text-xs flex items-center gap-1"
            title="Chèn liên kết bài viết"
          >
            <LinkIcon className="w-3.5 h-3.5" />
          </button>

          <div className="hidden sm:flex items-center gap-1 ml-auto">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Tag className="w-3 h-3" /> Gắn nhanh:
            </span>
            {quickTags.slice(0, 4).map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleInsertTag(tag)}
                className="px-1.5 py-0.5 text-[11px] bg-white border border-slate-200 rounded text-slate-700 hover:border-[#9f224e] hover:text-[#9f224e] transition-colors"
              >
                +{tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Editable Canvas or Preview */}
      {previewMode ? (
        <div
          className="border border-slate-200 rounded-md p-3.5 min-h-[160px] bg-slate-50/50 text-xs text-slate-800 leading-relaxed font-sans"
          dangerouslySetInnerHTML={{
            __html: editorRef.current?.innerHTML || initialHtml,
          }}
        />
      ) : (
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          className="border border-slate-200 rounded-b-md p-3.5 min-h-[180px] max-h-[360px] overflow-y-auto focus:outline-none focus:ring-1 focus:ring-[#9f224e] text-xs text-slate-800 leading-relaxed bg-white"
        />
      )}

      {/* Quick Tag Selector for smaller screens */}
      {!previewMode && (
        <div className="flex sm:hidden flex-wrap items-center gap-1 mt-2">
          <span className="text-[11px] text-slate-400">Gắn tag nhanh:</span>
          {quickTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => handleInsertTag(tag)}
              className="px-1.5 py-0.5 text-[10px] bg-slate-50 border border-slate-200 rounded text-slate-600"
            >
              +{tag}
            </button>
          ))}
        </div>
      )}

      {/* Action Footer */}
      <div className="flex items-center justify-end gap-2 pt-3 mt-3 border-t border-slate-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 rounded hover:bg-slate-50"
        >
          Hủy bỏ
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-[#9f224e] hover:bg-[#83193e] rounded shadow-xs transition-colors"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Lưu nhận xét</span>
        </button>
      </div>
    </div>
  );
};
