import React from 'react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Pencil, Trash2, User } from 'lucide-react';
import type { BlogPost as BlogPostType } from '../types';
import { useAuth } from '../contexts/AuthContext';
import Reactions from './Reactions';
import { useClientId } from '../hooks/useClientId';

interface Props {
  post: BlogPostType;
  onDelete?: (postId: string) => void;
  onEdit?: (post: BlogPostType) => void;
  onToggleReaction?: (postId: string, emoji: string) => void;
  author?: {
    displayName?: string;
    email: string;
    badges: string[];
  };
}

export default function BlogPost({ post, onDelete, onEdit, onToggleReaction, author }: Props) {
  const { user } = useAuth();
  const clientId = useClientId();

  const canModifyPost = user && (user.uid === post.authorId);

  const handleToggleReaction = (emoji: string) => {
    if (onToggleReaction) {
      onToggleReaction(post.id, emoji);
    }
  };

  return (
    <article className="bg-white rounded-lg shadow-md overflow-hidden">
      {post.imageUrl && (
        <img
          src={post.imageUrl}
          alt={post.title}
          className="w-full h-48 md:h-64 object-cover"
        />
      )}
      <div className="p-4 md:p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">{post.title}</h2>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Link 
                to={`/profile/${post.authorId}`}
                className="flex items-center hover:text-indigo-600"
              >
                <User className="h-4 w-4 mr-1" />
                <span>{author?.displayName || author?.email?.split('@')[0] || 'Unknown'}</span>
              </Link>
              <span>•</span>
              <time>{format(new Date(post.createdAt), 'MMMM d, yyyy')}</time>
            </div>
            {author?.badges && author.badges.length > 0 && (
              <div className="flex gap-2 mt-2">
                {author.badges.includes('admin') && (
                  <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                    Admin
                  </span>
                )}
                {author.badges.includes('og') && (
                  <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                    OG
                  </span>
                )}
              </div>
            )}
          </div>
          {canModifyPost && onDelete && onEdit && (
            <div className="flex space-x-2">
              <button
                onClick={() => onEdit(post)}
                className="p-2 text-gray-600 hover:text-indigo-600 transition-colors"
              >
                <Pencil className="h-5 w-5" />
              </button>
              <button
                onClick={() => onDelete(post.id)}
                className="p-2 text-gray-600 hover:text-red-600 transition-colors"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
        <div className="prose prose-indigo max-w-none mb-4">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {post.content}
          </ReactMarkdown>
        </div>
        <div className="mt-4 pt-4 border-t">
          <Reactions
            reactions={post.reactions || {}}
            onToggleReaction={handleToggleReaction}
          />
        </div>
      </div>
    </article>
  );
}