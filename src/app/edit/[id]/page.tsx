'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, ChevronDown, Plus, X, Bold, Italic, List, Trash2 } from 'lucide-react';
import { useNotionData, useMutation } from '@/lib/hooks';
import type { PageDetail, PageBlock } from '@/lib/types';
import { useToast } from '@/components/Toast';

const GRADIENTS = [
  'linear-gradient(135deg, #006789, #5acafe)',
  'linear-gradient(135deg, #9e422c, #fe8b70)',
  'linear-gradient(135deg, #a78bfa, #7c3aed)',
  'linear-gradient(135deg, #93c5fd, #2563eb)',
  'linear-gradient(135deg, #fdba74, #ea580c)',
  'linear-gradient(135deg, #615e57, #b8b29f)',
];

const STATUS_CYCLE = ['To Do', 'In Progress', 'Done'];

function pickGradient(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash + id.charCodeAt(i)) | 0;
  }
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
}

export default function EditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { toast, showToast } = useToast();

  const { data: pageData, loading: pageLoading } = useNotionData<PageDetail>(`pages/${id}`);
  const { data: blocksData, loading: blocksLoading } = useNotionData<PageBlock[]>(`pages/${id}/blocks`);

  const patchPage = useMutation(`pages/${id}`, 'PATCH');
  const deletePage = useMutation(`pages/${id}`, 'DELETE');
  const patchBlocks = useMutation(`pages/${id}/blocks`, 'PATCH');

  const [title, setTitle] = useState('');
  const [status, setStatus] = useState('');
  const [date, setDate] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [memoContent, setMemoContent] = useState('');
  const [statusOpen, setStatusOpen] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Initialize from fetched data
  useEffect(() => {
    if (!pageData || initialized) return;

    setTitle(pageData.title || '');

    // Extract status from properties
    const props = pageData.properties || {};
    for (const key of ['Status', '\uC0C1\uD0DC', '\uC9C4\uD589\uC0C1\uD0DC']) {
      const p = props[key];
      if (p?.status?.name) { setStatus(p.status.name); break; }
      if (p?.select?.name) { setStatus(p.select.name); break; }
    }

    // Extract date
    for (const key of ['Date', '\uB0A0\uC9DC', 'Due', '\uB9C8\uAC10', 'Due Date']) {
      const p = props[key];
      if (p?.date?.start) { setDate(p.date.start); break; }
    }

    // Extract tags
    for (const key of ['Tags', '\uD0DC\uADF8', 'Labels', 'Category', '\uBD84\uB958']) {
      const p = props[key];
      if (p?.multi_select) {
        setTags(p.multi_select.map((t: any) => t.name));
        break;
      }
      if (p?.select?.name) {
        setTags([p.select.name]);
        break;
      }
    }

    setInitialized(true);
  }, [pageData, initialized]);

  // Initialize memo content from blocks
  useEffect(() => {
    if (!blocksData || memoContent) return;
    const text = blocksData.map((b) => b.content).filter(Boolean).join('\n');
    setMemoContent(text);
  }, [blocksData, memoContent]);

  const handleTitleBlur = useCallback(async () => {
    if (!title.trim() || title === pageData?.title) return;
    await patchPage.mutate({
      properties: { Name: { title: [{ text: { content: title.trim() } }] } },
    });
    showToast('Title updated');
  }, [title, pageData?.title, patchPage, showToast]);

  const handleStatusChange = useCallback(async (newStatus: string) => {
    setStatus(newStatus);
    setStatusOpen(false);
    await patchPage.mutate({
      properties: { Status: { status: { name: newStatus } } },
    });
    showToast(`Status: ${newStatus}`);
  }, [patchPage, showToast]);

  const handleDateChange = useCallback(async (newDate: string) => {
    setDate(newDate);
    const propNames = ['Date', 'Due', 'Due Date'];
    for (const name of propNames) {
      try {
        await patchPage.mutate({
          properties: { [name]: { date: { start: newDate || null } } },
        });
        showToast('Date updated');
        return;
      } catch {
        // try next property name
      }
    }
  }, [patchPage, showToast]);

  const handleAddTag = useCallback(() => {
    if (!newTag.trim() || tags.includes(newTag.trim())) return;
    const updated = [...tags, newTag.trim()];
    setTags(updated);
    setNewTag('');
    // Best-effort update
    patchPage.mutate({
      properties: {
        Tags: { multi_select: updated.map((t) => ({ name: t })) },
      },
    });
  }, [newTag, tags, patchPage]);

  const handleRemoveTag = useCallback((tag: string) => {
    const updated = tags.filter((t) => t !== tag);
    setTags(updated);
    patchPage.mutate({
      properties: {
        Tags: { multi_select: updated.map((t) => ({ name: t })) },
      },
    });
  }, [tags, patchPage]);

  const handleMemoBlur = useCallback(async () => {
    if (!memoContent.trim()) return;
    await patchBlocks.mutate({
      blocks: [{
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [{ type: 'text', text: { content: memoContent } }],
        },
      }],
    });
    showToast('Content saved');
  }, [memoContent, patchBlocks, showToast]);

  const handleDelete = useCallback(async () => {
    if (!confirm('Delete this page?')) return;
    await deletePage.mutate();
    showToast('Page deleted');
    router.back();
  }, [deletePage, showToast, router]);

  const isLoading = pageLoading || blocksLoading;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingBottom: 40 }}>
      {/* Header */}
      <div className="edit-header">
        <button
          onClick={() => router.back()}
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: 'var(--ink)', fontSize: 14, fontWeight: 600 }}
        >
          <ArrowLeft style={{ width: 20, height: 20 }} />
          Back
        </button>
        {pageData?.notionUrl && (
          <a
            href={pageData.notionUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: 12, color: 'var(--tertiary)', fontWeight: 600, textDecoration: 'none' }}
          >
            Open in Notion
          </a>
        )}
      </div>

      {/* Cover gradient */}
      <div className="edit-cover" style={{ background: pickGradient(id), marginTop: 56 }} />

      {/* Loading skeleton */}
      {isLoading ? (
        <div style={{ padding: '0 20px' }}>
          <div className="skeleton" style={{ height: 32, width: '60%', marginBottom: 24 }} />
          <div className="skeleton" style={{ height: 48, marginBottom: 16 }} />
          <div className="skeleton" style={{ height: 48, marginBottom: 16 }} />
          <div className="skeleton" style={{ height: 200 }} />
        </div>
      ) : (
        <>
          {/* Title */}
          <input
            className="edit-title-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            placeholder="Untitled"
          />

          {/* Properties */}
          <div className="edit-section" style={{ marginTop: 24 }}>
            <div className="edit-section-label">Properties</div>

            {/* Status */}
            <div className="edit-prop-row" style={{ marginBottom: 8, position: 'relative' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-variant)' }}>Status</span>
              <button
                onClick={() => setStatusOpen(!statusOpen)}
                className="pill"
                style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                type="button"
              >
                {status || 'None'}
                <ChevronDown style={{ width: 14, height: 14 }} />
              </button>
              {statusOpen && (
                <div style={{
                  position: 'absolute', top: '100%', right: 0, marginTop: 4,
                  background: 'var(--surface-lowest)', borderRadius: 'var(--r-lg)',
                  boxShadow: 'var(--shadow-card)', border: '1px solid rgba(184,178,159,0.1)',
                  overflow: 'hidden', zIndex: 10, minWidth: 140,
                }}>
                  {STATUS_CYCLE.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(s)}
                      type="button"
                      style={{
                        display: 'block', width: '100%', padding: '10px 16px', border: 'none',
                        background: status === s ? 'var(--surface-high)' : 'transparent',
                        fontSize: 13, fontWeight: 600, color: 'var(--ink)', cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Date */}
            <div className="edit-prop-row" style={{ marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-variant)' }}>Date</span>
              <input
                type="date"
                value={date}
                onChange={(e) => handleDateChange(e.target.value)}
                style={{
                  border: 'none', background: 'transparent', fontSize: 13,
                  fontWeight: 600, color: 'var(--ink)', outline: 'none',
                }}
              />
            </div>

            {/* Tags */}
            <div className="edit-prop-row" style={{ flexWrap: 'wrap', gap: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-variant)', width: '100%' }}>Tags</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, width: '100%' }}>
                {tags.map((tag) => (
                  <span key={tag} className="edit-tag" style={{ background: 'var(--surface-container)', color: 'var(--ink)' }}>
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      type="button"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: 'var(--ink-outline)' }}
                    >
                      <X style={{ width: 12, height: 12 }} />
                    </button>
                  </span>
                ))}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                    placeholder="Add tag"
                    style={{
                      border: 'none', background: 'transparent', fontSize: 13,
                      fontWeight: 500, color: 'var(--ink)', outline: 'none', width: 80,
                    }}
                  />
                  {newTag.trim() && (
                    <button
                      onClick={handleAddTag}
                      type="button"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: 'var(--tertiary)' }}
                    >
                      <Plus style={{ width: 16, height: 16 }} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Memo / Content */}
          <div className="edit-section">
            <div className="edit-section-label">Content</div>
            <div className="edit-memo-area">
              <div className="edit-memo-toolbar">
                <Bold style={{ width: 16, height: 16 }} />
                <Italic style={{ width: 16, height: 16 }} />
                <List style={{ width: 16, height: 16 }} />
              </div>
              <textarea
                value={memoContent}
                onChange={(e) => setMemoContent(e.target.value)}
                onBlur={handleMemoBlur}
                placeholder="Write something..."
                style={{
                  width: '100%', minHeight: 160, border: 'none', background: 'transparent',
                  fontSize: 14, lineHeight: 1.7, color: 'var(--ink)', outline: 'none', resize: 'none',
                }}
              />
            </div>
          </div>

          {/* Delete */}
          <div className="edit-section">
            <button
              className="edit-delete-btn"
              onClick={handleDelete}
              type="button"
            >
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <Trash2 style={{ width: 16, height: 16 }} />
                Delete Page
              </span>
            </button>
          </div>
        </>
      )}

      {toast}
    </div>
  );
}
