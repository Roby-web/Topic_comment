import React, { useState } from 'react';
import { Pencil, Trash2, Plus, MessageSquare, Clock, Check, AlertCircle } from 'lucide-react';
import { EditorialComment, SecretaryProfile } from '../types';
import { RichCommentEditor } from './RichCommentEditor';

interface EditorialCommentsSectionProps {
  comments: EditorialComment[];
  selectedSecretary: SecretaryProfile;
  onUpdateComment: (id: string, updated: { title: string; html: string }) => void;
  onDeleteComment: (id: string) => void;
  onAddComment: (comment: { title: string; html: string }) => void;
}

// Helper to filter out raw JSON lines e.g. {"subject_id":...} or ","status":"1"...
function cleanRenderedHtml(html: string): string {
  if (!html) return '';
  let cleaned = html;
  // If string contains raw JSON fragments printed into HTML
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
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleSaveEdit = (content: { title: string; html: string }) => {
    if (editingCommentId) {
      onUpdateComment(editingCommentId, content);
      setEditingCommentId(null);
    }
  };

  const handleSaveNew = (content: { title: string; html: string }) => {
    onAddComment(content);
    setIsAddingNew(false);
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-4">
      {/* List of Comments */}
      {comments.length === 0 && !isAddingNew ? (
        <div className="py-6 text-center text-slate-500 text-xs">
          <p className="italic">Chưa có nhận xét cho ngày này.</p>
          <button
            type="button"
            onClick={() => setIsAddingNew(true)}
            className="mt-2 inline-flex items-center gap-1 text-[#9f224e] font-semibold hover:underline cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm nhận xét đầu tiên</span>
          </button>
        </div>
      ) : (
        comments.map((comment) => {
        const isEditing = editingCommentId === comment.id;

        if (isEditing) {
          return (
            <RichCommentEditor
              key={comment.id}
              isEditing={true}
              initialTitle={comment.summaryTitle}
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
            {/* Top Right Action Icons - Exact match to image.png */}
            <div className="absolute right-0 top-0 flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={() => setEditingCommentId(comment.id)}
                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                title="Chỉnh sửa nhận xét này"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setDeleteConfirmId(comment.id)}
                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
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
                    className="px-2 py-0.5 bg-rose-600 text-white rounded font-medium hover:bg-rose-700"
                  >
                    Xóa
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(null)}
                    className="px-2 py-0.5 bg-white border border-rose-300 rounded hover:bg-rose-50"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            )}

            {/* Optional Summary Heading */}
            {comment.summaryTitle &&
              !comment.summaryTitle.startsWith('Nhận xét Thư ký trực') &&
              !comment.summaryTitle.startsWith('Nhận xét đề tài ngày') && (
              <div className="text-xs font-semibold text-slate-900 mb-2 font-sans pr-14">
                {comment.summaryTitle}
              </div>
            )}

            {/* Rendered HTML content - Exact typographic layout from image.png */}
            <div
              className="text-xs text-slate-800 leading-relaxed space-y-2 pr-14 [&_a]:text-blue-600 [&_a]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_strong]:font-semibold"
              dangerouslySetInnerHTML={{ __html: cleanRenderedHtml(comment.htmlContent) }}
            />
          </div>
        );
      })
      )}

      {/* Adding New Comment form */}
      {isAddingNew && (
        <div className="pt-2">
          <RichCommentEditor
            isEditing={false}
            initialTitle="Nhận xét bổ sung Thư ký trực"
            initialHtml="<p><strong>- Đề tài mới / Lưu ý:</strong> </p>"
            onSave={handleSaveNew}
            onCancel={() => setIsAddingNew(false)}
          />
        </div>
      )}

      {/* Bottom Footer Action & Timestamp Row matching image.png */}
      <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
        {/* Buttons: Thêm nhận xét & Nhận xét hôm nay */}
        {!isAddingNew ? (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsAddingNew(true)}
              className="inline-flex items-center gap-1.5 text-slate-600 hover:text-[#9f224e] font-medium transition-colors cursor-pointer py-1 px-1 rounded"
              title="Thêm nhận xét mới cho ngày này"
            >
              <Plus className="w-3.5 h-3.5 text-slate-500" />
              <span>Thêm nhận xét</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAddingNew(true)}
              className="inline-flex items-center gap-1.5 text-[#9f224e] hover:text-[#7e173b] bg-rose-50/70 hover:bg-rose-100/70 border border-rose-200/80 font-medium transition-colors cursor-pointer py-1 px-2.5 rounded text-xs"
              title="Nhập nhận xét hôm nay"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#9f224e]" />
              <span>Nhận xét hôm nay</span>
            </button>
          </div>
        ) : (
          <div />
        )}

        {/* Thư ký trực cập nhật lần cuối timestamp */}
        <div className="text-slate-500 text-[11px] sm:ml-auto flex items-center gap-1 font-sans">
          <span>{selectedSecretary.username} cập nhật lần cuối {comments[0]?.updatedAt || '08:11'}</span>
        </div>
      </div>
    </div>
  );
};
