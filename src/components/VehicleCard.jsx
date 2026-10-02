import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Calculator, ChevronRight, Fuel, Gauge, Zap } from 'lucide-react';
import { toAppMediaUrl } from '../api/client';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=900';

/* Cut-corner shape (same language as the other pages) */
const CUT_SM = '[clip-path:polygon(0_0,calc(100%_-_8px)_0,100%_8px,100%_100%,8px_100%,0_calc(100%_-_8px))]';

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
  const hasRange = startPrice && topPrice && Number(vehicle.top_variant_price) > Number(vehicle.starting_price || vehicle.ex_showroom_price);
  const imageUrl = toAppMediaUrl(vehicle.primary_image) || FALLBACK_IMAGE;
  const vehicleName = `${vehicle.brand_name || 'Car'} ${vehicle.name || ''}`.trim();
  const compact = variant === 'lineup';

  const priceLabel = isTba ? 'Status' : hasRange ? 'Ex-showroom price' : 'Starting price';
  const priceValue = isTba ? 'Price TBA' : hasRange ? `${startPrice} – ${topPrice}` : startPrice;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-red-300 hover:shadow-[0_22px_40px_-18px_rgba(220,38,38,0.35)]">
      {/* Whole-card link */}
      <Link
        to={`/vehicles/${vehicle.slug}`}
        state={detailNavigationState}
        className="absolute inset-0 z-0"
        aria-label={`View ${vehicleName}`}
      />

      {/* ---------- Media ---------- */}
      <div className={`pointer-events-none relative z-10 overflow-hidden bg-gradient-to-br from-slate-50 via-white to-rose-50 ${compact ? 'aspect-[16/10]' : 'aspect-[4/3]'}`}>
        {/* Diagonal red panel behind the car */}
        <div aria-hidden="true" className="absolute -right-10 top-0 h-full w-2/3 -skew-x-12 bg-gradient-to-l from-red-600/10 to-transparent transition-transform duration-500 group-hover:translate-x-3" />
        <div aria-hidden="true" className="absolute right-6 top-0 h-full w-[3px] -skew-x-12 bg-red-600/30" />

        <img
          src={imageUrl}
          alt={vehicleName}
          loading="lazy"
          onError={handleImageError}
          className="relative h-full w-full object-contain p-4 transition-transform duration-500 ease-out group-hover:translate-x-1.5 group-hover:scale-[1.05]"
        />

        {/* Tags */}
        <div className="absolute left-3 top-3 flex flex-wrap items-center gap-2">
          <span className="-skew-x-12 bg-red-600 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-md shadow-red-600/25">
            <span className="inline-block skew-x-12">{vehicle.brand_name || 'Brand TBA'}</span>
          </span>
          {isEv && (
            <span className="inline-flex -skew-x-12 items-center bg-emerald-600 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white">
              <span className="inline-flex skew-x-12 items-center gap-1">
                <Zap className="h-3 w-3" aria-hidden="true" />
                EV
              </span>
            </span>
          )}
        </div>
      </div>

      {/* ---------- Content ---------- */}
      <div className="pointer-events-none relative z-10 flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex-1">
          <h3 className={`line-clamp-1 font-black italic tracking-tight text-slate-950 transition-colors duration-300 group-hover:text-red-600 ${compact ? 'text-lg' : 'text-lg sm:text-xl'}`}>
            {compact ? (vehicle.name || 'Unnamed vehicle') : vehicleName}
          </h3>
          <p className="mt-0.5 text-xs font-bold uppercase tracking-wider text-slate-400">
            {vehicle.body_type || 'Body type TBA'}
          </p>

          <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-bold text-slate-600">
            <span className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 ring-1 ring-slate-100 transition-colors group-hover:bg-red-50/60 group-hover:ring-red-100">
              <Fuel className="h-3.5 w-3.5 flex-none text-red-600" aria-hidden="true" />
              <span className="truncate capitalize">{vehicle.fuel_type || 'Fuel TBA'}</span>
            </span>
            <span className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 ring-1 ring-slate-100 transition-colors group-hover:bg-red-50/60 group-hover:ring-red-100">
              <Gauge className="h-3.5 w-3.5 flex-none text-red-600" aria-hidden="true" />
              <span className="truncate">{vehicle.seats ? `${vehicle.seats} Seats` : vehicle.transmission || 'Specs TBA'}</span>
            </span>
          </div>
        </div>

        {/* Price + actions */}
        <div className="mt-4 border-t border-slate-100 pt-4">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">{priceLabel}</span>
          <div className={`mt-1 min-h-7 font-black tabular-nums ${isTba ? 'text-slate-500' : 'text-red-600'} ${compact ? 'text-base' : 'text-lg'}`}>
            {priceValue}
          </div>

          <div className="pointer-events-auto relative z-10 mt-4 grid grid-cols-[1fr_auto] gap-2">
            <Link
              to={`/calculator?vehicle=${vehicle.id}`}
              className={`group/btn relative inline-flex h-11 items-center justify-center gap-2 overflow-hidden bg-slate-900 px-3 text-sm font-extrabold text-white transition-all duration-300 hover:bg-red-600 active:scale-[0.97] ${CUT_SM}`}
            >
              <span aria-hidden="true" className="absolute inset-y-0 -left-1/2 w-1/3 -skew-x-[22deg] bg-white/30 transition-all duration-700 group-hover/btn:left-[130%]" />
              <Calculator className="relative h-4 w-4" aria-hidden="true" />
              <span className="relative">Price breakup</span>
            </Link>
            <Link
              to={`/vehicles/${vehicle.slug}`}
              state={detailNavigationState}
              className="group/view inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition-all duration-300 hover:border-red-600 hover:bg-red-600 hover:text-white"
              aria-label={`View ${vehicleName}`}
            >
              <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover/view:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Red underline that slides in on hover */}
      <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[3px] origin-left scale-x-0 bg-red-600 transition-transform duration-500 group-hover:scale-x-100" />
    </article>
  );
}