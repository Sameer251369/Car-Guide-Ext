import React from 'react';
import { Link } from 'react-router-dom';
import { Car, Shield, Heart } from 'lucide-react';
import carGuideLogo from '../assets/Car Guide Media Logo Horizontal.png';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/vehicles', label: 'Automotive portfolio' },
  { to: '/calculator', label: 'On-road price calculator' },
  { to: '/blog', label: 'Editorial blog & advice' },
  { to: '/about', label: 'About us' },
];

const STATES = [
  { name: 'Delhi (NCT)', rule: 'Ex-showroom slab rates' },
  { name: 'Maharashtra', rule: 'Standard state RTO slabs' },
  { name: 'Gujarat', rule: 'Pre-GST tax basis rules' },
  { name: 'Chandigarh', rule: 'UT pre-GST concessions' },
  { name: 'Electric vehicles', rule: '0% road tax applicable', highlight: true },
];

function ColumnHeading({ children }) {
  return (
    <div className="mb-6">
      <h4 className="text-sm font-semibold text-white">{children}</h4>
      <span className="mt-3 block h-px w-6 bg-amber-500" />
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="relative mt-auto overflow-hidden bg-slate-950 text-sm text-slate-400">
      {/* Component-scoped keyframes (no Tailwind config changes needed) */}
      <style>{`
        @keyframes cg-road-scroll { to { background-position: -64px 0; } }
        @keyframes cg-car-idle { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-1.5px); } }
        .cg-road-dashes {
          background-image: repeating-linear-gradient(90deg, #f59e0b 0 28px, transparent 28px 64px);
          animation: cg-road-scroll 0.9s linear infinite;
        }
        .cg-car { animation: cg-car-idle 1.4s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .cg-road-dashes, .cg-car { animation: none; }
        }
      `}</style>

      {/* Soft amber glow behind the content */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 h-56 w-[42rem] -translate-x-1/2 rounded-full bg-amber-500/10 blur-3xl"
      />

      {/* The road: dashes scroll past while the car stays put */}
      <div
        aria-hidden="true"
        className="relative h-16 border-y border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950"
      >
        <div className="absolute bottom-5 left-[12%] flex items-center">
          <Car className="cg-car h-6 w-6 text-amber-400" strokeWidth={1.75} />
          {/* Headlight beam */}
          <span
            className="ml-1 block h-5 w-28 bg-gradient-to-r from-amber-400/30 to-transparent"
            style={{ clipPath: 'polygon(0 40%, 100% 0, 100% 100%, 0 60%)' }}
          />
        </div>
        <div className="cg-road-dashes absolute inset-x-0 bottom-3 h-0.5" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          {/* Brand */}
          <div className="md:col-span-2 lg:col-span-4">
            <Link
              to="/"
              aria-label="Car Guide Media home"
              className="inline-block rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              <span className="flex flex-col items-start leading-none">
                {/* Emblem only: crops the car silhouette out of the logo image.
                    The dark "CAR GUIDE" lettering baked into the PNG is invisible on this
                    background, so the name is rendered as real text below instead.
                    Tweak the three numbers if your original file crops differently. */}
                <span
                  aria-hidden="true"
                  className="relative block w-44 overflow-hidden"
                  style={{ aspectRatio: '145 / 20' }}
                >
                  <img
                    src={carGuideLogo}
                    alt=""
                    className="absolute max-w-none"
                    style={{ width: '221%', left: '-27.6%', top: '-240%' }}
                  />
                </span>
                <span className="mt-2 font-black italic tracking-wide text-white text-2xl">
                  CAR GUIDE
                </span>
                <span className="mt-1.5 pl-0.5 text-sm font-extrabold italic tracking-[0.5em] text-red-500">
                  MEDIA
                </span>
                <span className="sr-only">Car Guide Media</span>
              </span>
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-slate-400">
              India's premier automotive portfolio, editorial review platform, and
              config-driven state road tax calculator.
            </p>
          </div>

          {/* Navigation */}
          <nav aria-label="Footer" className="lg:col-span-2">
            <ColumnHeading>Explore</ColumnHeading>
            <ul className="space-y-3">
              {NAV_LINKS.map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="group inline-flex items-center rounded-sm text-slate-400 transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                  >
                    <span className="mr-0 block h-px w-0 bg-amber-400 transition-all duration-300 group-hover:mr-2 group-hover:w-3" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Supported states */}
          <div className="lg:col-span-3">
            <ColumnHeading>States we cover</ColumnHeading>
            <ul className="space-y-4">
              {STATES.map(({ name, rule, highlight }) => (
                <li key={name} className="flex items-start gap-3">
                  <span
                    className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${highlight ? 'bg-emerald-400' : 'bg-amber-500'
                      }`}
                  />
                  <span className="leading-snug">
                    <span className="block font-medium text-slate-200">{name}</span>
                    <span className="block text-xs text-slate-500">{rule}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Transparency */}
          <div className="lg:col-span-3">
            <ColumnHeading>How we calculate</ColumnHeading>
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm transition-colors hover:border-amber-500/40">
              <div className="flex items-center gap-2 font-medium text-amber-400">
                <Shield className="h-4 w-4" />
                <span>Self-hosted pricing engine</span>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-slate-400">
                All tax rates, RTO fees, and TCS rules (1% for &gt;₹10L) are maintained
                in our managed database for accurate estimates without third-party fees.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-slate-800/80 pt-8 text-xs text-slate-500 md:flex-row">
          <p>&copy; {new Date().getFullYear()} Car Guide Media. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            <span>Crafted with</span>
            <Heart className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
            <span>and delivered by</span>
            <span className="font-semibold text-slate-200">KaarBaar Solutions</span>
          </p>
        </div>
      </div>
    </footer>
  );
}