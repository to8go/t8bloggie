import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Edit2, Mail } from 'lucide-react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import BlogPost from '../components/BlogPost';
import type { UserProfile } from '../types';
import { useBlogPosts } from '../hooks/useBlogPosts';

export default function Profile() {
  const { userId } = useParams();
  const { user } = useAuth();
  const { posts, toggleReaction } = useBlogPosts();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', userId!));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const userPosts = posts.filter(post => post.authorId === userId);
          setProfile({
            id: userId!,
            email: userData.email,
            isAdmin: userData.isAdmin,
            displayName: userData.displayName,
            photoURL: userData.photoURL,
            bio: userData.bio,
            badges: userData.badges || [],
            posts: userPosts
          });
          setDisplayName(userData.displayName || '');
          setPhotoURL(userData.photoURL || '');
          setBio(userData.bio || '');
        } else {
          setError('User not found');
        }
      } catch (err) {
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId, posts]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    try {
      await updateDoc(doc(db, 'users', profile.id), {
        displayName: displayName.trim(),
        photoURL: photoURL.trim(),
        bio: bio.trim()
      });
      setIsEditing(false);
    } catch (err) {
      setError('Failed to update profile');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center space-x-4">
            <img
              src={profile.photoURL || 'https://www.gravatar.com/avatar/?d=mp'}
              alt={profile.displayName || profile.email}
              className="w-20 h-20 rounded-full object-cover"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {profile.displayName || profile.email.split('@')[0]}
              </h1>
              <div className="flex items-center space-x-2 mt-1">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="text-gray-500">{profile.email}</span>
              </div>
              <div className="flex gap-2 mt-2">
                {profile.badges.includes('admin') && (
                  <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                    Admin
                  </span>
                )}
                {profile.badges.includes('og') && (
                  <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                    OG
                  </span>
                )}
              </div>
            </div>
          </div>
          {user?.email === profile.email && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Edit2 className="h-4 w-4 mr-2" />
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
                Display Name
              </label>
              <input
                type="text"
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="photoURL" className="block text-sm font-medium text-gray-700">
                Profile Picture URL
              </label>
              <input
                type="url"
                id="photoURL"
                value={photoURL}
                onChange={(e) => setPhotoURL(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                Bio
              </label>
              <textarea
                id="bio"
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Save Profile
            </button>
          </form>
        ) : (
          <div className="prose prose-indigo max-w-none">
            {profile.bio && <p>{profile.bio}</p>}
          </div>
        )}
      </div>

      <div className="space-y-8">
        <h2 className="text-xl font-bold text-gray-900">Posts</h2>
        {profile.posts.length === 0 ? (
          <div className="text-center bg-white rounded-lg shadow-md p-8">
            <p className="text-gray-600">No posts yet</p>
          </div>
        ) : (
          profile.posts.map((post) => (
            <BlogPost
              key={post.id}
              post={post}
              onToggleReaction={toggleReaction}
            />
          ))
        )}
      </div>
    </div>
  );
}