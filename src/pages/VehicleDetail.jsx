import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api, { toAppMediaUrl } from '../api/client';
import SEOHead from '../components/SEOHead';
import { Car, Calculator, Fuel, ShieldCheck, Zap, ArrowLeft, CheckCircle2, ChevronRight } from 'lucide-react';

export default function VehicleDetail() {
  const { slug } = useParams();
  const [selectedVariant, setSelectedVariant] = useState(null);

  const { data: vehicle, isLoading, error } = useQuery({
    queryKey: ['vehicle', slug],
    queryFn: () => api.getVehicleBySlug(slug),
  });

  const [selectedImage, setSelectedImage] = useState(null);

  // Prepare image/gallery data and effect before any early returns so hooks order stays stable
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
  const primaryImgPre = validImagesPre[0]?.image_url || 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><rect width="1200" height="800" fill="#0f172a"/><text x="600" y="420" text-anchor="middle" font-size="52" fill="#f8fafc" font-family="Arial">${(vehicle?.name || 'Vehicle').replace(/&/g, '&amp;')}</text></svg>`);
  React.useEffect(() => {
    setSelectedImage(primaryImgPre);
  }, [slug, primaryImgPre]);
  const selectedImageUrlPre = selectedImage || primaryImgPre;

  if (isLoading) {
    return (
      <div className="py-20 text-center text-slate-400">
        <div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-xs">Loading vehicle specifications...</p>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="py-20 text-center text-slate-400 space-y-4">
        <h2 className="text-xl font-bold text-white">Vehicle Not Found</h2>
        <Link to="/vehicles" className="inline-flex items-center space-x-2 text-amber-400 text-xs font-bold">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Portfolio</span>
        </Link>
      </div>
    );
  }

  const specs = vehicle.key_specs || {};
  const validImages = validImagesPre;
  const selectedImageUrl = selectedImageUrlPre;
  const variants = vehicle.variants || [];
  const imageTypeLabels = {
    front: 'Front side',
    exterior: 'Exterior / side',
    interior: 'Interior',
    rear: 'Backside / rear',
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

  return (
    <>
      <SEOHead
        title={vehicle.meta_title || `${vehicle.name} Price & Specs | Car Guide Media`}
        description={vehicle.meta_description || `Explore ${vehicle.name} variants, fuel types, key specs, and calculate on-road price.`}
      />

      <div className="py-12 bg-slate-950 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          {/* Breadcrumb back */}
          <Link to="/vehicles" className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Vehicles</span>
          </Link>

          {/* Top Hero Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Gallery (Left 7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl">
                <div className="aspect-[16/10] relative">
                  <img
                    src={selectedImageUrl}
                    alt={vehicle.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4 flex items-center space-x-2">
                    <span className="px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-slate-950/80 backdrop-blur-md text-amber-400 border border-amber-500/30">
                      {vehicle.brand?.name}
                    </span>
                    {vehicle.fuel_type === 'electric' && (
                      <span className="px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                        EV Subsidized
                      </span>
                    )}
                  </div>
                </div>

                {validImages.length > 1 && (
                  <div className="flex gap-3 overflow-x-auto px-4 py-4 border-t border-slate-800 bg-slate-950/70">
                    {validImages.map((image, index) => (
                      <button
                        key={`${image.id || index}-${image.image_url}`}
                        type="button"
                        onClick={() => setSelectedImage(image.image_url)}
                        className={`relative flex-shrink-0 w-24 h-16 rounded-xl border overflow-hidden transition-all ${selectedImageUrl === image.image_url ? 'border-amber-400 ring-2 ring-amber-500/30' : 'border-slate-700 hover:border-slate-500'}`}
                      >
                        <img src={image.image_url} alt={image.alt_text || `${vehicle.name} ${imageTypeLabels[image.image_type] || `image ${index + 1}`}`} className="w-full h-full object-cover" />
                        <span className="absolute inset-x-0 bottom-0 bg-slate-950/80 px-1 py-0.5 text-[9px] font-semibold text-white">{imageTypeLabels[image.image_type] || `Image ${index + 1}`}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Overview Card (Right 5 cols) */}
            <div className="lg:col-span-5 rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-xl">
              
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">{vehicle.brand?.name}</span>
                <h1 className="text-3xl font-bold text-white font-serif">{vehicle.name}</h1>
                <p className="text-xs text-slate-400 mt-1 capitalize">{vehicle.body_type} • {vehicle.fuel_type} Powered</p>
              </div>

              {/* Price Banner */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[11px] uppercase font-semibold text-slate-500">Base Ex-Showroom Price</span>
                <div className="text-2xl font-extrabold text-amber-400 font-mono">
                  {formatRupees(vehicle.ex_showroom_price)}
                </div>
              </div>

              {/* CTA into Calculator */}
              <Link
                to={`/calculator?vehicle=${vehicle.id}`}
                className="w-full py-4 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm shadow-xl shadow-amber-500/20 hover:shadow-amber-500/40 transition-all flex items-center justify-center space-x-2"
              >
                <Calculator className="w-5 h-5" />
                <span>Calculate State On-Road Price</span>
              </Link>

              {/* Quick specs summary */}
              <div className="space-y-3 pt-4 border-t border-slate-800 text-xs">
                <h3 className="font-semibold text-white uppercase tracking-wider text-[11px] text-amber-400">Key Highlights</h3>
                <div className="grid grid-cols-2 gap-2">
                  {mainSpecEntries.map(([key, val]) => (
                    <div key={`${key}-${String(val)}`} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-slate-500 block uppercase font-mono">{key}</span>
                      <span className="font-semibold text-slate-200">{String(val)}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-6">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-amber-400 font-semibold">Vehicle Overview</span>
              <h2 className="mt-2 text-2xl font-bold text-white font-serif">{vehicle.name} at a glance</h2>
            </div>

            <div className="space-y-4 text-sm leading-7 text-slate-300">
              {(vehicle.description || buyerSummary).split('\n\n').map((paragraph, pIdx) => (
                <p key={pIdx}>{paragraph}</p>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {mainSpecEntries.map(([key, value]) => (
                <div key={`${key}-detail`} className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">{key}</div>
                  <div className="mt-2 text-sm font-semibold text-white">{String(value)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Variants Table */}
          {variants.length > 0 && (
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-6">
              <div>
                <h3 className="text-xl font-bold text-white font-serif">Available Variants &amp; Trims</h3>
                <p className="text-xs text-slate-400">Select a variant to calculate its specific on-road tax breakdown.</p>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-900 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3.5 px-4">Variant Trim</th>
                      <th className="py-3.5 px-4">Fuel Type</th>
                      <th className="py-3.5 px-4">Transmission</th>
                      <th className="py-3.5 px-4 text-right">Ex-Showroom Price</th>
                      <th className="py-3.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-200">
                    {variants.map((varItem) => (
                      <tr key={varItem.id} className="hover:bg-slate-900/50 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-white">{varItem.variant_name}</td>
                        <td className="py-3.5 px-4 text-xs text-slate-400 capitalize">{varItem.fuel_type || vehicle.fuel_type}</td>
                        <td className="py-3.5 px-4 text-xs text-slate-400">{varItem.transmission}</td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-amber-400">{formatRupees(varItem.ex_showroom_price)}</td>
                        <td className="py-3.5 px-4 text-right">
                          <Link
                            to={`/calculator?vehicle=${vehicle.id}&variant=${varItem.id}`}
                            className="inline-flex items-center space-x-1 text-xs font-bold text-amber-400 hover:text-amber-300"
                          >
                            <span>Calculate</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
