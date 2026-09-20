import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../api/client';
import SEOHead from '../components/SEOHead';
import LeadGateModal from '../components/LeadGateModal';
import PriceBreakdownTable from '../components/PriceBreakdownTable';
import CarBackgroundSlideshow from '../components/CarBackgroundSlideshow';
import { Calculator as CalcIcon, ArrowRight, Sparkles, Sliders, Car, Fuel, Tag, Shield, Check, Layers, Zap } from 'lucide-react';

export default function Calculator() {
  const [searchParams] = useSearchParams();
  const preselectedVehicleId = searchParams.get('vehicle');
  const preselectedStateParam = searchParams.get('state');

  const [selectedBrandId, setSelectedBrandId] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState(preselectedVehicleId || '');
  const [selectedFuelType, setSelectedFuelType] = useState('All Fuels');
  const [selectedVariantId, setSelectedVariantId] = useState('');
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

  const breakdownRef = useRef(null);

  useEffect(() => {
    if (breakdownResult && breakdownRef.current) {
      const timer = setTimeout(() => {
        breakdownRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [breakdownResult]);

  // Remember verified lead in local and session storage
  const [unlockedUser, setUnlockedUser] = useState(() => {
    try {
      const saved = localStorage.getItem('carguide_lead_user') || sessionStorage.getItem('carguide_lead_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Fetch Brands list
  const { data: brands = [] } = useQuery({
    queryKey: ['calculator-brands'],
    queryFn: () => api.getBrands(),
  });

  // Fetch all vehicles
  const { data: vehiclesData, isLoading: isVehiclesLoading } = useQuery({
    queryKey: ['calculator-vehicles-master'],
    queryFn: () => api.getVehicles({ page_size: 500 }),
  });

  // Fetch all states and UTs
  const { data: states = [], isLoading: isStatesLoading } = useQuery({
    queryKey: ['calculator-states-all'],
    queryFn: () => api.getStates(),
  });

  const vehicles = useMemo(() => vehiclesData?.results || vehiclesData || [], [vehiclesData]);

  // Derived: Filter vehicles by selected Brand
  const vehiclesOfBrand = useMemo(() => {
    if (!selectedBrandId) return vehicles;
    return vehicles.filter(
      (v) =>
        String(v.brand) === String(selectedBrandId) ||
        String(v.brand_id) === String(selectedBrandId) ||
        String(v.brand?.id) === String(selectedBrandId)
    );
  }, [vehicles, selectedBrandId]);

  // Active Vehicle object
  const activeVehicle = useMemo(() => {
    return vehicles.find((v) => String(v.id) === String(selectedVehicleId)) || null;
  }, [vehicles, selectedVehicleId]);

  // Sister EV / Electric vehicle model detection for current brand (e.g. Creta -> Creta Electric, Nexon -> Nexon EV)
  const sisterEVVehicle = useMemo(() => {
    if (!activeVehicle || !vehiclesOfBrand || vehiclesOfBrand.length === 0) return null;
    const cleanBase = activeVehicle.name.toLowerCase().replace(/\b(ev|electric|2026|roxx|4x4|z-series)\b/g, '').trim();
    if (!cleanBase) return null;

    return vehiclesOfBrand.find((v) => {
      if (v.id === activeVehicle.id) return false;
      const vName = v.name.toLowerCase();
      const isEvModel = vName.includes('ev') || vName.includes('electric') || String(v.fuel_type).toLowerCase().includes('electric');
      return isEvModel && (vName.includes(cleanBase) || cleanBase.includes(vName.replace(/\b(ev|electric|2026)\b/g, '').trim()));
    }) || null;
  }, [activeVehicle, vehiclesOfBrand]);

  // Derived: Unique fuel types for the selected vehicle (including sister EV model fuels if present)
  const availableFuelTypes = useMemo(() => {
    if (!activeVehicle) return ['All Fuels'];
    const fuels = new Set(['All Fuels']);

    const checkAndAdd = (str) => {
      if (!str) return;
      const s = String(str).toLowerCase();
      if (s.includes('petrol')) fuels.add('Petrol');
      if (s.includes('diesel')) fuels.add('Diesel');
      if (s.includes('cng')) fuels.add('CNG');
      if (s.includes('electric') || s.includes('ev')) fuels.add('Electric');
      if (s.includes('hybrid')) fuels.add('Hybrid');
    };

    checkAndAdd(activeVehicle.fuel_type);
    checkAndAdd(activeVehicle.ev_hybrid_cng_flag);

    if (activeVehicle.variants && activeVehicle.variants.length > 0) {
      activeVehicle.variants.forEach((varItem) => checkAndAdd(varItem.fuel_type));
    }

    if (sisterEVVehicle) {
      fuels.add('Electric');
      if (sisterEVVehicle.variants) {
        sisterEVVehicle.variants.forEach((v) => checkAndAdd(v.fuel_type));
      }
    }

    return Array.from(fuels);
  }, [activeVehicle, sisterEVVehicle]);

  // Combined pool of variants (active vehicle + sister EV model variants if Electric selected)
  const combinedVariantsPool = useMemo(() => {
    if (!activeVehicle) return [];
    const pool = [...(activeVehicle.variants || [])];
    if (sisterEVVehicle && sisterEVVehicle.variants) {
      sisterEVVehicle.variants.forEach((evVar) => {
        if (!pool.some((p) => p.id === evVar.id)) {
          pool.push(evVar);
        }
      });
    }
    return pool;
  }, [activeVehicle, sisterEVVehicle]);

  // Derived: Variants matching selected Vehicle + Fuel Type
  const variantsOfVehicleAndFuel = useMemo(() => {
    if (!combinedVariantsPool || combinedVariantsPool.length === 0) return [];
    if (!selectedFuelType || selectedFuelType === 'All Fuels') return combinedVariantsPool;

    const target = selectedFuelType.toLowerCase();
    const filtered = combinedVariantsPool.filter((varItem) => {
      const vFuel = String(varItem.fuel_type || '').toLowerCase();
      if (target === 'electric' || target === 'ev') {
        return vFuel.includes('electric') || vFuel.includes('ev');
      }
      if (target === 'petrol') return vFuel.includes('petrol');
      if (target === 'cng') return vFuel.includes('cng');
      if (target === 'diesel') return vFuel.includes('diesel');
      if (target === 'hybrid') return vFuel.includes('hybrid');
      return vFuel.includes(target);
    });

    return filtered.length > 0 ? filtered : combinedVariantsPool;
  }, [combinedVariantsPool, selectedFuelType]);

  // Guaranteed display variants list so select never renders empty
  const displayVariants = useMemo(() => {
    if (variantsOfVehicleAndFuel && variantsOfVehicleAndFuel.length > 0) {
      return variantsOfVehicleAndFuel;
    }
    if (combinedVariantsPool && combinedVariantsPool.length > 0) {
      return combinedVariantsPool;
    }
    if (activeVehicle) {
      return [{
        id: `fallback-${activeVehicle.id}`,
        variant_name: `${activeVehicle.name} Standard`,
        ex_showroom_price: activeVehicle.starting_price || activeVehicle.ex_showroom_price || 500000,
        fuel_type: activeVehicle.fuel_type || 'Petrol',
        transmission: activeVehicle.transmission || 'Manual'
      }];
    }
    return [];
  }, [variantsOfVehicleAndFuel, combinedVariantsPool, activeVehicle]);

  // Active Variant object
  const activeVariant = useMemo(() => {
    if (!displayVariants || displayVariants.length === 0) return null;
    if (selectedVariantId) {
      const match = displayVariants.find((v) => String(v.id) === String(selectedVariantId));
      if (match) return match;
    }
    return displayVariants[0] || null;
  }, [displayVariants, selectedVariantId]);

  // Active State object
  const activeState = useMemo(() => {
    return states.find((s) => String(s.id) === String(selectedStateId)) || null;
  }, [states, selectedStateId]);

  // Auto-initialize default brand and vehicle on load or param change
  useEffect(() => {
    if (vehicles.length > 0) {
      if (preselectedVehicleId) {
        const found = vehicles.find((v) => String(v.id) === String(preselectedVehicleId));
        if (found) {
          const brandId = found.brand?.id || found.brand;
          if (brandId && String(brandId) !== String(selectedBrandId)) {
            setSelectedBrandId(brandId);
          }
          if (String(found.id) !== String(selectedVehicleId)) {
            setSelectedVehicleId(found.id);
          }
          return;
        }
      }
      if (!selectedBrandId && brands.length > 0) {
        const firstBrand = brands[0];
        setSelectedBrandId(firstBrand.id);
      }
    }
  }, [vehicles, brands, preselectedVehicleId]);

  // When selectedBrandId changes, ensure a valid vehicle of that brand is selected
  useEffect(() => {
    if (vehiclesOfBrand.length > 0) {
      const matchInBrand = vehiclesOfBrand.find((v) => String(v.id) === String(selectedVehicleId));
      if (!matchInBrand) {
        setSelectedVehicleId(vehiclesOfBrand[0].id);
        setBreakdownResult(null);
      }
    }
  }, [selectedBrandId, vehiclesOfBrand]);

  // When activeVehicle changes, auto-select default fuel type and variant
  useEffect(() => {
    if (activeVehicle) {
      setSelectedFuelType('All Fuels');
      if (displayVariants.length > 0) {
        setSelectedVariantId(String(displayVariants[0].id));
      } else {
        setSelectedVariantId('');
      }
    }
  }, [activeVehicle]);

  // When displayVariants updates, ensure selectedVariantId points to a valid variant in list
  useEffect(() => {
    if (displayVariants.length > 0) {
      const exists = displayVariants.some((v) => String(v.id) === String(selectedVariantId));
      if (!exists) {
        setSelectedVariantId(String(displayVariants[0].id));
      }
    }
  }, [displayVariants, selectedVariantId]);

  // Auto-select state
  useEffect(() => {
    if (states.length > 0 && !selectedStateId) {
      if (preselectedStateParam) {
        const matched = states.find(
          (s) =>
            String(s.id) === String(preselectedStateParam) ||
            s.code.toUpperCase() === preselectedStateParam.toUpperCase() ||
            s.name.toLowerCase().includes(preselectedStateParam.toLowerCase())
        );
        if (matched) {
          setSelectedStateId(matched.id);
          return;
        }
      }
      setSelectedStateId(states[0].id);
    }
  }, [states, selectedStateId, preselectedStateParam]);

  const leadMutation = useMutation({
    mutationFn: (leadPayload) => api.submitLeadAndGetBreakdown(leadPayload),
    onSuccess: (data, variables) => {
      setBreakdownResult(data.breakdown);
      setLeadRefId(data.lead_id);
      setIsGateOpen(false);
      setModalError(null);

      if (variables?.name && variables?.phone_number) {
        const userData = {
          name: variables.name,
          phone_number: variables.phone_number,
          city: variables.city || '',
        };
        setUnlockedUser(userData);
        try {
          localStorage.setItem('carguide_lead_user', JSON.stringify(userData));
          sessionStorage.setItem('carguide_lead_user', JSON.stringify(userData));
        } catch {
          // ignore
        }
      }
    },
    onError: (error) => {
      const errorMsg =
        error?.response?.data?.error ||
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
    if (num >= 100000) return `₹ ${(num / 100000).toFixed(2)} Lakh`;
    return `₹ ${num.toLocaleString('en-IN')}`;
  };

  const executeCalculation = (variantObj = activeVariant, fuel = selectedFuelType) => {
    if (!selectedVehicleId || !selectedStateId || !activeVehicle) return;

    const targetVariant = variantObj || activeVariant;
    const isFallbackVariant = targetVariant && String(targetVariant.id).startsWith('fallback-');

    const effectiveFuel =
      fuel && fuel !== 'All Fuels'
        ? fuel
        : targetVariant?.fuel_type || activeVehicle?.fuel_type || 'Petrol';

    const payload = {
      vehicle_id: Number(selectedVehicleId),
      state_id: Number(selectedStateId),
      variant_id: targetVariant && !isFallbackVariant ? Number(targetVariant.id) : null,
      variant_tier: variantTier,
      custom_ex_showroom: useCustomPrice && customExShowroom
        ? Number(customExShowroom)
        : targetVariant
        ? Number(targetVariant.ex_showroom_price)
        : null,
      fuel_type: effectiveFuel,
      ownership_type: ownershipType,
      is_financed: isFinanced,
      source_page: unlockedUser ? 'calculator_recalc' : 'calculator_gate',
    };

    if (unlockedUser) {
      leadMutation.mutate({
        ...payload,
        name: unlockedUser.name,
        phone_number: unlockedUser.phone_number,
        city: unlockedUser.city,
      });
    }
  };

  const handleBrandChange = (e) => {
    const bId = e.target.value;
    setSelectedBrandId(bId);
    setBreakdownResult(null);
  };

  const handleVehicleChange = (e) => {
    const vId = e.target.value;
    setSelectedVehicleId(vId);
    setBreakdownResult(null);
  };

  const handleFuelChange = (fuel) => {
    setSelectedFuelType(fuel);
    if (displayVariants && displayVariants.length > 0) {
      const target = fuel.toLowerCase();
      const matching = displayVariants.filter((v) => {
        const vf = String(v.fuel_type || '').toLowerCase();
        if (target === 'electric' || target === 'ev') return vf.includes('electric') || vf.includes('ev');
        if (target === 'petrol') return vf.includes('petrol');
        if (target === 'cng') return vf.includes('cng');
        if (target === 'diesel') return vf.includes('diesel');
        if (target === 'hybrid') return vf.includes('hybrid');
        return vf.includes(target);
      });

      const nextVar = matching[0] || displayVariants[0];
      if (nextVar) {
        setSelectedVariantId(String(nextVar.id));
        if (unlockedUser && breakdownResult) {
          executeCalculation(nextVar, fuel);
        }
      }
    }
  };

  const handleVariantChange = (e) => {
    const varId = e.target.value;
    setSelectedVariantId(varId);
    if (displayVariants) {
      const varObj = displayVariants.find((v) => String(v.id) === String(varId));
      if (varObj && unlockedUser && breakdownResult) {
        executeCalculation(varObj);
      }
    }
  };

  const handleCalculateClick = (e) => {
    e.preventDefault();
    if (!selectedVehicleId) {
      alert('Please select a car model.');
      return;
    }
    if (!selectedStateId) {
      alert('Please select your registration state.');
      return;
    }

    if (activeVehicle?.is_tba) {
      setBreakdownResult({
        is_tba: true,
        message: 'Price to be announced by manufacturer.',
        state_name: activeState?.name || 'Selected State',
        state_code: activeState?.code || '',
        vehicle_name: `${activeVehicle.brand_name || activeVehicle.brand?.name} ${activeVehicle.name}`,
      });
      return;
    }

    if (unlockedUser) {
      executeCalculation();
      return;
    }

    setIsGateOpen(true);
  };

  const handleGateSubmit = ({ name, phone_number, city }) => {
    const userData = { name, phone_number, city };
    setUnlockedUser(userData);
    try {
      localStorage.setItem('carguide_lead_user', JSON.stringify(userData));
      sessionStorage.setItem('carguide_lead_user', JSON.stringify(userData));
    } catch {
      // ignore
    }

    const targetVariant = activeVariant;
    const isFallbackVariant = targetVariant && String(targetVariant.id).startsWith('fallback-');
    const effectiveFuel =
      selectedFuelType && selectedFuelType !== 'All Fuels'
        ? selectedFuelType
        : targetVariant?.fuel_type || activeVehicle?.fuel_type || 'Petrol';

    leadMutation.mutate({
      ...userData,
      vehicle_id: Number(selectedVehicleId),
      state_id: Number(selectedStateId),
      variant_id: targetVariant && !isFallbackVariant ? Number(targetVariant.id) : null,
      variant_tier: variantTier,
      custom_ex_showroom: useCustomPrice && customExShowroom
        ? Number(customExShowroom)
        : targetVariant
        ? Number(targetVariant.ex_showroom_price)
        : null,
      fuel_type: effectiveFuel,
      ownership_type: ownershipType,
      is_financed: isFinanced,
      source_page: 'calculator_gate',
    });
  };

  const variantLabel = useCustomPrice && customExShowroom
    ? `Custom Ex-Showroom (${formatPriceOption(customExShowroom)})`
    : activeVariant
    ? `${activeVariant.variant_name} (${activeVariant.fuel_type || 'Petrol'}, ${activeVariant.transmission})`
    : variantTier === 'top'
    ? 'Top Variant'
    : 'Starting Variant';

  return (
    <CarBackgroundSlideshow>
      <SEOHead
        title="2026 On-Road Price Calculator | Brand → Model → Fuel → Variant | Car Guide Media"
        description="Filter by car brand, model, fuel type (Petrol, Diesel, CNG, Electric, Hybrid), and specific variant trim level to calculate accurate state-wise on-road prices across all 36 Indian states and union territories."
      />

      <div className="py-10 sm:py-16 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* HEADER */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200 shadow-sm">
              <CalcIcon className="w-4 h-4 text-red-600" />
              <span>Hierarchical 2026 Catalog • Brand → Model → Fuel → Variant</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight">
              Car On-Road Price Calculator
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto font-medium">
              Select your vehicle brand, car model, fuel type, and exact variant trim level to generate precise state-wise on-road price breakdowns across India.
            </p>
          </div>

          {/* MAIN FORM CONTAINER */}
          <div className="rounded-xl bg-white border border-slate-200/80 p-6 sm:p-8 space-y-8 shadow-2xl shadow-slate-300/40">
            {/* STEP 1: CASCADING CAR SELECTION (BRAND -> MODEL) */}
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5 text-sm font-bold text-slate-950">
                  <div className="w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-bold font-mono">
                    1
                  </div>
                  <span>Select Car Brand &amp; Model</span>
                </div>
                <span className="text-[11px] font-mono text-red-700 bg-red-50 px-2.5 py-1 rounded-full border border-red-200">
                  {vehiclesOfBrand.length} Models for Selected Brand
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1A: BRAND DROPDOWN */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center space-x-1.5">
                    <Car className="w-3.5 h-3.5 text-red-600" />
                    <span>1. Car Brand *</span>
                  </label>
                  <select
                    value={selectedBrandId}
                    onChange={handleBrandChange}
                    className="w-full px-4 py-3 rounded-lg bg-white border border-slate-200 text-slate-950 text-xs sm:text-sm font-bold focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all cursor-pointer shadow-sm"
                  >
                    <option value="">-- Choose Brand --</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.vehicle_count || 0} Models)
                      </option>
                    ))}
                  </select>
                </div>

                {/* 1B: MODEL DROPDOWN */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center space-x-1.5">
                    <Layers className="w-3.5 h-3.5 text-red-600" />
                    <span>2. Car Model *</span>
                  </label>
                  <select
                    value={selectedVehicleId}
                    onChange={handleVehicleChange}
                    disabled={!selectedBrandId || vehiclesOfBrand.length === 0}
                    className="w-full px-4 py-3 rounded-lg bg-white border border-slate-200 text-slate-950 text-xs sm:text-sm font-bold focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 disabled:bg-slate-50 disabled:opacity-60 transition-all cursor-pointer shadow-sm"
                  >
                    <option value="">-- Choose Car Model --</option>
                    {vehiclesOfBrand.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} {v.is_tba ? '(Price TBA)' : `(From ${formatPriceOption(v.starting_price || v.ex_showroom_price)})`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* ACTIVE CAR HIGHLIGHT BADGE */}
              {activeVehicle && (
                <div className={`p-4 rounded-xl border ${activeVehicle.is_tba ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-slate-50 border-slate-200 text-slate-700'} flex items-start justify-between gap-4 text-xs transition-all`}>
                  <div>
                    <div className="flex items-center space-x-2 font-black text-slate-950 text-base">
                      <span>{activeVehicle.brand_name || activeVehicle.brand?.name} {activeVehicle.name}</span>
                      {activeVehicle.is_tba && (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500 text-slate-950 font-bold uppercase">Price TBA</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Body Type: <strong className="text-slate-800 font-semibold">{activeVehicle.body_type}</strong> • Transmission: <strong className="text-slate-800 font-semibold">{activeVehicle.transmission}</strong>
                    </p>
                  </div>

                  {!activeVehicle.is_tba && (
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Ex-Showroom Range</span>
                      <span className="font-mono font-black text-red-600 text-sm">
                        {formatPriceOption(activeVehicle.starting_price || activeVehicle.ex_showroom_price)} – {formatPriceOption(activeVehicle.top_variant_price)}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* STEP 2: FUEL TYPE & VARIANT SELECTION */}
            {activeVehicle && !activeVehicle.is_tba && (
              <div className="space-y-5 pt-6 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5 text-sm font-bold text-slate-950">
                    <div className="w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-bold font-mono">
                      2
                    </div>
                    <span>Select Fuel Type &amp; Trim Variant</span>
                  </div>
                  {!activeVehicle?.is_tba && (
                    <button
                      type="button"
                      onClick={() => {
                        setUseCustomPrice(!useCustomPrice);
                        setBreakdownResult(null);
                      }}
                      className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline flex items-center space-x-1 transition-colors"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>{useCustomPrice ? 'Choose Trim Variant' : 'Enter Custom Price'}</span>
                    </button>
                  )}
                </div>

                {/* 2A: FUEL TYPE PILLS (ALL FUELS, PETROL, DIESEL, CNG, ELECTRIC, HYBRID) */}
                {availableFuelTypes.length > 0 && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center space-x-1.5">
                      <Fuel className="w-3.5 h-3.5 text-red-600" />
                      <span>3. Powertrain / Fuel Type Filter</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {availableFuelTypes.map((fuel) => {
                        const isSelected = selectedFuelType?.toLowerCase() === fuel.toLowerCase();
                        const isElectric = fuel === 'Electric';
                        return (
                          <button
                            key={fuel}
                            type="button"
                            onClick={() => handleFuelChange(fuel)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border flex items-center space-x-1.5 cursor-pointer ${
                              isSelected
                                ? 'bg-red-600 text-white border-red-600 shadow-md shadow-red-200'
                                : isElectric
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-950'
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                            {isElectric && !isSelected && <Zap className="w-3.5 h-3.5 text-emerald-600" />}
                            <span>{fuel}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 2B: VARIANT DROPDOWN OR CUSTOM PRICE */}
                {!useCustomPrice ? (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center space-x-1.5">
                      <Tag className="w-3.5 h-3.5 text-red-600" />
                      <span>4. Select Variant (S, V, VX, ZXi, Corporate, Trim Level) *</span>
                    </label>
                    <select
                      value={selectedVariantId}
                      onChange={handleVariantChange}
                      className="w-full px-4 py-3.5 rounded-lg bg-white border border-slate-300 text-slate-950 text-xs sm:text-sm font-bold focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all cursor-pointer shadow-sm"
                    >
                      {displayVariants.map((varItem) => (
                        <option key={varItem.id} value={varItem.id}>
                          {varItem.variant_name} ({varItem.fuel_type || 'Petrol'}, {varItem.transmission}) — Ex-Showroom: {formatPriceOption(varItem.ex_showroom_price)}
                        </option>
                      ))}
                    </select>

                    {activeVariant && (
                      <div className="mt-3 p-3.5 rounded-xl bg-red-50/80 border border-red-200 flex items-center justify-between text-xs text-red-950 font-medium shadow-sm">
                        <div className="flex items-center space-x-2">
                          <Check className="w-4 h-4 text-red-600 shrink-0" />
                          <span>Selected Variant: <strong className="font-extrabold text-slate-950 text-sm">{activeVariant.variant_name}</strong> ({activeVariant.fuel_type || 'Petrol'}, {activeVariant.transmission})</span>
                        </div>
                        <span className="font-mono font-black text-red-600 text-base">
                          {formatPriceOption(activeVariant.ex_showroom_price)}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Enter Ex-Showroom Price in INR (₹) *</label>
                    <input
                      type="number"
                      value={customExShowroom}
                      onChange={(e) => {
                        setCustomExShowroom(e.target.value);
                        setBreakdownResult(null);
                      }}
                      placeholder="e.g. 1250000"
                      className="w-full px-4 py-3 rounded-lg bg-white border border-slate-200 text-slate-950 text-xs sm:text-sm font-mono font-bold focus:outline-none focus:border-red-500 shadow-sm"
                    />
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Interpolates state road tax slabs based on your custom ex-showroom input.
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* STEP 3: STATE & PAYMENT OPTIONS */}
            <div className="space-y-4 pt-6 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5 text-sm font-bold text-slate-950">
                  <div className="w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-bold font-mono">
                    3
                  </div>
                  <span>State Registration &amp; Payment Details</span>
                </div>
                <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  36 States/UT Slabs
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* State Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Registration State / UT *</label>
                  <select
                    value={selectedStateId}
                    onChange={(e) => {
                      setSelectedStateId(e.target.value);
                      if (unlockedUser && breakdownResult) {
                        executeCalculation();
                      } else {
                        setBreakdownResult(null);
                      }
                    }}
                    className="w-full px-4 py-3 rounded-lg bg-white border border-slate-200 text-slate-950 text-xs sm:text-sm font-bold focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all cursor-pointer shadow-sm"
                  >
                    {states.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.code})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Ownership Category */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Ownership Category *</label>
                  <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-lg border border-slate-200">
                    <button
                      type="button"
                      onClick={() => {
                        setOwnershipType('individual');
                        if (unlockedUser && breakdownResult) executeCalculation();
                        else setBreakdownResult(null);
                      }}
                      className={`py-2 px-3 rounded-md text-xs font-bold transition-all cursor-pointer ${
                        ownershipType === 'individual' ? 'bg-red-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-950'
                      }`}
                    >
                      Individual
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOwnershipType('company');
                        if (unlockedUser && breakdownResult) executeCalculation();
                        else setBreakdownResult(null);
                      }}
                      className={`py-2 px-3 rounded-md text-xs font-bold transition-all cursor-pointer ${
                        ownershipType === 'company' ? 'bg-red-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-950'
                      }`}
                    >
                      Corporate
                    </button>
                  </div>
                </div>
              </div>

              {/* Payment Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Payment Method *</label>
                  <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-lg border border-slate-200">
                    <button
                      type="button"
                      onClick={() => {
                        setIsFinanced(false);
                        if (unlockedUser && breakdownResult) executeCalculation();
                        else setBreakdownResult(null);
                      }}
                      className={`py-2 px-3 rounded-md text-xs font-bold transition-all cursor-pointer ${
                        !isFinanced ? 'bg-red-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-950'
                      }`}
                    >
                      Outright Cash
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsFinanced(true);
                        if (unlockedUser && breakdownResult) executeCalculation();
                        else setBreakdownResult(null);
                      }}
                      className={`py-2 px-3 rounded-md text-xs font-bold transition-all cursor-pointer ${
                        isFinanced ? 'bg-red-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-950'
                      }`}
                    >
                      Bank Loan
                    </button>
                  </div>
                </div>

                {activeState && isFinanced && (
                  <div className="flex items-center text-xs text-slate-500 font-medium pt-5">
                    <Shield className="w-4 h-4 text-emerald-600 mr-1.5 shrink-0" />
                    <span>Includes RTO hypothecation endorsement fee (₹{Number(activeState.hypothecation_fee || 1500).toLocaleString('en-IN')}).</span>
                  </div>
                )}
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <div className="pt-6 border-t border-slate-200">
              <button
                type="button"
                disabled={leadMutation.isPending}
                onClick={handleCalculateClick}
                className="w-full py-4 px-6 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-red-200 hover:shadow-red-300 transition-all flex items-center justify-center space-x-2 group cursor-pointer"
              >
                <Sparkles className="w-5 h-5 text-white group-hover:rotate-12 transition-transform" />
                <span>
                  {activeVehicle?.is_tba
                    ? 'View TBA Status Notice'
                    : leadMutation.isPending
                    ? 'Calculating Itemized On-Road Price...'
                    : unlockedUser
                    ? 'Calculate On-Road Price'
                    : 'Calculate & Unlock On-Road Price'}
                </span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* RESULTS BREAKDOWN */}
          {breakdownResult && (
            <div ref={breakdownRef} className="scroll-mt-20">
              <PriceBreakdownTable
                breakdown={breakdownResult}
                vehicleName={activeVehicle ? `${activeVehicle.brand_name || activeVehicle.brand?.name} ${activeVehicle.name}` : 'Selected Vehicle'}
                variantName={variantLabel}
                leadId={leadRefId}
              />
            </div>
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
