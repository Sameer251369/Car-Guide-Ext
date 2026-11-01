import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowUpRight, BookOpen, Calculator, Car, Info, Menu, X } from 'lucide-react';
import carGuideLogo from '../assets/Car Guide Media Logo Horizontal.png';

const wide = { fontFamily: "'Archivo','Arial Black',system-ui,sans-serif", fontStretch: '125%' };
const body = { fontFamily: "'Hanken Grotesk','Inter',system-ui,sans-serif" };

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0a0e13] focus-visible:ring-offset-2 focus-visible:ring-offset-white/80';

const navItems = [
  { name: 'New Cars', path: '/vehicles', icon: Car },
  { name: 'On Road Price', path: '/calculator', icon: Calculator, highlight: true },
  { name: 'Reviews & News', path: '/blog', icon: BookOpen },
  { name: 'About Us', path: '/about', icon: Info },
];

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  const links = navItems.filter((item) => !item.highlight);
  const cta = navItems.find((item) => item.highlight);
  const CtaIcon = cta.icon;

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  // Close the menu whenever the route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Header gets a deeper shadow once the page scrolls
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock page scroll and allow Escape while the mobile menu is open
  useEffect(() => {
    if (!isMobileMenuOpen) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') setIsMobileMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [isMobileMenuOpen]);

  return (
    <header
      style={body}
      className={`sticky top-0 z-50 border-b border-white/60 bg-white/65 text-[#0a0e13] backdrop-blur-2xl backdrop-saturate-150 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] transition-shadow duration-300 ${
        scrolled || isMobileMenuOpen
          ? 'shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_10px_40px_-12px_rgba(10,14,19,0.45)]'
          : ''
      }`}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,500..900&family=Hanken+Grotesk:wght@400;500;600;700&display=swap');`}</style>

      {/* sodium-lamp hairline */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-[-1px] h-[2px] bg-gradient-to-r from-[#ffb224] via-[#ffb224]/40 to-transparent"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4 lg:h-[72px]">
          <Link
            to="/"
            aria-label="Car Guide Media home"
            className={`flex shrink-0 items-center rounded-md ${focusRing}`}
          >
            <img
              src={carGuideLogo}
              alt="Car Guide Media"
              className="h-9 w-auto max-w-[200px] object-contain lg:h-10"
            />
          </Link>

          {/* Desktop links */}
          <nav
            aria-label="Main navigation"
            className="hidden items-center gap-1 rounded-full border border-white/70 bg-white/40 p-1 shadow-[0_2px_12px_-4px_rgba(10,14,19,0.15)] backdrop-blur-xl md:flex"
          >
            {links.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  aria-current={active ? 'page' : undefined}
                  className={`relative rounded-full px-4 py-1.5 text-[15px] font-semibold transition-colors duration-200 ${focusRing} ${
                    active
                      ? 'bg-white text-[#0a0e13] shadow-[0_2px_10px_-3px_rgba(10,14,19,0.3)]'
                      : 'text-[#0a0e13]/70 hover:bg-white/60 hover:text-[#0a0e13]'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Desktop right side */}
          <div className="hidden items-center gap-3 md:flex">
            <span className="hidden items-center gap-2 rounded-full border border-white/70 bg-white/50 px-3 py-1.5 text-xs font-semibold text-[#0a0e13]/80 backdrop-blur-xl lg:inline-flex">
              <span className="relative flex h-2 w-2" aria-hidden="true">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500/60 motion-safe:animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              36 states covered
            </span>

            <Link
              to={cta.path}
              aria-current={isActive(cta.path) ? 'page' : undefined}
              className={`inline-flex h-10 items-center gap-2 rounded-full bg-[#0a0e13] px-5 text-sm font-bold text-white shadow-[0_8px_20px_-8px_rgba(10,14,19,0.6)] transition-colors duration-200 hover:bg-[#ffb224] hover:text-[#0a0e13] ${focusRing}`}
            >
              <CtaIcon className="h-4 w-4" aria-hidden="true" />
              {cta.name}
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            className={`inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/70 bg-white/55 text-[#0a0e13] backdrop-blur-xl transition-colors hover:border-[#ffb224] md:hidden ${focusRing}`}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-navigation"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu (sits inside the blurred header, so it shares the glass) */}
      {isMobileMenuOpen && (
        <div
          id="mobile-navigation"
          className="max-h-[calc(100svh-4rem)] overflow-y-auto border-t border-white/60 px-4 pb-8 pt-2 md:hidden"
        >
          <nav aria-label="Mobile navigation" className="mx-auto flex max-w-7xl flex-col">
            {links.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  aria-current={active ? 'page' : undefined}
                  className={`flex items-center justify-between border-b border-black/10 py-5 text-2xl font-extrabold tracking-[-0.02em] transition-colors ${focusRing} ${
                    active ? 'text-[#0a0e13]' : 'text-[#0a0e13]/80 hover:text-[#0a0e13]'
                  }`}
                  style={wide}
                >
                  <span className="flex items-center gap-4">
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-full ${
                        active ? 'bg-[#ffb224] text-[#0a0e13]' : 'bg-[#0a0e13] text-[#ffb224]'
                      }`}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    {item.name}
                  </span>
                  <ArrowUpRight className="h-5 w-5 text-[#0a0e13]/40" aria-hidden="true" />
                </Link>
              );
            })}

            <Link
              to={cta.path}
              aria-current={isActive(cta.path) ? 'page' : undefined}
              className={`mt-6 inline-flex h-14 items-center justify-center gap-2 rounded-full bg-[#0a0e13] text-base font-bold text-white transition-colors hover:bg-[#ffb224] hover:text-[#0a0e13] ${focusRing}`}
            >
              <CtaIcon className="h-5 w-5" aria-hidden="true" />
              {cta.name}
            </Link>

            <div className="mt-5 flex items-center justify-center gap-2 text-xs font-semibold text-[#0a0e13]/70">
              <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
              36 states covered
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}