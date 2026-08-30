import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Calculator, Car, IndianRupee, Search, ShieldCheck } from 'lucide-react';
import api from '../api/client';
import BlogCard from '../components/BlogCard';
import SEOHead from '../components/SEOHead';
import VehicleCard from '../components/VehicleCard';

export default function Home() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBudget, setSelectedBudget] = useState('under10');

  const { data: vehiclesData, isLoading } = useQuery({
    queryKey: ['home-vehicles', selectedBudget],
    queryFn: () => api.getVehicles({
      page_size: 12,
      ordering: selectedBudget === 'above20' ? '-starting_price' : 'starting_price',
    }),
  });

  const { data: articlesData } = useQuery({
    queryKey: ['latest-articles'],
    queryFn: () => api.getArticles({ page_size: 3 }),
  });

  const allVehicles = vehiclesData?.results || vehiclesData || [];
  const vehicles = useMemo(() => {
    if (selectedBudget === 'under10') {
      return allVehicles.filter((v) => Number(v.starting_price || v.ex_showroom_price) <= 1000000).slice(0, 8);
    }
    if (selectedBudget === 'ten20') {
      return allVehicles.filter((v) => {
        const price = Number(v.starting_price || v.ex_showroom_price);
        return price > 1000000 && price <= 2000000;
      }).slice(0, 8);
    }
    return allVehicles.filter((v) => Number(v.starting_price || v.ex_showroom_price) > 2000000).slice(0, 8);
  }, [allVehicles, selectedBudget]);

  const articles = articlesData?.results || articlesData || [];

  const budgetTabs = [
    { label: 'Cars Under 10 Lakh', value: 'under10' },
    { label: '10 - 20 Lakh', value: 'ten20' },
    { label: 'Premium Cars', value: 'above20' },
  ];

  const handleSearch = (event) => {
    event.preventDefault();
    const q = searchQuery.trim();
    navigate(q ? `/vehicles?search=${encodeURIComponent(q)}` : '/vehicles');
  };

  return (
    <>
      <SEOHead
        title="Car Guide Media | New Cars, On Road Price & Reviews"
        description="Explore new cars in India, compare prices, and calculate state-wise on-road price with Car Guide Media."
      />

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_420px] lg:px-8 lg:py-14">
          <div className="flex flex-col justify-center">
            <p className="mb-3 text-xs font-black uppercase tracking-[0.25em] text-red-600">New cars in India</p>
            <h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
              Find the right car and calculate its real on-road price.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              Search 301 Indian car models, check ex-showroom ranges, and get state-wise price breakup across 36 states and union territories.
            </p>

            <form onSubmit={handleSearch} className="mt-8 max-w-2xl rounded-lg border border-slate-200 bg-white p-2 shadow-xl shadow-slate-200/70">
              <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                <label className="relative block">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by brand or model, e.g. Nexon, Swift, Creta"
                    className="h-12 w-full rounded-md border border-transparent bg-slate-50 pl-12 pr-4 text-sm font-semibold text-slate-950 outline-none focus:border-red-200 focus:bg-white"
                  />
                </label>
                <button className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-red-600 px-6 text-sm font-black text-white transition hover:bg-red-700">
                  Search
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </form>

            <div className="mt-6 flex flex-wrap gap-3 text-sm">
              <Link to="/calculator" className="inline-flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-2 font-bold text-red-700">
                <Calculator className="h-4 w-4" />
                On-road price calculator
              </Link>
              <Link to="/vehicles" className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-4 py-2 font-bold text-slate-700 hover:bg-slate-50">
                <Car className="h-4 w-4" />
                Explore all cars
              </Link>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
            <img
              src="https://imgd.aeplcdn.com/0x0/n/cw/ec/141867/mahindra-xuv700-left-front-three-quarter2.jpeg"
              alt="New car search"
              className="h-full min-h-[320px] w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50 py-8">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 sm:grid-cols-3 sm:px-6 lg:px-8">
          {[
            ['301', 'car models'],
            ['36', 'states and UTs'],
            ['Itemized', 'price breakup'],
          ].map(([value, label]) => (
            <div key={label} className="rounded-lg border border-slate-200 bg-white p-5">
              <div className="text-3xl font-black text-slate-950">{value}</div>
              <div className="mt-1 text-sm font-bold uppercase tracking-wide text-slate-500">{label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-red-600">Popular cars by budget</p>
              <h2 className="mt-2 text-2xl font-black text-slate-950">Browse cars with price breakup</h2>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {budgetTabs.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setSelectedBudget(tab.value)}
                  className={`shrink-0 rounded-md px-4 py-2 text-sm font-bold ${
                    selectedBudget === tab.value ? 'bg-red-600 text-white' : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((n) => <div key={n} className="h-80 animate-pulse rounded-lg bg-slate-100" />)}
            </div>
          ) : (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {vehicles.map((vehicle) => <VehicleCard key={vehicle.id} vehicle={vehicle} />)}
            </div>
          )}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50 py-12">
        <div className="mx-auto grid max-w-7xl gap-5 px-4 sm:grid-cols-3 sm:px-6 lg:px-8">
          {[
            [IndianRupee, 'More accurate calculator', 'Uses the statewise master price row and itemizes RTO fees, insurance, TCS, and finance charges.'],
            [ShieldCheck, 'Transparent estimates', 'Every quote includes a disclaimer and state data note for client-safe usage.'],
            [Car, 'Admin-published cars', 'Client-added cars become live in the frontend catalog and calculator immediately.'],
          ].map(([Icon, title, text]) => (
            <div key={title} className="rounded-lg border border-slate-200 bg-white p-6">
              <Icon className="h-6 w-6 text-red-600" />
              <h3 className="mt-4 text-lg font-black text-slate-950">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {articles.length > 0 && (
        <section className="bg-white py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-6 flex items-end justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-red-600">Reviews & news</p>
                <h2 className="mt-2 text-2xl font-black text-slate-950">Latest articles</h2>
              </div>
              <Link to="/blog" className="text-sm font-black text-red-600">View all</Link>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {articles.map((article) => <BlogCard key={article.id} article={article} />)}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
