import React from 'react';
import { Link } from 'react-router-dom';
import { Calculator, ChevronRight, Fuel, Gauge, Zap } from 'lucide-react';
import { toAppMediaUrl } from '../api/client';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=900';

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
  const isEv = vehicle.ev_hybrid_cng_flag === 'EV' || String(vehicle.fuel_type).toLowerCase() === 'electric';
  const isTba = vehicle.is_tba || (!vehicle.starting_price && !vehicle.ex_showroom_price);
  const startPrice = formatPrice(vehicle.starting_price || vehicle.ex_showroom_price);
  const topPrice = formatPrice(vehicle.top_variant_price);
  const hasRange = startPrice && topPrice && Number(vehicle.top_variant_price) > Number(vehicle.starting_price || vehicle.ex_showroom_price);
  const imageUrl = toAppMediaUrl(vehicle.primary_image) || FALLBACK_IMAGE;
  const vehicleName = `${vehicle.brand_name || 'Car'} ${vehicle.name || ''}`.trim();

  if (variant === 'lineup') {
    return (
      <article className="cg-lineup-item">
        <div className="cg-lineup-item__media">
          <img src={imageUrl} alt={vehicleName} loading="lazy" onError={handleImageError} />
        </div>
        <div className="cg-lineup-item__content">
          <div className="cg-lineup-item__heading">
            <div>
              <span className="cg-lineup-item__brand">{vehicle.brand_name || 'Brand TBA'}</span>
              <h3><Link to={`/vehicles/${vehicle.slug}`}>{vehicle.name || 'Unnamed vehicle'}</Link></h3>
              <p>{vehicle.body_type || 'Body type TBA'}</p>
            </div>
            {isEv && (
              <span className="cg-lineup-item__ev">
                <Zap aria-hidden="true" />
                EV
              </span>
            )}
          </div>

          <div className="cg-lineup-item__specs">
            <span><Fuel aria-hidden="true" />{vehicle.fuel_type || 'Fuel TBA'}</span>
            <span><Gauge aria-hidden="true" />{vehicle.seats ? `${vehicle.seats} Seats` : vehicle.transmission || 'Specs TBA'}</span>
          </div>

          <div className="cg-lineup-item__footer">
            <div className="cg-lineup-item__price">
              <span>{isTba ? 'Status' : hasRange ? 'Ex-showroom price' : 'Starting price'}</span>
              <strong>{isTba ? 'Price TBA' : hasRange ? `${startPrice} – ${topPrice}` : startPrice}</strong>
            </div>
            <div className="cg-lineup-item__actions">
              <Link to={`/calculator?vehicle=${vehicle.id}`} className="cg-primary-action cg-primary-action--small">
                <Calculator aria-hidden="true" />
                <span>Price breakup</span>
              </Link>
              <Link to={`/vehicles/${vehicle.slug}`} className="cg-vehicle-detail-link" aria-label={`View ${vehicleName}`}>
                <span>View car</span>
                <ChevronRight aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-red-200 hover:shadow-lg">
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 p-3 sm:p-4">
        <img
          src={imageUrl}
          alt={vehicleName}
          className="h-full w-full object-contain transition duration-500 group-hover:scale-[1.02]"
          loading="lazy"
          onError={handleImageError}
        />
        <div className="absolute left-3 top-3 flex gap-2">
          <span className="rounded bg-white/95 px-2 py-1 text-[11px] font-bold uppercase text-slate-700 shadow-sm">
            {vehicle.brand_name}
          </span>
          {isEv && (
            <span className="inline-flex items-center gap-1 rounded bg-emerald-600 px-2 py-1 text-[11px] font-bold uppercase text-white">
              <Zap className="h-3 w-3" />
              EV
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex-1">
          <h3 className="line-clamp-1 text-base font-bold text-slate-950">{vehicleName}</h3>
          <p className="mt-1 text-sm font-semibold text-slate-500">{vehicle.body_type}</p>

          <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-600">
            <span className="inline-flex min-h-9 items-center gap-1.5 rounded-md bg-slate-50 px-2">
              <Fuel className="h-3.5 w-3.5 text-red-600" />
              {vehicle.fuel_type || 'Fuel TBA'}
            </span>
            <span className="inline-flex min-h-9 items-center gap-1.5 rounded-md bg-slate-50 px-2">
              <Gauge className="h-3.5 w-3.5 text-red-600" />
              {vehicle.seats ? `${vehicle.seats} Seats` : vehicle.transmission || 'Specs TBA'}
            </span>
          </div>
        </div>

        <div className="mt-4 border-t border-slate-100 pt-4">
          <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
            {isTba ? 'Status' : hasRange ? 'Ex-showroom price' : 'Starting price'}
          </span>
          <div className="mt-1 min-h-7 text-lg font-black text-slate-950">
            {isTba ? 'Price TBA' : hasRange ? `${startPrice} - ${topPrice}` : startPrice}
          </div>
          <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
            <Link
              to={`/calculator?vehicle=${vehicle.id}`}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-red-600 px-3 py-2 text-sm font-bold text-white transition hover:bg-red-700"
            >
              <Calculator className="h-4 w-4" />
              Price Breakup
            </Link>
            <Link
              to={`/vehicles/${vehicle.slug}`}
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 text-slate-700 transition hover:border-red-200 hover:text-red-700"
              aria-label={`View ${vehicleName}`}
            >
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
