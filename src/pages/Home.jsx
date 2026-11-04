import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowUpRight,
  Calculator,
  Car,
  CarFront,
  Check,
  Cog,
  Droplets,
  Fuel,
  Gauge,
  Layers,
  Leaf,
  ListChecks,
  Mountain,
  Ruler,
  Search,
  Settings2,
  ShieldCheck,
  Tag,
  Zap,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../api/client';
import HeroMedia from '../components/HeroMedia';
import SEOHead from '../components/SEOHead';

/* ------------------------------------------------------------------ */
/*  Tokens                                                             */
/*  ink #0a0e13 · panel #11161d · concrete #dfe3e6 · sodium #ffb224    */
/* ------------------------------------------------------------------ */

const ROUTES = { vehicles: '/vehicles', calculator: '/calculator', compare: '/compare' };

const categories = [
  { label: 'SUV', to: '/vehicles?body_type=SUV', icon: Mountain },
  { label: 'Hatchback', to: '/vehicles?body_type=Hatchback', icon: CarFront },
  { label: 'Sedan', to: '/vehicles?body_type=Sedan', icon: Car },
  { label: 'Electric', to: '/vehicles?search=Electric', icon: Zap },
  { label: 'CNG', to: '/vehicles?search=CNG', icon: Leaf },
  { label: 'Petrol', to: '/vehicles?search=Petrol', icon: Fuel },
  { label: 'Diesel', to: '/vehicles?search=Diesel', icon: Droplets },
  { label: 'Automatic', to: '/vehicles?search=Automatic', icon: Cog },
];

const quickLinks = categories.filter((c) => ['SUV', 'Hatchback', 'Sedan', 'Electric', 'Automatic'].includes(c.label));

const specs = [
  { icon: Gauge, title: 'Performance', text: 'Power, torque and engine options.' },
  { icon: Fuel, title: 'Mileage', text: 'Claimed efficiency by fuel type.' },
  { icon: ShieldCheck, title: 'Safety', text: 'Airbags, ratings and driver aids.' },
  { icon: ListChecks, title: 'Features', text: 'Comfort, tech and convenience.' },
  { icon: Ruler, title: 'Dimensions', text: 'Size, boot space and ground clearance.' },
  { icon: Layers, title: 'Variants', text: 'Every trim, with what each adds.' },
  { icon: Tag, title: 'Prices', text: 'Ex-showroom and on-road figures.' },
];

const priceIncludes = [
  'Ex-showroom price',
  'Road tax for your state',
  'Insurance',
  'Registration and other charges',
];

const compareRows = [
  { label: 'Price', a: 64, b: 78 },
  { label: 'Mileage', a: 82, b: 58 },
  { label: 'Safety', a: 90, b: 72 },
  { label: 'Boot space', a: 55, b: 70 },
];

const heroWords = ['SUV.', 'Sedan.', 'EV.', 'Hatchback.'];

const wide = { fontFamily: "'Archivo','Arial Black',system-ui,sans-serif", fontStretch: '125%' };
const body = { fontFamily: "'Hanken Grotesk','Inter',system-ui,sans-serif" };

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffb224] focus-visible:ring-offset-2';
const btnBase = `inline-flex h-12 items-center justify-center gap-2 rounded-full px-7 text-[15px] font-semibold transition-colors duration-300 ${focusRing}`;
const btnPrimary = `${btnBase} bg-[#ffb224] text-[#0a0e13] hover:bg-white focus-visible:ring-offset-[#0a0e13]`;
const btnDark = `${btnBase} bg-[#0a0e13] text-white hover:bg-[#1d2733] focus-visible:ring-offset-[#dfe3e6]`;
const chip =
  'inline-flex h-10 items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-4 text-sm font-semibold text-white/90 backdrop-blur-xl transition-colors hover:border-[#ffb224] hover:bg-[#ffb224] hover:text-[#0a0e13]';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const toNumber = (v) => Number(v?.starting_price ?? v?.ex_showroom_price);

const formatPrice = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2).replace(/\.?0+$/, '')} crore`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2).replace(/\.?0+$/, '')} lakh`;
  return `₹${n.toLocaleString('en-IN')}`;
};

const pick = (obj, keys) => {
  for (const k of keys) {
    const val = obj?.[k];
    if (val !== undefined && val !== null && val !== '') {
      return typeof val === 'object' ? val.name ?? val.title ?? null : val;
    }
  }
  return null;
};

const vehicleImage = (v) =>
  pick(v, ['image', 'primary_image', 'thumbnail', 'main_image', 'hero_image', 'image_url']);

function useInView(threshold = 0.35) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setSeen(true);
      return undefined;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, seen];
}

const polar = (cx, cy, r, deg) => {
  const a = (deg * Math.PI) / 180;
  return [cx + r * Math.sin(a), cy - r * Math.cos(a)];
};
const arc = (cx, cy, r, from, to) => {
  const [x1, y1] = polar(cx, cy, r, from);
  const [x2, y2] = polar(cx, cy, r, to);
  return `M ${x1} ${y1} A ${r} ${r} 0 ${to - from > 180 ? 1 : 0} 1 ${x2} ${y2}`;
};

/* ------------------------------------------------------------------ */
/*  Price gauge                                                        */
/* ------------------------------------------------------------------ */

function PriceGauge() {
  const [ref, seen] = useInView(0.4);
  const ticks = Array.from({ length: 25 }, (_, i) => -120 + i * 10);
  return (
    <div ref={ref} className="mx-auto w-full max-w-[460px]">
      <svg
        viewBox="0 0 400 330"
        role="img"
        aria-label="Gauge illustrating how ex-showroom price builds up to the on-road price"
      >
        <circle cx="200" cy="200" r="180" fill="#0a0e13" />
        <circle cx="200" cy="200" r="180" fill="none" stroke="#3a4350" strokeWidth="2" />
        <circle cx="200" cy="200" r="168" fill="none" stroke="#1d2733" strokeWidth="1" />

        {/* track */}
        <path d={arc(200, 200, 150, -120, 120)} stroke="#1d2733" strokeWidth="12" fill="none" strokeLinecap="round" />
        {/* animated fill */}
        <path
          d={arc(200, 200, 150, -120, 78)}
          pathLength="100"
          stroke="#ffb224"
          strokeWidth="12"
          fill="none"
          strokeLinecap="round"
          strokeDasharray="100"
          strokeDashoffset={seen ? 0 : 100}
          style={{ transition: 'stroke-dashoffset 1800ms cubic-bezier(0.2, 0.8, 0.2, 1)' }}
        />

        {ticks.map((deg, i) => {
          const major = i % 3 === 0;
          const [x1, y1] = polar(200, 200, major ? 118 : 126, deg);
          const [x2, y2] = polar(200, 200, 136, deg);
          return (
            <line
              key={deg}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={deg >= 60 ? '#ff4d3d' : '#dfe3e6'}
              strokeWidth={major ? 3 : 1.5}
              opacity={major ? 0.95 : 0.4}
            />
          );
        })}

        <g
          style={{
            transformOrigin: '200px 200px',
            transform: `rotate(${seen ? 78 : -120}deg)`,
            transition: 'transform 1800ms cubic-bezier(0.2, 0.8, 0.2, 1)',
          }}
        >
          <polygon points="196,208 204,208 201,70 199,70" fill="#ffffff" />
        </g>
        <circle cx="200" cy="200" r="16" fill="#0a0e13" stroke="#ffb224" strokeWidth="3" />

        <text
          x="200"
          y="262"
          textAnchor="middle"
          fill="#ffffff"
          fontSize="34"
          fontWeight="800"
          style={{ ...wide, letterSpacing: '-0.02em' }}
        >
          On-road
        </text>
        <text x="200" y="292" textAnchor="middle" fill="#dfe3e6" opacity="0.65" fontSize="16" style={body}>
          your state, city and variant
        </text>
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Popular car card                                                   */
/* ------------------------------------------------------------------ */

function PopularCard({ vehicle }) {
  const [imageFailed, setImageFailed] = useState(false);
  const img = vehicleImage(vehicle);
  const brand = pick(vehicle, ['brand_name', 'brand', 'make']);
  const model = pick(vehicle, ['model_name', 'model', 'name']);
  const title = [brand, model].filter(Boolean).join(' ') || 'Car';
  const price = formatPrice(vehicle.starting_price ?? vehicle.ex_showroom_price);
  const fuel = pick(vehicle, ['fuel_type', 'fuel']);
  const transmission = pick(vehicle, ['transmission', 'transmission_type']);
  const href = `${ROUTES.vehicles}/${vehicle.slug || vehicle.id}`;

  return (
    <Link
      to={href}
      aria-label={`${title}, view details`}
      className={`group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#11161d] text-white ${focusRing} focus-visible:ring-offset-[#0a0e13]`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[radial-gradient(ellipse_at_50%_100%,#2a3340,#0f141a)]">
        {img && !imageFailed ? (
          <img
            src={img}
            alt={title}
            loading="lazy"
            onError={() => setImageFailed(true)}
            className="h-full w-full object-cover motion-safe:transition-transform motion-safe:duration-700 motion-safe:group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-white/40">No image</div>
        )}
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#11161d] to-transparent" />
        <span
          aria-hidden="true"
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white backdrop-blur-xl transition-colors group-hover:border-[#ffb224] group-hover:bg-[#ffb224] group-hover:text-[#0a0e13]"
        >
          <ArrowUpRight className="h-5 w-5" />
        </span>
      </div>

      <div className="flex flex-1 flex-col px-5 pb-6 pt-3">
        <h3 className="text-xl font-extrabold leading-tight tracking-[-0.02em]" style={wide}>
          {title}
        </h3>
        <p className="mt-4 text-sm text-white/55" style={body}>
          Starting at
        </p>
        <p className="text-2xl font-bold leading-tight text-white" style={wide}>
          {price || 'Price on request'}
        </p>
        {(fuel || transmission) && (
          <div className="mt-5 flex flex-wrap gap-2 text-sm" style={body}>
            {fuel && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1 text-white/80">
                <Fuel className="h-3.5 w-3.5 text-[#ffb224]" aria-hidden="true" />
                {fuel}
              </span>
            )}
            {transmission && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1 text-white/80">
                <Settings2 className="h-3.5 w-3.5 text-[#ffb224]" aria-hidden="true" />
                {transmission}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function Home() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [minPrice, setMinPrice] = useState(5);
  const [maxPrice, setMaxPrice] = useState(50);
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return undefined;
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % heroWords.length);
    }, 2600);
    return () => clearInterval(interval);
  }, []);

  const { data: vehiclesData, isLoading, isError, refetch } = useQuery({
    queryKey: ['home-vehicles', 'popular'],
    queryFn: () => api.getVehicles({ page_size: 'all', ordering: 'starting_price' }),
  });

  const allVehicles = useMemo(
    () =>
      Array.isArray(vehiclesData?.results)
        ? vehiclesData.results
        : Array.isArray(vehiclesData)
          ? vehiclesData
          : [],
    [vehiclesData],
  );

  const popular = useMemo(() => {
    const flagged = allVehicles.filter((v) => v.is_popular || v.is_featured || v.featured || v.popular);
    const source = flagged.length >= 4 ? flagged : allVehicles.filter((v) => Number.isFinite(toNumber(v)));
    return source.slice(0, 8);
  }, [allVehicles]);

  const handleSearch = (event) => {
    event.preventDefault();
    const query = searchQuery.trim();
    navigate(query ? `${ROUTES.vehicles}?search=${encodeURIComponent(query)}` : ROUTES.vehicles);
  };

  const container = 'mx-auto w-full min-w-0 max-w-[1320px] px-5 sm:px-8 lg:px-12';
  const h2 = 'font-extrabold leading-[1] tracking-[-0.025em]';
  const h2Size = 'text-[clamp(1.9rem,4.4vw,3.75rem)]';

  return (
    <div className="w-full min-w-0 overflow-x-clip bg-[#0a0e13] text-[#eef1f3]" style={body}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,500..900&family=Hanken+Grotesk:wght@400;500;600;700&display=swap');
        @keyframes cg-rise { from { opacity: 0; transform: translateY(28px); } to { opacity: 1; transform: none; } }
        @keyframes cg-word { from { opacity: 0; transform: translateY(45%); clip-path: inset(0 0 100% 0); } to { opacity: 1; transform: none; clip-path: inset(0 0 0 0); } }
        @media (prefers-reduced-motion: no-preference) {
          .cg-rise { animation: cg-rise 900ms cubic-bezier(0.2, 0.8, 0.2, 1) both; animation-delay: var(--d, 0ms); }
          .cg-word { animation: cg-word 700ms cubic-bezier(0.2, 0.8, 0.2, 1) both; }
        }
      `}</style>

      <SEOHead
        title="Find Your Car. Know the Real Price. | Car Guide Media"
        description="Explore cars, compare specifications, discover variants, and calculate the on-road price for your state — all in one place."
      />

      {/* HERO */}
      <section className="relative overflow-hidden bg-[#0a0e13] text-white" aria-labelledby="home-hero-title">
        <HeroMedia>
          <div className={`relative flex min-h-[100svh] flex-col justify-end pb-10 pt-28 sm:pb-14 ${container}`}>
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0a0e13] via-[#0a0e13]/35 to-[#0a0e13]/30"
            />

            <div className="relative max-w-[1000px]">
              <h1
                id="home-hero-title"
                className="text-[clamp(2.25rem,7vw,6.25rem)] font-black leading-[1.02] tracking-[-0.03em]"
                style={wide}
              >
                <span className="cg-rise block" style={{ '--d': '80ms' }}>
                  Find your next
                </span>
                <span className="cg-rise block overflow-hidden pb-[0.08em]" style={{ '--d': '220ms' }} aria-hidden="true">
                  <span key={wordIndex} className="cg-word block">
                    {heroWords[wordIndex]}
                  </span>
                </span>
                <span className="sr-only">SUV, sedan, EV or hatchback.</span>
              </h1>

              <p
                className="cg-rise mt-5 max-w-[48ch] text-base leading-relaxed text-white/75 sm:text-lg"
                style={{ '--d': '360ms' }}
              >
                Specs, variants and the real on-road price for your state, in one place.
              </p>

              <div className="cg-rise mt-8 max-w-[720px]" style={{ '--d': '480ms' }}>
                <form onSubmit={handleSearch} role="search">
                  <label htmlFor="home-search" className="sr-only">
                    Search for a car, brand or model
                  </label>
                  <div className="flex h-16 items-center gap-3 rounded-full border border-white/20 bg-white/10 pl-6 pr-2 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.8)] backdrop-blur-2xl focus-within:border-[#ffb224]">
                    <Search className="h-5 w-5 shrink-0 text-white/60" aria-hidden="true" />
                    <input
                      id="home-search"
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search car, brand or model"
                      className="h-full min-w-0 flex-1 bg-transparent text-lg text-white placeholder:text-white/50 focus:outline-none"
                    />
                    <button
                      type="submit"
                      className={`inline-flex h-12 shrink-0 items-center gap-2 rounded-full bg-[#ffb224] px-6 text-[15px] font-semibold text-[#0a0e13] transition-colors hover:bg-white ${focusRing} focus-visible:ring-offset-0`}
                    >
                      Search
                    </button>
                  </div>
                </form>

                <ul className="mt-4 flex flex-wrap items-center gap-2">
                  {quickLinks.map(({ label, to }) => (
                    <li key={label}>
                      <Link to={to} className={`${chip} ${focusRing} focus-visible:ring-offset-[#0a0e13]`}>
                        {label}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link
                      to={ROUTES.vehicles}
                      className={`inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-white underline decoration-[#ffb224] decoration-2 underline-offset-4 transition-colors hover:text-[#ffb224] ${focusRing} focus-visible:ring-offset-[#0a0e13]`}
                    >
                      Browse all cars
                      <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </HeroMedia>
      </section>

      {/* PRICE RANGE AND BODY TYPE */}
     <section
  className="relative overflow-hidden border-y border-white/10 bg-[#0b0f15]"
  aria-labelledby="explore-title"
>
  {/* decorative backdrop */}
  <div aria-hidden="true" className="pointer-events-none absolute inset-0">
    <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#ffb224]/20 blur-[100px]" />
    <div className="absolute -bottom-32 right-0 h-80 w-80 rounded-full bg-[#ff6b3d]/10 blur-[120px]" />
    <div
      className="absolute inset-0 opacity-[0.07]"
      style={{
        backgroundImage:
          "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
        backgroundSize: "48px 48px",
        maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
      }}
    />
  </div>

  <div className={`${container} relative grid gap-10 py-12 sm:py-16 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:gap-16`}>
    {/* LEFT: price range */}
    <div>
      <p className="mb-3 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.28em] text-[#ffb224]">
        <span className="h-px w-8 bg-[#ffb224]" aria-hidden="true" />
        Find your drive
      </p>

      <h2
        id="explore-title"
        className="text-3xl font-extrabold tracking-[-0.03em] sm:text-4xl"
        style={wide}
      >
        Car price range
      </h2>
      <p className="mt-2 text-sm text-white/60">
        Choose your budget in lakhs (ex-showroom).
      </p>

      {/* big live readout */}
      <div className="mt-7 flex flex-wrap items-baseline gap-x-3 gap-y-1" aria-live="polite">
        <span
          className="bg-gradient-to-b from-white to-[#ffb224] bg-clip-text text-5xl font-extrabold tracking-[-0.04em] text-transparent sm:text-6xl"
          style={wide}
        >
          ₹{minPrice}
        </span>
        <span className="text-2xl font-light text-white/30" aria-hidden="true">—</span>
        <span
          className="bg-gradient-to-b from-white to-[#ffb224] bg-clip-text text-5xl font-extrabold tracking-[-0.04em] text-transparent sm:text-6xl"
          style={wide}
        >
          ₹{maxPrice}
        </span>
        <span className="ml-1 text-sm font-semibold uppercase tracking-[0.2em] text-white/50">lakh</span>
      </div>

      {/* visual range bar (display only) */}
      <div className="mt-6 max-w-[560px]" aria-hidden="true">
        <div className="relative h-2 rounded-full bg-white/10">
          <div
            className="absolute top-0 h-full rounded-full bg-gradient-to-r from-[#ffb224] to-[#ff6b3d] shadow-[0_0_18px_rgba(255,178,36,0.55)]"
            style={{
              left: `${((minPrice - 1) / 99) * 100}%`,
              width: `${((maxPrice - minPrice) / 99) * 100}%`,
            }}
          />
        </div>
        <div className="mt-2 flex justify-between text-[10px] font-semibold uppercase tracking-widest text-white/30">
          <span>₹1L</span>
          <span>₹25L</span>
          <span>₹50L</span>
          <span>₹75L</span>
          <span>₹100L</span>
        </div>
      </div>

      {/* sliders */}
      <div className="mt-6 grid w-full min-w-0 max-w-[560px] gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur sm:grid-cols-2 sm:gap-6">
        <label className="text-xs font-bold uppercase tracking-[0.18em] text-white/60">
          From <span className="ml-2 text-sm normal-case tracking-normal text-[#ffb224]">₹{minPrice} lakh</span>
          <input
            aria-label="Minimum car price in lakhs"
            type="range"
            min="1"
            max="99"
            step="1"
            value={minPrice}
            onChange={(event) => setMinPrice(Math.min(Number(event.target.value), maxPrice - 1))}
            className="mt-3 block w-full min-w-0 max-w-full cursor-pointer accent-[#ffb224]"
          />
        </label>
        <label className="text-xs font-bold uppercase tracking-[0.18em] text-white/60">
          To <span className="ml-2 text-sm normal-case tracking-normal text-[#ffb224]">₹{maxPrice} lakh</span>
          <input
            aria-label="Maximum car price in lakhs"
            type="range"
            min="2"
            max="100"
            step="1"
            value={maxPrice}
            onChange={(event) => setMaxPrice(Math.max(Number(event.target.value), minPrice + 1))}
            className="mt-3 block w-full min-w-0 max-w-full cursor-pointer accent-[#ffb224]"
          />
        </label>
      </div>

      <button
        type="button"
        onClick={() => navigate(`/vehicles?min_price=${minPrice * 100000}&max_price=${maxPrice * 100000}`)}
        className={`${btnPrimary} group mt-6 h-12 px-7 text-sm shadow-[0_10px_30px_-8px_rgba(255,178,36,0.6)] transition-transform duration-200 hover:-translate-y-0.5`}
      >
        <Search className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" aria-hidden="true" />
        Search this price range
      </button>
    </div>

    {/* RIGHT: browse by type */}
    <div className="relative rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.01] p-6 sm:p-8">
      {/* corner accent */}
      <span
        aria-hidden="true"
        className="absolute -right-px -top-px h-16 w-16 rounded-tr-3xl border-r-2 border-t-2 border-[#ffb224]/70"
      />
      <span
        aria-hidden="true"
        className="absolute -bottom-px -left-px h-16 w-16 rounded-bl-3xl border-b-2 border-l-2 border-[#ffb224]/30"
      />

      <h3 className="text-xl font-extrabold tracking-[-0.02em] sm:text-2xl" style={wide}>
        Browse by type
      </h3>
      <div className="mt-3 flex items-center gap-2" aria-hidden="true">
        <span className="h-0.5 w-10 rounded bg-[#ffb224]" />
        <span className="h-0.5 w-3 rounded bg-[#ffb224]/60" />
        <span className="h-0.5 w-1.5 rounded bg-[#ffb224]/30" />
      </div>

      <ul className="mt-6 grid grid-cols-2 gap-2.5 sm:flex sm:flex-wrap sm:gap-3">
        {categories.map(({ label, to, icon: Icon }) => (
          <li key={label} className="min-w-0">
            <Link
              to={to}
              className={`${chip} group h-11 w-full justify-center px-3 text-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#ffb224]/60 hover:shadow-[0_8px_24px_-8px_rgba(255,178,36,0.5)] sm:h-12 sm:w-auto sm:px-5 sm:text-base ${focusRing} focus-visible:ring-offset-[#0b0f15]`}
            >
              <Icon
                className="h-4 w-4 transition-colors duration-200 group-hover:text-[#ffb224]"
                aria-hidden="true"
              />
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  </div>
</section>

      {/* POPULAR CARS */}
      <section className="py-16 sm:py-24" aria-labelledby="popular-title">
        <div className={container}>
          <header className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <h2 id="popular-title" className={`${h2Size} ${h2}`} style={wide}>
              Popular cars
            </h2>
            <Link
              to={ROUTES.vehicles}
              className={`inline-flex items-center gap-1.5 rounded-full text-base font-semibold underline decoration-[#ffb224] decoration-2 underline-offset-8 transition-colors hover:text-[#ffb224] ${focusRing} focus-visible:ring-offset-[#0a0e13]`}
            >
              See every car <ArrowUpRight className="h-5 w-5" aria-hidden="true" />
            </Link>
          </header>

          <div aria-live="polite" aria-busy={isLoading}>
            {isLoading && (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4" aria-hidden="true">
                {Array.from({ length: 8 }, (_, i) => (
                  <div key={i} className="aspect-[4/5] rounded-3xl bg-white/5 motion-safe:animate-pulse" />
                ))}
              </div>
            )}

            {!isLoading && isError && (
              <div className="rounded-3xl border border-white/15 bg-[#11161d] p-8">
                <h3 className="text-2xl font-extrabold tracking-[-0.02em]" style={wide}>
                  Cars couldn’t load
                </h3>
                <p className="mt-2 text-white/65">Check your connection, then try again.</p>
                <button type="button" onClick={() => refetch()} className={`${btnPrimary} mt-5`}>
                  Try again
                </button>
              </div>
            )}

            {!isLoading && !isError && popular.length === 0 && (
              <div className="rounded-3xl border border-white/15 bg-[#11161d] p-8">
                <h3 className="text-2xl font-extrabold tracking-[-0.02em]" style={wide}>
                  No cars to show yet
                </h3>
                <Link to={ROUTES.vehicles} className={`${btnPrimary} mt-5`}>
                  Browse all cars
                </Link>
              </div>
            )}

            {!isLoading && !isError && popular.length > 0 && (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {popular.map((vehicle) => (
                  <PopularCard key={vehicle.id} vehicle={vehicle} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ON-ROAD PRICE */}
      <section className="relative overflow-hidden bg-[#dfe3e6] py-16 text-[#0a0e13] sm:py-24" aria-labelledby="onroad-title">
        <div className={`${container} grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-center`}>
          <div>
            <h2 id="onroad-title" className={`max-w-[18ch] ${h2Size} ${h2}`} style={wide}>
              Know what your car really costs
            </h2>
            <p className="mt-5 max-w-[46ch] text-base leading-relaxed text-[#0a0e13]/75 sm:text-lg">
              The sticker price is only the start. Get an estimated on-road price for your state, city and variant.
            </p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {priceIncludes.map((item) => (
                <li key={item} className="flex items-center gap-3 text-[15px] font-medium">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0a0e13] text-[#ffb224]">
                    <Check className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <Link to={ROUTES.calculator} className={`${btnDark} mt-8`}>
              <Calculator className="h-5 w-5" aria-hidden="true" />
              Calculate on-road price
            </Link>
          </div>
          <PriceGauge />
        </div>
      </section>

      {/* SPECIFICATIONS */}
      <section className="py-16 sm:py-24" aria-labelledby="specs-title">
        <div className={`${container} grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-20`}>
          <div className="lg:sticky lg:top-28 lg:self-start">
            <h2 id="specs-title" className={`max-w-[16ch] ${h2Size} ${h2}`} style={wide}>
              Everything you need before you buy
            </h2>
            <p className="mt-5 max-w-[40ch] text-base leading-relaxed text-white/65 sm:text-lg">
              Every car page covers the same seven things, so you can judge them on equal terms.
            </p>
          </div>
          <ul className="divide-y divide-white/10 border-y border-white/10">
            {specs.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex items-center gap-5 py-5">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] text-[#ffb224]">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-lg font-bold tracking-[-0.01em]" style={wide}>
                    {title}
                  </h3>
                  <p className="mt-0.5 text-sm text-white/65 sm:text-base">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* COMPARE */}
      <section className="pb-16 sm:pb-24" aria-labelledby="compare-title">
        <div className={container}>
          <div className="grid gap-10 overflow-hidden rounded-[32px] border border-white/10 bg-[#11161d] p-6 sm:p-10 lg:grid-cols-2 lg:items-center lg:p-14">
            <div>
              <h2 id="compare-title" className={`max-w-[16ch] ${h2Size} ${h2}`} style={wide}>
                Compare cars side by side
              </h2>
              <p className="mt-5 max-w-[44ch] text-base leading-relaxed text-white/70 sm:text-lg">
                Line up prices, specifications, features and variants for two or more cars.
              </p>
              <Link to={ROUTES.compare} className={`${btnPrimary} mt-8`}>
                Compare cars
                <ArrowUpRight className="h-5 w-5" aria-hidden="true" />
              </Link>
            </div>

            <div aria-hidden="true" className="rounded-2xl border border-white/10 bg-[#0a0e13] p-5 sm:p-6">
              <div className="mb-5 flex items-center justify-between text-sm font-semibold text-white/70">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#ffb224]" />
                  Car A
                </span>
                <span className="flex items-center gap-2">
                  Car B
                  <span className="h-2.5 w-2.5 rounded-full bg-white/50" />
                </span>
              </div>
              <div className="space-y-5">
                {compareRows.map(({ label, a, b }) => (
                  <div key={label}>
                    <p className="mb-2 text-center text-xs text-white/50">{label}</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex justify-end">
                        <div className="h-2.5 rounded-full bg-[#ffb224]" style={{ width: `${a}%` }} />
                      </div>
                      <div className="flex justify-start">
                        <div className="h-2.5 rounded-full bg-white/50" style={{ width: `${b}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative overflow-hidden border-t border-white/10 py-20 text-center sm:py-32" aria-labelledby="final-title">
        <div className={container}>
          <h2
            id="final-title"
            className="mx-auto max-w-[14ch] text-[clamp(2.25rem,6.5vw,5.5rem)] font-black leading-[1] tracking-[-0.03em]"
            style={wide}
          >
            Your next car starts here
          </h2>
          <Link to={ROUTES.vehicles} className={`${btnPrimary} mt-10 h-14 px-9 text-base`}>
            Explore cars
            <ArrowUpRight className="h-5 w-5" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  );
}