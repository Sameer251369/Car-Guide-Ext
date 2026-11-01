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

/* Tokens: ink #0a0e13 · panel #11161d · concrete #dfe3e6 · sodium #ffb224 */
const wide = { fontFamily: "'Archivo','Arial Black',system-ui,sans-serif", fontStretch: '125%' };
const body = { fontFamily: "'Hanken Grotesk','Inter',system-ui,sans-serif" };

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffb224] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0e13]';

/* ---------- Small presentational helpers ---------- */
function StepHeader({ number, title, right }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 flex-none place-items-center rounded-full bg-[#ffb224] text-sm font-extrabold text-[#0a0e13]">
          {number}
        </span>
        <h2 className="text-lg font-extrabold leading-tight tracking-[-0.02em] text-white sm:text-xl" style={wide}>
          {title}
        </h2>
      </div>
      {right}
    </div>
  );
}

function Tag2({ children, tone = 'amber' }) {
  const tones = {
    amber: 'border-[#ffb224]/50 bg-[#ffb224]/10 text-white',
    green: 'border-emerald-400/40 bg-emerald-500/10 text-emerald-300',
  };
  return (
    <span className={`inline-block rounded-full border px-3.5 py-1 text-xs font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}

function FieldLabel({ icon: Icon, children }) {
  return (
    <span className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-white/65">
      {Icon && <Icon className="h-3.5 w-3.5 text-[#ffb224]" aria-hidden="true" />}
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
        className={`w-full cursor-pointer appearance-none rounded-full border border-white/15 bg-white/[0.06] pl-5 pr-11 text-sm font-semibold text-white outline-none transition-colors duration-200 hover:border-white/40 focus:border-[#ffb224] focus:ring-2 focus:ring-[#ffb224]/30 disabled:cursor-not-allowed disabled:opacity-50 [&>option]:bg-[#11161d] [&>option]:text-white ${
          large ? 'h-14' : 'h-12'
        }`}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50 transition-transform duration-200 group-focus-within:rotate-180 group-focus-within:text-[#ffb224]" />
    </span>
  );
}

function Segmented({ options, value, onSelect }) {
  return (
    <div className="grid grid-cols-2 gap-1 rounded-full border border-white/10 bg-white/[0.04] p-1">
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={String(opt.value)}
            type="button"
            onClick={() => onSelect(opt.value)}
            aria-pressed={active}
            className={`h-10 cursor-pointer rounded-full px-3 text-sm font-semibold transition-colors duration-200 ${focusRing} focus-visible:ring-offset-0 ${
              active ? 'bg-[#ffb224] text-[#0a0e13]' : 'text-white/70 hover:bg-white/10 hover:text-white'
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

      <div
        style={body}
        className="relative isolate min-h-screen !bg-[#0a0e13] !text-white py-10 sm:py-16 before:content-[''] before:fixed before:inset-0 before:-z-10 before:!bg-[#0a0e13]"
      >
        <div className="mx-auto max-w-4xl space-y-8 px-4 sm:px-6 lg:px-8">

          {/* ---------- HEADER ---------- */}
          <div className="space-y-5 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-sm font-semibold text-white/85 backdrop-blur-xl">
              <CalcIcon className="h-4 w-4 text-[#ffb224]" aria-hidden="true" />
              <span>2026 catalog: brand, model, fuel, variant</span>
            </div>
            <h1
              className="text-[clamp(2rem,6vw,3.75rem)] font-extrabold leading-[1] tracking-[-0.03em] text-white"
              style={wide}
            >
              Car on-road price calculator
            </h1>
            <p className="mx-auto max-w-xl text-base leading-relaxed text-white/70">
              Choose your brand, model, fuel type and variant to get an itemised, state-wise on-road price for anywhere in India.
            </p>
          </div>

          {/* ---------- MAIN FORM ---------- */}
          <div className="relative space-y-8 rounded-[32px] border border-white/10 bg-[#11161d]/95 p-6 shadow-[0_30px_60px_-25px_rgba(0,0,0,0.8)] backdrop-blur-xl sm:p-8">

            {/* STEP 1 */}
            <div className="space-y-5">
              <StepHeader
                number="1"
                title="Select car brand and model"
                right={<Tag2>{vehiclesOfBrand.length} models for selected brand</Tag2>}
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
                  className={`flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-4 sm:p-5 ${
                    activeVehicle.is_tba
                      ? 'border-[#ffb224]/40 bg-[#ffb224]/10'
                      : 'border-white/10 bg-[#0a0e13]'
                  }`}
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-xl font-extrabold leading-tight tracking-[-0.02em] text-white" style={wide}>
                      <span>{activeVehicle.brand_name || activeVehicle.brand?.name} {activeVehicle.name}</span>
                      {activeVehicle.is_tba && (
                        <span className="rounded-full bg-[#ffb224] px-3 py-0.5 text-xs font-bold text-[#0a0e13]" style={body}>
                          Price TBA
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-white/55">
                      Body type: <strong className="font-semibold text-white">{activeVehicle.body_type}</strong>
                      <span className="mx-2 text-white/25">/</span>
                      Transmission: <strong className="font-semibold text-white">{activeVehicle.transmission}</strong>
                    </p>
                  </div>

                  {!activeVehicle.is_tba && (
                    <div className="text-left sm:text-right">
                      <span className="block text-xs text-white/55">Ex-showroom range</span>
                      <span className="text-lg font-extrabold tabular-nums tracking-[-0.02em] text-white" style={wide}>
                        {formatPriceOption(activeVehicle.starting_price || activeVehicle.ex_showroom_price)} – {formatPriceOption(activeVehicle.top_variant_price)}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* STEP 2 */}
            {activeVehicle && !activeVehicle.is_tba && (
              <div className="space-y-5 border-t border-white/10 pt-7">
                <StepHeader
                  number="2"
                  title="Select fuel type and trim variant"
                  right={!activeVehicle?.is_tba && (
                    <button
                      type="button"
                      onClick={() => {
                        setUseCustomPrice(!useCustomPrice);
                        setBreakdownResult(null);
                      }}
                      className={`group inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.06] px-4 py-2 text-sm font-semibold text-white transition-colors hover:border-[#ffb224] hover:bg-[#ffb224] hover:text-[#0a0e13] ${focusRing}`}
                    >
                      <Sliders className="h-3.5 w-3.5 transition-transform duration-300 group-hover:rotate-90" aria-hidden="true" />
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
                            className={`inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-full border px-5 text-sm font-semibold transition-colors duration-200 ${focusRing} ${
                              isSelected
                                ? 'border-[#ffb224] bg-[#ffb224] text-[#0a0e13]'
                                : isElectric
                                  ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                                  : 'border-white/15 bg-white/[0.04] text-white/80 hover:border-[#ffb224] hover:text-[#ffb224]'
                            }`}
                          >
                            {isSelected && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
                            {isElectric && !isSelected && <Zap className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />}
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
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#dfe3e6] p-4 text-[#0a0e13] sm:p-5">
                        <div className="flex items-center gap-3">
                          <span className="grid h-9 w-9 flex-none place-items-center rounded-full bg-[#0a0e13] text-[#ffb224]">
                            <Check className="h-4 w-4" aria-hidden="true" />
                          </span>
                          <div className="text-sm">
                            <span className="block text-xs font-semibold text-[#0a0e13]/65">Selected variant</span>
                            <strong className="font-bold">{activeVariant.variant_name}</strong>
                            <span className="text-[#0a0e13]/70"> ({activeVariant.fuel_type || 'Petrol'}, {activeVariant.transmission})</span>
                          </div>
                        </div>
                        <span className="text-2xl font-extrabold tabular-nums tracking-[-0.03em]" style={wide}>
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
                        className="h-14 w-full rounded-full border border-white/15 bg-white/[0.06] px-6 text-sm font-bold tabular-nums text-white outline-none transition-colors placeholder:font-medium placeholder:text-white/40 hover:border-white/40 focus:border-[#ffb224] focus:ring-2 focus:ring-[#ffb224]/30"
                      />
                    </label>
                    <span className="mt-2 block text-sm text-white/50">
                      Interpolates state road tax slabs based on your custom ex-showroom input.
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* STEP 3 */}
            <div className="space-y-5 border-t border-white/10 pt-7">
              <StepHeader
                number="3"
                title="State registration and payment details"
                right={<Tag2 tone="green">36 states / UT slabs</Tag2>}
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
                  <div className="flex items-start gap-2 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-3.5 text-sm font-medium text-emerald-300 sm:mt-7">
                    <Shield className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
                    <span>Includes RTO hypothecation endorsement fee (₹{Number(activeState.hypothecation_fee || 1500).toLocaleString('en-IN')}).</span>
                  </div>
                )}
              </div>
            </div>

            {/* SUBMIT */}
            <div className="border-t border-white/10 pt-7">
              <button
                type="button"
                disabled={leadMutation.isPending}
                onClick={handleCalculateClick}
                className={`group flex w-full cursor-pointer items-center justify-between gap-3 rounded-full bg-[#ffb224] py-2 pl-7 pr-2 text-base font-bold text-[#0a0e13] transition-colors duration-200 hover:bg-white active:scale-[0.99] disabled:pointer-events-none disabled:opacity-60 ${focusRing}`}
              >
                <span className="flex items-center gap-2.5">
                  <Sparkles className={`h-5 w-5 ${leadMutation.isPending ? 'motion-safe:animate-pulse' : ''}`} aria-hidden="true" />
                  <span>
                    {activeVehicle?.is_tba
                      ? 'View TBA status notice'
                      : leadMutation.isPending
                        ? 'Calculating itemised on-road price…'
                        : unlockedUser
                          ? 'Calculate on-road price'
                          : 'Calculate and unlock on-road price'}
                  </span>
                </span>
                <span className="grid h-12 w-12 flex-none place-items-center rounded-full bg-[#0a0e13] text-[#ffb224]">
                  <ArrowUpRight className="h-5 w-5 transition-transform duration-300 group-hover:rotate-45" aria-hidden="true" />
                </span>
              </button>
            </div>
          </div>

          {/* ---------- RESULTS ---------- */}
          {breakdownResult && (
            <div ref={breakdownRef} className="scroll-mt-24">
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