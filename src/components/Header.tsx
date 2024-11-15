import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PenSquare, BookOpen, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Header() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <header className="bg-white shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <BookOpen className="h-8 w-8 text-indigo-600" />
            <Link to="/" className="ml-2 text-xl font-bold text-gray-900">
              Thoughtscape
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                !isAdmin
                  ? 'text-white bg-indigo-600 hover:bg-indigo-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Blog
            </Link>
            {user ? (
              <>
                <Link
                  to="/admin"
                  className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                    isAdmin
                      ? 'text-white bg-indigo-600 hover:bg-indigo-700'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <PenSquare className="h-4 w-4 mr-1" />
                  Admin
                </Link>
                <button
                  onClick={logout}
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}