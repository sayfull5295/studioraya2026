
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CrescentIcon, STRINGS } from '../constants';
import { User } from '../types';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('current_user') || 'null') as User | null;

  const handleLogout = () => {
    localStorage.removeItem('current_user');
    window.location.reload();
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gold/20">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2 group">
          <CrescentIcon className="w-8 h-8 text-gold group-hover:rotate-12 transition-transform" />
          <span className="text-emerald-900 font-serif text-2xl font-bold tracking-tight">
            {STRINGS.appName}
          </span>
        </Link>

        <nav className="hidden md:flex items-center space-x-8 text-emerald-900 font-medium">
          <Link to="/" className="hover:text-gold transition-colors">Utama</Link>
          <Link to="/booking" className="hover:text-gold transition-colors">Tempah Slot</Link>
          {user ? (
            <div className="flex items-center space-x-4">
              {user.role === 'admin' && (
                <Link to="/admin" className="text-gold font-bold hover:underline">
                  Panel Admin
                </Link>
              )}
              <Link to="/dashboard" className="bg-emerald-900 text-white px-5 py-2 rounded-full hover:bg-emerald-800 transition-colors">
                Dashboard
              </Link>
              <button onClick={handleLogout} className="text-sm font-semibold opacity-60 hover:opacity-100">
                Keluar
              </button>
            </div>
          ) : (
            <Link to="/auth" className="border-2 border-emerald-900 px-6 py-2 rounded-full hover:bg-emerald-900 hover:text-white transition-all">
              Log Masuk
            </Link>
          )}
        </nav>

        {/* Mobile Menu Button - simple placeholder */}
        <button className="md:hidden text-emerald-900">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" /></svg>
        </button>
      </div>
    </header>
  );
};

export default Header;
