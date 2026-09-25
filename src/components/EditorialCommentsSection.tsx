import React, { useState } from 'react';
import { Pencil, Trash2, Plus, MessageSquare, Clock, Check, AlertCircle, Building2, Globe } from 'lucide-react';
import { EditorialComment, SecretaryProfile, CommentCategory } from '../types';
import { RichCommentEditor } from './RichCommentEditor';

interface EditorialCommentsSectionProps {
  comments: EditorialComment[];
  selectedSecretary: SecretaryProfile;
  onUpdateComment: (id: string, updated: { title: string; html: string; category?: CommentCategory }) => void;
  onDeleteComment: (id: string) => void;
  onAddComment: (comment: { title: string; html: string; category?: CommentCategory }) => void;
}

// Helper to filter out raw JSON lines e.g. {"subject_id":...} or ","status":"1"...
function cleanRenderedHtml(html: string): string {
  if (!html) return '';
  let cleaned = html;
  cleaned = cleaned.replace(/\{"subject_id"[^}]*"comments":\s*"?/gi, '');
  cleaned = cleaned.replace(/&quot;subject_id&quot;[^}]*&quot;comments&quot;:\s*&quot;?/gi, '');
  cleaned = cleaned.replace(/&quot;\s*,\s*&quot;status&quot;[\s\S]*$/gi, '');
  cleaned = cleaned.replace(/"\s*,\s*"status"[\s\S]*$/gi, '');
  cleaned = cleaned.replace(/\{&quot;subject_id&quot;[\s\S]*?&quot;comments&quot;:\s*&quot;/gi, '');
  cleaned = cleaned.replace(/<p>\s*\{&quot;subject_id&quot;[\s\S]*?<\/p>/gi, '');
  cleaned = cleaned.replace(/<p>\s*\{"subject_id"[\s\S]*?<\/p>/gi, '');
  cleaned = cleaned.replace(/<p>[\s\S]*?"status":"1"[\s\S]*?<\/p>/gi, '');
  cleaned = cleaned.replace(/<p>[\s\S]*?&quot;status&quot;:&quot;1&quot;[\s\S]*?<\/p>/gi, '');
  return cleaned;
}

export const EditorialCommentsSection: React.FC<EditorialCommentsSectionProps> = ({
  comments,
  selectedSecretary,
  onUpdateComment,
  onDeleteComment,
  onAddComment,
}) => {
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [addingCategory, setAddingCategory] = useState<CommentCategory | null>(null);

  // Group comments into 2 distinct groups:
  // 1. VnExpress
  // 2. Ngôi sao, English, Tia sáng
  const vnexpressComments = comments.filter(
    (c) => !c.category || c.category === 'vnexpress'
  );

  const othersComments = comments.filter(
    (c) => c.category === 'others'
  );

  const handleSaveEdit = (content: { title: string; html: string; category?: CommentCategory }) => {
    if (editingCommentId) {
      onUpdateComment(editingCommentId, content);
      setEditingCommentId(null);
    }
  };

  const handleSaveNew = (content: { title: string; html: string; category?: CommentCategory }) => {
    onAddComment({
      ...content,
      category: addingCategory || content.category || 'vnexpress',
    });
    setAddingCategory(null);
  };

  // Render a comment list item
  const renderCommentItem = (comment: EditorialComment) => {
    const isEditing = editingCommentId === comment.id;

    if (isEditing) {
      return (
        <RichCommentEditor
          key={comment.id}
          isEditing={true}
          initialCategory={comment.category || 'vnexpress'}
          initialHtml={comment.htmlContent}
          onSave={handleSaveEdit}
          onCancel={() => setEditingCommentId(null)}
        />
      );
    }

    return (
      <div
        key={comment.id}
        className="group relative pb-3 border-b border-slate-100 last:border-b-0 last:pb-0"
      >
        {/* Top Right Action Icons */}
        <div className="absolute right-0 top-0 flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={() => setEditingCommentId(comment.id)}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors cursor-pointer"
            title="Chỉnh sửa nhận xét này"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setDeleteConfirmId(comment.id)}
            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
            title="Xóa nhận xét"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Delete confirmation dialog popover */}
        {deleteConfirmId === comment.id && (
          <div className="mb-3 p-2.5 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-800 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Bạn có chắc chắn muốn xóa khối nhận xét này không?</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => {
                  onDeleteComment(comment.id);
                  setDeleteConfirmId(null);
                }}
                className="px-2 py-0.5 bg-rose-600 text-white rounded font-medium hover:bg-rose-700 cursor-pointer"
              >
                Xóa
              </button>
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-2 py-0.5 bg-white border border-rose-300 rounded hover:bg-rose-50 cursor-pointer"
              >
                Hủy
              </button>
            </div>
          </div>
        )}

        {/* Author & Timestamp meta line */}
        <div className="flex items-center gap-2 mb-1.5 text-[11px] text-slate-400">
          <span className="font-semibold text-slate-700">@{comment.author || selectedSecretary.username}</span>
          <span>•</span>
          <span>{comment.updatedAt || '08:00'}</span>
        </div>

        {/* Optional Summary Heading */}
        {comment.summaryTitle &&
          !comment.summaryTitle.startsWith('Nhận xét Thư ký trực') &&
          !comment.summaryTitle.startsWith('Nhận xét đề tài ngày') && (
          <div className="text-xs font-semibold text-slate-900 mb-2 font-sans pr-14">
            {comment.summaryTitle}
          </div>
        )}

        {/* Rendered HTML content */}
        <div
          className="text-xs text-slate-800 leading-relaxed space-y-2 pr-14 [&_a]:text-blue-600 [&_a]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_strong]:font-semibold"
          dangerouslySetInnerHTML={{ __html: cleanRenderedHtml(comment.htmlContent) }}
        />
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* BOX 1: VnExpress */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#9f224e]" />
            <h3 className="font-bold text-slate-900 text-sm tracking-tight flex items-center gap-2">
              <span>Nhận xét VnExpress</span>
              <span className="text-[11px] font-normal text-slate-400">
                ({vnexpressComments.length} nhận xét)
              </span>
            </h3>
          </div>

          <button
            type="button"
            onClick={() => setAddingCategory(addingCategory === 'vnexpress' ? null : 'vnexpress')}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#9f224e] hover:bg-rose-50 px-2 py-1 rounded transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm nhận xét VnExpress</span>
          </button>
        </div>

        {/* Inline adding form for VnExpress */}
        {addingCategory === 'vnexpress' && (
          <div className="pb-3 border-b border-slate-100">
            <RichCommentEditor
              isEditing={false}
              initialCategory="vnexpress"
              initialHtml="<p><strong>- Điểm tin / Lưu ý:</strong> </p>"
              onSave={handleSaveNew}
              onCancel={() => setAddingCategory(null)}
            />
          </div>
        )}

        {/* VnExpress Comments list */}
        {vnexpressComments.length === 0 && addingCategory !== 'vnexpress' ? (
          <div className="py-6 text-center text-slate-500 text-xs">
            <p className="font-medium text-slate-500">Chưa có nhận xét VnExpress</p>
          </div>
        ) : (
          <div className="space-y-4">
            {vnexpressComments.map((comment) => renderCommentItem(comment))}
          </div>
        )}
      </div>

      {/* BOX 2: Ngôi sao, English, Tia sáng */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
            <h3 className="font-bold text-slate-900 text-sm tracking-tight flex items-center gap-2">
              <span>Nhận xét Ngôi sao, English, Tia sáng</span>
              <span className="text-[11px] font-normal text-slate-400">
                ({othersComments.length} nhận xét)
              </span>
            </h3>
          </div>

          <button
            type="button"
            onClick={() => setAddingCategory(addingCategory === 'others' ? null : 'others')}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 hover:bg-indigo-50 px-2 py-1 rounded transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm nhận xét Site vệ tinh</span>
          </button>
        </div>

        {/* Inline adding form for Site vệ tinh */}
        {addingCategory === 'others' && (
          <div className="pb-3 border-b border-slate-100">
            <RichCommentEditor
              isEditing={false}
              initialCategory="others"
              initialHtml="<p><strong>- Ngôi sao / English / Tia sáng:</strong> </p>"
              onSave={handleSaveNew}
              onCancel={() => setAddingCategory(null)}
            />
          </div>
        )}

        {/* Others Comments list */}
        {othersComments.length === 0 && addingCategory !== 'others' ? (
          <div className="py-6 text-center text-slate-500 text-xs">
            <p className="font-medium text-slate-500">Chưa có nhận xét cho Ngôi sao, English, Tia sáng</p>
          </div>
        ) : (
          <div className="space-y-4">
            {othersComments.map((comment) => renderCommentItem(comment))}
          </div>
        )}
      </div>
    </div>
  );
};
