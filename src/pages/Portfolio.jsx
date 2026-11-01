import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Car, ChevronDown, ChevronLeft, ChevronRight, RefreshCw, Search, X } from 'lucide-react';
import api from '../api/client';
import SEOHead from '../components/SEOHead';
import VehicleCard from '../components/VehicleCard';

const listingStates = new Map();

/* Tokens: ink #0a0e13 · panel #11161d · sodium #ffb224 */
const wide = { fontFamily: "'Archivo','Arial Black',system-ui,sans-serif", fontStretch: '125%' };
const body = { fontFamily: "'Hanken Grotesk','Inter',system-ui,sans-serif" };

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffb224] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0e13]';

const fieldBase =
  'h-12 w-full rounded-full border bg-white/[0.06] text-sm font-semibold text-white outline-none transition-colors duration-200 hover:border-white/40 focus:border-[#ffb224] focus:ring-2 focus:ring-[#ffb224]/30';

/* Styled select with custom chevron */
function FilterSelect({ value, onChange, children, label, active }) {
  return (
    <label className="group relative block">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={onChange}
        className={`${fieldBase} cursor-pointer appearance-none pl-5 pr-10 [&>option]:bg-[#11161d] [&>option]:text-white ${
          active ? 'border-[#ffb224] bg-[#ffb224]/10 text-[#ffb224]' : 'border-white/15'
        }`}
      >
        {children}
      </select>
      <ChevronDown
        className={`pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 transition-transform duration-200 group-focus-within:rotate-180 ${
          active ? 'text-[#ffb224]' : 'text-white/50'
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
    'group inline-flex h-10 items-center gap-1 rounded-full border border-white/15 px-4 text-sm font-semibold text-white transition-colors hover:border-[#ffb224] hover:bg-[#ffb224] hover:text-[#0a0e13] disabled:pointer-events-none disabled:opacity-40';

  return (
    <>
      <SEOHead
        title="New Cars in India | Car Guide Media"
        description="Explore verified Indian car models, ex-showroom price bands, fuel types, and state-wise on-road price calculators."
      />

      <div className="relative min-h-screen bg-[#0a0e13] py-8 text-white sm:py-12" style={body}>
        <div className="relative mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
          {/* ---------- Header ---------- */}
          <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <h1
                className="text-[clamp(2rem,5vw,3.75rem)] font-extrabold leading-[1] tracking-[-0.03em] text-white"
                style={wide}
              >
                Indian car catalog
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/65">
                Search by brand, body style, fuel type and price. Open Price breakup on any car to see its on-road price
                in your state.
              </p>
            </div>

            <div className="flex-none self-start rounded-2xl border border-white/15 bg-white/[0.06] px-6 py-4 backdrop-blur-xl md:self-auto md:text-right">
              <span className="block text-xs text-white/60">
                {totalCount > 0 ? `Showing ${startItem}–${endItem} of` : 'Total'}
              </span>
              <span className="text-3xl font-extrabold tabular-nums tracking-[-0.02em]" style={wide}>
                {totalCount} <span className="text-lg font-bold text-white/70">cars</span>
              </span>
            </div>
          </header>

          {/* ---------- Filters ---------- */}
          <div className="rounded-3xl border border-white/10 bg-[#11161d] p-4 sm:p-5">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto]">
              <label className="relative sm:col-span-2 lg:col-span-1">
                <span className="sr-only">Search car model or brand</span>
                <Search className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#ffb224]" />
                <input
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search car model or brand"
                  className={`${fieldBase} border-white/15 pl-12 pr-4 placeholder:font-medium placeholder:text-white/40`}
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
                <option value="">All brands</option>
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
                <option value="">All body styles</option>
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
                <option value="">All fuel types</option>
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
                <option value="starting_price">Price low to high</option>
                <option value="-starting_price">Price high to low</option>
                <option value="-is_featured">Featured first</option>
              </FilterSelect>

              <button
                type="button"
                onClick={handleReset}
                className={`group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#ffb224] px-6 text-sm font-bold text-[#0a0e13] transition-colors duration-200 hover:bg-white active:scale-[0.98] ${focusRing}`}
              >
                <RefreshCw className="h-4 w-4 transition-transform duration-500 group-hover:rotate-180" />
                Reset
              </button>
            </div>

            {/* Active filter chips */}
            {activeChips.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/10 pt-4">
                <span className="text-sm text-white/55">Filters</span>
                {activeChips.map((chip) => (
                  <button
                    key={chip.key}
                    type="button"
                    onClick={() => removeChip(chip)}
                    className={`group inline-flex items-center gap-2 rounded-full border border-[#ffb224]/50 bg-[#ffb224]/10 py-1.5 pl-4 pr-2 text-sm font-semibold capitalize text-white transition-colors hover:border-[#ffb224] hover:bg-[#ffb224] hover:text-[#0a0e13] ${focusRing}`}
                  >
                    <span>{chip.label}</span>
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-[#ffb224] text-[#0a0e13] transition-colors group-hover:bg-[#0a0e13] group-hover:text-[#ffb224]">
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
                <div key={n} className="h-96 rounded-3xl border border-white/10 bg-[#11161d] motion-safe:animate-pulse" />
              ))}
            </div>
          ) : vehicles.length > 0 ? (
            <>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {vehicles.map((vehicle) => <VehicleCard key={vehicle.id} vehicle={vehicle} />)}
              </div>

              {/* ---------- Pagination ---------- */}
              <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-3xl border border-white/10 bg-[#11161d] p-4 sm:flex-row sm:p-5">
                <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-white/60 sm:justify-start">
                  <span className="font-semibold text-white/60">Per page</span>
                  <label className="relative">
                    <span className="sr-only">Cars per page</span>
                    <select
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(e.target.value === 'all' ? 'all' : Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="h-10 cursor-pointer appearance-none rounded-full border border-white/15 bg-white/[0.06] pl-4 pr-9 text-sm font-semibold text-white outline-none transition-colors hover:border-white/40 focus:border-[#ffb224] focus:ring-2 focus:ring-[#ffb224]/30 [&>option]:bg-[#11161d] [&>option]:text-white"
                    >
                      <option value={12}>12</option>
                      <option value={24}>24</option>
                      <option value={48}>48</option>
                      <option value="all">All ({totalCount})</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/50" />
                  </label>
                  <span aria-hidden="true" className="hidden h-5 w-px bg-white/15 sm:inline-block" />
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
                          className={`h-10 min-w-[40px] rounded-full px-3 text-sm font-bold transition-colors duration-200 ${focusRing} ${
                            currentPage === page
                              ? 'bg-[#ffb224] text-[#0a0e13]'
                              : 'border border-white/15 text-white hover:border-[#ffb224] hover:bg-[#ffb224] hover:text-[#0a0e13]'
                          }`}
                        >
                          {page}
                        </button>
                      ) : (
                        <span key={`ellipsis-${idx}`} className="px-1 text-sm font-semibold text-white/40">
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
            <div className="rounded-3xl border border-white/10 bg-[#11161d] p-12 text-center">
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-white/15 bg-white/[0.04] text-[#ffb224]">
                <Car className="h-8 w-8" />
              </span>
              <h3 className="mt-5 text-2xl font-extrabold tracking-[-0.02em] text-white sm:text-3xl" style={wide}>
                No cars found
              </h3>
              <p className="mx-auto mt-2 max-w-md text-white/65">
                Try a different brand, model, body style or fuel type, or clear your filters.
              </p>
              <button
                type="button"
                onClick={handleReset}
                className={`group mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-[#ffb224] px-7 text-[15px] font-bold text-[#0a0e13] transition-colors duration-200 hover:bg-white active:scale-[0.98] ${focusRing}`}
              >
                <RefreshCw className="h-4 w-4 transition-transform duration-500 group-hover:rotate-180" />
                Clear filters
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}