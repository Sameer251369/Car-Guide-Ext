import React from 'react';
import { Link } from 'react-router-dom';
import { Car, Shield, Heart, ArrowUp, ArrowUpRight } from 'lucide-react';
import carGuideLogo from '../assets/Car Guide Media Logo Horizontal.png';

/* Tokens: ink #0a0e13 · concrete #dfe3e6 · sodium #ffb224 */
const wide = { fontFamily: "'Archivo','Arial Black',system-ui,sans-serif", fontStretch: '125%' };
const body = { fontFamily: "'Hanken Grotesk','Inter',system-ui,sans-serif" };

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0a0e13] focus-visible:ring-offset-2 focus-visible:ring-offset-[#dfe3e6]';

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
    <h4 className="mb-5 text-base font-extrabold tracking-[-0.01em] text-[#0a0e13]" style={wide}>
      {children}
    </h4>
  );
}

export default function Footer() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer className="relative mt-auto overflow-hidden bg-[#dfe3e6] text-sm text-[#0a0e13]/75" style={body}>
      {/* Component-scoped keyframes (no Tailwind config changes needed) */}
      <style>{`
        @keyframes cg-road-scroll { to { background-position: -64px 0; } }
        @keyframes cg-car-idle { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-1.5px); } }
        .cg-road-dashes {
          background-image: repeating-linear-gradient(90deg, rgba(255,178,36,0.95) 0 28px, transparent 28px 64px);
          animation: cg-road-scroll 0.9s linear infinite;
        }
        .cg-car { animation: cg-car-idle 1.4s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .cg-road-dashes, .cg-car { animation: none; }
        }
      `}</style>

      {/* The road: dark strip, amber dashes scroll past while the car stays put */}
      <div aria-hidden="true" className="relative h-16 overflow-hidden bg-[#0a0e13]">
        <div className="absolute bottom-5 left-[12%] flex items-center">
          <Car className="cg-car h-6 w-6 text-white" strokeWidth={1.75} />
          {/* Headlight beam */}
          <span
            className="ml-1 block h-5 w-28 bg-gradient-to-r from-[#ffb224]/60 to-transparent"
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
              className={`inline-block rounded-md ${focusRing}`}
            >
              {/* Light background, so the full logo (with its dark lettering) works as-is */}
              <img src={carGuideLogo} alt="Car Guide Media" className="h-14 w-auto" />
            </Link>
            <p className="mt-5 max-w-sm text-base leading-relaxed text-[#0a0e13]/70">
              India’s premier automotive portfolio, editorial review platform, and config-driven state road tax
              calculator.
            </p>

            <Link
              to="/calculator"
              className={`group mt-6 inline-flex items-center gap-3 rounded-full bg-[#0a0e13] py-1.5 pl-6 pr-1.5 text-sm font-bold text-white transition-colors duration-200 hover:bg-[#1d2733] active:scale-[0.98] ${focusRing}`}
            >
              <span>Calculate on-road price</span>
              <span className="grid h-10 w-10 place-items-center rounded-full bg-[#ffb224] text-[#0a0e13]">
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
                    className={`rounded-sm font-semibold text-[#0a0e13]/70 underline decoration-transparent decoration-2 underline-offset-4 transition-colors hover:text-[#0a0e13] hover:decoration-[#ffb224] ${focusRing}`}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Supported states */}
          <div className="lg:col-span-3">
            <ColumnHeading>States we cover</ColumnHeading>
            <ul className="space-y-2.5">
              {STATES.map(({ name, rule, highlight }) => (
                <li
                  key={name}
                  className={`flex items-start gap-3 rounded-2xl border px-4 py-3 ${
                    highlight
                      ? 'border-emerald-500/30 bg-emerald-50/70'
                      : 'border-white/70 bg-white/55'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${highlight ? 'bg-emerald-500' : 'bg-[#ffb224]'}`}
                  />
                  <span className="leading-snug">
                    <span className="block font-bold text-[#0a0e13]">{name}</span>
                    <span className={`block text-xs ${highlight ? 'text-emerald-800' : 'text-[#0a0e13]/60'}`}>
                      {rule}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Transparency */}
          <div className="lg:col-span-3">
            <ColumnHeading>How we calculate</ColumnHeading>
            <div className="rounded-3xl bg-[#0a0e13] p-6 text-white">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 flex-none place-items-center rounded-full bg-[#ffb224] text-[#0a0e13]">
                  <Shield className="h-5 w-5" />
                </span>
                <span className="font-bold leading-tight" style={wide}>
                  Self-hosted pricing engine
                </span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-white/70">
                All tax rates, RTO fees, and TCS rules (1% for &gt;₹10L) are maintained in our managed database for
                accurate estimates without third-party fees.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-[#0a0e13]/15 pt-8 text-xs text-[#0a0e13]/65 md:flex-row">
          <p>&copy; {new Date().getFullYear()} Car Guide Media. All rights reserved.</p>

          <p className="flex items-center gap-1.5">
            <span>Crafted with</span>
            <Heart className="h-3.5 w-3.5 fill-[#ff4d3d] text-[#ff4d3d]" aria-hidden="true" />
            <span>and delivered by</span>
            <span className="font-bold text-[#0a0e13]">KaarBaar Solutions</span>
          </p>

          <button
            type="button"
            onClick={scrollToTop}
            className={`group inline-flex items-center gap-2 rounded-full border border-[#0a0e13]/20 bg-white/60 py-1.5 pl-4 pr-1.5 text-sm font-bold text-[#0a0e13] transition-colors duration-200 hover:border-[#0a0e13] hover:bg-[#0a0e13] hover:text-white ${focusRing}`}
          >
            <span>Back to top</span>
            <span className="grid h-7 w-7 place-items-center rounded-full bg-[#ffb224] text-[#0a0e13]">
              <ArrowUp className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5" />
            </span>
          </button>
        </div>
      </div>
    </footer>
  );
}