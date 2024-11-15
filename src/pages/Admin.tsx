import React, { useState } from 'react';
import { Save, X, AlertTriangle } from 'lucide-react';
import { useBlogPosts } from '../hooks/useBlogPosts';
import BlogPost from '../components/BlogPost';
import type { BlogPost as BlogPostType } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Admin() {
  const { addPost, posts, deletePost, updatePost, toggleReaction } = useBlogPosts();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [editingPost, setEditingPost] = useState<BlogPostType | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { user, deleteAccount } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    if (editingPost) {
      updatePost(editingPost.id, {
        title: title.trim(),
        content: content.trim(),
        imageUrl: imageUrl.trim() || undefined,
      });
      setEditingPost(null);
    } else {
      addPost({
        title: title.trim(),
        content: content.trim(),
        imageUrl: imageUrl.trim() || undefined,
        createdAt: new Date().toISOString(),
      });
    }

    setTitle('');
    setContent('');
    setImageUrl('');
  };

  const handleEdit = (post: BlogPostType) => {
    setEditingPost(post);
    setTitle(post.title);
    setContent(post.content);
    setImageUrl(post.imageUrl || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setEditingPost(null);
    setTitle('');
    setContent('');
    setImageUrl('');
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount();
      navigate('/');
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {editingPost ? 'Edit Post' : 'Create New Post'}
          </h1>
          {editingPost && (
            <button
              onClick={handleCancel}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </button>
          )}
        </div>
        
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h2 className="text-sm font-medium text-gray-700 mb-2">Markdown Tips:</h2>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Use # for headings (# H1, ## H2, ### H3)</li>
            <li>• *italic* or _italic_</li>
            <li>• **bold** or __bold__</li>
            <li>• - or * for bullet points</li>
            <li>• [Link text](URL)</li>
            <li>• ![Alt text](image URL)</li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Enter post title"
              required
            />
          </div>

          <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">
              Cover Image URL (optional)
            </label>
            <input
              type="url"
              id="imageUrl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700">
              Content (Markdown supported)
            </label>
            <textarea
              id="content"
              rows={12}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="font-mono mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Write your post content here using Markdown..."
              required
            />
          </div>

          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Save className="h-4 w-4 mr-2" />
            {editingPost ? 'Update Post' : 'Publish Post'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Account Settings</h2>
        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-red-600">Delete Account</h3>
              <p className="text-sm text-gray-500">
                This action cannot be undone. All your posts will be permanently deleted.
              </p>
            </div>
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Delete Account
              </button>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                >
                  Confirm Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {posts.map((post) => (
          <BlogPost
            key={post.id}
            post={post}
            onDelete={deletePost}
            onEdit={handleEdit}
            onToggleReaction={toggleReaction}
          />
        ))}
      </div>
    </div>
  );
}