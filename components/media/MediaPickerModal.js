'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { uploadFiles, uploaderFetch } from '@/lib/api/uploader-client';
import toast from 'react-hot-toast';

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function previewNode(item) {
  if (!item) return null;
  if (item.mediaType === 'image') {
    return <img src={item.url} alt={item.originalName} style={{ height: '100%', width: '100%', objectFit: 'cover' }} />;
  }
  if (item.mediaType === 'video') {
    return (
      <video style={{ height: '100%', width: '100%', objectFit: 'cover' }} controls preload="metadata">
        <source src={item.url} type={item.mimeType} />
      </video>
    );
  }
  return (
    <div style={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff0f0' }}>
      <i className="fa-regular fa-file-pdf" style={{ fontSize: 40, color: '#ef4444' }} />
    </div>
  );
}

function mediaConfig(mediaType) {
  if (mediaType === 'video') {
    return { label: 'Video', plural: 'Videos', accept: '.mp4,.mov', icon: 'fa-film' };
  }
  return { label: 'Image', plural: 'Images', accept: '.jpg,.jpeg,.png,.webp', icon: 'fa-image' };
}

/**
 * MediaPickerModal
 *
 * Props:
 *   open        – boolean: whether the modal is visible
 *   onClose     – () => void
 *   onSelect    – (item) => void           [when multiple=false]
 *   onSelectMany – (items[]) => void       [when multiple=true]
 *   multiple    – boolean: allow multi-select (for gallery)
 *   currentUrl  – string: pre-select item with this URL
 *   mediaType   – 'image' | 'video'
 */
export default function MediaPickerModal({
  open,
  onClose,
  onSelect,
  onSelectMany,
  multiple = false,
  currentUrl = '',
  mediaType = 'image',
}) {
  const cfg = mediaConfig(mediaType);
  const [tab, setTab] = useState('library');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [month, setMonth] = useState('');
  const [dragActive, setDragActive] = useState(false);

  // Single selection
  const [selectedId, setSelectedId] = useState(null);
  // Multi selection
  const [selectedIds, setSelectedIds] = useState([]);

  const selectedItem = useMemo(() => items.find((item) => item.id === selectedId) || null, [items, selectedId]);
  const selectedItems = useMemo(() => items.filter((item) => selectedIds.includes(item.id)), [items, selectedIds]);

  async function loadMedia() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ type: mediaType, page: '1', limit: '80' });
      if (search.trim()) params.set('search', search.trim());
      if (month) params.set('month', month);

      const res = await uploaderFetch(`/api/media?${params.toString()}`, { method: 'GET' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to load media');

      setItems(data.items || []);
      if (currentUrl && !selectedId && !multiple) {
        const found = (data.items || []).find((item) => item.url === currentUrl);
        if (found) setSelectedId(found.id);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to load media');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!open) return;
    setTab('library');
    setSelectedId(null);
    setSelectedIds([]);
    setSearch('');
    setMonth('');
    loadMedia();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mediaType]);

  useEffect(() => {
    if (!open || tab !== 'library') return;
    const t = setTimeout(() => loadMedia(), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, month]);

  async function handleUploadFiles(fileList) {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    setUploading(true);
    try {
      const uploaded = await uploadFiles(files);
      setTab('library');
      await loadMedia();
      if (uploaded.length) {
        if (multiple) {
          setSelectedIds(uploaded.map((f) => f.id));
        } else {
          setSelectedId(uploaded[0].id);
        }
        toast.success(`${uploaded.length} file(s) uploaded successfully`);
      }
    } catch (error) {
      toast.error(error.message || 'Upload failed');
    } finally {
      setUploading(false);
      setDragActive(false);
    }
  }

  function handleDrag(e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  }

  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUploadFiles(e.dataTransfer.files);
    }
  }

  function toggleMultiSelect(itemId) {
    setSelectedIds((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  }

  function handleConfirm() {
    if (multiple) {
      if (!selectedItems.length) return;
      onSelectMany?.(selectedItems);
    } else {
      if (!selectedItem) return;
      onSelect?.(selectedItem);
    }
    onClose();
  }

  const canConfirm = multiple ? selectedIds.length > 0 : !!selectedItem;

  // SSR-safe portal mount guard
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open || !mounted) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)', zIndex: 99999,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }}
      >
        {/* Modal */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: '#fff', borderRadius: 16, boxShadow: '0 25px 60px rgba(0,0,0,0.25)',
            width: '100%', maxWidth: 1000, maxHeight: '90vh',
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="fa-solid fa-images" style={{ color: '#fff', fontSize: 16 }} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#111' }}>Media Library</h3>
                <p style={{ margin: 0, fontSize: 13, color: '#888' }}>
                  {multiple ? 'Select one or more files' : 'Choose a file for your content'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              style={{ width: 36, height: 36, borderRadius: 8, border: 'none', background: '#f5f5f5', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555' }}
            >
              <i className="fa-solid fa-xmark" style={{ fontSize: 16 }} />
            </button>
          </div>

          {/* Tabs */}
          <div style={{ borderBottom: '1px solid #f0f0f0', padding: '0 24px', display: 'flex', gap: 4 }}>
            {[
              { id: 'library', label: 'Media Library', icon: 'fa-book-open' },
              { id: 'upload', label: 'Upload Files', icon: 'fa-cloud-arrow-up' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '14px 16px',
                  border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                  color: tab === t.id ? '#6366f1' : '#888',
                  borderBottom: tab === t.id ? '2px solid #6366f1' : '2px solid transparent',
                  marginBottom: -1,
                }}
              >
                <i className={`fa-solid ${t.icon}`} />
                {t.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div style={{ flex: 1, overflow: 'auto' }}>
            {tab === 'upload' ? (
              <div style={{ padding: 24 }}>
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  style={{
                    position: 'relative', borderRadius: 12,
                    border: `2px dashed ${dragActive ? '#6366f1' : '#d1d5db'}`,
                    background: dragActive ? '#eef2ff' : '#fafafa',
                    transition: 'all 0.2s',
                  }}
                >
                  <input
                    type="file"
                    accept={cfg.accept}
                    multiple
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                    onChange={(e) => { handleUploadFiles(e.target.files); e.target.value = ''; }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', textAlign: 'center', minHeight: 180 }}>
                    <i
                      className={`fa-solid ${uploading ? 'fa-spinner fa-spin' : 'fa-cloud-arrow-up'}`}
                      style={{ fontSize: 48, color: dragActive ? '#6366f1' : '#d1d5db', marginBottom: 16 }}
                    />
                    <p style={{ margin: '0 0 6px', fontWeight: 600, fontSize: 16, color: '#333' }}>
                      {uploading ? 'Uploading…' : dragActive ? 'Drop files here' : 'Drag & drop files here'}
                    </p>
                    <p style={{ margin: '0 0 12px', fontSize: 14, color: '#888' }}>
                      or <span style={{ color: '#6366f1', fontWeight: 600 }}>browse files</span>
                    </p>
                    <p style={{ margin: 0, fontSize: 12, color: '#aaa' }}>
                      Supported: {cfg.accept.replaceAll('.', '').toUpperCase().replaceAll(',', ', ')} · Max 50MB each
                    </p>
                  </div>
                </div>
                {uploading && (
                  <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ flex: 1, height: 6, background: '#f0f0f0', borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: '60%', background: 'linear-gradient(90deg,#6366f1,#8b5cf6)', borderRadius: 99, animation: 'pulse 1s ease-in-out infinite' }} />
                    </div>
                    <span style={{ fontSize: 13, color: '#555' }}>Uploading…</span>
                  </div>
                )}
              </div>
            ) : (
              /* Library Tab */
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', height: '100%' }}>
                {/* Grid */}
                <div style={{ padding: 24, borderRight: '1px solid #f0f0f0', overflowY: 'auto' }}>
                  {/* Filters */}
                  <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 160, position: 'relative' }}>
                      <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#aaa', fontSize: 13 }} />
                      <input
                        style={{ width: '100%', padding: '9px 12px 9px 32px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, boxSizing: 'border-box', outline: 'none' }}
                        placeholder={`Search ${cfg.plural.toLowerCase()}…`}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </div>
                    <div style={{ position: 'relative' }}>
                      <i className="fa-regular fa-calendar" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#aaa', fontSize: 13 }} />
                      <input
                        style={{ padding: '9px 12px 9px 32px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none' }}
                        type="month"
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                      />
                    </div>
                  </div>

                  {multiple && selectedIds.length > 0 && (
                    <div style={{ marginBottom: 12, padding: '8px 12px', background: '#eef2ff', borderRadius: 8, fontSize: 13, color: '#6366f1', fontWeight: 600 }}>
                      <i className="fa-solid fa-check-circle" style={{ marginRight: 6 }} />
                      {selectedIds.length} file{selectedIds.length > 1 ? 's' : ''} selected — click more to add, click selected to deselect
                    </div>
                  )}

                  {/* Image grid */}
                  {loading ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 10 }}>
                      {Array.from({ length: 15 }).map((_, i) => (
                        <div key={i} style={{ aspectRatio: '1', borderRadius: 10, background: '#f3f4f6', animation: 'pulse 1.5s ease-in-out infinite' }} />
                      ))}
                    </div>
                  ) : items.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 0' }}>
                      <i className="fa-regular fa-images" style={{ fontSize: 48, color: '#d1d5db', display: 'block', marginBottom: 12 }} />
                      <p style={{ color: '#555', fontWeight: 500, margin: '0 0 4px' }}>No {cfg.plural.toLowerCase()} found</p>
                      <p style={{ color: '#aaa', fontSize: 13, margin: 0 }}>Try adjusting your search or upload new {cfg.plural.toLowerCase()}</p>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 10 }}>
                      {items.map((item) => {
                        const isSelected = multiple ? selectedIds.includes(item.id) : item.id === selectedId;
                        const selectionIndex = multiple ? selectedIds.indexOf(item.id) : -1;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              if (multiple) {
                                toggleMultiSelect(item.id);
                              } else {
                                setSelectedId(item.id);
                              }
                            }}
                            style={{
                              position: 'relative', aspectRatio: '1', borderRadius: 10, overflow: 'hidden',
                              border: `2px solid ${isSelected ? '#6366f1' : 'transparent'}`,
                              cursor: 'pointer', padding: 0, background: '#f3f4f6',
                              boxShadow: isSelected ? '0 0 0 3px rgba(99,102,241,0.2)' : 'none',
                              transform: isSelected ? 'scale(1.03)' : 'scale(1)',
                              transition: 'all 0.15s',
                            }}
                          >
                            <div style={{ position: 'absolute', inset: 0 }}>{previewNode(item)}</div>
                            {/* Hover overlay */}
                            <div style={{
                              position: 'absolute', inset: 0,
                              background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 50%)',
                              opacity: isSelected ? 1 : 0,
                              transition: 'opacity 0.15s',
                            }} />
                            {/* File name */}
                            {isSelected && (
                              <p style={{ position: 'absolute', bottom: 4, left: 4, right: 4, margin: 0, fontSize: 10, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {item.originalName}
                              </p>
                            )}
                            {/* Check badge */}
                            {isSelected && (
                              <span style={{
                                position: 'absolute', top: 5, right: 5,
                                width: 22, height: 22, borderRadius: 6,
                                background: '#6366f1', color: '#fff',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 11, fontWeight: 700, boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                              }}>
                                {multiple && selectionIndex >= 0 ? selectionIndex + 1 : <i className="fa-solid fa-check" />}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Details Panel */}
                <div style={{ padding: 24, background: '#fafafa', overflowY: 'auto' }}>
                  <p style={{ margin: '0 0 16px', fontSize: 11, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: 1 }}>
                    {multiple ? 'Selected Files' : `Selected ${cfg.label}`}
                  </p>

                  {multiple ? (
                    selectedItems.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {selectedItems.map((item, i) => (
                          <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: '#fff', borderRadius: 8, border: '1px solid #eee' }}>
                            <div style={{ width: 48, height: 48, borderRadius: 6, overflow: 'hidden', flexShrink: 0 }}>
                              {previewNode(item)}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: '#333', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                #{i + 1} {item.originalName}
                              </p>
                              <p style={{ margin: 0, fontSize: 11, color: '#aaa' }}>{formatBytes(item.size)}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => toggleMultiSelect(item.id)}
                              style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#aaa', padding: 4 }}
                            >
                              <i className="fa-solid fa-xmark" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '40px 0' }}>
                        <i className="fa-regular fa-images" style={{ fontSize: 36, color: '#d1d5db', display: 'block', marginBottom: 10 }} />
                        <p style={{ color: '#888', fontSize: 13, margin: 0 }}>No files selected</p>
                        <p style={{ color: '#aaa', fontSize: 12, margin: '4px 0 0' }}>Click images in the grid to select</p>
                      </div>
                    )
                  ) : selectedItem ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <div style={{ aspectRatio: '16/9', borderRadius: 10, overflow: 'hidden', border: '1px solid #eee', background: '#f5f5f5' }}>
                        {previewNode(selectedItem)}
                      </div>
                      <div>
                        <p style={{ margin: '0 0 4px', fontWeight: 600, fontSize: 14, color: '#222', wordBreak: 'break-all' }}>
                          {selectedItem.originalName}
                        </p>
                        <div style={{ display: 'flex', gap: 8, fontSize: 12, color: '#aaa' }}>
                          <span>{new Date(selectedItem.uploadedAt).toLocaleDateString()}</span>
                          <span>·</span>
                          <span>{formatBytes(selectedItem.size)}</span>
                        </div>
                      </div>
                      <div style={{ background: '#fff', borderRadius: 8, padding: 12, border: '1px solid #eee' }}>
                        <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 600, color: '#aaa', textTransform: 'uppercase' }}>URL</p>
                        <p style={{ margin: 0, fontSize: 11, color: '#555', wordBreak: 'break-all' }}>{selectedItem.url}</p>
                      </div>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                      <i className="fa-regular fa-image" style={{ fontSize: 36, color: '#d1d5db', display: 'block', marginBottom: 10 }} />
                      <p style={{ color: '#888', fontSize: 13, margin: 0 }}>No {cfg.label.toLowerCase()} selected</p>
                      <p style={{ color: '#aaa', fontSize: 12, margin: '4px 0 0' }}>Click on a {cfg.label.toLowerCase()} to view details</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{
            padding: '14px 24px', borderTop: '1px solid #f0f0f0', background: '#fafafa',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{ padding: '9px 18px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', color: '#555', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!canConfirm}
              style={{
                padding: '9px 22px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 600,
                cursor: canConfirm ? 'pointer' : 'not-allowed',
                background: canConfirm ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : '#e5e7eb',
                color: canConfirm ? '#fff' : '#aaa',
                display: 'flex', alignItems: 'center', gap: 8,
                boxShadow: canConfirm ? '0 4px 14px rgba(99,102,241,0.4)' : 'none',
                transition: 'all 0.2s',
              }}
            >
              <i className="fa-solid fa-check-circle" />
              {multiple
                ? selectedIds.length > 0 ? `Add ${selectedIds.length} ${cfg.label}${selectedIds.length > 1 ? 's' : ''}` : `Select ${cfg.plural}`
                : selectedItem ? `Use ${cfg.label}` : `Select ${cfg.label}`}
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
