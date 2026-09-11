import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Calculator, Car, Info, Menu, Shield, X } from 'lucide-react';
import carGuideLogo from '../assets/Car Guide Media Logo Horizontal.png';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: 'New Cars', path: '/vehicles', icon: Car },
    { name: 'On Road Price', path: '/calculator', icon: Calculator, highlight: true },
    { name: 'Reviews & News', path: '/blog', icon: BookOpen },
    { name: 'About Us', path: '/about', icon: Info },
  ];

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center">
            <img
              src={carGuideLogo}
              alt="Car Guide Media"
              className="h-10 w-auto max-w-[200px] object-contain"
            />
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition ${
                    item.highlight
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : active
                      ? 'bg-slate-100 text-red-700'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <span className="inline-flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">
              <Shield className="h-4 w-4" />
              36 states covered
            </span>
          </div>

          <button
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            className="rounded-md border border-slate-200 p-2 text-slate-700 md:hidden"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-3 md:hidden">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-md px-3 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-100"
              >
                <Icon className="h-5 w-5 text-red-600" />
                {item.name}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
