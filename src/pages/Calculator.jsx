import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../api/client';
import SEOHead from '../components/SEOHead';
import LeadGateModal from '../components/LeadGateModal';
import PriceBreakdownTable from '../components/PriceBreakdownTable';
import CarBackgroundSlideshow from '../components/CarBackgroundSlideshow';
import { Calculator as CalcIcon, ArrowRight, Sparkles, AlertTriangle, Shield, Sliders } from 'lucide-react';

export default function Calculator() {
  const [searchParams] = useSearchParams();
  const preselectedVehicleId = searchParams.get('vehicle');

  const [selectedVehicleId, setSelectedVehicleId] = useState(preselectedVehicleId || '');
  const [selectedStateId, setSelectedStateId] = useState('');
  const [variantTier, setVariantTier] = useState('start');
  const [useCustomPrice, setUseCustomPrice] = useState(false);
  const [customExShowroom, setCustomExShowroom] = useState('');
  const [isFinanced, setIsFinanced] = useState(false);
  const [ownershipType, setOwnershipType] = useState('individual');
  const [isGateOpen, setIsGateOpen] = useState(false);
  const [breakdownResult, setBreakdownResult] = useState(null);
  const [leadRefId, setLeadRefId] = useState(null);
  const [modalError, setModalError] = useState(null);

  // Fetch all 301 cars
  const { data: vehiclesData, isLoading: isVehiclesLoading } = useQuery({
    queryKey: ['calculator-vehicles-301'],
    queryFn: () => api.getVehicles({ page_size: 500 }),
  });

  // Fetch all states and UTs
  const { data: states = [], isLoading: isStatesLoading } = useQuery({
    queryKey: ['calculator-states-all'],
    queryFn: () => api.getStates(),
  });

  const vehicles = vehiclesData?.results || vehiclesData || [];
  const activeVehicle = vehicles.find((v) => String(v.id) === String(selectedVehicleId));
  const activeState = states.find((s) => String(s.id) === String(selectedStateId));

  useEffect(() => {
    if (states.length > 0 && !selectedStateId) {
      setSelectedStateId(states[0].id);
    }
  }, [states, selectedStateId]);

  // Set default vehicle if preselected or first loaded
  useEffect(() => {
    if (vehicles.length > 0 && !selectedVehicleId) {
      setSelectedVehicleId(vehicles[0].id);
    }
  }, [vehicles, selectedVehicleId]);

  const leadMutation = useMutation({
    mutationFn: (leadPayload) => api.submitLeadAndGetBreakdown(leadPayload),
    onSuccess: (data) => {
      setBreakdownResult(data.breakdown);
      setLeadRefId(data.lead_id);
      setIsGateOpen(false);
      setModalError(null);
    },
    onError: (error) => {
      const errorMsg = error?.response?.data?.error || 
                       error?.response?.data?.detail ||
                       error?.message ||
                       'Unable to calculate price. Please try again or contact support.';
      setModalError(errorMsg);
    },
  });

  const formatPriceOption = (price) => {
    const num = Number(price);
    if (isNaN(num) || num <= 0) return 'TBA';
    if (num >= 10000000) return `₹ ${(num / 10000000).toFixed(2)} Cr`;
    if (num >= 100000) return `₹ ${(num / 100000).toFixed(2)} L`;
    return `₹ ${num.toLocaleString('en-IN')}`;
  };

  const handleCalculateClick = (e) => {
    e.preventDefault();
    if (!selectedVehicleId) {
      alert('Please select a vehicle.');
      return;
    }
    if (!selectedStateId) {
      alert('Please select your state.');
      return;
    }

    if (activeVehicle?.is_tba) {
      // Trigger instant TBA breakdown response without gate
      setBreakdownResult({
        is_tba: true,
        message: 'Price to be announced',
        state_name: activeState?.name || 'Selected State',
        state_code: activeState?.code || '',
        vehicle_name: `${activeVehicle.brand_name || activeVehicle.brand?.name} ${activeVehicle.name}`,
      });
      return;
    }

    setIsGateOpen(true);
  };

  const handleGateSubmit = ({ name, phone_number, city }) => {
    leadMutation.mutate({
      name,
      phone_number,
      city,
      vehicle_id: Number(selectedVehicleId),
      state_id: Number(selectedStateId),
      variant_tier: variantTier,
      custom_ex_showroom: useCustomPrice && customExShowroom ? Number(customExShowroom) : null,
      fuel_type: activeVehicle?.fuel_type || '',
      ownership_type: ownershipType,
      is_financed: isFinanced,
      source_page: 'calculator_gate',
    });
  };

  const variantLabel = useCustomPrice && customExShowroom
    ? `Custom Ex-Showroom (${formatPriceOption(customExShowroom)})`
    : variantTier === 'top' ? 'Top Variant' : 'Starting Variant';

  return (
    <CarBackgroundSlideshow>
      <SEOHead
        title="2026 On-Road Price Calculator (36 States/UTs & 301 Cars) | Car Guide Media"
        description="Calculate precise on-road price across all Indian states and union territories for 301 car models. Precomputed state tax lookup, custom ex-showroom interpolation, and legal disclaimers."
      />

      <div className="py-12 sm:py-16 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">

          <div className="text-center space-y-3">
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
              <CalcIcon className="w-4 h-4 text-red-600" />
              <span>Official 2026 Dataset • 36 States/UTs &amp; 301 Cars</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight">
              On-Road Price Calculator
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
              Select any car from India's master catalog of 301 models and pick your state or UT to view accurate, itemized on-road prices across all 36 Indian states and union territories.
            </p>
          </div>

          <div className="rounded-lg bg-white border border-slate-200 p-6 sm:p-8 space-y-8 shadow-xl shadow-slate-200/70">

            {/* STEP 1: SELECT CAR */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5 text-sm font-bold text-slate-950">
                  <div className="w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-bold font-mono">1</div>
                  <span>Select Vehicle Model (301 Cars)</span>
                </div>
                <span className="text-[11px] font-mono text-red-700 bg-red-50 px-2.5 py-1 rounded-full border border-red-200">
                  {vehicles.length} Models Loaded
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Car Brand &amp; Model *</label>
                <select
                  value={selectedVehicleId}
                  onChange={(e) => {
                    setSelectedVehicleId(e.target.value);
                    setBreakdownResult(null);
                    setCustomExShowroom('');
                  }}
                  className="w-full px-4 py-3.5 rounded-md bg-white border border-slate-200 text-slate-950 text-sm focus:outline-none focus:border-red-300 font-medium transition-all"
                >
                  <option value="">-- Choose Car ({vehicles.length} Available) --</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.brand_name || v.brand?.name} {v.name} {v.is_tba ? '(Price TBA)' : `(From ${formatPriceOption(v.starting_price || v.ex_showroom_price)})`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Active Vehicle Info Badge */}
              {activeVehicle && (
                <div className={`p-4 rounded-lg border ${activeVehicle.is_tba ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-slate-50 border-slate-200 text-slate-700'} flex items-start justify-between gap-4 text-xs`}>
                  <div>
                    <div className="flex items-center space-x-2 font-bold text-slate-950 text-sm">
                      <span>{activeVehicle.brand_name || activeVehicle.brand?.name} {activeVehicle.name}</span>
                      {activeVehicle.is_tba && (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500 text-slate-950 font-bold uppercase">Price TBA</span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Body: <strong className="text-slate-200">{activeVehicle.body_type}</strong> • Powertrain: <strong className="text-slate-200">{activeVehicle.fuel_type}</strong>
                    </p>
                  </div>

                  {!activeVehicle.is_tba && (
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Ex-Showroom Band</span>
                      <span className="font-mono font-bold text-red-700 text-sm">
                        {formatPriceOption(activeVehicle.starting_price || activeVehicle.ex_showroom_price)} – {formatPriceOption(activeVehicle.top_variant_price)}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* STEP 2: STATE & VARIANT / CUSTOM PRICE */}
            <div className="space-y-4 pt-6 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5 text-sm font-bold text-slate-950">
                  <div className="w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-bold font-mono">2</div>
                  <span>State &amp; Pricing Customization</span>
                </div>
                <span className="text-[11px] font-mono text-emerald-400/90 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  36 States/UT Slabs
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* State Dropdown */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Registration State (36 Available) *</label>
                  <select
                    value={selectedStateId}
                    onChange={(e) => {
                      setSelectedStateId(e.target.value);
                      setBreakdownResult(null);
                    }}
                    className="w-full px-4 py-3.5 rounded-md bg-white border border-slate-200 text-slate-950 text-sm focus:outline-none focus:border-red-300 font-medium transition-all"
                  >
                    {states.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.code})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Variant / Custom Price Option */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-700">Variant Price Option *</label>
                    {!activeVehicle?.is_tba && (
                      <button
                        type="button"
                        onClick={() => {
                          setUseCustomPrice(!useCustomPrice);
                          setBreakdownResult(null);
                        }}
                        className="text-[11px] font-semibold text-red-600 hover:underline flex items-center space-x-1"
                      >
                        <Sliders className="w-3 h-3" />
                        <span>{useCustomPrice ? 'Use Variant Tiers' : 'Enter Custom Price'}</span>
                      </button>
                    )}
                  </div>

                  {!useCustomPrice ? (
                    <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-md border border-slate-200">
                      <button
                        type="button"
                        disabled={activeVehicle?.is_tba}
                        onClick={() => { setVariantTier('start'); setBreakdownResult(null); }}
                        className={`py-2.5 px-3 rounded-lg text-xs font-bold transition-all ${
                          variantTier === 'start' ? 'bg-red-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-950'
                        } ${activeVehicle?.is_tba ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        Starting Variant
                        {activeVehicle && !activeVehicle.is_tba && (
                          <span className="block text-[10px] font-normal mt-0.5 opacity-80 font-mono">
                            {formatPriceOption(activeVehicle.starting_price || activeVehicle.ex_showroom_price)}
                          </span>
                        )}
                      </button>

                      <button
                        type="button"
                        disabled={activeVehicle?.is_tba}
                        onClick={() => { setVariantTier('top'); setBreakdownResult(null); }}
                        className={`py-2.5 px-3 rounded-lg text-xs font-bold transition-all ${
                          variantTier === 'top' ? 'bg-red-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-950'
                        } ${activeVehicle?.is_tba ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        Top Variant
                        {activeVehicle && !activeVehicle.is_tba && (
                          <span className="block text-[10px] font-normal mt-0.5 opacity-80 font-mono">
                            {formatPriceOption(activeVehicle.top_variant_price)}
                          </span>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div>
                      <input
                        type="number"
                        value={customExShowroom}
                        onChange={(e) => {
                          setCustomExShowroom(e.target.value);
                          setBreakdownResult(null);
                        }}
                        placeholder="Enter Ex-Showroom Price in INR (e.g. 1250000)"
                        className="w-full px-4 py-3 rounded-md bg-white border border-slate-200 text-slate-950 text-xs font-mono focus:outline-none focus:border-red-300"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        Linearly interpolates state road tax band for custom variant prices.
                      </span>
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* STEP 3: OWNERSHIP & PAYMENT METHOD */}
            <div className="space-y-4 pt-6 border-t border-slate-200">
              <div className="flex items-center space-x-2.5 text-sm font-bold text-slate-950">
                <div className="w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-bold font-mono">3</div>
                <span>Ownership Type &amp; Payment Options</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Ownership Type */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Vehicle Ownership Category *</label>
                  <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-md border border-slate-200">
                    <button
                      type="button"
                      onClick={() => { setOwnershipType('individual'); setBreakdownResult(null); }}
                      className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                        ownershipType === 'individual' ? 'bg-red-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-950'
                      }`}
                    >
                      Individual Owner
                    </button>
                    <button
                      type="button"
                      onClick={() => { setOwnershipType('company'); setBreakdownResult(null); }}
                      className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                        ownershipType === 'company' ? 'bg-red-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-950'
                      }`}
                    >
                      Company / Corporate
                    </button>
                  </div>
                  {ownershipType === 'company' && (
                    <span className="text-[10px] text-amber-600 mt-1 block font-medium">
                      Applies state corporate RTO tax surcharges (20%–25% rate slab).
                    </span>
                  )}
                </div>

                {/* Payment Type */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Payment Type *</label>
                  <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-md border border-slate-200">
                    <button
                      type="button"
                      onClick={() => { setIsFinanced(false); setBreakdownResult(null); }}
                      className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                        !isFinanced ? 'bg-red-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-950'
                      }`}
                    >
                      Outright Cash
                    </button>
                    <button
                      type="button"
                      onClick={() => { setIsFinanced(true); setBreakdownResult(null); }}
                      className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                        isFinanced ? 'bg-red-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-950'
                      }`}
                    >
                      Bank Loan (Financed)
                    </button>
                  </div>
                  {isFinanced && activeState && (
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Endorsement fee (₹{Number(activeState.hypothecation_fee || 1500).toLocaleString('en-IN')}) included.
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <div className="pt-6 border-t border-slate-200">
              <button
                type="button"
                onClick={handleCalculateClick}
                className="w-full py-4 px-6 rounded-md bg-red-600 hover:bg-red-700 text-white font-extrabold text-sm shadow-lg shadow-red-100 transition-all flex items-center justify-center space-x-2 group"
              >
                <Sparkles className="w-5 h-5 text-white group-hover:rotate-12 transition-transform" />
                <span>
                  {activeVehicle?.is_tba ? 'View TBA Status Notice' : 'Calculate & Unlock On-Road Price'}
                </span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

          </div>

          {/* RESULTS BREAKDOWN */}
          {breakdownResult && (
            <PriceBreakdownTable
              breakdown={breakdownResult}
              vehicleName={activeVehicle ? `${activeVehicle.brand_name || activeVehicle.brand?.name} ${activeVehicle.name}` : 'Selected Vehicle'}
              variantName={variantLabel}
              leadId={leadRefId}
            />
          )}

        </div>
      </div>

      <LeadGateModal
        isOpen={isGateOpen}
        vehicle={activeVehicle}
        stateName={activeState?.name || 'Selected State'}
        onSubmit={handleGateSubmit}
        isLoading={leadMutation.isPending}
        error={modalError}
        onClose={() => {
          setIsGateOpen(false);
          setModalError(null);
        }}
      />
    </CarBackgroundSlideshow>
  );
}
