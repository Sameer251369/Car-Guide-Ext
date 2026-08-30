import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Car, RefreshCw, Search } from 'lucide-react';
import api from '../api/client';
import SEOHead from '../components/SEOHead';
import VehicleCard from '../components/VehicleCard';

export default function Portfolio() {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedBodyType, setSelectedBodyType] = useState('');
  const [selectedFuelType, setSelectedFuelType] = useState('');
  const [ordering, setOrdering] = useState('name');

  useEffect(() => {
    setSearchQuery(searchParams.get('search') || '');
  }, [searchParams]);

  const { data: facets } = useQuery({
    queryKey: ['vehicle-facets'],
    queryFn: () => api.getVehicleFacets(),
  });

  const queryParams = {
    page_size: 500,
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

  const vehicles = vehiclesData?.results || vehiclesData || [];
  const totalCount = vehiclesData?.count || vehicles.length;
  const brands = facets?.brands || [];
  const bodyTypes = facets?.body_types || [];
  const fuelTypes = facets?.fuel_types || [];

  const handleReset = () => {
    setSearchQuery('');
    setSelectedBrand('');
    setSelectedBodyType('');
    setSelectedFuelType('');
    setOrdering('name');
  };

  return (
    <>
      <SEOHead
        title="New Cars in India | Car Guide Media"
        description="Explore verified Indian car models, ex-showroom price bands, fuel types, and state-wise on-road price calculators."
      />

      <div className="min-h-screen bg-slate-50 py-8">
        <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-red-600">New cars</p>
                <h1 className="mt-2 text-3xl font-black text-slate-950">Indian car catalog</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                  Search by brand, body style, fuel type, and price. Use Price Breakup on any car to calculate state-wise on-road price.
                </p>
              </div>
              <div className="rounded-md bg-slate-50 px-4 py-3 text-right">
                <span className="block text-[11px] font-bold uppercase text-slate-500">Showing</span>
                <span className="text-2xl font-black text-red-600">{totalCount} Cars</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="grid gap-3 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto]">
              <label className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search car model or brand"
                  className="h-11 w-full rounded-md border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm font-semibold outline-none focus:border-red-300 focus:bg-white"
                />
              </label>

              <select value={selectedBrand} onChange={(e) => setSelectedBrand(e.target.value)} className="h-11 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700">
                <option value="">All Brands</option>
                {brands.map((brand) => <option key={brand.id} value={brand.slug}>{brand.name}</option>)}
              </select>

              <select value={selectedBodyType} onChange={(e) => setSelectedBodyType(e.target.value)} className="h-11 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700">
                <option value="">All Body Styles</option>
                {bodyTypes.map((bodyType) => <option key={bodyType} value={bodyType}>{bodyType}</option>)}
              </select>

              <select value={selectedFuelType} onChange={(e) => setSelectedFuelType(e.target.value)} className="h-11 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700">
                <option value="">All Fuel Types</option>
                {fuelTypes.map((fuelType) => <option key={fuelType} value={fuelType}>{fuelType}</option>)}
              </select>

              <select value={ordering} onChange={(e) => setOrdering(e.target.value)} className="h-11 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700">
                <option value="name">Name A-Z</option>
                <option value="starting_price">Price Low-High</option>
                <option value="-starting_price">Price High-Low</option>
                <option value="-is_featured">Featured First</option>
              </select>

              <button onClick={handleReset} className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-slate-200 px-4 text-sm font-bold text-slate-700 hover:bg-slate-50">
                <RefreshCw className="h-4 w-4 text-red-600" />
                Reset
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => <div key={n} className="h-80 animate-pulse rounded-lg bg-white" />)}
            </div>
          ) : vehicles.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {vehicles.map((vehicle) => <VehicleCard key={vehicle.id} vehicle={vehicle} />)}
            </div>
          ) : (
            <div className="rounded-lg border border-slate-200 bg-white p-12 text-center">
              <Car className="mx-auto h-10 w-10 text-slate-400" />
              <h3 className="mt-3 text-lg font-black text-slate-950">No cars found</h3>
              <p className="mt-1 text-sm text-slate-500">Try a different brand, model, body style, or fuel filter.</p>
              <button onClick={handleReset} className="mt-5 rounded-md bg-red-600 px-4 py-2 text-sm font-black text-white">Clear filters</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
