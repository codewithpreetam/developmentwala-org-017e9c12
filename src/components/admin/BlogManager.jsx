import React, { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '@/api/apiClient';
import {
  Plus, Pencil, Trash2, Eye, EyeOff, CheckCircle2, X, Save,
  Upload, Tag, Globe, FileText, Image as ImageIcon, Loader2,
  Bold, Italic, Underline, Link, AlignLeft, AlignCenter, AlignRight,
  List, ListOrdered, Quote, Minus, Strikethrough, Code, RotateCcw, RotateCw,
  Clock, AlertCircle, CheckCircle
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { resizeImageToCoverWebp } from '@/lib/image/compress';


function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function estimateReadTime(html) {
  const text = html?.replace(/<[^>]+>/g, '') || '';
  return Math.max(1, Math.ceil(text.split(/\s+/).length / 200));
}

export default function BlogManager() {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list');
  const [editPost, setEditPost] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const [newCatName, setNewCatName] = useState('');
  const [newCatSlug, setNewCatSlug] = useState('');
  const [addingCat, setAddingCat] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState(''); // 'saving' | 'saved' | 'error' | ''
  const [wordCount, setWordCount] = useState(0);
  const [linkUrl, setLinkUrl] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);
  const editorRef = useRef(null);
  const autoSaveTimer = useRef(null);
  const savedSelectionRef = useRef(null);

  const blankPost = {
    title: '', slug: '', content: '', excerpt: '',
    featured_image: '', categories: [], tags: '',
    status: 'draft', meta_title: '', meta_description: '',
    author_name: '', read_time: 1,
  };

  useEffect(() => { loadAll(); }, []);

  // Keyboard shortcut Ctrl+S / Cmd+S
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's' && view === 'edit') {
        e.preventDefault();
        savePost();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [view, editPost]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty && view === 'edit') {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty, view]);

  // Auto-save every 30 seconds when dirty
  useEffect(() => {
    if (autoSaveTimer.current) clearInterval(autoSaveTimer.current);
    if (view === 'edit' && editPost?.title) {
      autoSaveTimer.current = setInterval(() => {
        if (isDirty) autoSave();
      }, 30000);
    }
    return () => { if (autoSaveTimer.current) clearInterval(autoSaveTimer.current); };
  }, [view, isDirty, editPost]);

  const loadAll = async () => {
    setLoading(true);
    const [p, c] = await Promise.all([
      api.entities.BlogPost.list('-created_date', 200),
      api.entities.BlogCategory.list('-created_date', 100),
    ]);
    setPosts(p);
    setCategories(c);
    setLoading(false);
  };

  const startNew = () => { setEditPost({ ...blankPost }); setView('edit'); setIsDirty(false); setLastSaved(null); setWordCount(0); };
  const startEdit = (p) => { setEditPost({ ...p }); setView('edit'); setIsDirty(false); setLastSaved(new Date()); setWordCount(countWords(p.content)); };

  const goBackToList = () => {
    if (isDirty && !confirm('You have unsaved changes. Leave without saving?')) return;
    setView('list');
    setIsDirty(false);
  };

  const countWords = (html) => {
    const text = html?.replace(/<[^>]+>/g, '') || '';
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  };

  const u = (k, v) => {
    setEditPost(p => ({ ...p, [k]: v }));
    setIsDirty(true);
  };

  const handleTitleChange = (val) => {
    setEditPost(p => ({ ...p, title: val, slug: p.id ? p.slug : slugify(val) }));
    setIsDirty(true);
  };

  const handleFeaturedImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingImg(true);
    try {
      // Force 1200×630 (Google/OG recommended), center-crop, encode as WebP.
      const resized = await resizeImageToCoverWebp(file, { width: 1200, height: 630, targetBytes: 200 * 1024 });
      const { file_url } = await api.integrations.Core.UploadFile({ file: resized });
      u('featured_image', file_url);
    } finally {
      setUploadingImg(false);
      e.target.value = '';
    }
  };


  const toggleCategory = (slug) => {
    const cats = editPost.categories || [];
    u('categories', cats.includes(slug) ? cats.filter(c => c !== slug) : [...cats, slug]);
  };

  const doSave = async (post, asDraft = false) => {
    if (!post?.title) return null;
    const data = {
      ...post,
      status: asDraft ? 'draft' : post.status,
      read_time: estimateReadTime(post.content),
    };
    let saved;
    if (post.id) {
      saved = await api.entities.BlogPost.update(post.id, data);
    } else {
      saved = await api.entities.BlogPost.create(data);
    }
    return saved;
  };

  const savePost = async () => {
    if (!editPost?.title) return;
    setSaving(true);
    const saved = await doSave(editPost);
    if (saved && !editPost.id) setEditPost(p => ({ ...p, id: saved.id }));
    await loadAll();
    setSaving(false);
    setIsDirty(false);
    setLastSaved(new Date());
    setSavedMsg('Saved!');
    setTimeout(() => setSavedMsg(''), 3000);
  };

  const autoSave = async () => {
    if (!editPost?.title) return;
    setAutoSaveStatus('saving');
    try {
      const saved = await doSave(editPost, false);
      if (saved && !editPost.id) setEditPost(p => ({ ...p, id: saved.id }));
      setIsDirty(false);
      setLastSaved(new Date());
      setAutoSaveStatus('saved');
      setTimeout(() => setAutoSaveStatus(''), 4000);
    } catch {
      setAutoSaveStatus('error');
      setTimeout(() => setAutoSaveStatus(''), 4000);
    }
  };

  const publishPost = async () => {
    if (!editPost?.title) return;
    setSaving(true);
    const toSave = { ...editPost, status: 'published' };
    setEditPost(toSave);
    const saved = await doSave(toSave);
    if (saved && !editPost.id) setEditPost(p => ({ ...p, id: saved.id, status: 'published' }));
    await loadAll();
    setSaving(false);
    setIsDirty(false);
    setLastSaved(new Date());
    setSavedMsg('Published!');
    setTimeout(() => setSavedMsg(''), 3000);
  };

  const deletePost = async (id) => {
    if (!confirm('Delete this post?')) return;
    await api.entities.BlogPost.delete(id);
    await loadAll();
  };

  const toggleStatus = async (post) => {
    await api.entities.BlogPost.update(post.id, { status: post.status === 'published' ? 'draft' : 'published' });
    await loadAll();
  };

  const addCategory = async () => {
    if (!newCatName || !newCatSlug) return;
    setAddingCat(true);
    await api.entities.BlogCategory.create({ name: newCatName, slug: newCatSlug });
    setNewCatName(''); setNewCatSlug('');
    await loadAll();
    setAddingCat(false);
  };

  const deleteCategory = async (id) => {
    if (!confirm('Delete this category?')) return;
    await api.entities.BlogCategory.delete(id);
    await loadAll();
  };

  // Rich text editor commands using execCommand
  const exec = (cmd, value = null) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, value);
    if (editorRef.current) {
      u('content', editorRef.current.innerHTML);
      setWordCount(countWords(editorRef.current.innerHTML));
    }
  };

  const insertLink = () => {
    if (!linkUrl) return;
    exec('createLink', linkUrl);
    setLinkUrl('');
    setShowLinkInput(false);
  };

  const insertInlineImage = () => {
    const url = prompt('Enter image URL:');
    if (url) exec('insertImage', url);
  };

  const insertBlock = (type) => {
    if (!editorRef.current) return;
    let html = '';
    if (type === 'h2') html = '<h2>Heading 2</h2><p><br></p>';
    if (type === 'h3') html = '<h3>Heading 3</h3><p><br></p>';
    if (type === 'ul') html = '<ul><li>Item 1</li><li>Item 2</li></ul><p><br></p>';
    if (type === 'ol') html = '<ol><li>Item 1</li><li>Item 2</li></ol><p><br></p>';
    if (type === 'blockquote') html = '<blockquote>Quote text here...</blockquote><p><br></p>';
    if (type === 'hr') html = '<hr/><p><br></p>';
    if (type === 'code') html = '<pre><code>// code here</code></pre><p><br></p>';
    document.execCommand('insertHTML', false, html);
    if (editorRef.current) {
      u('content', editorRef.current.innerHTML);
      setWordCount(countWords(editorRef.current.innerHTML));
    }
  };

  if (loading) return <div className="flex items-center justify-center py-10"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="font-bold text-xl text-gray-900">Blog Manager</h2>
          {view === 'edit' && (
            <button onClick={goBackToList} className="text-sm text-blue-600 hover:underline ml-2">← Back to list</button>
          )}
          {view === 'categories' && (
            <button onClick={() => setView('list')} className="text-sm text-blue-600 hover:underline ml-2">← Back to list</button>
          )}
          {/* Auto-save status */}
          {view === 'edit' && (
            <div className="flex items-center gap-2 ml-3">
              {isDirty && (
                <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full border border-amber-200">
                  <AlertCircle className="w-3 h-3" /> Unsaved changes
                </span>
              )}
              {autoSaveStatus === 'saving' && (
                <span className="flex items-center gap-1 text-xs text-blue-600">
                  <Loader2 className="w-3 h-3 animate-spin" /> Auto-saving...
                </span>
              )}
              {autoSaveStatus === 'saved' && (
                <span className="flex items-center gap-1 text-xs text-green-600">
                  <CheckCircle className="w-3 h-3" /> Auto-saved
                </span>
              )}
              {autoSaveStatus === 'error' && (
                <span className="flex items-center gap-1 text-xs text-red-500">
                  <AlertCircle className="w-3 h-3" /> Auto-save failed
                </span>
              )}
              {lastSaved && !isDirty && !autoSaveStatus && (
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <Clock className="w-3 h-3" /> Saved {format(lastSaved, 'HH:mm:ss')}
                </span>
              )}
            </div>
          )}
        </div>
        <div className="flex gap-2">
          {view === 'list' && (
            <>
              <button onClick={() => setView('categories')}
                className="flex items-center gap-1.5 text-sm border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 px-3 py-2 rounded-lg font-medium">
                <Tag className="w-4 h-4" /> Categories ({categories.length})
              </button>
              <button onClick={startNew}
                className="flex items-center gap-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium">
                <Plus className="w-4 h-4" /> New Post
              </button>
            </>
          )}
        </div>
      </div>

      {/* List view */}
      {view === 'list' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {posts.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No blog posts yet. Create your first post!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {posts.map(post => (
                <div key={post.id} className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-gray-50">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {post.featured_image ? (
                      <img src={post.featured_image} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />
                    ) : (
                      <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5 text-blue-300" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">{post.title}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${post.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {post.status}
                        </span>
                        {(post.categories || []).slice(0, 2).map(slug => {
                          const cat = categories.find(c => c.slug === slug);
                          return cat ? <span key={slug} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{cat.name}</span> : null;
                        })}
                        <span className="text-xs text-gray-400">{post.created_date ? format(new Date(post.created_date), 'dd MMM yyyy') : ''}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <a href={`/blog/${post.slug || post.id}`} target="_blank" rel="noopener noreferrer"
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View post">
                      <Eye className="w-4 h-4" />
                    </a>
                    <button onClick={() => toggleStatus(post)}
                      className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title={post.status === 'published' ? 'Unpublish' : 'Publish'}>
                      {post.status === 'published' ? <EyeOff className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                    </button>
                    <button onClick={() => startEdit(post)}
                      className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors" title="Edit">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => deletePost(post.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Category manager */}
      {view === 'categories' && (
        <div className="max-w-xl">
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-5">
            <h3 className="font-bold text-gray-900 mb-4">Add Category</h3>
            <div className="flex gap-3 mb-3">
              <Input value={newCatName} onChange={e => { setNewCatName(e.target.value); setNewCatSlug(slugify(e.target.value)); }}
                placeholder="Category name" className="h-10 rounded-lg flex-1" />
              <Input value={newCatSlug} onChange={e => setNewCatSlug(slugify(e.target.value))}
                placeholder="slug" className="h-10 rounded-lg w-32" />
              <button onClick={addCategory} disabled={addingCat || !newCatName || !newCatSlug}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 rounded-lg text-sm font-semibold flex items-center gap-1.5">
                {addingCat ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Add
              </button>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {categories.length === 0 ? (
              <p className="text-gray-400 text-center py-10">No categories yet.</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {categories.map(cat => (
                  <div key={cat.id} className="flex items-center justify-between px-5 py-3">
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{cat.name}</p>
                      <p className="text-xs text-gray-400">/blog/category/{cat.slug}</p>
                    </div>
                    <button onClick={() => deleteCategory(cat.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Post editor */}
      {view === 'edit' && editPost && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Main editor */}
          <div className="xl:col-span-2 space-y-5">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Post Title *</label>
              <Input value={editPost.title} onChange={e => handleTitleChange(e.target.value)}
                placeholder="Enter post title..." className="h-12 rounded-xl text-lg font-semibold" />
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs text-gray-400">Slug:</span>
                <Input value={editPost.slug} onChange={e => u('slug', slugify(e.target.value))}
                  className="h-7 text-xs rounded-lg flex-1 text-gray-500" />
              </div>
            </div>

            {/* Rich text editor */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {/* Toolbar */}
              <div className="border-b border-gray-100 px-3 py-2 bg-gray-50 space-y-1.5">
                {/* Row 1: Text formatting */}
                <div className="flex flex-wrap gap-1 items-center">
                  <span className="text-xs text-gray-400 mr-1">Format:</span>
                  <button onClick={() => exec('bold')} title="Bold (Ctrl+B)" className="p-1.5 rounded hover:bg-blue-50 hover:text-blue-700 text-gray-600 transition-colors"><Bold className="w-4 h-4" /></button>
                  <button onClick={() => exec('italic')} title="Italic (Ctrl+I)" className="p-1.5 rounded hover:bg-blue-50 hover:text-blue-700 text-gray-600 transition-colors"><Italic className="w-4 h-4" /></button>
                  <button onClick={() => exec('underline')} title="Underline (Ctrl+U)" className="p-1.5 rounded hover:bg-blue-50 hover:text-blue-700 text-gray-600 transition-colors"><Underline className="w-4 h-4" /></button>
                  <button onClick={() => exec('strikeThrough')} title="Strikethrough" className="p-1.5 rounded hover:bg-blue-50 hover:text-blue-700 text-gray-600 transition-colors"><Strikethrough className="w-4 h-4" /></button>
                  <div className="w-px h-5 bg-gray-300 mx-1" />
                  <button onClick={() => exec('justifyLeft')} title="Align left" className="p-1.5 rounded hover:bg-blue-50 hover:text-blue-700 text-gray-600 transition-colors"><AlignLeft className="w-4 h-4" /></button>
                  <button onClick={() => exec('justifyCenter')} title="Align center" className="p-1.5 rounded hover:bg-blue-50 hover:text-blue-700 text-gray-600 transition-colors"><AlignCenter className="w-4 h-4" /></button>
                  <button onClick={() => exec('justifyRight')} title="Align right" className="p-1.5 rounded hover:bg-blue-50 hover:text-blue-700 text-gray-600 transition-colors"><AlignRight className="w-4 h-4" /></button>
                  <div className="w-px h-5 bg-gray-300 mx-1" />
                  <button onClick={() => exec('undo')} title="Undo (Ctrl+Z)" className="p-1.5 rounded hover:bg-blue-50 hover:text-blue-700 text-gray-600 transition-colors"><RotateCcw className="w-4 h-4" /></button>
                  <button onClick={() => exec('redo')} title="Redo (Ctrl+Y)" className="p-1.5 rounded hover:bg-blue-50 hover:text-blue-700 text-gray-600 transition-colors"><RotateCw className="w-4 h-4" /></button>
                </div>
                {/* Row 2: Blocks & insert */}
                <div className="flex flex-wrap gap-1 items-center">
                  <span className="text-xs text-gray-400 mr-1">Insert:</span>
                  {[
                    { label: 'H2', cmd: () => insertBlock('h2'), title: 'Heading 2' },
                    { label: 'H3', cmd: () => insertBlock('h3'), title: 'Heading 3' },
                  ].map(btn => (
                    <button key={btn.label} onClick={btn.cmd} title={btn.title}
                      className="text-xs px-2.5 py-1.5 rounded font-bold bg-white border border-gray-200 hover:bg-blue-50 hover:border-blue-300 text-gray-700 transition-colors">
                      {btn.label}
                    </button>
                  ))}
                  <button onClick={() => insertBlock('ul')} title="Bullet list" className="p-1.5 rounded bg-white border border-gray-200 hover:bg-blue-50 text-gray-600 transition-colors"><List className="w-4 h-4" /></button>
                  <button onClick={() => insertBlock('ol')} title="Numbered list" className="p-1.5 rounded bg-white border border-gray-200 hover:bg-blue-50 text-gray-600 transition-colors"><ListOrdered className="w-4 h-4" /></button>
                  <button onClick={() => insertBlock('blockquote')} title="Blockquote" className="p-1.5 rounded bg-white border border-gray-200 hover:bg-blue-50 text-gray-600 transition-colors"><Quote className="w-4 h-4" /></button>
                  <button onClick={() => insertBlock('hr')} title="Divider" className="p-1.5 rounded bg-white border border-gray-200 hover:bg-blue-50 text-gray-600 transition-colors"><Minus className="w-4 h-4" /></button>
                  <button onClick={() => insertBlock('code')} title="Code block" className="p-1.5 rounded bg-white border border-gray-200 hover:bg-blue-50 text-gray-600 transition-colors"><Code className="w-4 h-4" /></button>
                  <button onClick={insertInlineImage} title="Insert image" className="p-1.5 rounded bg-white border border-gray-200 hover:bg-blue-50 text-gray-600 transition-colors"><ImageIcon className="w-4 h-4" /></button>
                  <button onClick={() => setShowLinkInput(v => !v)} title="Insert link" className={`p-1.5 rounded bg-white border transition-colors ${showLinkInput ? 'border-blue-400 bg-blue-50 text-blue-700' : 'border-gray-200 hover:bg-blue-50 text-gray-600'}`}><Link className="w-4 h-4" /></button>
                  {showLinkInput && (
                    <div className="flex items-center gap-1 ml-1">
                      <input value={linkUrl} onChange={e => setLinkUrl(e.target.value)}
                        placeholder="https://..." onKeyDown={e => e.key === 'Enter' && insertLink()}
                        className="text-xs border border-gray-200 rounded px-2 py-1 h-8 w-48 outline-none focus:border-blue-400" />
                      <button onClick={insertLink} className="text-xs bg-blue-600 text-white px-2 py-1 rounded h-8">Insert</button>
                      <button onClick={() => { setShowLinkInput(false); setLinkUrl(''); }} className="p-1 text-gray-400 hover:text-gray-600"><X className="w-3.5 h-3.5" /></button>
                    </div>
                  )}
                </div>
              </div>
              {/* Editor area */}
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={e => {
                  u('content', e.currentTarget.innerHTML);
                  setWordCount(countWords(e.currentTarget.innerHTML));
                }}
                dangerouslySetInnerHTML={{ __html: editPost.content || '<p>Start writing your post here...</p>' }}
                className="min-h-[420px] p-6 focus:outline-none prose prose-gray max-w-none"
                style={{ outline: 'none' }}
              />
              <div className="border-t border-gray-100 px-4 py-2 bg-gray-50 flex items-center gap-4 text-xs text-gray-400">
                <span>{wordCount} words</span>
                <span>{estimateReadTime(editPost.content)} min read</span>
                <span className="ml-auto text-gray-300">Ctrl+S to save</span>
              </div>
            </div>

            {/* Excerpt */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Excerpt / Summary</label>
              <Textarea value={editPost.excerpt} onChange={e => u('excerpt', e.target.value)}
                placeholder="Short summary that appears in the post list..." className="min-h-[80px] rounded-xl" />
            </div>

            {/* SEO */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><Globe className="w-4 h-4 text-blue-500" /> SEO Settings</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Meta Title</label>
                  <Input value={editPost.meta_title} onChange={e => u('meta_title', e.target.value)}
                    placeholder="SEO title (leave blank to use post title)" className="h-10 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Meta Description</label>
                  <Textarea value={editPost.meta_description} onChange={e => u('meta_description', e.target.value)}
                    placeholder="SEO description (max 160 chars)..." className="min-h-[70px] rounded-lg" maxLength={160} />
                  <p className="text-xs text-gray-400 mt-1">{(editPost.meta_description || '').length}/160</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar settings */}
          <div className="space-y-5">
            {/* Publish */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-500" /> Publish
              </h3>
              <div className="mb-3 px-3 py-2 rounded-lg bg-gray-50 border border-gray-100 text-xs text-gray-500 flex items-center gap-2">
                {editPost.status === 'published'
                  ? <><CheckCircle2 className="w-3.5 h-3.5 text-green-600" /><span className="text-green-700 font-medium">Published</span></>
                  : <><FileText className="w-3.5 h-3.5 text-gray-400" /><span>Draft</span></>}
                {lastSaved && <span className="ml-auto text-gray-400">Saved {format(lastSaved, 'HH:mm')}</span>}
              </div>
              <button onClick={savePost} disabled={saving || !editPost.title}
                className="w-full bg-gray-800 hover:bg-gray-900 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm mb-2">
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save as Draft</>}
              </button>
              <button onClick={publishPost} disabled={saving || !editPost.title}
                className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm">
                <Globe className="w-4 h-4" /> {editPost.status === 'published' ? 'Update & Keep Published' : 'Publish Now'}
              </button>
              {savedMsg && <p className="text-green-600 text-xs text-center mt-2 font-medium">✓ {savedMsg}</p>}
              <p className="text-xs text-gray-400 text-center mt-3">Auto-saves every 30 seconds · Ctrl+S</p>
            </div>

            {/* Featured Image */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2"><ImageIcon className="w-4 h-4 text-blue-500" /> Featured Image</h3>
              {editPost.featured_image ? (
                <div className="relative">
                  <img src={editPost.featured_image} alt="" className="w-full aspect-video object-cover rounded-lg mb-2" />
                  <button onClick={() => u('featured_image', '')}
                    className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <label className="block cursor-pointer border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-blue-300 transition-colors">
                  {uploadingImg ? <Loader2 className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-1" /> : <Upload className="w-8 h-8 text-gray-300 mx-auto mb-1" />}
                  <p className="text-xs text-gray-500">{uploadingImg ? 'Resizing & uploading…' : 'Upload image (any size — auto-resized to 1200×630 WebP)'}</p>
                  <input type="file" accept="image/*" onChange={handleFeaturedImageUpload} className="hidden" />
                </label>
              )}
              <Input value={editPost.featured_image} onChange={e => u('featured_image', e.target.value)}
                placeholder="Or paste image URL" className="h-9 rounded-lg mt-2 text-xs" />
            </div>

            {/* Categories */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-800 mb-3">Categories</h3>
              {categories.length === 0 ? (
                <p className="text-xs text-gray-400">No categories. <button onClick={() => setView('categories')} className="text-blue-600 hover:underline">Create one.</button></p>
              ) : (
                <div className="space-y-2">
                  {categories.map(cat => (
                    <label key={cat.slug} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={(editPost.categories || []).includes(cat.slug)}
                        onChange={() => toggleCategory(cat.slug)} className="rounded" />
                      <span className="text-sm text-gray-700">{cat.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Tags & Author */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5"><Tag className="w-4 h-4" /> Tags</label>
                <Input value={editPost.tags} onChange={e => u('tags', e.target.value)}
                  placeholder="ngo, fellowship, leadership..." className="h-10 rounded-lg" />
                <p className="text-xs text-gray-400 mt-1">Comma-separated</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Author Name</label>
                <Input value={editPost.author_name} onChange={e => u('author_name', e.target.value)}
                  placeholder="Author name" className="h-10 rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}