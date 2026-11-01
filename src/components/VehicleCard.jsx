import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowUpRight, Calculator, Fuel, Gauge, Zap } from 'lucide-react';
import { toAppMediaUrl } from '../api/client';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=900';

/* Tokens: ink #0a0e13 · panel #11161d · sodium #ffb224 */
const wide = { fontFamily: "'Archivo','Arial Black',system-ui,sans-serif", fontStretch: '125%' };
const body = { fontFamily: "'Hanken Grotesk','Inter',system-ui,sans-serif" };

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffb224] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0e13]';

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
    <article
      style={body}
      className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#11161d] text-white transition-colors duration-300 hover:border-[#ffb224]/70"
    >
      {/* Whole-card link */}
      <Link
        to={`/vehicles/${vehicle.slug}`}
        state={detailNavigationState}
        className={`absolute inset-0 z-0 rounded-3xl ${focusRing}`}
        aria-label={`View ${vehicleName}`}
      />

      {/* ---------- Media ---------- */}
      <div
        className={`pointer-events-none relative z-10 overflow-hidden bg-[radial-gradient(ellipse_at_50%_100%,#2a3340,#0f141a_70%)] ${
          compact ? 'aspect-[16/10]' : 'aspect-[4/3]'
        }`}
      >
        {/* soft floor glow under the car */}
        <div
          aria-hidden="true"
          className="absolute inset-x-8 bottom-3 h-6 rounded-[50%] bg-black/50 blur-xl"
        />

        <img
          src={imageUrl}
          alt={vehicleName}
          loading="lazy"
          onError={handleImageError}
          className="relative h-full w-full object-contain p-4 drop-shadow-[0_18px_18px_rgba(0,0,0,0.5)] motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-out motion-safe:group-hover:scale-[1.05]"
        />

        {/* Tags */}
        <div className="absolute left-4 top-4 flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-white/20 bg-black/30 px-3 py-1 text-xs font-semibold text-white backdrop-blur-xl">
            {vehicle.brand_name || 'Brand TBA'}
          </span>
          {isEv && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400 px-2.5 py-1 text-xs font-bold text-[#0a0e13]">
              <Zap className="h-3 w-3" aria-hidden="true" />
              EV
            </span>
          )}
        </div>
      </div>

      {/* ---------- Content ---------- */}
      <div className="pointer-events-none relative z-10 flex flex-1 flex-col p-5">
        <div className="flex-1">
          <h3
            className={`line-clamp-1 font-extrabold leading-tight tracking-[-0.02em] text-white ${
              compact ? 'text-xl' : 'text-xl sm:text-2xl'
            }`}
            style={wide}
          >
            {compact ? vehicle.name || 'Unnamed vehicle' : vehicleName}
          </h3>
          <p className="mt-1.5 text-sm text-white/55">{vehicle.body_type || 'Body type TBA'}</p>

          <div className="mt-4 flex flex-wrap gap-2 text-sm text-white/80">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1">
              <Fuel className="h-3.5 w-3.5 flex-none text-[#ffb224]" aria-hidden="true" />
              <span className="capitalize">{vehicle.fuel_type || 'Fuel TBA'}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1">
              <Gauge className="h-3.5 w-3.5 flex-none text-[#ffb224]" aria-hidden="true" />
              <span>{vehicle.seats ? `${vehicle.seats} seats` : vehicle.transmission || 'Specs TBA'}</span>
            </span>
          </div>
        </div>

        {/* Price + actions */}
        <div className="mt-5 border-t border-white/10 pt-4">
          <span className="text-xs text-white/55">{priceLabel}</span>
          <div
            className={`mt-1 min-h-7 font-bold tabular-nums leading-tight ${
              isTba ? 'text-white/50' : 'text-white'
            } ${compact ? 'text-lg' : 'text-xl'}`}
            style={wide}
          >
            {priceValue}
          </div>

          <div className="pointer-events-auto relative z-10 mt-4 grid grid-cols-[1fr_auto] gap-2">
            <Link
              to={`/calculator?vehicle=${vehicle.id}`}
              className={`inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#ffb224] px-5 text-sm font-bold text-[#0a0e13] transition-colors duration-200 hover:bg-white active:scale-[0.98] ${focusRing}`}
            >
              <Calculator className="h-4 w-4" aria-hidden="true" />
              Price breakup
            </Link>
            <Link
              to={`/vehicles/${vehicle.slug}`}
              state={detailNavigationState}
              className={`inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-white transition-colors duration-200 hover:border-[#ffb224] hover:bg-[#ffb224] hover:text-[#0a0e13] ${focusRing}`}
              aria-label={`View ${vehicleName}`}
            >
              <ArrowUpRight className="h-5 w-5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}