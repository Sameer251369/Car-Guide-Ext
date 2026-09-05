import React, { useMemo, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../api/client';
import BudgetRail from '../components/BudgetRail';
import EditorialDesk from '../components/EditorialDesk';
import HeroMedia from '../components/HeroMedia';
import PriceLedger from '../components/PriceLedger';
import ProofRail from '../components/ProofRail';
import SearchGantry from '../components/SearchGantry';
import SEOHead from '../components/SEOHead';
import VehicleCard from '../components/VehicleCard';

const budgetLinks = {
  under10: { label: '₹10–20 lakh', value: 'ten20' },
  ten20: { label: 'Above ₹20 lakh', value: 'above20' },
  above20: { label: 'Under ₹10 lakh', value: 'under10' },
};

const proofItems = [
  { value: '301', label: 'car models' },
  { value: '36', label: 'states & UTs' },
  { value: 'Itemized', label: 'price breakup' },
];

export default function Home() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBudget, setSelectedBudget] = useState('under10');

  const {
    data: vehiclesData,
    isLoading: vehiclesLoading,
    isError: vehiclesError,
    refetch: refetchVehicles,
  } = useQuery({
    queryKey: ['home-vehicles', selectedBudget],
    queryFn: () => api.getVehicles({
      page_size: 'all',
      ordering: selectedBudget === 'above20' ? '-starting_price' : 'starting_price',
    }),
  });

  const { data: articlesData } = useQuery({
    queryKey: ['latest-articles'],
    queryFn: () => api.getArticles({ page_size: 3 }),
  });

  const allVehicles = useMemo(() => (
    Array.isArray(vehiclesData?.results)
      ? vehiclesData.results
      : Array.isArray(vehiclesData)
        ? vehiclesData
        : []
  ), [vehiclesData]);

  const vehicles = useMemo(() => {
    if (selectedBudget === 'under10') {
      return allVehicles.filter((vehicle) => Number(vehicle.starting_price || vehicle.ex_showroom_price) <= 1000000).slice(0, 8);
    }
    if (selectedBudget === 'ten20') {
      return allVehicles.filter((vehicle) => {
        const price = Number(vehicle.starting_price || vehicle.ex_showroom_price);
        return price > 1000000 && price <= 2000000;
      }).slice(0, 8);
    }
    return allVehicles.filter((vehicle) => Number(vehicle.starting_price || vehicle.ex_showroom_price) > 2000000).slice(0, 8);
  }, [allVehicles, selectedBudget]);

  const articles = Array.isArray(articlesData?.results)
    ? articlesData.results
    : Array.isArray(articlesData)
      ? articlesData
      : [];

  const handleSearch = (event) => {
    event.preventDefault();
    const query = searchQuery.trim();
    navigate(query ? `/vehicles?search=${encodeURIComponent(query)}` : '/vehicles');
  };

  return (
    <div className="cg-home">
      <SEOHead
        title="Find the Right Car | New Cars & On-Road Prices"
        description="Search Indian car models, compare ex-showroom prices, and calculate state-wise on-road estimates with Car Guide Media."
      />

      <section className="cg-hero" aria-labelledby="home-hero-title">
        <HeroMedia>
          <div className="cg-container cg-hero__content">
            <div className="cg-hero__copy">
              <p className="cg-operational-label">Indian car discovery / 2026 catalog</p>
              <h1 id="home-hero-title">
                <span>Find the right car.</span>
                <span>Know its on-road price.</span>
              </h1>
              <p className="cg-hero__description">
                Search 301 Indian car models, compare ex-showroom ranges, and open an itemized estimate for your state or union territory.
              </p>
            </div>

            <div className="cg-hero__lower">
              <SearchGantry value={searchQuery} onChange={setSearchQuery} onSubmit={handleSearch} />
              <div className="cg-hero__links">
                <Link to="/calculator" className="cg-text-link cg-text-link--light">
                  <span>Calculate on-road price</span>
                  <ArrowUpRight aria-hidden="true" />
                </Link>
                <Link to="/vehicles" className="cg-text-link cg-text-link--quiet">
                  <span>Browse all cars</span>
                  <ArrowUpRight aria-hidden="true" />
                </Link>
              </div>
              <ProofRail items={proofItems} />
            </div>
          </div>
        </HeroMedia>
      </section>

      <section className="cg-budget-section" aria-labelledby="budget-title">
        <div className="cg-container">
          <header className="cg-section-header cg-section-header--budget">
            <div>
              <p className="cg-operational-label">Starting grid</p>
              <h2 id="budget-title">Cars in your budget, lined up</h2>
              <p>Compare ex-showroom ranges at a glance, then open any car’s itemized on-road estimate.</p>
            </div>
          </header>

          <BudgetRail value={selectedBudget} onChange={setSelectedBudget} />

          <div
            id="budget-results"
            role="tabpanel"
            aria-label="Cars in selected budget"
            aria-live="polite"
            aria-busy={vehiclesLoading}
            className="cg-lineup-wrap"
          >
            {vehiclesLoading && (
              <>
                <span className="cg-sr-only">Loading cars…</span>
                <div className="cg-lineup cg-lineup--loading" aria-hidden="true">
                  {Array.from({ length: 8 }, (_, index) => <div className="cg-lineup-skeleton" key={index} />)}
                </div>
              </>
            )}

            {!vehiclesLoading && vehiclesError && (
              <div className="cg-lineup-state">
                <h3>Cars couldn’t load.</h3>
                <p>Try again or open the complete catalog.</p>
                <div className="cg-lineup-state__actions">
                  <button type="button" className="cg-primary-action cg-primary-action--compact" onClick={() => refetchVehicles()}>
                    Try again
                  </button>
                  <Link to="/vehicles" className="cg-text-link">Browse all cars <ArrowUpRight aria-hidden="true" /></Link>
                </div>
              </div>
            )}

            {!vehiclesLoading && !vehiclesError && vehicles.length === 0 && (
              <div className="cg-lineup-state">
                <h3>No cars are available in this budget yet.</h3>
                <div className="cg-lineup-state__actions">
                  <Link to="/vehicles" className="cg-primary-action cg-primary-action--compact">Browse all cars</Link>
                  <button type="button" className="cg-text-link" onClick={() => setSelectedBudget(budgetLinks[selectedBudget].value)}>
                    Try {budgetLinks[selectedBudget].label} <ArrowUpRight aria-hidden="true" />
                  </button>
                </div>
              </div>
            )}

            {!vehiclesLoading && !vehiclesError && vehicles.length > 0 && (
              <div className="cg-lineup">
                {vehicles.map((vehicle) => <VehicleCard key={vehicle.id} vehicle={vehicle} variant="lineup" />)}
              </div>
            )}
          </div>
        </div>
      </section>

      <PriceLedger />

      {articles.length > 0 && <EditorialDesk articles={articles} />}
    </div>
  );
}
