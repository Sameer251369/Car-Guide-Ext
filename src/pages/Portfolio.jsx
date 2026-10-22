import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Car, ChevronDown, ChevronLeft, ChevronRight, RefreshCw, Search, X } from 'lucide-react';
import api from '../api/client';
import SEOHead from '../components/SEOHead';
import VehicleCard from '../components/VehicleCard';

const listingStates = new Map();

/* --- Shared style tokens: replace with your existing ones if you have them --- */
const display = { fontFamily: 'var(--font-display, inherit)' };
const slant = { clipPath: 'polygon(0 0, 100% 0, calc(100% - 12px) 100%, 0 100%)' };
const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f6c945] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d0e10]';

const fieldBase =
  'h-12 w-full border bg-[#1a1c20] text-sm font-bold text-white outline-none transition-all duration-200 hover:border-[#dc2626]/70 focus:border-[#f6c945] focus:ring-2 focus:ring-[#f6c945]/30';

/* Styled select with custom chevron */
function FilterSelect({ value, onChange, children, label, active }) {
  return (
    <label className="group relative block">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={onChange}
        className={`${fieldBase} cursor-pointer appearance-none pl-4 pr-10 [&>option]:bg-[#1a1c20] [&>option]:text-white ${active ? 'border-[#dc2626] bg-[#dc2626]/10 text-[#f6c945]' : 'border-white/15'
          }`}
      >
        {children}
      </select>
      <ChevronDown
        className={`pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 transition-transform duration-200 group-focus-within:rotate-180 ${active ? 'text-[#f6c945]' : 'text-white/50'
          }`}
      />
    </label>
  );
}

export default function Portfolio() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const savedState = listingStates.get(location.key);
  const [searchQuery, setSearchQuery] = useState(savedState?.searchQuery ?? searchParams.get('search') ?? '');
  const [selectedBrand, setSelectedBrand] = useState(savedState?.selectedBrand ?? '');
  const [selectedBodyType, setSelectedBodyType] = useState(savedState?.selectedBodyType ?? '');
  const [selectedFuelType, setSelectedFuelType] = useState(savedState?.selectedFuelType ?? '');
  const [ordering, setOrdering] = useState(savedState?.ordering ?? 'name');
  const [currentPage, setCurrentPage] = useState(savedState?.currentPage ?? 1);
  const [pageSize, setPageSize] = useState(savedState?.pageSize ?? 12);
  const previousSearch = useRef(searchParams.toString());

  useEffect(() => {
    const nextSearch = searchParams.toString();
    if (nextSearch !== previousSearch.current) {
      previousSearch.current = nextSearch;
      setSearchQuery(searchParams.get('search') || '');
      setCurrentPage(1);
    }
  }, [searchParams]);

  useEffect(() => {
    listingStates.set(location.key, {
      searchQuery,
      selectedBrand,
      selectedBodyType,
      selectedFuelType,
      ordering,
      currentPage,
      pageSize,
    });
  }, [location.key, searchQuery, selectedBrand, selectedBodyType, selectedFuelType, ordering, currentPage, pageSize]);

  const { data: facets } = useQuery({
    queryKey: ['vehicle-facets'],
    queryFn: () => api.getVehicleFacets(),
  });

  const queryParams = {
    page: currentPage,
    ...(pageSize !== 'all' ? { page_size: pageSize } : { page_size: 'all' }),
    ...(searchQuery && { search: searchQuery }),
    ...(selectedBrand && { brand__slug: selectedBrand }),
    ...(selectedBodyType && { body_type: selectedBodyType }),
    ...(selectedFuelType && { fuel_type: selectedFuelType }),
    ...(ordering && { ordering }),
  };

  const { data: vehiclesData, isLoading } = useQuery({
    queryKey: ['vehicles-301', queryParams],
    queryFn: () => api.getVehicles(queryParams),
  });

  const vehicles = Array.isArray(vehiclesData?.results)
    ? vehiclesData.results
    : Array.isArray(vehiclesData)
      ? vehiclesData
      : [];
  const totalCount = vehiclesData?.count ?? vehicles.length;
  const isAllPages = pageSize === 'all';
  const effectivePageSize = isAllPages ? (totalCount || 1) : Number(pageSize);
  const totalPages = isAllPages ? 1 : Math.max(1, Math.ceil(totalCount / effectivePageSize));

  const startItem = totalCount === 0 ? 0 : isAllPages ? 1 : (currentPage - 1) * effectivePageSize + 1;
  const endItem = isAllPages ? totalCount : Math.min(currentPage * effectivePageSize, totalCount);

  const brands = Array.isArray(facets?.brands) ? facets.brands : [];
  const bodyTypes = Array.isArray(facets?.body_types) ? facets.body_types : [];
  const fuelTypes = Array.isArray(facets?.fuel_types) ? facets.fuel_types : [];

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 150, behavior: 'smooth' });
    }
  };

  const handleReset = () => {
    setSearchQuery('');
    setSelectedBrand('');
    setSelectedBodyType('');
    setSelectedFuelType('');
    setOrdering('name');
    setCurrentPage(1);
  };

  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, '...', totalPages];
    }
    if (currentPage >= totalPages - 3) {
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  /* Active filter chips (each removable) */
  const brandName = brands.find((b) => b.slug === selectedBrand)?.name || selectedBrand;
  const activeChips = [
    searchQuery && { key: 'search', label: `“${searchQuery}”`, clear: () => setSearchQuery('') },
    selectedBrand && { key: 'brand', label: brandName, clear: () => setSelectedBrand('') },
    selectedBodyType && { key: 'body', label: selectedBodyType, clear: () => setSelectedBodyType('') },
    selectedFuelType && { key: 'fuel', label: selectedFuelType, clear: () => setSelectedFuelType('') },
  ].filter(Boolean);

  const removeChip = (chip) => {
    chip.clear();
    setCurrentPage(1);
  };

  const pageBtn =
    'group inline-flex h-9 items-center gap-1 border border-white/15 px-3 text-xs font-extrabold text-white transition-all hover:border-[#f6c945] hover:bg-[#f6c945] hover:text-[#0d0e10] disabled:pointer-events-none disabled:opacity-40';

  return (
    <>
      <SEOHead
        title="New Cars in India | Car Guide Media"
        description="Explore verified Indian car models, ex-showroom price bands, fuel types, and state-wise on-road price calculators."
      />

      <div className="relative min-h-screen overflow-hidden bg-[#0d0e10] py-8 text-white sm:py-10">
        {/* Decorative speed panels */}
        <div aria-hidden="true" className="pointer-events-none absolute -top-28 -right-24 h-[420px] w-[420px] -skew-x-12 bg-gradient-to-br from-[#dc2626]/20 to-transparent" />
        <div aria-hidden="true" className="pointer-events-none absolute top-72 -left-32 h-64 w-64 -skew-x-12 bg-[#dc2626]/5" />

        <div className="relative mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">

          {/* ---------- Header ---------- */}
          <div className="relative overflow-hidden border border-white/10 bg-[#1a1c20] p-6 sm:p-8">
            <div aria-hidden="true" className="absolute inset-y-0 right-0 hidden w-1/3 -skew-x-12 translate-x-10 bg-gradient-to-l from-[#dc2626]/20 to-transparent md:block" />
            <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span aria-hidden="true" className="h-[3px] w-7 -skew-x-[30deg] bg-[#dc2626]" />
                  <p className="text-xs font-extrabold uppercase tracking-widest text-[#f6c945]">New cars</p>
                </div>
                <h1
                  className="mt-3 text-[clamp(2.25rem,6vw,4.5rem)] font-extrabold italic leading-[1.02] tracking-tight text-white"
                  style={display}
                >
                  Indian car catalog
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/60">
                  Search by brand, body style, fuel type, and price. Use Price Breakup on any car to calculate state-wise on-road price.
                </p>
              </div>

              <div
                className="relative flex-none self-start bg-[#dc2626] py-4 pl-6 pr-10 text-white md:self-auto md:text-right"
                style={slant}
              >
                <span className="relative block text-[11px] font-bold uppercase tracking-widest text-white/80">
                  {totalCount > 0 ? `Showing ${startItem}–${endItem} of` : 'Total'}
                </span>
                <span className="relative text-3xl font-extrabold italic tabular-nums" style={display}>
                  {totalCount} <span className="text-xl">Cars</span>
                </span>
              </div>
            </div>
          </div>

          {/* ---------- Filters ---------- */}
          <div className="border border-white/10 bg-[#1a1c20] p-4 sm:p-5">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto]">
              <label className="relative sm:col-span-2 lg:col-span-1">
                <span className="sr-only">Search car model or brand</span>
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#dc2626]" />
                <input
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search car model or brand"
                  className={`${fieldBase} border-white/15 bg-[#0d0e10] pl-11 pr-4 placeholder:font-semibold placeholder:text-white/40`}
                />
              </label>

              <FilterSelect
                label="Brand"
                active={!!selectedBrand}
                value={selectedBrand}
                onChange={(e) => {
                  setSelectedBrand(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">All Brands</option>
                {brands.map((brand) => <option key={brand.id} value={brand.slug}>{brand.name}</option>)}
              </FilterSelect>

              <FilterSelect
                label="Body style"
                active={!!selectedBodyType}
                value={selectedBodyType}
                onChange={(e) => {
                  setSelectedBodyType(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">All Body Styles</option>
                {bodyTypes.map((bodyType) => <option key={bodyType} value={bodyType}>{bodyType}</option>)}
              </FilterSelect>

              <FilterSelect
                label="Fuel type"
                active={!!selectedFuelType}
                value={selectedFuelType}
                onChange={(e) => {
                  setSelectedFuelType(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">All Fuel Types</option>
                {fuelTypes.map((fuelType) => <option key={fuelType} value={fuelType}>{fuelType}</option>)}
              </FilterSelect>

              <FilterSelect
                label="Sort by"
                active={ordering !== 'name'}
                value={ordering}
                onChange={(e) => {
                  setOrdering(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="name">Name A-Z</option>
                <option value="starting_price">Price Low-High</option>
                <option value="-starting_price">Price High-Low</option>
                <option value="-is_featured">Featured First</option>
              </FilterSelect>

              <button
                type="button"
                onClick={handleReset}
                className={`group relative inline-flex h-12 items-center justify-center gap-2 overflow-hidden bg-[#dc2626] pl-5 pr-7 text-sm font-extrabold italic uppercase tracking-wide text-white transition-all duration-300 hover:bg-[#f6c945] hover:text-[#0d0e10] active:scale-[0.97] ${focusRing}`}
                style={{ ...slant, ...display }}
              >
                <span aria-hidden="true" className="absolute inset-y-0 -left-1/2 w-1/3 -skew-x-[22deg] bg-white/30 transition-all duration-700 group-hover:left-[130%]" />
                <RefreshCw className="relative h-4 w-4 transition-transform duration-500 group-hover:rotate-180" />
                <span className="relative">Reset</span>
              </button>
            </div>

            {/* Active filter chips */}
            {activeChips.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/10 pt-4">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-white/50">Active</span>
                {activeChips.map((chip) => (
                  <button
                    key={chip.key}
                    type="button"
                    onClick={() => removeChip(chip)}
                    className={`group inline-flex items-center gap-1.5 border border-[#dc2626]/50 bg-[#dc2626]/10 py-1.5 pl-3.5 pr-2 text-xs font-bold capitalize text-white transition-all hover:border-[#f6c945] hover:bg-[#f6c945] hover:text-[#0d0e10] ${focusRing}`}
                  >
                    <span>{chip.label}</span>
                    <span className="grid h-4 w-4 place-items-center bg-[#dc2626] text-white transition-colors group-hover:bg-[#0d0e10]/20 group-hover:text-[#0d0e10]">
                      <X className="h-3 w-3" />
                    </span>
                    <span className="sr-only">Remove filter</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ---------- Results ---------- */}
          {isLoading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4" aria-hidden="true">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
                <div key={n} className="h-96 border border-white/10 bg-[#1a1c20] motion-safe:animate-pulse" />
              ))}
            </div>
          ) : vehicles.length > 0 ? (
            <>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {vehicles.map((vehicle) => <VehicleCard key={vehicle.id} vehicle={vehicle} />)}
              </div>

              {/* ---------- Pagination ---------- */}
              <div className="mt-8 flex flex-col items-center justify-between gap-4 border border-white/10 bg-[#1a1c20] p-4 sm:flex-row sm:p-5">
                <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-white/60 sm:justify-start">
                  <span className="font-bold text-white/50">Per page</span>
                  <label className="relative">
                    <span className="sr-only">Cars per page</span>
                    <select
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(e.target.value === 'all' ? 'all' : Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="h-9 cursor-pointer appearance-none border border-white/15 bg-[#0d0e10] pl-3 pr-8 text-sm font-bold text-white outline-none transition-all hover:border-[#dc2626]/70 focus:border-[#f6c945] focus:ring-2 focus:ring-[#f6c945]/30 [&>option]:bg-[#1a1c20] [&>option]:text-white"
                    >
                      <option value={12}>12</option>
                      <option value={24}>24</option>
                      <option value={48}>48</option>
                      <option value="all">All ({totalCount})</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/50" />
                  </label>
                  <span aria-hidden="true" className="hidden h-5 w-px -skew-x-12 bg-white/20 sm:inline-block" />
                  <span>
                    Showing <strong className="text-white">{startItem}–{endItem}</strong> of <strong className="text-white">{totalCount}</strong> cars
                  </span>
                </div>

                {!isAllPages && totalPages > 1 && (
                  <nav aria-label="Pagination" className="flex flex-wrap items-center justify-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`${pageBtn} ${focusRing}`}
                    >
                      <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                      Prev
                    </button>

                    {getPageNumbers().map((page, idx) => (
                      typeof page === 'number' ? (
                        <button
                          key={page}
                          type="button"
                          onClick={() => handlePageChange(page)}
                          aria-current={currentPage === page ? 'page' : undefined}
                          className={`h-9 min-w-[36px] px-2.5 text-xs font-extrabold transition-all duration-200 ${focusRing} ${currentPage === page
                              ? 'bg-[#dc2626] pr-4 text-white'
                              : 'border border-white/15 text-white hover:border-[#f6c945] hover:bg-[#f6c945] hover:text-[#0d0e10]'
                            }`}
                          style={currentPage === page ? slant : undefined}
                        >
                          {page}
                        </button>
                      ) : (
                        <span key={`ellipsis-${idx}`} className="px-1 text-xs font-bold text-white/40">
                          …
                        </span>
                      )
                    ))}

                    <button
                      type="button"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`${pageBtn} ${focusRing}`}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  </nav>
                )}
              </div>
            </>
          ) : (
            <div className="relative overflow-hidden border border-white/10 bg-[#1a1c20] p-12 text-center">
              <div aria-hidden="true" className="absolute -right-10 -top-10 h-40 w-40 -skew-x-12 bg-[#dc2626]/15" />
              <span className="relative mx-auto grid h-16 w-16 place-items-center bg-[#dc2626]/15 text-[#dc2626]" style={slant}>
                <Car className="h-8 w-8" />
              </span>
              <h3 className="relative mt-5 text-3xl font-extrabold italic tracking-tight text-white" style={display}>
                No cars found
              </h3>
              <p className="relative mt-2 text-sm text-white/60">Try a different brand, model, body style, or fuel filter.</p>
              <button
                type="button"
                onClick={handleReset}
                className={`group relative mt-6 inline-flex items-center gap-2 overflow-hidden bg-[#dc2626] py-3 pl-6 pr-8 text-sm font-extrabold italic uppercase tracking-wide text-white transition-all duration-300 hover:bg-[#f6c945] hover:text-[#0d0e10] active:scale-[0.97] ${focusRing}`}
                style={{ ...slant, ...display }}
              >
                <span aria-hidden="true" className="absolute inset-y-0 -left-1/2 w-1/3 -skew-x-[22deg] bg-white/40 transition-all duration-700 group-hover:left-[130%]" />
                <RefreshCw className="relative h-4 w-4 transition-transform duration-500 group-hover:rotate-180" />
                <span className="relative">Clear filters</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}