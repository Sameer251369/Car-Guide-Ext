import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowUpRight, Calculator, Fuel, Gauge, Zap } from 'lucide-react';
import { toAppMediaUrl } from '../api/client';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=900';

/* --- Shared style tokens: replace with your existing ones if you have them --- */
const display = { fontFamily: 'var(--font-display, inherit)' };
const slant = { clipPath: 'polygon(0 0, 100% 0, calc(100% - 12px) 100%, 0 100%)' };
const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f6c945] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d0e10]';

const handleImageError = (event) => {
  event.currentTarget.onerror = null;
  event.currentTarget.src = FALLBACK_IMAGE;
};

const formatPrice = (price) => {
  const num = Number(price);
  if (!num || Number.isNaN(num)) return null;
  if (num >= 10000000) return `Rs. ${(num / 10000000).toFixed(2)} Crore`;
  if (num >= 100000) return `Rs. ${(num / 100000).toFixed(2)} Lakh`;
  return `Rs. ${num.toLocaleString('en-IN')}`;
};

export default function VehicleCard({ vehicle, variant = 'default' }) {
  const location = useLocation();
  const detailNavigationState = location.pathname === '/vehicles' ? { fromVehicles: true } : undefined;
  const isEv = vehicle.ev_hybrid_cng_flag === 'EV' || String(vehicle.fuel_type).toLowerCase() === 'electric';
  const isTba = vehicle.is_tba || (!vehicle.starting_price && !vehicle.ex_showroom_price);
  const startPrice = formatPrice(vehicle.starting_price || vehicle.ex_showroom_price);
  const topPrice = formatPrice(vehicle.top_variant_price);
  const hasRange =
    startPrice && topPrice && Number(vehicle.top_variant_price) > Number(vehicle.starting_price || vehicle.ex_showroom_price);
  const imageUrl = toAppMediaUrl(vehicle.primary_image) || FALLBACK_IMAGE;
  const vehicleName = `${vehicle.brand_name || 'Car'} ${vehicle.name || ''}`.trim();
  const compact = variant === 'lineup';

  const priceLabel = isTba ? 'Status' : hasRange ? 'Ex-showroom price' : 'Starting price';
  const priceValue = isTba ? 'Price TBA' : hasRange ? `${startPrice} – ${topPrice}` : startPrice;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden border border-white/10 bg-[#1a1c20] text-white transition-all duration-300 hover:-translate-y-1.5 hover:border-[#dc2626] hover:shadow-[0_22px_40px_-18px_rgba(220,38,38,0.55)]">
      {/* Whole-card link */}
      <Link
        to={`/vehicles/${vehicle.slug}`}
        state={detailNavigationState}
        className={`absolute inset-0 z-0 ${focusRing}`}
        aria-label={`View ${vehicleName}`}
      />

      {/* ---------- Media ---------- */}
      <div
        className={`pointer-events-none relative z-10 overflow-hidden bg-gradient-to-br from-[#24272d] via-[#1a1c20] to-[#0d0e10] ${compact ? 'aspect-[16/10]' : 'aspect-[4/3]'
          }`}
      >
        {/* Slanted red panels behind the car */}
        <div
          aria-hidden="true"
          className="absolute -right-10 top-0 h-full w-2/3 -skew-x-12 bg-gradient-to-l from-[#dc2626]/25 to-transparent transition-transform duration-500 group-hover:translate-x-3"
        />
        <div aria-hidden="true" className="absolute right-6 top-0 h-full w-[3px] -skew-x-12 bg-[#dc2626]/60" />

        <img
          src={imageUrl}
          alt={vehicleName}
          loading="lazy"
          onError={handleImageError}
          className="relative h-full w-full object-contain p-4 drop-shadow-[0_18px_18px_rgba(0,0,0,0.55)] transition-transform duration-500 ease-out group-hover:translate-x-1.5 group-hover:scale-[1.05]"
        />

        {/* Tags */}
        <div className="absolute left-0 top-3 flex flex-wrap items-center gap-2">
          <span
            className="bg-[#dc2626] py-1 pl-3 pr-5 text-[10px] font-extrabold uppercase italic tracking-wider text-white"
            style={{ ...slant, ...display }}
          >
            {vehicle.brand_name || 'Brand TBA'}
          </span>
          {isEv && (
            <span
              className="inline-flex items-center gap-1 bg-emerald-500 py-1 pl-2.5 pr-4 text-[10px] font-extrabold uppercase italic tracking-wider text-[#0d0e10]"
              style={{ ...slant, ...display }}
            >
              <Zap className="h-3 w-3" aria-hidden="true" />
              EV
            </span>
          )}
        </div>
      </div>

      {/* ---------- Content ---------- */}
      <div className="pointer-events-none relative z-10 flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex-1">
          <h3
            className={`line-clamp-1 font-extrabold italic leading-none tracking-tight text-white transition-colors duration-300 group-hover:text-[#f6c945] ${compact ? 'text-2xl' : 'text-2xl sm:text-3xl'
              }`}
            style={display}
          >
            {compact ? vehicle.name || 'Unnamed vehicle' : vehicleName}
          </h3>
          <p className="mt-1.5 text-xs font-bold uppercase tracking-widest text-white/50">
            {vehicle.body_type || 'Body type TBA'}
          </p>

          <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-bold text-white/80">
            <span className="inline-flex min-h-9 items-center gap-1.5 border border-white/10 bg-white/5 px-2.5 transition-colors group-hover:border-[#dc2626]/50">
              <Fuel className="h-3.5 w-3.5 flex-none text-[#dc2626]" aria-hidden="true" />
              <span className="truncate capitalize">{vehicle.fuel_type || 'Fuel TBA'}</span>
            </span>
            <span className="inline-flex min-h-9 items-center gap-1.5 border border-white/10 bg-white/5 px-2.5 transition-colors group-hover:border-[#dc2626]/50">
              <Gauge className="h-3.5 w-3.5 flex-none text-[#dc2626]" aria-hidden="true" />
              <span className="truncate">
                {vehicle.seats ? `${vehicle.seats} Seats` : vehicle.transmission || 'Specs TBA'}
              </span>
            </span>
          </div>
        </div>

        {/* Price + actions */}
        <div className="mt-4 border-t border-white/10 pt-4">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-white/50">{priceLabel}</span>
          <div
            className={`mt-1 min-h-7 font-extrabold italic tabular-nums ${isTba ? 'text-white/50' : 'text-[#f6c945]'
              } ${compact ? 'text-lg' : 'text-xl'}`}
            style={display}
          >
            {priceValue}
          </div>

          <div className="pointer-events-auto relative z-10 mt-4 grid grid-cols-[1fr_auto] gap-2">
            <Link
              to={`/calculator?vehicle=${vehicle.id}`}
              className={`group/btn relative inline-flex h-11 items-center justify-center gap-2 overflow-hidden bg-[#dc2626] pl-3 pr-5 text-sm font-extrabold italic uppercase tracking-wide text-white transition-all duration-300 hover:bg-[#f6c945] hover:text-[#0d0e10] active:scale-[0.97] ${focusRing}`}
              style={{ ...slant, ...display }}
            >
              <span
                aria-hidden="true"
                className="absolute inset-y-0 -left-1/2 w-1/3 -skew-x-[22deg] bg-white/30 transition-all duration-700 group-hover/btn:left-[130%]"
              />
              <Calculator className="relative h-4 w-4" aria-hidden="true" />
              <span className="relative">Price breakup</span>
            </Link>
            <Link
              to={`/vehicles/${vehicle.slug}`}
              state={detailNavigationState}
              className={`group/view inline-flex h-11 w-11 items-center justify-center border border-white/20 bg-transparent text-white transition-all duration-300 hover:border-[#f6c945] hover:bg-[#f6c945] hover:text-[#0d0e10] ${focusRing}`}
              aria-label={`View ${vehicleName}`}
            >
              <ArrowUpRight className="h-5 w-5 transition-transform duration-300 group-hover/view:-translate-y-0.5 group-hover/view:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Red underline that slides in on hover */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[3px] origin-left scale-x-0 bg-[#dc2626] transition-transform duration-500 group-hover:scale-x-100"
      />
    </article>
  );
}