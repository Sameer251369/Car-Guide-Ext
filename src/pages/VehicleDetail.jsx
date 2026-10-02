import React, { useState } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api, { toAppMediaUrl } from '../api/client';
import SEOHead from '../components/SEOHead';
import {
  Car, Calculator, Fuel, ShieldCheck, Zap, ArrowLeft,
  CheckCircle2, ChevronRight, ChevronLeft, ArrowUpRight,
} from 'lucide-react';

/* Cut-corner shapes (same language as the home page) */
const CUT_LG = '[clip-path:polygon(0_0,calc(100%_-_16px)_0,100%_16px,100%_100%,16px_100%,0_calc(100%_-_16px))]';
const CUT_SM = '[clip-path:polygon(0_0,calc(100%_-_8px)_0,100%_8px,100%_100%,8px_100%,0_calc(100%_-_8px))]';
const CUT_TR = '[clip-path:polygon(0_0,calc(100%_-_18px)_0,100%_18px,100%_100%,0_100%)]';

export default function VehicleDetail() {
  const { slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const handleBackToVehicles = () => {
    if (location.state?.fromVehicles) {
      navigate(-1);
      return;
    }
    navigate('/vehicles');
  };

  const { data: vehicle, isLoading, error } = useQuery({
    queryKey: ['vehicle', slug],
    queryFn: () => api.getVehicleBySlug(slug),
  });

  // Prepare gallery data and effects before any early return so hook order stays stable
  const _images = Array.isArray(vehicle?.images) ? vehicle.images.filter(Boolean) : [];
  const validImagesPre = _images
    .filter((img) => img && img.image_url)
    .map((img) => ({ ...img, image_url: toAppMediaUrl(img.image_url) }))
    .sort((left, right) => {
      const leftIsFront = left.image_type === 'front';
      const rightIsFront = right.image_type === 'front';
      if (leftIsFront !== rightIsFront) return leftIsFront ? -1 : 1;
      if (left.is_primary !== right.is_primary) return left.is_primary ? -1 : 1;
      return (left.display_order || 0) - (right.display_order || 0);
    });
  const primaryImgPre =
    validImagesPre[0]?.image_url ||
    'data:image/svg+xml;charset=utf-8,' +
      encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><rect width="1200" height="800" fill="#fef2f2"/><text x="600" y="420" text-anchor="middle" font-size="52" fill="#b91c1c" font-family="Arial">${(vehicle?.name || 'Vehicle').replace(/&/g, '&amp;')}</text></svg>`
      );

  React.useEffect(() => {
    setSelectedImage(primaryImgPre);
  }, [slug, primaryImgPre]);

  React.useEffect(() => {
    setSelectedVariant(null);
  }, [slug]);

  const selectedImageUrl = selectedImage || primaryImgPre;

  if (isLoading) {
    return (
      <div className="min-h-[60vh] grid place-items-center bg-white text-slate-500">
        <div className="text-center">
          <div className="animate-spin w-9 h-9 border-[3px] border-red-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-xs font-semibold tracking-wide">Loading vehicle specifications…</p>
        </div>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="min-h-[60vh] grid place-items-center bg-white px-4">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-black italic text-slate-900">Vehicle not found</h2>
          <button
            type="button"
            onClick={handleBackToVehicles}
            className="inline-flex items-center gap-2 text-sm font-bold text-red-600 hover:text-red-700"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to all cars</span>
          </button>
        </div>
      </div>
    );
  }

  const specs = vehicle.key_specs || {};
  const validImages = validImagesPre;
  const variants = vehicle.variants || [];
  const imageTypeLabels = {
    front: 'Front',
    exterior: 'Side',
    interior: 'Interior',
    rear: 'Rear',
  };

  const activeIndex = Math.max(0, validImages.findIndex((img) => img.image_url === selectedImageUrl));
  const goToImage = (step) => {
    if (validImages.length < 2) return;
    const next = (activeIndex + step + validImages.length) % validImages.length;
    setSelectedImage(validImages[next].image_url);
  };

  const normalizeSpecEntries = (specMap = {}) => {
    const labelMap = {
      engine: 'Engine',
      engine_capacity: 'Engine',
      power: 'Power',
      torque: 'Torque',
      transmission: 'Transmission',
      mileage: 'Mileage',
      fuel_efficiency: 'Mileage',
      range: 'Range',
      seating: 'Seating',
      seating_capacity: 'Seating',
      seats: 'Seating',
      boot_space: 'Boot Space',
      boot: 'Boot Space',
      dimensions: 'Dimensions',
      length: 'Length',
      width: 'Width',
      height: 'Height',
      drivetrain: 'Drivetrain',
      safety: 'Safety',
      features: 'Features',
      warranty: 'Warranty',
      charging_time: 'Charging Time',
      battery: 'Battery',
      variant: 'Variant',
      body_type: 'Body Type',
    };

    return Object.entries(specMap)
      .filter(([, value]) => value !== null && value !== undefined && value !== '')
      .map(([rawKey, rawValue]) => {
        const cleanKey = String(rawKey).trim().toLowerCase().replace(/[^a-z0-9]+/g, '_');
        const label = labelMap[cleanKey] || rawKey.replace(/_/g, ' ');
        return [label, rawValue];
      });
  };

  const specEntries = normalizeSpecEntries(specs);
  const mainSpecEntries = specEntries.slice(0, 6);
  const engineValue = specs.engine || specs.engine_capacity || specs.motor || 'Responsive powertrain';
  const powerValue = specs.power || specs.output || specs.bhp || null;
  const mileageValue = specs.mileage || specs.fuel_efficiency || specs.range || null;
  const seatingValue = specs.seating || specs.seating_capacity || specs.seats || vehicle.seats || null;
  const transmissionValue = specs.transmission || vehicle.transmission || 'Automatic/Manual';
  const safetyValue = specs.safety || null;

  const buyerSummary = `${vehicle.brand?.name || 'This'} ${vehicle.name} is a ${String(vehicle.body_type || 'SUV').toLowerCase()} ${String(vehicle.fuel_type || 'petrol').toLowerCase()} model designed for ${vehicle.fuel_type === 'electric' || vehicle.fuel_type === 'Electric' ? 'efficient city and highway driving with quick charging convenience' : 'everyday use with balanced performance and practicality'}. It comes with ${engineValue} powertrain${powerValue ? `, producing ${powerValue}` : ''}${mileageValue ? ` and delivering ${mileageValue}` : ''}. The cabin is set up for ${seatingValue ? `${seatingValue} seating comfort` : 'comfortable commuting'}, with ${transmissionValue.toLowerCase()} gearing and ${safetyValue ? `${safetyValue.toLowerCase()} safety equipment` : 'a practical feature list'}.`;

  const formatRupees = (val) => `₹ ${Number(val).toLocaleString('en-IN')}`;

  const isElectric = String(vehicle.fuel_type || '').toLowerCase() === 'electric';
  const activeVariant = variants.find((v) => v.id === selectedVariant) || null;
  const displayPrice = activeVariant?.ex_showroom_price ?? vehicle.ex_showroom_price;
  const calcLink = activeVariant
    ? `/calculator?vehicle=${vehicle.id}&variant=${activeVariant.id}`
    : `/calculator?vehicle=${vehicle.id}`;

  const quickStats = [
    { icon: Zap, label: 'Powertrain', value: powerValue || engineValue },
    { icon: Fuel, label: isElectric ? 'Range' : 'Mileage', value: mileageValue },
    { icon: Car, label: 'Seating', value: seatingValue },
    { icon: ShieldCheck, label: 'Safety', value: safetyValue },
  ].filter((item) => item.value);

  return (
    <>
      <SEOHead
        title={vehicle.meta_title || `${vehicle.name} Price & Specs | Car Guide Media`}
        description={vehicle.meta_description || `Explore ${vehicle.name} variants, fuel types, key specs, and calculate on-road price.`}
      />

      <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-white via-rose-50/50 to-white pb-28 lg:pb-16 pt-8 sm:pt-12">
        {/* Decorative speed panels */}
        <div aria-hidden="true" className="pointer-events-none absolute -top-24 -right-24 h-[420px] w-[420px] -skew-x-12 bg-gradient-to-br from-red-600/10 to-transparent" />
        <div aria-hidden="true" className="pointer-events-none absolute top-40 -left-32 h-64 w-64 -skew-x-12 bg-red-600/5" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">

          {/* Back */}
          <button
            type="button"
            onClick={handleBackToVehicles}
            className="group inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-red-600 transition-colors"
          >
            <span className="grid place-items-center w-7 h-7 rounded-full bg-white border border-slate-200 group-hover:border-red-200 group-hover:-translate-x-0.5 transition-all">
              <ArrowLeft className="w-3.5 h-3.5" />
            </span>
            <span>Back to all cars</span>
          </button>

          {/* ---------- Hero grid ---------- */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">

            {/* Gallery */}
            <div className="lg:col-span-7 space-y-4">
              <div className="group relative overflow-hidden rounded-3xl bg-white border border-slate-200 shadow-[0_20px_50px_-20px_rgba(15,23,42,0.25)]">
                <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
                  <img
                    key={selectedImageUrl}
                    src={selectedImageUrl}
                    alt={vehicle.name}
                    className="w-full h-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
                  />
                  <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/35 to-transparent" />

                  {/* Tags */}
                  <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
                    <span className="bg-red-600 text-white text-[11px] font-extrabold uppercase tracking-wider px-4 py-1.5 -skew-x-12 shadow-lg shadow-red-600/30">
                      <span className="inline-block skew-x-12">{vehicle.brand?.name}</span>
                    </span>
                    {isElectric && (
                      <span className="bg-white/90 backdrop-blur text-emerald-700 text-[11px] font-extrabold uppercase tracking-wider px-3 py-1.5 -skew-x-12 border border-emerald-200">
                        <span className="inline-block skew-x-12">EV subsidized</span>
                      </span>
                    )}
                  </div>

                  {/* Prev / next */}
                  {validImages.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() => goToImage(-1)}
                        aria-label="Previous image"
                        className="absolute left-3 top-1/2 -translate-y-1/2 grid place-items-center w-10 h-10 rounded-full bg-white/90 text-slate-900 shadow-lg opacity-100 sm:opacity-0 sm:group-hover:opacity-100 hover:bg-red-600 hover:text-white transition-all"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => goToImage(1)}
                        aria-label="Next image"
                        className="absolute right-3 top-1/2 -translate-y-1/2 grid place-items-center w-10 h-10 rounded-full bg-white/90 text-slate-900 shadow-lg opacity-100 sm:opacity-0 sm:group-hover:opacity-100 hover:bg-red-600 hover:text-white transition-all"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                      <span className="absolute bottom-3 right-4 text-[11px] font-bold text-white bg-black/50 backdrop-blur px-2.5 py-1 rounded-full">
                        {activeIndex + 1} / {validImages.length}
                      </span>
                    </>
                  )}
                </div>

                {validImages.length > 1 && (
                  <div className="flex gap-3 overflow-x-auto px-4 py-4 bg-white border-t border-slate-100">
                    {validImages.map((image, index) => {
                      const active = selectedImageUrl === image.image_url;
                      return (
                        <button
                          key={`${image.id || index}-${image.image_url}`}
                          type="button"
                          onClick={() => setSelectedImage(image.image_url)}
                          className={`relative flex-shrink-0 w-24 h-16 rounded-xl overflow-hidden transition-all duration-300 ${active ? 'ring-2 ring-red-600 ring-offset-2 ring-offset-white -translate-y-0.5' : 'ring-1 ring-slate-200 opacity-75 hover:opacity-100 hover:ring-red-300'}`}
                        >
                          <img
                            src={image.image_url}
                            alt={image.alt_text || `${vehicle.name} ${imageTypeLabels[image.image_type] || `image ${index + 1}`}`}
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute inset-x-0 bottom-0 bg-slate-900/70 px-1 py-0.5 text-[9px] font-bold text-white">
                            {imageTypeLabels[image.image_type] || `Image ${index + 1}`}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Overview panel */}
            <aside className="lg:col-span-5 lg:sticky lg:top-24 rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 space-y-6 shadow-[0_20px_50px_-20px_rgba(15,23,42,0.2)]">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span aria-hidden="true" className="h-[3px] w-7 -skew-x-[30deg] bg-red-600" />
                  <span className="text-xs font-extrabold uppercase tracking-wider text-red-600">{vehicle.brand?.name}</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-black italic tracking-tight text-slate-900 leading-[1.05]">
                  {vehicle.name}
                </h1>
                <div className="flex flex-wrap gap-2 text-[11px] font-bold capitalize">
                  {[vehicle.body_type, vehicle.fuel_type, transmissionValue].filter(Boolean).map((chip) => (
                    <span key={chip} className="px-3 py-1 rounded-full bg-slate-100 text-slate-600">{chip}</span>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div className={`relative overflow-hidden p-5 bg-gradient-to-br from-red-600 to-red-700 text-white ${CUT_LG}`}>
                <div aria-hidden="true" className="absolute -right-6 -top-6 h-28 w-28 rotate-12 bg-white/10" />
                <span className="relative text-[11px] font-bold uppercase tracking-wider text-red-100">
                  {activeVariant ? `${activeVariant.variant_name} · Ex-showroom` : 'Base ex-showroom price'}
                </span>
                <div className="relative mt-1 text-3xl sm:text-4xl font-black tracking-tight tabular-nums">
                  {formatRupees(displayPrice)}
                </div>
                {activeVariant && (
                  <button
                    type="button"
                    onClick={() => setSelectedVariant(null)}
                    className="relative mt-2 text-[11px] font-bold text-red-100 underline underline-offset-4 hover:text-white"
                  >
                    Reset to base price
                  </button>
                )}
              </div>

              {/* CTA */}
              <Link
                to={calcLink}
                className={`group relative flex items-center justify-between gap-3 overflow-hidden bg-slate-900 hover:bg-red-600 text-white font-extrabold text-sm pl-5 pr-2 py-2 transition-colors duration-300 hover:-translate-y-0.5 active:scale-[0.98] ${CUT_LG}`}
              >
                <span aria-hidden="true" className="absolute inset-y-0 -left-1/2 w-1/3 -skew-x-[22deg] bg-white/30 transition-all duration-700 group-hover:left-[130%]" />
                <span className="relative flex items-center gap-2.5">
                  <Calculator className="w-5 h-5" />
                  <span>Calculate state on-road price</span>
                </span>
                <span className={`relative grid place-items-center w-11 h-11 bg-white text-red-600 transition-transform duration-300 group-hover:translate-x-0.5 ${CUT_SM}`}>
                  <ArrowUpRight className="w-5 h-5 transition-transform duration-300 group-hover:rotate-45" />
                </span>
              </Link>

              {/* Key highlights */}
              {mainSpecEntries.length > 0 && (
                <div className="space-y-3 pt-5 border-t border-slate-100">
                  <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-900">Key highlights</h3>
                  <div className="grid grid-cols-2 gap-2.5">
                    {mainSpecEntries.map(([key, val]) => (
                      <div
                        key={`${key}-${String(val)}`}
                        className="group/spec relative p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:border-red-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
                      >
                        <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wide">{key}</span>
                        <span className="text-xs font-bold text-slate-900">{String(val)}</span>
                        <span aria-hidden="true" className="absolute left-3 right-3 bottom-0 h-0.5 origin-left scale-x-0 bg-red-600 transition-transform duration-300 group-hover/spec:scale-x-100" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>

          {/* ---------- Quick stat strip ---------- */}
          {quickStats.length > 0 && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {quickStats.map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="group flex items-center gap-3 sm:gap-4 p-4 rounded-2xl bg-white border border-slate-200 hover:border-red-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                >
                  <span className={`grid place-items-center w-11 h-11 flex-none bg-red-50 text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors duration-300 ${CUT_SM}`}>
                    <Icon className="w-5 h-5" />
                  </span>
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</div>
                    <div className="text-sm font-extrabold text-slate-900 truncate">{String(value)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ---------- Overview ---------- */}
          <section className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="flex items-center gap-2">
              <span aria-hidden="true" className="h-[3px] w-7 -skew-x-[30deg] bg-red-600" />
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-red-600">Vehicle overview</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black italic tracking-tight text-slate-900">{vehicle.name} at a glance</h2>

            <div className="space-y-4 text-sm leading-7 text-slate-600 max-w-3xl">
              {(vehicle.description || buyerSummary).split('\n\n').map((paragraph, pIdx) => (
                <p key={pIdx}>{paragraph}</p>
              ))}
            </div>

            {mainSpecEntries.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {mainSpecEntries.map(([key, value]) => (
                  <div
                    key={`${key}-detail`}
                    className={`relative p-4 bg-slate-50 border-l-4 border-red-600 hover:bg-red-50/60 transition-colors ${CUT_TR}`}
                  >
                    <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">{key}</div>
                    <div className="mt-1.5 text-sm font-extrabold text-slate-900">{String(value)}</div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ---------- Variants ---------- */}
          {variants.length > 0 && (
            <section className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h3 className="text-2xl font-black italic tracking-tight text-slate-900">Available variants &amp; trims</h3>
                  <p className="text-xs text-slate-500 mt-1">Pick a variant to update the price above, then open its on-road tax breakdown.</p>
                </div>
                <span className="text-[11px] font-bold text-slate-400">{variants.length} trims</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {variants.map((varItem) => {
                  const active = selectedVariant === varItem.id;
                  return (
                    <div
                      key={varItem.id}
                      className={`group relative flex flex-col rounded-2xl border transition-all duration-300 overflow-hidden ${active ? 'border-red-600 bg-red-50/50 shadow-lg shadow-red-600/10 -translate-y-0.5' : 'border-slate-200 bg-white hover:border-red-300 hover:shadow-lg hover:-translate-y-1'}`}
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedVariant(active ? null : varItem.id)}
                        aria-pressed={active}
                        className="text-left p-5 space-y-3 flex-1"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="font-extrabold text-slate-900 leading-tight">{varItem.variant_name}</div>
                          <span className={`grid place-items-center w-6 h-6 rounded-full flex-none transition-colors ${active ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-300 group-hover:text-red-400'}`}>
                            <CheckCircle2 className="w-4 h-4" />
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 text-[11px] font-bold capitalize">
                          <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">{varItem.fuel_type || vehicle.fuel_type}</span>
                          {varItem.transmission && (
                            <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">{varItem.transmission}</span>
                          )}
                        </div>
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Ex-showroom</div>
                          <div className="text-xl font-black text-red-600 tabular-nums">{formatRupees(varItem.ex_showroom_price)}</div>
                        </div>
                      </button>

                      <Link
                        to={`/calculator?vehicle=${vehicle.id}&variant=${varItem.id}`}
                        className="flex items-center justify-between px-5 py-3 text-xs font-extrabold text-slate-900 bg-slate-50 group-hover:bg-red-600 group-hover:text-white border-t border-slate-100 group-hover:border-red-600 transition-colors duration-300"
                      >
                        <span>Calculate on-road</span>
                        <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </Link>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        {/* ---------- Mobile sticky price bar ---------- */}
        <div className="lg:hidden fixed inset-x-0 bottom-0 z-40 bg-white/90 backdrop-blur-xl border-t border-slate-200 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 truncate">
                {activeVariant ? activeVariant.variant_name : 'Ex-showroom from'}
              </div>
              <div className="text-lg font-black text-slate-900 tabular-nums truncate">{formatRupees(displayPrice)}</div>
            </div>
            <Link
              to={calcLink}
              className={`flex-none inline-flex items-center gap-2 bg-red-600 active:bg-red-700 text-white text-sm font-extrabold px-5 py-3 ${CUT_SM}`}
            >
              <Calculator className="w-4 h-4" />
              <span>On-road price</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}