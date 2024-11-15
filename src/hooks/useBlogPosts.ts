import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  Timestamp,
  doc,
  deleteDoc,
  updateDoc,
  getDoc,
  where
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { BlogPost, User } from '../types';
import { useClientId } from './useClientId';
import { useAuth } from '../contexts/AuthContext';

export function useBlogPosts() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [authors, setAuthors] = useState<{ [key: string]: User }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const clientId = useClientId();
  const { user } = useAuth();

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, 
      async (snapshot) => {
        try {
          const newPosts = await Promise.all(
            snapshot.docs.map(async (doc) => {
              const data = doc.data();
              if (!data.createdAt || !data.authorId) {
                console.warn(`Post ${doc.id} missing required fields`);
                return null;
              }

              try {
                return {
                  id: doc.id,
                  ...data,
                  createdAt: data.createdAt.toDate().toISOString(),
                  reactions: data.reactions || {},
                  authorId: data.authorId
                } as BlogPost;
              } catch (err) {
                console.error(`Error processing post ${doc.id}:`, err);
                return null;
              }
            })
          );

          const validPosts = newPosts.filter((post): post is BlogPost => 
            post !== null && typeof post.authorId === 'string' && post.authorId.length > 0
          );

          // Get unique author IDs
          const authorIds = [...new Set(validPosts.map(post => post.authorId))];
          const authorData: { [key: string]: User } = {};
          
          // Fetch author data in parallel
          await Promise.all(
            authorIds.map(async (authorId) => {
              if (!authorId) return;

              try {
                const authorDoc = await getDoc(doc(db, 'users', authorId));
                if (authorDoc.exists()) {
                  const userData = authorDoc.data();
                  authorData[authorId] = {
                    email: userData.email || 'unknown',
                    isAdmin: !!userData.isAdmin,
                    displayName: userData.displayName || userData.email?.split('@')[0] || 'Anonymous',
                    photoURL: userData.photoURL || undefined,
                    bio: userData.bio || undefined,
                    badges: Array.isArray(userData.badges) ? userData.badges : []
                  };
                } else {
                  // Create a default user object for missing authors
                  authorData[authorId] = {
                    email: 'unknown',
                    isAdmin: false,
                    displayName: 'Anonymous',
                    badges: []
                  };
                }
              } catch (err) {
                console.error(`Error fetching author ${authorId}:`, err);
                // Add fallback user data
                authorData[authorId] = {
                  email: 'unknown',
                  isAdmin: false,
                  displayName: 'Anonymous',
                  badges: []
                };
              }
            })
          );

          setPosts(validPosts);
          setAuthors(authorData);
          setLoading(false);
          setError(null);
        } catch (err) {
          console.error('Error processing posts:', err);
          setError('Failed to process posts');
          setPosts([]);
          setAuthors({});
          setLoading(false);
        }
      },
      (err) => {
        console.error('Error fetching posts:', err);
        setError('Failed to load posts');
        setPosts([]);
        setAuthors({});
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const addPost = async (post: Omit<BlogPost, 'id' | 'authorId'>) => {
    if (!user) throw new Error('Must be logged in to add posts');
    
    try {
      await addDoc(collection(db, 'posts'), {
        ...post,
        authorId: user.uid,
        createdAt: Timestamp.now(),
        reactions: {}
      });
    } catch (err) {
      console.error('Error adding post:', err);
      throw new Error('Failed to add post');
    }
  };

  const deletePost = async (postId: string) => {
    if (!user) throw new Error('Must be logged in to delete posts');

    try {
      const postRef = doc(db, 'posts', postId);
      const postDoc = await getDoc(postRef);
      
      if (!postDoc.exists()) {
        throw new Error('Post not found');
      }

      const post = postDoc.data();
      if (post.authorId !== user.uid) {
        throw new Error('You can only delete your own posts');
      }

      await deleteDoc(postRef);
    } catch (err) {
      console.error('Error deleting post:', err);
      throw new Error('Failed to delete post');
    }
  };

  const updatePost = async (postId: string, updates: Partial<BlogPost>) => {
    if (!user) throw new Error('Must be logged in to update posts');

    try {
      const postRef = doc(db, 'posts', postId);
      const postDoc = await getDoc(postRef);
      
      if (!postDoc.exists()) {
        throw new Error('Post not found');
      }

      const post = postDoc.data();
      if (post.authorId !== user.uid) {
        throw new Error('You can only update your own posts');
      }

      await updateDoc(postRef, updates);
    } catch (err) {
      console.error('Error updating post:', err);
      throw new Error('Failed to update post');
    }
  };

  const toggleReaction = async (postId: string, emoji: string) => {
    if (!clientId) return;

    try {
      const postRef = doc(db, 'posts', postId);
      const postDoc = await getDoc(postRef);
      
      if (!postDoc.exists()) {
        throw new Error('Post not found');
      }

      const post = postDoc.data() as BlogPost;
      const reactions = { ...(post.reactions || {}) };
      
      if (reactions[clientId] === emoji) {
        delete reactions[clientId];
      } else {
        reactions[clientId] = emoji;
      }

      await updateDoc(postRef, { reactions });
    } catch (err) {
      console.error('Error toggling reaction:', err);
    }
  };

  return { 
    posts, 
    authors,
    loading, 
    error, 
    addPost, 
    deletePost, 
    updatePost,
    toggleReaction
  };
}