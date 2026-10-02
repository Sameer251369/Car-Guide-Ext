import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../api/client';
import SEOHead from '../components/SEOHead';
import LeadGateModal from '../components/LeadGateModal';
import PriceBreakdownTable from '../components/PriceBreakdownTable';
import CarBackgroundSlideshow from '../components/CarBackgroundSlideshow';
import {
  Calculator as CalcIcon, ArrowUpRight, Sparkles, Sliders, Car, Fuel, Tag,
  Shield, Check, Layers, Zap, ChevronDown,
} from 'lucide-react';

/* Cut-corner shapes (same language as the other pages) */
const CUT_LG = '[clip-path:polygon(0_0,calc(100%_-_16px)_0,100%_16px,100%_100%,16px_100%,0_calc(100%_-_16px))]';
const CUT_SM = '[clip-path:polygon(0_0,calc(100%_-_8px)_0,100%_8px,100%_100%,8px_100%,0_calc(100%_-_8px))]';

/* ---------- Small presentational helpers ---------- */
function StepHeader({ number, title, right }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 -skew-x-12 place-items-center bg-red-600 text-sm font-black text-white shadow-lg shadow-red-600/30">
          <span className="inline-block skew-x-12">{number}</span>
        </span>
        <h2 className="text-base sm:text-lg font-black italic tracking-tight text-slate-950">{title}</h2>
      </div>
      {right}
    </div>
  );
}

function FieldLabel({ icon: Icon, children }) {
  return (
    <span className="mb-2 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-slate-500">
      {Icon && <Icon className="h-3.5 w-3.5 text-red-600" />}
      <span>{children}</span>
    </span>
  );
}

function SelectBox({ value, onChange, disabled, children, large }) {
  return (
    <span className="group relative block">
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white pl-4 pr-10 text-sm font-bold text-slate-950 shadow-sm outline-none transition-all duration-200 hover:border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-600/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-60 ${large ? 'h-14' : 'h-12'}`}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-transform duration-200 group-focus-within:rotate-180 group-focus-within:text-red-600" />
    </span>
  );
}

function Segmented({ options, value, onSelect }) {
  return (
    <div className="grid grid-cols-2 gap-1.5 rounded-xl border border-slate-200 bg-slate-100 p-1.5">
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={String(opt.value)}
            type="button"
            onClick={() => onSelect(opt.value)}
            aria-pressed={active}
            className={`h-10 cursor-pointer rounded-lg px-3 text-xs font-extrabold transition-all duration-200 ${
              active
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                : 'text-slate-600 hover:bg-white hover:text-red-600'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

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

  /* Shared handler for the Individual/Corporate and Cash/Loan toggles (same behaviour as before) */
  const recalcOrReset = () => {
    if (unlockedUser && breakdownResult) executeCalculation();
    else setBreakdownResult(null);
  };

  return (
    <CarBackgroundSlideshow>
      <SEOHead
        title="2026 On-Road Price Calculator | Brand → Model → Fuel → Variant | Car Guide Media"
        description="Filter by car brand, model, fuel type (Petrol, Diesel, CNG, Electric, Hybrid), and specific variant trim level to calculate accurate state-wise on-road prices across all 36 Indian states and union territories."
      />

      <div className="py-10 sm:py-16 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

          {/* ---------- HEADER ---------- */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 -skew-x-12 bg-red-600 px-5 py-2 text-[11px] font-extrabold uppercase tracking-wider text-white shadow-lg shadow-red-600/30">
              <span className="inline-flex skew-x-12 items-center gap-2">
                <CalcIcon className="h-4 w-4" />
                <span>2026 catalog · Brand → Model → Fuel → Variant</span>
              </span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-black italic tracking-tight text-slate-950 leading-[1.05]">
              Car on-road price calculator
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto font-semibold leading-relaxed">
              Select your vehicle brand, car model, fuel type, and exact variant trim level to generate precise state-wise on-road price breakdowns across India.
            </p>
          </div>

          {/* ---------- MAIN FORM ---------- */}
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 space-y-8 shadow-[0_30px_60px_-25px_rgba(15,23,42,0.35)]">
            {/* racing stripe along the top */}
            <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-red-700 via-red-600 to-red-400" />
            <div aria-hidden="true" className="pointer-events-none absolute -right-16 top-0 h-48 w-48 -skew-x-12 bg-gradient-to-bl from-red-600/10 to-transparent" />

            {/* STEP 1 */}
            <div className="relative space-y-5">
              <StepHeader
                number="1"
                title="Select car brand & model"
                right={(
                  <span className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-[11px] font-extrabold text-red-700">
                    {vehiclesOfBrand.length} models for selected brand
                  </span>
                )}
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block">
                  <FieldLabel icon={Car}>Car brand *</FieldLabel>
                  <SelectBox value={selectedBrandId} onChange={handleBrandChange}>
                    <option value="">-- Choose Brand --</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.vehicle_count || 0} Models)
                      </option>
                    ))}
                  </SelectBox>
                </label>

                <label className="block">
                  <FieldLabel icon={Layers}>Car model *</FieldLabel>
                  <SelectBox
                    value={selectedVehicleId}
                    onChange={handleVehicleChange}
                    disabled={!selectedBrandId || vehiclesOfBrand.length === 0}
                  >
                    <option value="">-- Choose Car Model --</option>
                    {vehiclesOfBrand.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} {v.is_tba ? '(Price TBA)' : `(From ${formatPriceOption(v.starting_price || v.ex_showroom_price)})`}
                      </option>
                    ))}
                  </SelectBox>
                </label>
              </div>

              {/* Active car banner */}
              {activeVehicle && (
                <div
                  className={`relative flex flex-wrap items-center justify-between gap-4 overflow-hidden rounded-2xl border border-l-4 p-4 sm:p-5 transition-all ${
                    activeVehicle.is_tba
                      ? 'border-amber-200 border-l-amber-500 bg-amber-50'
                      : 'border-slate-200 border-l-red-600 bg-gradient-to-r from-rose-50/70 to-white'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2 text-lg font-black italic tracking-tight text-slate-950">
                      <span>{activeVehicle.brand_name || activeVehicle.brand?.name} {activeVehicle.name}</span>
                      {activeVehicle.is_tba && (
                        <span className="rounded bg-amber-500 px-2 py-0.5 text-[10px] font-extrabold uppercase not-italic text-slate-950">Price TBA</span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      Body type: <strong className="font-bold text-slate-800">{activeVehicle.body_type}</strong>
                      <span className="mx-1.5 text-slate-300">/</span>
                      Transmission: <strong className="font-bold text-slate-800">{activeVehicle.transmission}</strong>
                    </p>
                  </div>

                  {!activeVehicle.is_tba && (
                    <div className="text-left sm:text-right">
                      <span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Ex-showroom range</span>
                      <span className="text-base font-black text-red-600 tabular-nums">
                        {formatPriceOption(activeVehicle.starting_price || activeVehicle.ex_showroom_price)} – {formatPriceOption(activeVehicle.top_variant_price)}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* STEP 2 */}
            {activeVehicle && !activeVehicle.is_tba && (
              <div className="relative space-y-5 border-t border-slate-100 pt-7">
                <StepHeader
                  number="2"
                  title="Select fuel type & trim variant"
                  right={!activeVehicle?.is_tba && (
                    <button
                      type="button"
                      onClick={() => {
                        setUseCustomPrice(!useCustomPrice);
                        setBreakdownResult(null);
                      }}
                      className="group inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3.5 py-1.5 text-xs font-extrabold text-red-700 transition-all hover:border-red-600 hover:bg-red-600 hover:text-white"
                    >
                      <Sliders className="h-3.5 w-3.5 transition-transform duration-300 group-hover:rotate-90" />
                      <span>{useCustomPrice ? 'Choose trim variant' : 'Enter custom price'}</span>
                    </button>
                  )}
                />

                {/* Fuel pills */}
                {availableFuelTypes.length > 0 && (
                  <div>
                    <FieldLabel icon={Fuel}>Powertrain / fuel type</FieldLabel>
                    <div className="flex flex-wrap gap-2">
                      {availableFuelTypes.map((fuel) => {
                        const isSelected = selectedFuelType?.toLowerCase() === fuel.toLowerCase();
                        const isElectric = fuel === 'Electric';
                        return (
                          <button
                            key={fuel}
                            type="button"
                            onClick={() => handleFuelChange(fuel)}
                            aria-pressed={isSelected}
                            className={`inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-xl border px-4 text-xs font-extrabold transition-all duration-200 hover:-translate-y-0.5 ${
                              isSelected
                                ? 'border-red-600 bg-red-600 text-white shadow-lg shadow-red-600/25'
                                : isElectric
                                ? 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-red-300 hover:bg-red-50 hover:text-red-700'
                            }`}
                          >
                            {isSelected && <Check className="h-3.5 w-3.5" />}
                            {isElectric && !isSelected && <Zap className="h-3.5 w-3.5 text-emerald-600" />}
                            <span>{fuel}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Variant or custom price */}
                {!useCustomPrice ? (
                  <div>
                    <label className="block">
                      <FieldLabel icon={Tag}>Select variant (S, V, VX, ZXi, corporate, trim level) *</FieldLabel>
                      <SelectBox value={selectedVariantId} onChange={handleVariantChange} large>
                        {displayVariants.map((varItem) => (
                          <option key={varItem.id} value={varItem.id}>
                            {varItem.variant_name} ({varItem.fuel_type || 'Petrol'}, {varItem.transmission}) — Ex-Showroom: {formatPriceOption(varItem.ex_showroom_price)}
                          </option>
                        ))}
                      </SelectBox>
                    </label>

                    {activeVariant && (
                      <div className={`relative mt-4 flex flex-wrap items-center justify-between gap-3 overflow-hidden bg-gradient-to-br from-red-600 to-red-700 p-4 sm:p-5 text-white ${CUT_LG}`}>
                        <div aria-hidden="true" className="absolute -right-6 -top-6 h-24 w-24 rotate-12 bg-white/10" />
                        <div className="relative flex items-center gap-3">
                          <span className="grid h-8 w-8 flex-none place-items-center rounded-full bg-white text-red-600">
                            <Check className="h-4 w-4" />
                          </span>
                          <div className="text-xs">
                            <span className="block text-[10px] font-bold uppercase tracking-wider text-red-100">Selected variant</span>
                            <strong className="text-sm font-black">{activeVariant.variant_name}</strong>
                            <span className="text-red-100"> ({activeVariant.fuel_type || 'Petrol'}, {activeVariant.transmission})</span>
                          </div>
                        </div>
                        <span className="relative text-2xl font-black tabular-nums">
                          {formatPriceOption(activeVariant.ex_showroom_price)}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="block">
                      <FieldLabel>Enter ex-showroom price in INR (₹) *</FieldLabel>
                      <input
                        type="number"
                        value={customExShowroom}
                        onChange={(e) => {
                          setCustomExShowroom(e.target.value);
                          setBreakdownResult(null);
                        }}
                        placeholder="e.g. 1250000"
                        className="h-14 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-black tabular-nums text-slate-950 shadow-sm outline-none transition-all placeholder:font-semibold placeholder:text-slate-400 hover:border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-600/10"
                      />
                    </label>
                    <span className="mt-2 block text-[11px] font-semibold text-slate-400">
                      Interpolates state road tax slabs based on your custom ex-showroom input.
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* STEP 3 */}
            <div className="relative space-y-5 border-t border-slate-100 pt-7">
              <StepHeader
                number="3"
                title="State registration & payment details"
                right={(
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-extrabold text-emerald-700">
                    36 states / UT slabs
                  </span>
                )}
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block">
                  <FieldLabel>Registration state / UT *</FieldLabel>
                  <SelectBox
                    value={selectedStateId}
                    onChange={(e) => {
                      setSelectedStateId(e.target.value);
                      if (unlockedUser && breakdownResult) {
                        executeCalculation();
                      } else {
                        setBreakdownResult(null);
                      }
                    }}
                  >
                    {states.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.code})
                      </option>
                    ))}
                  </SelectBox>
                </label>

                <div>
                  <FieldLabel>Ownership category *</FieldLabel>
                  <Segmented
                    value={ownershipType}
                    options={[
                      { value: 'individual', label: 'Individual' },
                      { value: 'company', label: 'Corporate' },
                    ]}
                    onSelect={(val) => {
                      setOwnershipType(val);
                      recalcOrReset();
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <FieldLabel>Payment method *</FieldLabel>
                  <Segmented
                    value={isFinanced}
                    options={[
                      { value: false, label: 'Outright cash' },
                      { value: true, label: 'Bank loan' },
                    ]}
                    onSelect={(val) => {
                      setIsFinanced(val);
                      recalcOrReset();
                    }}
                  />
                </div>

                {activeState && isFinanced && (
                  <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 text-xs font-semibold text-emerald-800 sm:mt-7">
                    <Shield className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    <span>Includes RTO hypothecation endorsement fee (₹{Number(activeState.hypothecation_fee || 1500).toLocaleString('en-IN')}).</span>
                  </div>
                )}
              </div>
            </div>

            {/* SUBMIT */}
            <div className="relative border-t border-slate-100 pt-7">
              <button
                type="button"
                disabled={leadMutation.isPending}
                onClick={handleCalculateClick}
                className={`group relative flex w-full cursor-pointer items-center justify-between gap-3 overflow-hidden bg-red-600 py-2 pl-6 pr-2 text-sm font-extrabold text-white shadow-xl transition-all duration-300 hover:-translate-y-0.5 hover:bg-red-700 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-60 sm:text-base ${CUT_LG}`}
              >
                <span aria-hidden="true" className="absolute inset-y-0 -left-1/2 w-1/3 -skew-x-[22deg] bg-white/35 transition-all duration-700 group-hover:left-[130%]" />
                <span className="relative flex items-center gap-2.5">
                  <Sparkles className={`h-5 w-5 transition-transform duration-300 group-hover:rotate-12 ${leadMutation.isPending ? 'animate-pulse' : ''}`} />
                  <span>
                    {activeVehicle?.is_tba
                      ? 'View TBA status notice'
                      : leadMutation.isPending
                      ? 'Calculating itemized on-road price…'
                      : unlockedUser
                      ? 'Calculate on-road price'
                      : 'Calculate & unlock on-road price'}
                  </span>
                </span>
                <span className={`relative grid h-12 w-12 flex-none place-items-center bg-white text-red-600 transition-transform duration-300 group-hover:translate-x-0.5 ${CUT_SM}`}>
                  <ArrowUpRight className="h-5 w-5 transition-transform duration-300 group-hover:rotate-45" />
                </span>
              </button>
            </div>
          </div>

          {/* ---------- RESULTS ---------- */}
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