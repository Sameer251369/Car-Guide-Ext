import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowUpRight,
  Calculator,
  Fuel,
  Gauge,
  Layers,
  ListChecks,
  Ruler,
  Search,
  Settings2,
  ShieldCheck,
  Tag,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../api/client';
import HeroMedia from '../components/HeroMedia';
import SEOHead from '../components/SEOHead';

/*
  Car Guide Media: homepage, automotive redesign.
  Same data source (api.getVehicles), same routes, same ?search= behaviour.

  Concept: the page is an instrument cluster on a night drive.
  - Asphalt  #0d0e10   base
  - Steel    #1a1c20   panels
  - Chalk    #f1efea   light surfaces / lane paint
  - Signal   #dc2626   brand red (CTAs, racing stripe, redline)
  - Beam     #f6c945   headlight amber (needle, plate, price highlights)
  Type: Barlow Condensed (italic, heavy) for display, Barlow for text.
  Memorable moment: the headline over the hero imagery, with a number-plate search box.
  One motion moment: the price gauge needle sweeping when it scrolls into view.
*/

const ROUTES = { vehicles: '/vehicles', calculator: '/calculator', compare: '/compare' };

const categories = [
  { label: 'SUV', to: '/vehicles?search=SUV' },
  { label: 'Hatchback', to: '/vehicles?search=Hatchback' },
  { label: 'Sedan', to: '/vehicles?search=Sedan' },
  { label: 'Electric', to: '/vehicles?search=Electric' },
  { label: 'CNG', to: '/vehicles?search=CNG' },
  { label: 'Petrol', to: '/vehicles?search=Petrol' },
  { label: 'Diesel', to: '/vehicles?search=Diesel' },
  { label: 'Automatic', to: '/vehicles?search=Automatic' },
];

const specs = [
  { icon: Gauge, title: 'Performance', text: 'Power, torque and engine options.' },
  { icon: Fuel, title: 'Mileage', text: 'Claimed efficiency by fuel type.' },
  { icon: ShieldCheck, title: 'Safety', text: 'Airbags, ratings and driver aids.' },
  { icon: ListChecks, title: 'Features', text: 'Comfort, tech and convenience.' },
  { icon: Ruler, title: 'Dimensions', text: 'Size, boot space and ground clearance.' },
  { icon: Layers, title: 'Variants', text: 'Every trim, with what each adds.' },
  { icon: Tag, title: 'Prices', text: 'Ex-showroom and on-road figures.' },
];

const display = { fontFamily: "'Barlow Condensed','Oswald','Arial Narrow',sans-serif" };
const body = { fontFamily: "'Barlow','Inter',system-ui,sans-serif" };

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f6c945] focus-visible:ring-offset-2';
// Slanted "racing" button: skewed container, un-skewed label.
const slant = { clipPath: 'polygon(14px 0, 100% 0, calc(100% - 14px) 100%, 0 100%)' };
const btnBase = `inline-flex h-14 items-center justify-center gap-2 px-9 text-lg font-bold italic tracking-wide transition-colors ${focusRing}`;
const btnPrimary = `${btnBase} bg-[#dc2626] text-white hover:bg-[#f6c945] hover:text-[#0d0e10] focus-visible:ring-offset-[#0d0e10]`;
const btnGhost = `${btnBase} bg-white/10 text-white backdrop-blur-md hover:bg-white hover:text-[#0d0e10] focus-visible:ring-offset-[#0d0e10]`;
const btnLight = `${btnBase} bg-[#0d0e10] text-white hover:bg-[#dc2626] focus-visible:ring-offset-[#f1efea]`;

// ---- helpers (defensive: field names are read with fallbacks, nothing is invented) ----
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

// Fires once when the element scrolls into view.
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

// ---- Gauge ----
const polar = (cx, cy, r, deg) => {
  const a = (deg * Math.PI) / 180;
  return [cx + r * Math.sin(a), cy - r * Math.cos(a)];
};
const arc = (cx, cy, r, from, to) => {
  const [x1, y1] = polar(cx, cy, r, from);
  const [x2, y2] = polar(cx, cy, r, to);
  return `M ${x1} ${y1} A ${r} ${r} 0 ${to - from > 180 ? 1 : 0} 1 ${x2} ${y2}`;
};

function PriceGauge() {
  const [ref, seen] = useInView(0.4);
  const ticks = Array.from({ length: 25 }, (_, i) => -120 + i * 10);
  return (
    <div ref={ref} className="mx-auto w-full max-w-[460px]">
      <svg viewBox="0 0 400 330" role="img" aria-label="Gauge illustrating how ex-showroom price builds up to the on-road price">
        <circle cx="200" cy="200" r="178" fill="#15171a" stroke="#2a2d33" strokeWidth="2" />
        <path d={arc(200, 200, 150, -120, 120)} stroke="#2a2d33" strokeWidth="14" fill="none" strokeLinecap="round" />
        <path d={arc(200, 200, 150, 60, 120)} stroke="#dc2626" strokeWidth="14" fill="none" strokeLinecap="round" />
        {ticks.map((deg, i) => {
          const major = i % 3 === 0;
          const [x1, y1] = polar(200, 200, major ? 124 : 132, deg);
          const [x2, y2] = polar(200, 200, 142, deg);
          return (
            <line
              key={deg}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={deg >= 60 ? '#dc2626' : '#f1efea'}
              strokeWidth={major ? 3 : 1.5}
              opacity={major ? 0.9 : 0.45}
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
          <polygon points="196,208 204,208 201,66 199,66" fill="#f6c945" />
        </g>
        <circle cx="200" cy="200" r="16" fill="#0d0e10" stroke="#f6c945" strokeWidth="3" />
        <text x="200" y="262" textAnchor="middle" fill="#f1efea" fontSize="40" fontWeight="800" fontStyle="italic" style={display}>
          On-road
        </text>
        <text x="200" y="292" textAnchor="middle" fill="#f1efea" opacity="0.6" fontSize="18" style={body}>
          your state, city and variant
        </text>
      </svg>
    </div>
  );
}

function PopularCard({ vehicle }) {
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
      className={`group relative flex h-full flex-col bg-[#1a1c20] text-[#f1efea] transition-transform duration-300 hover:-translate-y-1 ${focusRing} focus-visible:ring-offset-[#0d0e10]`}
      style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 28px), calc(100% - 28px) 100%, 0 100%)' }}
    >
      <span aria-hidden="true" className="absolute left-0 top-0 z-10 h-full w-1 bg-[#dc2626] transition-all duration-300 group-hover:w-1.5 group-hover:bg-[#f6c945]" />
      <div className="relative aspect-[16/10] overflow-hidden bg-[radial-gradient(ellipse_at_50%_90%,#2b2e35,#14161a)]">
        {img ? (
          <img
            src={img}
            alt={title}
            loading="lazy"
            className="h-full w-full object-cover motion-safe:transition-transform motion-safe:duration-700 motion-safe:group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-white/40">No image</div>
        )}
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#1a1c20] to-transparent" />
      </div>
      <div className="flex flex-1 flex-col px-6 pb-8 pt-4">
        <h3 className="text-[1.7rem] font-extrabold italic leading-none tracking-tight" style={display}>
          {title}
        </h3>
        <p className="mt-4 text-sm text-white/55" style={body}>Starting at</p>
        <p className="text-[2rem] font-bold leading-tight text-[#f6c945]" style={display}>
          {price || 'Price on request'}
        </p>
        {(fuel || transmission) && (
          <div className="mt-5 flex divide-x divide-white/15 border-t border-white/15 pt-4 text-sm" style={body}>
            {fuel && (
              <span className="flex items-center gap-2 pr-4">
                <Fuel className="h-4 w-4 text-[#dc2626]" aria-hidden="true" />
                {fuel}
              </span>
            )}
            {transmission && (
              <span className={`flex items-center gap-2 ${fuel ? 'pl-4' : ''}`}>
                <Settings2 className="h-4 w-4 text-[#dc2626]" aria-hidden="true" />
                {transmission}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

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

  // Uses an existing popular/featured flag if the API provides one, otherwise the first 8 returned.
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

  const container = 'mx-auto w-full max-w-[1320px] px-5 sm:px-8 lg:px-12';
  const h2 = 'font-extrabold italic leading-[0.92] tracking-[-0.01em]';

  return (
    <div className="bg-[#0d0e10] text-[#f1efea]" style={body}>
      {/* Add once to index.html (or keep this @import): Barlow + Barlow Condensed */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@1,700;1,800;1,900&family=Barlow:wght@400;500;600&display=swap');`}</style>

      <SEOHead
        title="Find Your Car. Know the Real Price. | Car Guide Media"
        description="Explore cars, compare specifications, discover variants, and calculate the on-road price for your state — all in one place."
      />

      {/* HERO */}
      <section className="relative overflow-hidden bg-[#0d0e10] text-white" aria-labelledby="home-hero-title">
        <HeroMedia>
          <div className={`relative flex min-h-[92vh] flex-col justify-end gap-9 pb-14 pt-28 lg:pb-20 lg:pt-36 ${container}`}>
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0d0e10] via-[#0d0e10]/55 to-[#0d0e10]/10" />

            <div className="relative max-w-[1100px]">
              <h1
                id="home-hero-title"
                className="text-[clamp(3.5rem,11vw,10rem)] font-black italic leading-[0.86] tracking-[-0.015em]"
                style={display}
              >
                Find your car.
                <br />
                <span className="text-[#f1efea]/90">Know the real price.</span>
              </h1>
              <p className="mt-6 max-w-[52ch] text-lg leading-snug text-white/80 sm:text-xl">
                Explore cars, compare specifications, discover variants, and calculate the on-road price for your state, all in one place.
              </p>
            </div>

            {/* number-plate search */}
            <form onSubmit={handleSearch} role="search" className="relative max-w-[780px]">
              <label htmlFor="home-search" className="sr-only">Search for a car, brand or model</label>
              <div className="flex items-stretch overflow-hidden rounded-lg border-[3px] border-[#0d0e10] bg-[#f6f3e7] shadow-[0_30px_80px_-24px_rgba(0,0,0,0.9)] ring-2 ring-white/20">
                <span className="flex w-12 shrink-0 flex-col items-center justify-center bg-[#1d3f9e] text-[10px] font-bold leading-tight text-white" aria-hidden="true">
                  <span className="mb-0.5 h-3 w-3 rounded-full border border-dashed border-[#f6c945]" />
                  IND
                </span>
                <input
                  id="home-search"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search any car, brand or model"
                  className="h-16 min-w-0 flex-1 bg-transparent px-4 text-2xl font-bold italic tracking-wide text-[#0d0e10] placeholder:text-[#0d0e10]/40 focus:outline-none sm:text-3xl"
                  style={display}
                />
                <button
                  type="submit"
                  className={`flex shrink-0 items-center gap-2 bg-[#dc2626] px-6 text-lg font-bold italic text-white transition-colors hover:bg-[#0d0e10] ${focusRing} focus-visible:ring-inset`}
                  style={display}
                >
                  <Search className="h-5 w-5" aria-hidden="true" />
                  Search
                </button>
              </div>
            </form>

            <div className="relative flex flex-col gap-3 sm:flex-row">
              <Link to={ROUTES.vehicles} className={btnPrimary} style={{ ...slant, ...display }}>
                Explore cars
                <ArrowUpRight className="h-5 w-5" aria-hidden="true" />
              </Link>
              <Link to={ROUTES.calculator} className={btnGhost} style={{ ...slant, ...display }}>
                <Calculator className="h-5 w-5" aria-hidden="true" />
                Calculate on-road price
              </Link>
            </div>
          </div>
        </HeroMedia>
      </section>

      {/* BODY STYLE STRIP */}
      <section className="border-y border-white/10 bg-[#14161a]" aria-labelledby="explore-title">
        <div className={`${container} py-10 sm:py-12`}>
          <h2 id="explore-title" className={`text-4xl sm:text-5xl ${h2}`} style={display}>
            Pick your lane
          </h2>
          <ul className="mt-6 flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] sm:flex-wrap sm:overflow-visible">
            {categories.map((c) => (
              <li key={c.label} className="shrink-0">
                <Link
                  to={c.to}
                  className={`group flex h-14 items-center gap-3 border border-white/20 px-6 text-2xl font-bold italic transition-colors hover:border-[#dc2626] hover:bg-[#dc2626] ${focusRing} focus-visible:ring-offset-[#14161a]`}
                  style={{ ...slant, ...display }}
                >
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* POPULAR CARS */}
      <section className="py-20 sm:py-28" aria-labelledby="popular-title">
        <div className={container}>
          <header className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <h2 id="popular-title" className={`text-[clamp(3rem,7vw,6rem)] ${h2}`} style={display}>
              Popular cars
            </h2>
            <Link
              to={ROUTES.vehicles}
              className={`inline-flex items-center gap-1.5 rounded-sm text-xl font-bold italic underline decoration-[#dc2626] decoration-4 underline-offset-8 transition-colors hover:text-[#f6c945] ${focusRing} focus-visible:ring-offset-[#0d0e10]`}
              style={display}
            >
              See every car <ArrowUpRight className="h-5 w-5" aria-hidden="true" />
            </Link>
          </header>

          <div aria-live="polite" aria-busy={isLoading}>
            {isLoading && (
              <>
                <span className="sr-only">Loading cars…</span>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4" aria-hidden="true">
                  {Array.from({ length: 8 }, (_, i) => (
                    <div key={i} className="aspect-[4/5] bg-[#1a1c20] motion-safe:animate-pulse" />
                  ))}
                </div>
              </>
            )}

            {!isLoading && isError && (
              <div className="border border-white/15 bg-[#1a1c20] p-8 sm:p-12">
                <h3 className="text-4xl font-extrabold italic" style={display}>Cars couldn’t load.</h3>
                <p className="mt-2 text-white/65">Check your connection and try again, or open the full catalog.</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <button type="button" onClick={() => refetch()} className={btnPrimary} style={{ ...slant, ...display }}>
                    Try again
                  </button>
                  <Link to={ROUTES.vehicles} className={btnGhost} style={{ ...slant, ...display }}>
                    Browse all cars
                  </Link>
                </div>
              </div>
            )}

            {!isLoading && !isError && popular.length === 0 && (
              <div className="border border-white/15 bg-[#1a1c20] p-8 sm:p-12">
                <h3 className="text-4xl font-extrabold italic" style={display}>No cars to show yet.</h3>
                <Link to={ROUTES.vehicles} className={`${btnPrimary} mt-6`} style={{ ...slant, ...display }}>
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

      {/* ON-ROAD PRICE: gauge */}
      <section className="relative overflow-hidden bg-[#14161a] py-20 sm:py-28" aria-labelledby="onroad-title">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_75%_50%,rgba(220,38,38,0.18),transparent_60%)]" />
        <div className={`${container} relative grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-center`}>
          <div>
            <h2 id="onroad-title" className={`text-[clamp(3rem,7.5vw,6.5rem)] ${h2}`} style={display}>
              Know what your car really costs
            </h2>
            <p className="mt-5 max-w-[46ch] text-lg leading-snug text-white/75">
              Calculate an estimated on-road price based on your state, city and selected variant.
            </p>
            <dl className="mt-8 max-w-[460px] divide-y divide-white/10 border-y border-white/10 text-lg">
              {['Ex-showroom price', 'Road tax & registration', 'Insurance', 'Other charges'].map((row) => (
                <div key={row} className="flex items-center justify-between py-3">
                  <dt className="text-white/75">{row}</dt>
                  <dd className="text-[#f6c945]" aria-hidden="true">+</dd>
                </div>
              ))}
              <div className="flex items-center justify-between py-3 font-bold">
                <dt>On-road price</dt>
                <dd className="text-[#dc2626]" aria-hidden="true">=</dd>
              </div>
            </dl>
            <Link to={ROUTES.calculator} className={`${btnPrimary} mt-8`} style={{ ...slant, ...display }}>
              <Calculator className="h-5 w-5" aria-hidden="true" />
              Calculate on-road price
            </Link>
          </div>
          <PriceGauge />
        </div>
      </section>

      {/* SPECIFICATIONS */}
      <section className="py-20 sm:py-28" aria-labelledby="specs-title">
        <div className={container}>
          <h2 id="specs-title" className={`max-w-[18ch] text-[clamp(3rem,7vw,6rem)] ${h2}`} style={display}>
            Everything you need to know before you buy
          </h2>
          <ul className="mt-12 grid border-l border-t border-white/12 sm:grid-cols-2 lg:grid-cols-4">
            {specs.map(({ icon: Icon, title, text }) => (
              <li key={title} className="group border-b border-r border-white/12 p-7 transition-colors hover:bg-[#1a1c20]">
                <Icon className="h-8 w-8 text-[#dc2626] transition-colors group-hover:text-[#f6c945]" aria-hidden="true" />
                <h3 className="mt-5 text-3xl font-extrabold italic leading-none" style={display}>{title}</h3>
                <p className="mt-2 text-base leading-snug text-white/65">{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* COMPARE: split screen */}
      <section className="relative overflow-hidden bg-[#f1efea] text-[#0d0e10]" aria-labelledby="compare-title">
        <div aria-hidden="true" className="absolute inset-y-0 right-0 hidden w-[42%] -skew-x-[14deg] translate-x-16 bg-[#dc2626] lg:block" />
        <div className={`${container} relative flex flex-col gap-8 py-20 sm:py-24 lg:flex-row lg:items-center lg:justify-between`}>
          <div>
            <h2 id="compare-title" className={`text-[clamp(3rem,7vw,6rem)] ${h2}`} style={display}>
              Compare cars side by side
            </h2>
            <p className="mt-4 max-w-[46ch] text-lg text-black/70">
              Compare prices, specifications, features and variants for two or more cars.
            </p>
          </div>
          <Link to={ROUTES.compare} className={`${btnLight} lg:mr-8`} style={{ ...slant, ...display }}>
            Compare cars
            <ArrowUpRight className="h-5 w-5" aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* FINAL CTA: road in perspective */}
      <section className="relative overflow-hidden py-28 text-center sm:py-40" aria-labelledby="final-title">
        <div className={`${container} relative`}>
          <h2 id="final-title" className="mx-auto max-w-[12ch] text-[clamp(3.5rem,10vw,9rem)] font-black italic leading-[0.88] tracking-[-0.015em]" style={display}>
            Your next car starts here.
          </h2>
          <p className="mx-auto mt-6 max-w-[48ch] text-lg leading-snug text-white/75">
            Discover the right car, understand the specifications and know the real on-road price.
          </p>
          <Link to={ROUTES.vehicles} className={`${btnPrimary} mt-10`} style={{ ...slant, ...display }}>
            Explore cars
            <ArrowUpRight className="h-5 w-5" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  );
}