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

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0d0e10]/95 text-white shadow-lg shadow-black/10 backdrop-blur-xl">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-[#dc2626] via-[#f6c945]/60 to-transparent"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link
            to="/"
            aria-label="Car Guide Media home"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex shrink-0 items-center rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f6c945]"
          >
            <img
              src={carGuideLogo}
              alt="Car Guide Media"
              className="h-10 w-auto max-w-[200px] object-contain"
            />
          </Link>

          <nav aria-label="Main navigation" className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  aria-current={active ? 'page' : undefined}
                  className={`inline-flex items-center gap-2 border px-3 py-2 text-sm font-bold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f6c945] ${item.highlight
                      ? 'border-[#dc2626] bg-[#dc2626] text-white hover:border-red-500 hover:bg-red-700'
                      : active
                        ? 'border-white/10 bg-white/10 text-[#f6c945]'
                        : 'border-transparent text-white/75 hover:border-white/10 hover:bg-white/5 hover:text-white'
                    }`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <span className="inline-flex items-center gap-2 border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-300">
              <Shield className="h-4 w-4" aria-hidden="true" />
              36 states covered
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            className="inline-flex items-center justify-center border border-white/15 p-2 text-white transition-colors hover:border-[#dc2626] hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f6c945] md:hidden"
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-navigation"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div id="mobile-navigation" className="border-t border-white/10 bg-[#111316] px-4 py-3 shadow-xl md:hidden">
          <nav aria-label="Mobile navigation" className="mx-auto flex max-w-7xl flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  aria-current={active ? 'page' : undefined}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 border px-3 py-3 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f6c945] ${item.highlight
                      ? 'border-[#dc2626] bg-[#dc2626] text-white hover:bg-red-700'
                      : active
                        ? 'border-white/10 bg-white/10 text-[#f6c945]'
                        : 'border-transparent text-white/80 hover:border-white/10 hover:bg-white/5 hover:text-white'
                    }`}
                >
                  <Icon className="h-5 w-5 text-[#dc2626]" aria-hidden="true" />
                  {item.name}
                </Link>
              );
            })}
            <div className="mt-2 flex items-center gap-2 border-t border-white/10 px-3 pt-3 text-xs font-bold text-emerald-300 lg:hidden">
              <Shield className="h-4 w-4" aria-hidden="true" />
              36 states covered
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
