import React, { useState, useRef, useEffect } from 'react';
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon,
  Eye,
  Edit3,
  X,
  Upload,
} from 'lucide-react';
import { CommentCategory } from '../types';

interface RichCommentEditorProps {
  initialHtml: string;
  initialCategory?: CommentCategory;
  onSave: (content: { title: string; html: string; category?: CommentCategory }) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

export const RichCommentEditor: React.FC<RichCommentEditorProps> = ({
  initialHtml,
  initialCategory = 'vnexpress',
  onSave,
  onCancel,
  isEditing = false,
}) => {
  const [category, setCategory] = useState<CommentCategory>(initialCategory);
  const [previewMode, setPreviewMode] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Insert image via URL or local file upload
  const handleInsertImageUrl = () => {
    const url = prompt('Nhập URL hình ảnh (hoặc click nút bên cạnh để tải ảnh từ máy):');
    if (url) {
      executeCommand('insertImage', url);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn tệp hình ảnh hợp lệ (PNG, JPG, WebP...).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        executeCommand('insertImage', dataUrl);
      }
    };
    reader.readAsDataURL(file);
    // reset input
    e.target.value = '';
  };

  const handleSave = () => {
    const contentHtml = editorRef.current ? editorRef.current.innerHTML : initialHtml;
    onSave({
      title: category === 'vnexpress' ? 'Nhận xét VnExpress' : 'Nhận xét Ngôi sao, English, Tia sáng',
      html: contentHtml,
      category,
    });
  };

  return (
    <div className="bg-white border border-slate-300 rounded-lg shadow-md p-3.5 animate-in fade-in duration-150 space-y-3">
      {/* Top Header Row: Title & Preview mode */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Edit3 className="w-4 h-4 text-[#9f224e]" />
          <h3 className="font-semibold text-slate-900 text-xs sm:text-sm">
            {isEditing ? 'Chỉnh sửa nhận xét' : 'Nhập nội dung nhận xét'}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPreviewMode(!previewMode)}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded border transition-colors cursor-pointer ${
              previewMode
                ? 'bg-rose-50 text-[#9f224e] border-rose-200'
                : 'text-slate-600 hover:bg-slate-50 border-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{previewMode ? 'Soạn thảo' : 'Xem trước'}</span>
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="p-1 text-slate-400 hover:text-slate-700 rounded cursor-pointer"
            title="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Editor Toolbar: Bỏ gắn thẻ tag, Thêm insert ảnh */}
      {!previewMode && (
        <div className="border border-slate-200 rounded-t-md bg-slate-50 p-1.5 flex flex-wrap items-center gap-1 border-b-0">
          <button
            type="button"
            onClick={() => executeCommand('bold')}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded border border-transparent hover:border-slate-200 font-bold text-xs cursor-pointer"
            title="In đậm (Ctrl+B)"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('italic')}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded border border-transparent hover:border-slate-200 italic text-xs cursor-pointer"
            title="In nghiêng (Ctrl+I)"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('underline')}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded border border-transparent hover:border-slate-200 underline text-xs cursor-pointer"
            title="Gạch chân (Ctrl+U)"
          >
            <Underline className="w-3.5 h-3.5" />
          </button>

          <span className="w-px h-4 bg-slate-300 mx-1" />

          <button
            type="button"
            onClick={() => executeCommand('insertUnorderedList')}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded border border-transparent hover:border-slate-200 text-xs cursor-pointer"
            title="Danh sách gạch đầu dòng"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('insertOrderedList')}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded border border-transparent hover:border-slate-200 text-xs cursor-pointer"
            title="Danh sách số"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>

          <span className="w-px h-4 bg-slate-300 mx-1" />

          {/* Chèn liên kết */}
          <button
            type="button"
            onClick={handleInsertLink}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded border border-transparent hover:border-slate-200 text-xs flex items-center gap-1 cursor-pointer"
            title="Chèn liên kết bài viết"
          >
            <LinkIcon className="w-3.5 h-3.5" />
          </button>

          <span className="w-px h-4 bg-slate-300 mx-1" />

          {/* Thêm tính năng Insert ảnh: Upload file hoặc chèn link URL */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-2 py-1 text-slate-700 hover:text-slate-900 hover:bg-white rounded border border-slate-200 text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Tải ảnh từ máy tính"
            >
              <Upload className="w-3.5 h-3.5 text-indigo-600" />
              <span>Tải ảnh</span>
            </button>
            <button
              type="button"
              onClick={handleInsertImageUrl}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded border border-transparent hover:border-slate-200 text-xs cursor-pointer"
              title="Chèn ảnh từ URL đường dẫn"
            >
              <ImageIcon className="w-3.5 h-3.5" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>
        </div>
      )}

      {/* Editable Canvas or Preview */}
      {previewMode ? (
        <div
          className="border border-slate-200 rounded-md p-3.5 min-h-[160px] bg-slate-50/50 text-xs text-slate-800 leading-relaxed font-sans [&_img]:max-w-full [&_img]:rounded-md [&_img]:my-2 [&_img]:shadow-xs"
          dangerouslySetInnerHTML={{
            __html: editorRef.current?.innerHTML || initialHtml,
          }}
        />
      ) : (
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          className="border border-slate-200 rounded-b-md p-3.5 min-h-[160px] focus:outline-none focus:border-[#9f224e] focus:ring-1 focus:ring-[#9f224e] text-xs text-slate-800 leading-relaxed font-sans bg-white overflow-y-auto max-h-[360px] [&_img]:max-w-full [&_img]:rounded-md [&_img]:my-2 [&_img]:shadow-xs"
        />
      )}

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <span className="text-[11px] text-slate-400">
          Hỗ trợ phím tắt: Ctrl+B (in đậm), Ctrl+I (in nghiêng), kéo thả hoặc dán ảnh trực tiếp.
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded border border-slate-200 transition-colors cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-1.5 text-xs font-semibold bg-[#9f224e] hover:bg-[#861b40] text-white rounded shadow-xs transition-colors cursor-pointer"
          >
            Lưu nhận xét
          </button>
        </div>
      </div>
    </div>
  );
};
