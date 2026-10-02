import React from 'react';
import { Link } from 'react-router-dom';
import { Car, Shield, Heart, ArrowUp, ArrowUpRight } from 'lucide-react';
import carGuideLogo from '../assets/Car Guide Media Logo Horizontal.png';

/* Cut-corner shape (same language as the other pages) */
const CUT_SM = '[clip-path:polygon(0_0,calc(100%_-_8px)_0,100%_8px,100%_100%,8px_100%,0_calc(100%_-_8px))]';

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
    <div className="mb-6 flex items-center gap-2">
      <span aria-hidden="true" className="h-[3px] w-6 -skew-x-[30deg] bg-red-600" />
      <h4 className="text-sm font-black italic tracking-tight text-slate-950">{children}</h4>
    </div>
  );
}

export default function Footer() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer className="relative mt-auto overflow-hidden bg-gradient-to-b from-white via-rose-50/60 to-white text-sm text-slate-600">
      {/* Component-scoped keyframes (no Tailwind config changes needed) */}
      <style>{`
        @keyframes cg-road-scroll { to { background-position: -64px 0; } }
        @keyframes cg-car-idle { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-1.5px); } }
        .cg-road-dashes {
          background-image: repeating-linear-gradient(90deg, rgba(255,255,255,0.9) 0 28px, transparent 28px 64px);
          animation: cg-road-scroll 0.9s linear infinite;
        }
        .cg-car { animation: cg-car-idle 1.4s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .cg-road-dashes, .cg-car { animation: none; }
        }
      `}</style>

      {/* Decorative speed panels */}
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 top-24 h-80 w-80 -skew-x-12 bg-gradient-to-bl from-red-600/10 to-transparent" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-28 bottom-10 h-56 w-56 -skew-x-12 bg-red-600/5" />

      {/* The road: red strip, white dashes scroll past while the car stays put */}
      <div
        aria-hidden="true"
        className="relative h-16 overflow-hidden bg-gradient-to-r from-red-700 via-red-600 to-red-700"
      >
        {/* diagonal sheen */}
        <div className="absolute inset-y-0 left-1/3 w-24 -skew-x-[22deg] bg-white/10" />
        <div className="absolute bottom-5 left-[12%] flex items-center">
          <Car className="cg-car h-6 w-6 text-white" strokeWidth={1.75} />
          {/* Headlight beam */}
          <span
            className="ml-1 block h-5 w-28 bg-gradient-to-r from-white/50 to-transparent"
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
              className="inline-block rounded-md transition-transform duration-300 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
            >
              {/* Light background, so the full logo (with its dark lettering) works as-is */}
              <img src={carGuideLogo} alt="Car Guide Media" className="h-14 w-auto" />
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-slate-600">
              India's premier automotive portfolio, editorial review platform, and
              config-driven state road tax calculator.
            </p>

            <Link
              to="/calculator"
              className={`group relative mt-6 inline-flex items-center gap-3 overflow-hidden bg-slate-900 py-1.5 pl-5 pr-1.5 text-sm font-extrabold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-red-600 active:scale-[0.97] ${CUT_SM}`}
            >
              <span aria-hidden="true" className="absolute inset-y-0 -left-1/2 w-1/3 -skew-x-[22deg] bg-white/30 transition-all duration-700 group-hover:left-[130%]" />
              <span className="relative">Calculate on-road price</span>
              <span className={`relative grid h-9 w-9 place-items-center bg-white text-red-600 ${CUT_SM}`}>
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:rotate-45" />
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <nav aria-label="Footer" className="lg:col-span-2">
            <ColumnHeading>Explore</ColumnHeading>
            <ul className="space-y-3">
              {NAV_LINKS.map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="group inline-flex items-center rounded-sm font-semibold text-slate-600 transition-colors hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
                  >
                    <span aria-hidden="true" className="mr-0 block h-[2px] w-0 -skew-x-[30deg] bg-red-600 transition-all duration-300 group-hover:mr-2 group-hover:w-3" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Supported states */}
          <div className="lg:col-span-3">
            <ColumnHeading>States we cover</ColumnHeading>
            <ul className="space-y-3">
              {STATES.map(({ name, rule, highlight }) => (
                <li
                  key={name}
                  className={`group flex items-start gap-3 rounded-xl border px-3.5 py-2.5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${highlight ? 'border-emerald-200 bg-emerald-50/70 hover:border-emerald-300' : 'border-slate-200 bg-white hover:border-red-200'}`}
                >
                  <span
                    aria-hidden="true"
                    className={`mt-1.5 h-2 w-2 shrink-0 -skew-x-12 ${highlight ? 'bg-emerald-500' : 'bg-red-600'}`}
                  />
                  <span className="leading-snug">
                    <span className="block font-extrabold text-slate-900">{name}</span>
                    <span className={`block text-xs ${highlight ? 'text-emerald-700' : 'text-slate-500'}`}>{rule}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Transparency */}
          <div className="lg:col-span-3">
            <ColumnHeading>How we calculate</ColumnHeading>
            <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-red-300 hover:shadow-[0_18px_36px_-18px_rgba(220,38,38,0.35)]">
              <div aria-hidden="true" className="absolute -right-6 -top-6 h-24 w-24 -skew-x-12 bg-red-50 transition-transform duration-500 group-hover:translate-x-2" />
              <div className="relative flex items-center gap-3">
                <span className={`grid h-10 w-10 flex-none place-items-center bg-red-600 text-white ${CUT_SM}`}>
                  <Shield className="h-5 w-5" />
                </span>
                <span className="font-extrabold leading-tight text-slate-900">Self-hosted pricing engine</span>
              </div>
              <p className="relative mt-4 text-xs leading-relaxed text-slate-600">
                All tax rates, RTO fees, and TCS rules (1% for &gt;₹10L) are maintained
                in our managed database for accurate estimates without third-party fees.
              </p>
              <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 bg-red-600 transition-transform duration-500 group-hover:scale-x-100" />
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-8 text-xs text-slate-500 md:flex-row">
          <p>&copy; {new Date().getFullYear()} Car Guide Media. All rights reserved.</p>

          <p className="flex items-center gap-1.5">
            <span>Crafted with</span>
            <Heart className="h-3.5 w-3.5 fill-red-600 text-red-600" />
            <span>and delivered by</span>
            <span className="font-extrabold text-slate-900">KaarBaar Solutions</span>
          </p>

          <button
            type="button"
            onClick={scrollToTop}
            className="group inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1.5 pl-4 pr-1.5 font-extrabold text-slate-700 transition-all duration-300 hover:border-red-600 hover:bg-red-600 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
          >
            <span>Back to top</span>
            <span className="grid h-6 w-6 place-items-center rounded-full bg-red-600 text-white transition-colors group-hover:bg-white group-hover:text-red-600">
              <ArrowUp className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5" />
            </span>
          </button>
        </div>
      </div>
    </footer>
  );
}