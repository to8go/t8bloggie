import React from 'react';
import BlogPost from '../components/BlogPost';
import { useBlogPosts } from '../hooks/useBlogPosts';

export default function BlogList() {
  const { posts, authors, loading, error, toggleReaction } = useBlogPosts();

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading posts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-semibold text-gray-900">No posts yet</h2>
          <p className="mt-2 text-gray-600">Check back later for new content!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="space-y-8">
        {posts.map((post) => (
          <BlogPost 
            key={post.id} 
            post={post}
            author={authors[post.authorId]}
            onToggleReaction={toggleReaction}
          />
        ))}
      </div>
    </div>
  );
}