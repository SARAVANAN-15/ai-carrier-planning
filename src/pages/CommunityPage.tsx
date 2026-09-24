import React, { useState, useEffect } from 'react';
import {
  Users,
  MessageSquare,
  Heart,
  Share2,
  Plus,
  Send,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Search
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export const CommunityPage: React.FC = () => {
  const { user } = useAuth();

  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');

  // Create post modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('Career Guidance');

  // Comments state
  const [activeCommentsPostId, setActiveCommentsPostId] = useState<string | null>(null);
  const [commentsMap, setCommentsMap] = useState<Record<string, any[]>>({});
  const [commentInput, setCommentInput] = useState('');

  const categories = [
    'All',
    'Career Guidance',
    'Technical Learning',
    'Vocational Skills',
    'Entrepreneurship',
    'Interview Prep'
  ];

  useEffect(() => {
    fetchPosts();
  }, [category]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const data = await api.getPosts(category, search);
      setPosts(data.posts || []);
    } catch (err) {
      console.warn('Failed to load posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    try {
      await api.createPost({ title: newTitle, content: newContent, category: newCategory });
      setShowCreateModal(false);
      setNewTitle('');
      setNewContent('');
      await fetchPosts();
    } catch (err) {
      console.error('Failed to create post:', err);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const res = await api.likePost(postId);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, hasLiked: res.hasLiked, likes_count: res.hasLiked ? p.likes_count + 1 : Math.max(0, p.likes_count - 1) }
            : p
        )
      );
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  const handleToggleComments = async (postId: string) => {
    if (activeCommentsPostId === postId) {
      setActiveCommentsPostId(null);
      return;
    }

    setActiveCommentsPostId(postId);
    try {
      const res = await api.getComments(postId);
      setCommentsMap((prev) => ({ ...prev, [postId]: res.comments || [] }));
    } catch (err) {
      console.warn('Failed to load comments:', err);
    }
  };

  const handleAddComment = async (postId: string) => {
    if (!commentInput.trim()) return;
    try {
      const res = await api.addComment(postId, commentInput);
      setCommentsMap((prev) => ({
        ...prev,
        [postId]: [...(prev[postId] || []), res.comment]
      }));
      setCommentInput('');
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, comments_count: p.comments_count + 1 } : p))
      );
    } catch (err) {
      console.error('Failed to add comment:', err);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      await api.deletePost(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (err) {
      console.error('Failed to delete post:', err);
    }
  };

  const handleReportPost = async (postId: string) => {
    try {
      await api.reportPost(postId, 'Inappropriate content or spam');
      alert('Thank you for reporting. This post has been flagged for moderation.');
    } catch (err) {
      console.error('Report error:', err);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
              Module 13 — Peer Growth Network
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">
            Community Insights & Breakthroughs
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Share practical lessons, safety discoveries, interview experiences, and real learning stories.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-all self-end sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Share Insights</span>
        </button>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              category === cat
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Posts Stream */}
      {loading ? (
        <div className="p-8 text-center text-xs text-slate-500">Loading community discussions...</div>
      ) : posts.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-soft">
          <p className="text-sm font-semibold text-slate-700">No posts in this category yet. Be the first to share!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => {
            const isAuthor = user?.id === post.user_id || user?.role === 'admin';
            const comments = commentsMap[post.id] || [];

            return (
              <div key={post.id} className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-soft space-y-3">
                {/* Author row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 text-white font-bold text-xs flex items-center justify-center">
                      {post.author_name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{post.author_name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                          {post.author_role || 'Learner'}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {new Date(post.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                    {post.category}
                  </span>
                </div>

                {/* Title & Body */}
                {post.title && (
                  <h3 className="text-sm font-bold text-slate-900">{post.title}</h3>
                )}
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {post.content}
                </p>

                {/* Footer Controls */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center gap-1.5 font-semibold transition-colors ${
                        post.hasLiked ? 'text-rose-600' : 'hover:text-rose-600'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${post.hasLiked ? 'fill-current' : ''}`} />
                      <span>{post.likes_count}</span>
                    </button>

                    <button
                      onClick={() => handleToggleComments(post.id)}
                      className="flex items-center gap-1.5 hover:text-indigo-600 font-semibold"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>{post.comments_count} Comments</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {isAuthor && (
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                        title="Delete your post"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleReportPost(post.id)}
                      className="text-slate-400 hover:text-amber-600 p-1"
                      title="Report inappropriate content"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Comments Drawer */}
                {activeCommentsPostId === post.id && (
                  <div className="pt-3 border-t border-slate-100 space-y-3 animate-fade-in">
                    <div className="space-y-2">
                      {comments.map((c) => (
                        <div key={c.id} className="p-2.5 rounded-xl bg-slate-50 text-xs">
                          <strong className="text-slate-900 font-semibold">{c.author_name}: </strong>
                          <span className="text-slate-700">{c.content}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={commentInput}
                        onChange={(e) => setCommentInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddComment(post.id);
                        }}
                        placeholder="Write a constructive comment..."
                        className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                      <button
                        onClick={() => handleAddComment(post.id)}
                        className="p-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-100 space-y-4 animate-fade-in">
            <h3 className="text-base font-bold text-slate-900">Share Learning or Breakthrough</h3>

            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                >
                  <option value="Career Guidance">Career Guidance</option>
                  <option value="Technical Learning">Technical Learning</option>
                  <option value="Vocational Skills">Vocational Skills</option>
                  <option value="Entrepreneurship">Entrepreneurship</option>
                  <option value="Interview Prep">Interview Prep</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Title (Optional)</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. How I mastered the Live-Dead-Live rule..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Content</label>
                <textarea
                  rows={4}
                  required
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Share your practical realization, takeaway, or question..."
                  className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md"
                >
                  Post to Community
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
