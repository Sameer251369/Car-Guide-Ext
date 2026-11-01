import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api, { toAppMediaUrl } from '../api/client';
import SEOHead from '../components/SEOHead';
import {
  Car, Calculator, Fuel, ShieldCheck, Zap, ArrowLeft,
  CheckCircle2, ChevronRight, ChevronLeft, ArrowUpRight,
} from 'lucide-react';

/* Tokens: ink #0a0e13 · panel #11161d · concrete #dfe3e6 · sodium #ffb224 */
const wide = { fontFamily: "'Archivo','Arial Black',system-ui,sans-serif", fontStretch: '125%' };
const body = { fontFamily: "'Hanken Grotesk','Inter',system-ui,sans-serif" };

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffb224] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0e13]';

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
      `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#1d2733"/><stop offset="1" stop-color="#0a0e13"/></linearGradient></defs><rect width="1200" height="800" fill="url(#g)"/><text x="600" y="420" text-anchor="middle" font-size="52" fill="#ffb224" font-family="Arial">${name}</text></svg>`
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
      <div className="grid min-h-[60vh] place-items-center bg-[#0a0e13] text-white" style={body}>
        <div className="text-center" role="status">
          <div className="mx-auto mb-4 h-10 w-10 rounded-full border-[3px] border-[#ffb224] border-t-transparent motion-safe:animate-spin" />
          <p className="text-sm font-semibold text-white/60">Loading vehicle specs</p>
        </div>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="grid min-h-[60vh] place-items-center bg-[#0a0e13] px-4 text-white" style={body}>
        <div className="space-y-4 text-center">
          <h2 className="text-3xl font-extrabold tracking-[-0.02em]" style={wide}>
            We couldn’t find this car
          </h2>
          <p className="text-white/65">It may have been removed, or the link may be wrong.</p>
          <button
            onClick={handleBackToVehicles}
            className={`inline-flex h-12 items-center gap-2 rounded-full bg-[#ffb224] px-7 text-[15px] font-bold text-[#0a0e13] transition-colors hover:bg-white ${focusRing}`}
          >
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

  const glassBtn =
    'absolute top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/35 text-white backdrop-blur-xl transition-colors hover:border-[#ffb224] hover:bg-[#ffb224] hover:text-[#0a0e13]';

  return (
    <>
      <SEOHead
        title={vehicle.meta_title || `${vehicle.name} Price & Specs | Car Guide Media`}
        description={vehicle.meta_description || `Explore ${vehicle.name} variants, fuel types, specifications and calculate its on-road price.`}
      />

      <main className="min-h-screen bg-[#0a0e13] pb-28 pt-5 text-white sm:pt-8 lg:pb-16" style={body}>
        <div className="relative mx-auto max-w-7xl space-y-7 px-4 sm:space-y-9 sm:px-6 lg:px-8">
          <button
            onClick={handleBackToVehicles}
            className={`group inline-flex items-center gap-3 rounded-full text-sm font-semibold text-white/70 transition-colors hover:text-white ${focusRing}`}
          >
            <span className="grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-white/[0.05] transition-all group-hover:-translate-x-0.5 group-hover:border-[#ffb224]">
              <ArrowLeft className="h-4 w-4" />
            </span>
            Back to all cars
          </button>

          <section className="grid items-start gap-5 lg:grid-cols-12 lg:gap-7">
            {/* Vehicle gallery */}
            <div className="space-y-3 lg:col-span-7">
              <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#11161d]">
                <div className="relative aspect-[16/10] overflow-hidden bg-[#11161d]">
                  <img
                    key={selectedImageUrl}
                    src={selectedImageUrl}
                    alt={vehicle.name}
                    className="h-full w-full object-cover"
                  />
                  <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#0a0e13]/85 via-transparent to-black/25" />

                  <div className="absolute left-4 top-4 flex flex-wrap gap-2 sm:left-6 sm:top-6">
                    <span className="rounded-full border border-white/20 bg-black/35 px-4 py-1.5 text-sm font-semibold text-white backdrop-blur-xl">
                      {vehicle.brand?.name || 'Car Guide'}
                    </span>
                    {isElectric && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400 px-3 py-1.5 text-sm font-bold text-[#0a0e13]">
                        <Zap className="h-3.5 w-3.5" aria-hidden="true" />
                        Electric
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-5 left-5 right-5 sm:bottom-7 sm:left-7">
                    <h1
                      className="max-w-xl text-3xl font-black leading-[1] tracking-[-0.03em] sm:text-5xl"
                      style={wide}
                    >
                      {vehicle.name}
                    </h1>
                  </div>

                  {images.length > 1 && (
                    <>
                      <button type="button" onClick={() => goToImage(-1)} aria-label="Previous image" className={`${glassBtn} left-3 ${focusRing}`}>
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button type="button" onClick={() => goToImage(1)} aria-label="Next image" className={`${glassBtn} right-3 ${focusRing}`}>
                        <ChevronRight className="h-5 w-5" />
                      </button>
                      <span className="absolute right-4 top-4 rounded-full border border-white/20 bg-black/35 px-3 py-1.5 text-xs font-semibold tabular-nums text-white backdrop-blur-xl sm:right-6 sm:top-6">
                        {activeIndex + 1} / {images.length}
                      </span>
                    </>
                  )}
                </div>

                {images.length > 1 && (
                  <div className="flex gap-3 overflow-x-auto border-t border-white/10 p-3 sm:p-4">
                    {images.map((image, index) => {
                      const active = selectedImageUrl === image.image_url;
                      return (
                        <button
                          key={`${image.id || index}-${image.image_url}`}
                          type="button"
                          onClick={() => setSelectedImage(image.image_url)}
                          aria-label={`Show ${imageLabels[image.image_type] || `image ${index + 1}`}`}
                          aria-pressed={active}
                          className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${focusRing} ${
                            active ? 'border-[#ffb224] opacity-100' : 'border-transparent opacity-55 hover:opacity-100'
                          }`}
                        >
                          <img
                            src={image.image_url}
                            alt={image.alt_text || `${vehicle.name} ${imageLabels[image.image_type] || `image ${index + 1}`}`}
                            className="h-full w-full object-cover"
                          />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {quickStats.length > 0 && (
                <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                  {quickStats.map(({ icon: Icon, label, value }) => (
                    <div
                      key={label}
                      className="flex min-w-0 items-center gap-3 rounded-2xl border border-white/10 bg-[#11161d] p-3 sm:p-4"
                    >
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/15 bg-white/[0.04] text-[#ffb224]">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs text-white/55">{label}</p>
                        <p className="mt-0.5 truncate text-sm font-bold text-white">{String(value)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Vehicle summary and price */}
            <aside className="space-y-5 rounded-3xl border border-white/10 bg-[#11161d] p-5 sm:p-7 lg:sticky lg:top-24 lg:col-span-5">
              <div className="space-y-3">
                <p className="text-sm font-semibold text-white/60">{vehicle.brand?.name || 'Vehicle details'}</p>
                <div className="flex flex-wrap gap-2">
                  {[vehicle.body_type, vehicle.fuel_type, transmissionValue !== 'Not specified' ? transmissionValue : null]
                    .filter(Boolean)
                    .map((chip) => (
                      <span
                        key={chip}
                        className="rounded-full border border-white/15 px-3.5 py-1.5 text-sm font-medium capitalize text-white/80"
                      >
                        {chip}
                      </span>
                    ))}
                </div>
              </div>

              {/* Price: the one light surface on the page */}
              <div className="rounded-2xl bg-[#dfe3e6] p-5 text-[#0a0e13] sm:p-6">
                <p className="text-sm font-semibold text-[#0a0e13]/70">
                  {activeVariant ? `${activeVariant.variant_name} · Ex-showroom` : 'Base ex-showroom price'}
                </p>
                <p className="mt-2 text-3xl font-extrabold tabular-nums tracking-[-0.03em] sm:text-4xl" style={wide}>
                  {formatRupees(displayPrice)}
                </p>
                <p className="mt-3 text-sm text-[#0a0e13]/65">
                  Final on-road price varies by state, insurance and registration.
                </p>
                {activeVariant && (
                  <button
                    type="button"
                    onClick={() => setSelectedVariant(null)}
                    className="mt-3 rounded-sm text-sm font-bold underline decoration-[#ffb224] decoration-2 underline-offset-4 hover:text-[#0a0e13]/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0a0e13]"
                  >
                    Reset to base price
                  </button>
                )}
              </div>

              <Link
                to={calcLink}
                className={`group flex items-center justify-between gap-3 rounded-full bg-[#ffb224] py-2 pl-6 pr-2 font-bold text-[#0a0e13] transition-colors duration-200 hover:bg-white active:scale-[0.99] ${focusRing}`}
              >
                <span className="flex items-center gap-3 text-sm sm:text-[15px]">
                  <Calculator className="h-5 w-5" aria-hidden="true" />
                  Calculate state on-road price
                </span>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#0a0e13] text-[#ffb224]">
                  <ArrowUpRight className="h-5 w-5 transition-transform group-hover:rotate-45" aria-hidden="true" />
                </span>
              </Link>

              {mainSpecs.length > 0 && (
                <div className="space-y-3 border-t border-white/10 pt-5">
                  <h3 className="text-base font-bold tracking-[-0.01em]" style={wide}>
                    Key specifications
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {mainSpecs.map(([label, value]) => (
                      <div key={`${label}-${String(value)}`} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                        <p className="text-xs text-white/55">{label}</p>
                        <p className="mt-1 break-words text-sm font-bold text-white">{String(value)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </section>

          {/* Vehicle overview */}
          <section className="rounded-3xl border border-white/10 bg-[#11161d] p-5 sm:p-8">
            <h2 className="text-2xl font-extrabold tracking-[-0.02em] sm:text-3xl" style={wide}>
              {vehicle.name} at a glance
            </h2>
            <div className="mt-5 max-w-3xl space-y-4 text-base leading-7 text-white/70">
              {(vehicle.description || buyerSummary).split('\n\n').map((paragraph, index) => <p key={index}>{paragraph}</p>)}
            </div>

            {mainSpecs.length > 0 && (
              <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {mainSpecs.map(([label, value]) => (
                  <div key={`${label}-detail`} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-sm text-white/55">{label}</p>
                    <p className="mt-1.5 break-words text-base font-bold text-white">{String(value)}</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Available variants */}
          {variants.length > 0 && (
            <section className="space-y-6 rounded-3xl border border-white/10 bg-[#11161d] p-5 sm:p-8">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-extrabold tracking-[-0.02em] sm:text-3xl" style={wide}>
                    Variants and trims
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">
                    Select a variant to update the price, then calculate its state-wise on-road cost.
                  </p>
                </div>
                <span className="rounded-full border border-white/15 px-4 py-1.5 text-sm font-semibold text-white/70">
                  {variants.length} trims
                </span>
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {variants.map((variant) => {
                  const active = selectedVariant === variant.id;
                  return (
                    <article
                      key={variant.id}
                      className={`group flex flex-col overflow-hidden rounded-2xl border transition-colors duration-300 ${
                        active
                          ? 'border-[#ffb224] bg-[#ffb224]/[0.07]'
                          : 'border-white/10 bg-white/[0.02] hover:border-white/30'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedVariant(active ? null : variant.id)}
                        aria-pressed={active}
                        className={`flex-1 space-y-4 p-5 text-left ${focusRing}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="font-bold leading-tight text-white">{variant.variant_name}</h3>
                          <span
                            className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border ${
                              active
                                ? 'border-[#ffb224] bg-[#ffb224] text-[#0a0e13]'
                                : 'border-white/20 text-white/30'
                            }`}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 text-sm capitalize text-white/70">
                          {(variant.fuel_type || vehicle.fuel_type) && (
                            <span className="rounded-full border border-white/15 px-3 py-1">
                              {variant.fuel_type || vehicle.fuel_type}
                            </span>
                          )}
                          {variant.transmission && (
                            <span className="rounded-full border border-white/15 px-3 py-1">{variant.transmission}</span>
                          )}
                        </div>
                        <div>
                          <p className="text-xs text-white/55">Ex-showroom</p>
                          <p className="mt-1 text-xl font-bold tabular-nums tracking-[-0.02em] text-white" style={wide}>
                            {formatRupees(variant.ex_showroom_price)}
                          </p>
                        </div>
                      </button>
                      <Link
                        to={`/calculator?vehicle=${vehicle.id}&variant=${variant.id}`}
                        className={`flex items-center justify-between border-t border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-white/80 transition-colors hover:bg-[#ffb224] hover:text-[#0a0e13] ${focusRing} focus-visible:ring-inset`}
                      >
                        <span>Calculate on-road</span>
                        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </article>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        {/* Mobile fixed price CTA */}
        <div
          className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#0a0e13]/90 px-4 py-3 backdrop-blur-2xl lg:hidden"
          style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
        >
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-xs text-white/55">
                {activeVariant ? activeVariant.variant_name : 'Ex-showroom from'}
              </p>
              <p className="truncate text-lg font-extrabold tabular-nums tracking-[-0.02em] text-white" style={wide}>
                {formatRupees(displayPrice)}
              </p>
            </div>
            <Link
              to={calcLink}
              className={`inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-[#ffb224] px-5 text-sm font-bold text-[#0a0e13] transition-colors hover:bg-white ${focusRing}`}
            >
              <Calculator className="h-4 w-4" />
              <span>On-road price</span>
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}