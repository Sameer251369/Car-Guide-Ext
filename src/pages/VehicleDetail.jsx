import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api, { toAppMediaUrl } from '../api/client';
import SEOHead from '../components/SEOHead';
import {
  Car, Calculator, Fuel, ShieldCheck, Zap, ArrowLeft,
  CheckCircle2, ChevronRight, ChevronLeft, ArrowUpRight,
} from 'lucide-react';

const CUT_LG = '[clip-path:polygon(0_0,calc(100%_-_16px)_0,100%_16px,100%_100%,16px_100%,0_calc(100%_-_16px))]';
const CUT_SM = '[clip-path:polygon(0_0,calc(100%_-_8px)_0,100%_8px,100%_100%,8px_100%,0_calc(100%_-_8px))]';
const textureStyle = {
  backgroundImage: `
    repeating-linear-gradient(135deg, transparent 0, transparent 5px, rgba(255,255,255,.025) 5px, rgba(255,255,255,.025) 6px),
    radial-gradient(ellipse at 80% 0%, rgba(220,38,38,.18), transparent 42%),
    linear-gradient(135deg, #111216 0%, #090a0c 65%, #151619 100%)
  `,
};

const formatRupees = (value) => {
  const amount = Number(value);
  return Number.isFinite(amount) ? `₹ ${amount.toLocaleString('en-IN')}` : 'Price unavailable';
};

function normalizeSpecEntries(specMap = {}) {
  const labels = {
    engine: 'Engine', engine_capacity: 'Engine', power: 'Power', output: 'Power',
    bhp: 'Power', torque: 'Torque', transmission: 'Transmission', mileage: 'Mileage',
    fuel_efficiency: 'Mileage', range: 'Range', seating: 'Seating',
    seating_capacity: 'Seating', seats: 'Seating', boot_space: 'Boot Space',
    boot: 'Boot Space', dimensions: 'Dimensions', length: 'Length', width: 'Width',
    height: 'Height', drivetrain: 'Drivetrain', safety: 'Safety', features: 'Features',
    warranty: 'Warranty', charging_time: 'Charging Time', battery: 'Battery',
    variant: 'Variant', body_type: 'Body Type',
  };

  return Object.entries(specMap)
    .filter(([, value]) => value !== null && value !== undefined && value !== '')
    .map(([key, value]) => {
      const normalized = key.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_');
      return [labels[normalized] || key.replace(/_/g, ' '), value];
    });
}

export default function VehicleDetail() {
  const { slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const { data: vehicle, isLoading, error } = useQuery({
    queryKey: ['vehicle', slug],
    queryFn: () => api.getVehicleBySlug(slug),
  });

  const images = useMemo(() => {
    const source = Array.isArray(vehicle?.images) ? vehicle.images : [];
    return source
      .filter((image) => image?.image_url)
      .map((image) => ({ ...image, image_url: toAppMediaUrl(image.image_url) }))
      .sort((a, b) => {
        if ((a.image_type === 'front') !== (b.image_type === 'front')) {
          return a.image_type === 'front' ? -1 : 1;
        }
        if (a.is_primary !== b.is_primary) return a.is_primary ? -1 : 1;
        return (a.display_order || 0) - (b.display_order || 0);
      });
  }, [vehicle?.images]);

  const fallbackImage = useMemo(() => {
    const name = String(vehicle?.name || 'Vehicle').replace(/[<>&"]/g, '');
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#202126"/><stop offset="1" stop-color="#08090b"/></linearGradient></defs><rect width="1200" height="800" fill="url(#g)"/><path d="M0 610 L1200 400 L1200 800 L0 800Z" fill="#dc2626" opacity=".18"/><text x="600" y="420" text-anchor="middle" font-size="52" fill="#f6c945" font-family="Arial">${name}</text></svg>`
    )}`;
  }, [vehicle?.name]);

  useEffect(() => {
    setSelectedImage(images[0]?.image_url || fallbackImage);
  }, [slug, images, fallbackImage]);

  useEffect(() => {
    setSelectedVariant(null);
  }, [slug]);

  const handleBackToVehicles = () => {
    if (location.state?.fromVehicles) {
      navigate(-1);
    } else {
      navigate('/vehicles');
    }
  };

  if (isLoading) {
    return (
      <div className="grid min-h-[60vh] place-items-center bg-[#0b0c0e] text-white" style={textureStyle}>
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin border-[3px] border-[#dc2626] border-t-transparent" />
          <p className="text-xs font-bold uppercase tracking-[.2em] text-white/55">Loading vehicle specs</p>
        </div>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="grid min-h-[60vh] place-items-center bg-[#0b0c0e] px-4 text-white" style={textureStyle}>
        <div className="space-y-4 text-center">
          <p className="text-xs font-black uppercase tracking-[.25em] text-[#dc2626]">404 · Vehicle unavailable</p>
          <h2 className="text-3xl font-black italic">We couldn't find this car.</h2>
          <button onClick={handleBackToVehicles} className="inline-flex items-center gap-2 text-sm font-bold text-[#f6c945] hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Back to all cars
          </button>
        </div>
      </div>
    );
  }

  const specs = vehicle.key_specs || {};
  const variants = vehicle.variants || [];
  const specEntries = normalizeSpecEntries(specs);
  const mainSpecs = specEntries.slice(0, 6);
  const activeIndex = Math.max(0, images.findIndex((image) => image.image_url === selectedImage));
  const selectedImageUrl = selectedImage || images[0]?.image_url || fallbackImage;
  const isElectric = String(vehicle.fuel_type || '').toLowerCase() === 'electric';
  const engineValue = specs.engine || specs.engine_capacity || specs.motor || 'Not specified';
  const powerValue = specs.power || specs.output || specs.bhp;
  const mileageValue = specs.mileage || specs.fuel_efficiency || specs.range;
  const seatingValue = specs.seating || specs.seating_capacity || specs.seats || vehicle.seats;
  const transmissionValue = specs.transmission || vehicle.transmission || 'Not specified';
  const safetyValue = specs.safety;
  const activeVariant = variants.find((variant) => variant.id === selectedVariant) || null;
  const displayPrice = activeVariant?.ex_showroom_price ?? vehicle.ex_showroom_price;
  const calcLink = activeVariant
    ? `/calculator?vehicle=${vehicle.id}&variant=${activeVariant.id}`
    : `/calculator?vehicle=${vehicle.id}`;
  const quickStats = [
    { icon: Zap, label: 'Powertrain', value: powerValue || engineValue },
    { icon: Fuel, label: isElectric ? 'Driving range' : 'Mileage', value: mileageValue },
    { icon: Car, label: 'Seating', value: seatingValue },
    { icon: ShieldCheck, label: 'Safety', value: safetyValue },
  ].filter((item) => item.value !== null && item.value !== undefined && item.value !== '');

  const imageLabels = { front: 'Front', exterior: 'Exterior', interior: 'Interior', rear: 'Rear' };
  const goToImage = (step) => {
    if (images.length < 2) return;
    const next = (activeIndex + step + images.length) % images.length;
    setSelectedImage(images[next].image_url);
  };

  const buyerSummary = `${vehicle.brand?.name || 'This'} ${vehicle.name} is a ${String(vehicle.body_type || 'vehicle').toLowerCase()} with a ${String(vehicle.fuel_type || 'specified').toLowerCase()} powertrain. ${powerValue ? `Power output is listed as ${powerValue}. ` : ''}${mileageValue ? `${isElectric ? 'Driving range' : 'Mileage'} is listed as ${mileageValue}. ` : ''}${seatingValue ? `It offers seating for ${seatingValue}. ` : ''}${transmissionValue !== 'Not specified' ? `Transmission: ${transmissionValue}.` : ''}`;

  return (
    <>
      <SEOHead
        title={vehicle.meta_title || `${vehicle.name} Price & Specs | Car Guide Media`}
        description={vehicle.meta_description || `Explore ${vehicle.name} variants, fuel types, specifications and calculate its on-road price.`}
      />

      <main className="min-h-screen overflow-hidden bg-[#0b0c0e] pb-28 pt-5 text-white lg:pb-16 sm:pt-8" style={textureStyle}>
        <div aria-hidden="true" className="pointer-events-none absolute left-0 right-0 top-0 h-[420px] bg-gradient-to-b from-red-950/20 to-transparent" />
        <div className="relative mx-auto max-w-7xl space-y-7 px-4 sm:space-y-9 sm:px-6 lg:px-8">
          <button onClick={handleBackToVehicles} className="group inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-white/50 transition-colors hover:text-[#f6c945]">
            <span className="grid h-8 w-8 place-items-center border border-white/10 bg-white/[0.03] transition-all group-hover:-translate-x-1 group-hover:border-[#dc2626]">
              <ArrowLeft className="h-4 w-4" />
            </span>
            Back to all cars
          </button>

          <section className="grid items-start gap-5 lg:grid-cols-12 lg:gap-7">
            {/* Vehicle gallery */}
            <div className="space-y-3 lg:col-span-7">
              <div className="group relative overflow-hidden border border-white/10 bg-[#151619] shadow-[0_25px_80px_rgba(0,0,0,.4)]">
                <div className="relative aspect-[16/10] overflow-hidden bg-[#17181b]">
                  <img
                    key={selectedImageUrl}
                    src={selectedImageUrl}
                    alt={vehicle.name}
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.025]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/25" />
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-[#dc2626] via-[#f6c945] to-transparent" />
                  <div className="absolute left-4 top-4 flex flex-wrap gap-2 sm:left-6 sm:top-6">
                    <span className={`bg-[#dc2626] px-4 py-2 text-[10px] font-black uppercase tracking-[.18em] text-white ${CUT_SM}`}>
                      {vehicle.brand?.name || 'Car Guide'}
                    </span>
                    {isElectric && (
                      <span className={`border border-emerald-300/30 bg-black/60 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-emerald-300 backdrop-blur ${CUT_SM}`}>
                        Electric
                      </span>
                    )}
                  </div>
                  <div className="absolute bottom-5 left-5 right-5 sm:bottom-7 sm:left-7">
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-[.25em] text-[#f6c945]">Vehicle profile</p>
                    <h1 className="max-w-xl text-3xl font-black italic uppercase leading-[.95] tracking-tight sm:text-5xl">{vehicle.name}</h1>
                  </div>
                  {images.length > 1 && (
                    <>
                      <button type="button" onClick={() => goToImage(-1)} aria-label="Previous image" className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center border border-white/20 bg-black/55 text-white backdrop-blur transition hover:border-[#f6c945] hover:bg-[#dc2626]">
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button type="button" onClick={() => goToImage(1)} aria-label="Next image" className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center border border-white/20 bg-black/55 text-white backdrop-blur transition hover:border-[#f6c945] hover:bg-[#dc2626]">
                        <ChevronRight className="h-5 w-5" />
                      </button>
                      <span className="absolute bottom-4 right-4 bg-black/60 px-3 py-1.5 text-[10px] font-bold tracking-widest text-white backdrop-blur">{activeIndex + 1} / {images.length}</span>
                    </>
                  )}
                </div>

                {images.length > 1 && (
                  <div className="flex gap-3 overflow-x-auto border-t border-white/10 bg-black/20 p-3 sm:p-4">
                    {images.map((image, index) => {
                      const active = selectedImageUrl === image.image_url;
                      return (
                        <button
                          key={`${image.id || index}-${image.image_url}`}
                          type="button"
                          onClick={() => setSelectedImage(image.image_url)}
                          aria-label={`Show ${imageLabels[image.image_type] || `image ${index + 1}`}`}
                          aria-pressed={active}
                          className={`relative h-16 w-24 shrink-0 overflow-hidden border transition-all ${active ? 'border-[#f6c945] opacity-100' : 'border-white/10 opacity-55 hover:opacity-100'}`}
                        >
                          <img src={image.image_url} alt={image.alt_text || `${vehicle.name} ${imageLabels[image.image_type] || `image ${index + 1}`}`} className="h-full w-full object-cover" />
                          {active && <span className="absolute inset-x-0 bottom-0 h-[3px] bg-[#dc2626]" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {quickStats.length > 0 && (
                <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                  {quickStats.map(({ icon: Icon, label, value }) => (
                    <div key={label} className="group flex min-w-0 items-center gap-3 border border-white/10 bg-white/[0.035] p-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#dc2626]/60 hover:bg-white/[0.06] sm:p-4">
                      <span className={`grid h-10 w-10 shrink-0 place-items-center bg-[#dc2626]/15 text-[#f6c945] ${CUT_SM}`}>
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-[9px] font-bold uppercase tracking-[.15em] text-white/40">{label}</p>
                        <p className="mt-1 truncate text-xs font-extrabold text-white sm:text-sm">{String(value)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Vehicle summary and price */}
            <aside className="space-y-5 border border-white/10 bg-[#111216]/90 p-5 shadow-[0_25px_80px_rgba(0,0,0,.25)] sm:p-7 lg:sticky lg:top-24 lg:col-span-5">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="h-[3px] w-8 -skew-x-[30deg] bg-[#dc2626]" />
                  <span className="text-[10px] font-black uppercase tracking-[.22em] text-[#f6c945]">{vehicle.brand?.name || 'Vehicle details'}</span>
                </div>
                <h2 className="text-3xl font-black italic uppercase leading-none tracking-tight sm:text-4xl">{vehicle.name}</h2>
                <div className="flex flex-wrap gap-2">
                  {[vehicle.body_type, vehicle.fuel_type, transmissionValue !== 'Not specified' ? transmissionValue : null].filter(Boolean).map((chip) => (
                    <span key={chip} className="border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] font-bold capitalize tracking-wide text-white/65">{chip}</span>
                  ))}
                </div>
              </div>

              <div className={`relative overflow-hidden border border-red-400/20 bg-gradient-to-br from-[#b91c1c] via-[#dc2626] to-[#7f1d1d] p-5 sm:p-6 ${CUT_LG}`}>
                <div aria-hidden="true" className="absolute -right-5 -top-8 h-32 w-32 rotate-12 border-[18px] border-white/[0.06]" />
                <p className="relative text-[10px] font-extrabold uppercase tracking-[.18em] text-red-100">
                  {activeVariant ? `${activeVariant.variant_name} · Ex-showroom` : 'Base ex-showroom price'}
                </p>
                <p className="relative mt-2 text-3xl font-black tracking-tight tabular-nums sm:text-4xl">{formatRupees(displayPrice)}</p>
                <p className="relative mt-2 text-[10px] font-medium text-white/70">Final on-road price varies by state, insurance and registration.</p>
                {activeVariant && (
                  <button type="button" onClick={() => setSelectedVariant(null)} className="relative mt-3 text-[11px] font-bold text-white underline underline-offset-4 hover:text-[#f6c945]">Reset to base price</button>
                )}
              </div>

              <Link to={calcLink} className={`group relative flex items-center justify-between gap-3 overflow-hidden bg-[#f6c945] px-4 py-3 font-black text-[#101114] transition-all duration-300 hover:-translate-y-0.5 hover:bg-white active:scale-[.98] ${CUT_LG}`}>
                <span aria-hidden="true" className="absolute inset-y-0 -left-1/2 w-1/3 -skew-x-[22deg] bg-white/50 transition-all duration-700 group-hover:left-[130%]" />
                <span className="relative flex items-center gap-3 text-xs uppercase tracking-wide sm:text-sm"><Calculator className="h-5 w-5" /> Calculate state on-road price</span>
                <span className={`relative grid h-10 w-10 shrink-0 place-items-center bg-[#111216] text-[#f6c945] ${CUT_SM}`}><ArrowUpRight className="h-5 w-5 transition-transform group-hover:rotate-45" /></span>
              </Link>

              {mainSpecs.length > 0 && (
                <div className="space-y-3 border-t border-white/10 pt-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-black uppercase tracking-[.2em] text-white/75">Key specifications</h3>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-white/30">At a glance</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {mainSpecs.map(([label, value]) => (
                      <div key={`${label}-${String(value)}`} className="border border-white/[0.07] bg-white/[0.025] p-3 transition-colors hover:border-red-500/40">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-white/40">{label}</p>
                        <p className="mt-1 break-words text-xs font-extrabold text-white">{String(value)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </section>

          {/* Vehicle overview */}
          <section className="border border-white/10 bg-[#111216]/90 p-5 sm:p-8">
            <div className="mb-5 flex items-center gap-3">
              <span className="h-8 w-1 bg-[#dc2626]" />
              <div>
                <p className="text-[9px] font-black uppercase tracking-[.25em] text-[#f6c945]">The details</p>
                <h2 className="mt-1 text-2xl font-black italic uppercase tracking-tight sm:text-3xl">{vehicle.name} <span className="text-white/45">at a glance</span></h2>
              </div>
            </div>
            <div className="max-w-4xl space-y-4 text-sm leading-7 text-white/60">
              {(vehicle.description || buyerSummary).split('\n\n').map((paragraph, index) => <p key={index}>{paragraph}</p>)}
            </div>

            {mainSpecs.length > 0 && (
              <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {mainSpecs.map(([label, value]) => (
                  <div key={`${label}-detail`} className={`border-l-[3px] border-[#dc2626] bg-white/[0.035] p-4 transition-colors hover:bg-white/[0.06] ${CUT_SM}`}>
                    <p className="text-[9px] font-bold uppercase tracking-[.18em] text-white/40">{label}</p>
                    <p className="mt-2 break-words text-sm font-extrabold text-white">{String(value)}</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Available variants */}
          {variants.length > 0 && (
            <section className="space-y-5 border border-white/10 bg-[#111216]/90 p-5 sm:p-8">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[.25em] text-[#f6c945]">Find your trim</p>
                  <h2 className="mt-1 text-2xl font-black italic uppercase tracking-tight sm:text-3xl">Variants <span className="text-white/40">&amp; trims</span></h2>
                  <p className="mt-2 max-w-2xl text-xs leading-5 text-white/45">Select a variant to update the price, then calculate its state-wise on-road cost.</p>
                </div>
                <span className="border border-white/10 px-3 py-2 text-[10px] font-extrabold uppercase tracking-widest text-white/55">{variants.length} trims</span>
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {variants.map((variant) => {
                  const active = selectedVariant === variant.id;
                  return (
                    <article key={variant.id} className={`group flex flex-col overflow-hidden border transition-all duration-300 ${active ? 'border-[#f6c945] bg-[#f6c945]/[0.055] shadow-[0_0_25px_rgba(246,201,69,.06)]' : 'border-white/10 bg-white/[0.02] hover:-translate-y-1 hover:border-red-500/60'}`}>
                      <button type="button" onClick={() => setSelectedVariant(active ? null : variant.id)} aria-pressed={active} className="flex-1 space-y-4 p-5 text-left">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="font-extrabold leading-tight text-white">{variant.variant_name}</h3>
                          <span className={`grid h-6 w-6 shrink-0 place-items-center border ${active ? 'border-[#f6c945] bg-[#f6c945] text-black' : 'border-white/15 text-white/30 group-hover:border-red-500'}`}><CheckCircle2 className="h-4 w-4" /></span>
                        </div>
                        <div className="flex flex-wrap gap-2 text-[10px] font-bold capitalize text-white/55">
                          {(variant.fuel_type || vehicle.fuel_type) && <span className="border border-white/10 bg-white/[0.04] px-2.5 py-1">{variant.fuel_type || vehicle.fuel_type}</span>}
                          {variant.transmission && <span className="border border-white/10 bg-white/[0.04] px-2.5 py-1">{variant.transmission}</span>}
                        </div>
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-[.18em] text-white/40">Ex-showroom</p>
                          <p className="mt-1 text-xl font-black tabular-nums text-[#f6c945]">{formatRupees(variant.ex_showroom_price)}</p>
                        </div>
                      </button>
                      <Link to={`/calculator?vehicle=${vehicle.id}&variant=${variant.id}`} className="flex items-center justify-between border-t border-white/10 bg-white/[0.035] px-5 py-3 text-xs font-extrabold text-white/75 transition-colors hover:border-[#dc2626] hover:bg-[#dc2626] hover:text-white">
                        <span>Calculate on-road</span><ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </article>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        {/* Mobile fixed price CTA */}
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#0b0c0e]/95 px-4 py-3 backdrop-blur-xl lg:hidden" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-[9px] font-bold uppercase tracking-[.15em] text-white/45">{activeVariant ? activeVariant.variant_name : 'Ex-showroom from'}</p>
              <p className="truncate text-lg font-black tabular-nums text-white">{formatRupees(displayPrice)}</p>
            </div>
            <Link to={calcLink} className={`inline-flex shrink-0 items-center gap-2 bg-[#f6c945] px-4 py-3 text-xs font-black uppercase tracking-wide text-[#101114] transition-colors hover:bg-white ${CUT_SM}`}>
              <Calculator className="h-4 w-4" /><span>On-road price</span>
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
