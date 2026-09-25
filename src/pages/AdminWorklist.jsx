import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Car,
  Check,
  Edit3,
  Eye,
  Filter,
  Image as ImageIcon,
  LogOut,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  Tag,
  Trash2,
  X,
  Download,
  DollarSign
} from 'lucide-react';
import api, { toAppMediaUrl } from '../api/client';
import SEOHead from '../components/SEOHead';

export default function AdminWorklist({ onLogout }) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('leads'); // 'leads' | 'cars' | 'add-car'

  // --- LEAD FILTERING STATE ---
  const [leadExportFilter, setLeadExportFilter] = useState('all');
  const [datePreset, setDatePreset] = useState('all'); // 'all' | 'today' | 'yesterday' | '7days' | '30days' | 'custom'
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [stateFilter, setStateFilter] = useState('all');
  const [carFilter, setCarFilter] = useState('all');
  const [leadSearch, setLeadSearch] = useState('');
  const [leadPage, setLeadPage] = useState(1);

  // --- CAR MANAGEMENT STATE ---
  const [carSearch, setCarSearch] = useState('');
  const [carSourceFilter, setCarSourceFilter] = useState('all');
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editVariants, setEditVariants] = useState([]);
  const [editImages, setEditImages] = useState({
    primary_image: null,
    front_image: null,
    exterior_image: null,
    interior_image: null,
    rear_image: null,
  });

  // --- ADD VEHICLE STATE ---
  const [vehicleForm, setVehicleForm] = useState({
    brand_name: '',
    name: '',
    body_type: 'SUV',
    fuel_type: 'Petrol',
    ev_hybrid_cng_flag: 'No',
    starting_price: '',
    top_variant_price: '',
    ex_showroom_price: '',
    seats: '',
    transmission: 'Manual/Automatic',
    description: '',
    key_specs: '{"engine": "", "mileage": ""}',
    is_featured: false,
    is_tba: false,
    meta_description: '',
  });
  const [primaryImage, setPrimaryImage] = useState(null);
  const [vehicleImages, setVehicleImages] = useState({
    front_image: null,
    exterior_image: null,
    interior_image: null,
    rear_image: null,
  });
  const [publishedVehicle, setPublishedVehicle] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const showNotification = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // --- QUERIES ---
  const { data: statesData } = useQuery({
    queryKey: ['calculator-states'],
    queryFn: () => api.getStates(),
  });
  const states = statesData || [];

  const { data: facetsData } = useQuery({
    queryKey: ['vehicle-facets'],
    queryFn: () => api.getVehicleFacets(),
  });
  const brands = facetsData?.brands || [];

  // Admin Leads Query with All Filters
  const leadQueryParams = useMemo(() => {
    const params = { page: leadPage };
    if (leadExportFilter !== 'all') params.is_exported = leadExportFilter;
    if (datePreset !== 'all' && datePreset !== 'custom') params.date_preset = datePreset;
    if (dateFrom) params.date_from = dateFrom;
    if (dateTo) params.date_to = dateTo;
    if (stateFilter !== 'all') params.state = stateFilter;
    if (carFilter !== 'all') params.car = carFilter;
    if (leadSearch.trim()) params.search = leadSearch.trim();
    return params;
  }, [leadExportFilter, datePreset, dateFrom, dateTo, stateFilter, carFilter, leadSearch, leadPage]);

  const { data: leadData, isLoading: leadsLoading, refetch: refetchLeads } = useQuery({
    queryKey: ['admin-leads', leadQueryParams],
    queryFn: () => api.getAdminLeads(leadQueryParams),
  });

  const leads = leadData?.results || [];
  const leadCount = leadData?.count ?? leads.length;
  const leadPageCount = Math.max(1, Math.ceil(leadCount / (leadData?.page_size || 10)));

  // Admin Vehicles Query (Records of Cars)
  const carQueryParams = useMemo(() => {
    const params = {};
    if (carSearch.trim()) params.search = carSearch.trim();
    if (carSourceFilter !== 'all') params.data_source = carSourceFilter;
    return params;
  }, [carSearch, carSourceFilter]);

  const { data: adminCarsData, isLoading: adminCarsLoading, refetch: refetchCars } = useQuery({
    queryKey: ['admin-vehicles-record', carQueryParams],
    queryFn: () => api.getAdminVehicles(carQueryParams),
  });

  const adminCars = adminCarsData || [];

  useEffect(() => {
    setLeadPage(1);
  }, [leadExportFilter, datePreset, dateFrom, dateTo, stateFilter, carFilter, leadSearch]);

  // --- MUTATIONS ---
  const publishVehicleMutation = useMutation({
    mutationFn: (payload) => api.createAdminVehicle(payload),
    onSuccess: (result) => {
      setPublishedVehicle(result.vehicle);
      setVehicleForm({
        brand_name: '',
        name: '',
        body_type: 'SUV',
        fuel_type: 'Petrol',
        ev_hybrid_cng_flag: 'No',
        starting_price: '',
        top_variant_price: '',
        ex_showroom_price: '',
        seats: '',
        transmission: 'Manual/Automatic',
        description: '',
        key_specs: '{"engine": "", "mileage": ""}',
        is_featured: false,
        is_tba: false,
        meta_description: '',
      });
      setPrimaryImage(null);
      setVehicleImages({ front_image: null, exterior_image: null, interior_image: null, rear_image: null });
      queryClient.invalidateQueries({ queryKey: ['admin-vehicles-record'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles-301'] });
      queryClient.invalidateQueries({ queryKey: ['vehicle-facets'] });
      showNotification('Car published successfully!');
    },
  });

  const updateVehicleMutation = useMutation({
    mutationFn: ({ id, payload }) => api.updateAdminVehicle(id, payload),
    onSuccess: () => {
      setEditingVehicle(null);
      queryClient.invalidateQueries({ queryKey: ['admin-vehicles-record'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles-301'] });
      queryClient.invalidateQueries({ queryKey: ['calculator-vehicles-master'] });
      queryClient.invalidateQueries({ queryKey: ['vehicle-facets'] });
      showNotification('Car and variants updated successfully!');
    },
    onError: (error) => {
      const responseData = error?.response?.data;
      const details = responseData && typeof responseData === 'object'
        ? Object.values(responseData).flat().join(' ')
        : '';
      showNotification(details ? `Update failed: ${details}` : 'Car update failed. Please try again.');
    },
  });

  const deleteVehicleMutation = useMutation({
    mutationFn: (id) => api.deleteAdminVehicle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-vehicles-record'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles-301'] });
      showNotification('Car deleted.');
    },
  });

  const deleteLeadMutation = useMutation({
    mutationFn: (id) => api.deleteAdminLead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-leads'] });
      showNotification('Lead deleted.');
    },
  });

  // --- HANDLERS ---
  const handleExportLeads = async () => {
    try {
      const exportParams = { ...leadQueryParams };
      delete exportParams.page; // Export all matching pages
      const blob = await api.exportLeadsCsv(exportParams);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `car_guide_leads_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      showNotification('Leads exported successfully.');
    } catch (err) {
      console.error('Export failed', err);
      alert('Lead export failed.');
    }
  };

  const handleLogout = async () => {
    if (onLogout) await onLogout();
  };

  const resetLeadFilters = () => {
    setLeadExportFilter('all');
    setDatePreset('all');
    setDateFrom('');
    setDateTo('');
    setStateFilter('all');
    setCarFilter('all');
    setLeadSearch('');
    setLeadPage(1);
  };

  const handleVehicleField = (event) => {
    const { name, value, type, checked } = event.target;
    setVehicleForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleVehicleImage = (event) => {
    const { name, files } = event.target;
    setVehicleImages((previous) => ({ ...previous, [name]: files?.[0] || null }));
  };

  const handlePublishVehicle = (event) => {
    event.preventDefault();
    setPublishedVehicle(null);

    const payload = new FormData();
    Object.entries(vehicleForm).forEach(([key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        payload.append(key, value);
      }
    });
    payload.append('is_active', 'true');
    if (!vehicleForm.ex_showroom_price && vehicleForm.starting_price) {
      payload.append('ex_showroom_price', vehicleForm.starting_price);
    }
    if (vehicleForm.key_specs.trim()) {
      payload.set('key_specs', vehicleForm.key_specs);
    }
    if (primaryImage) {
      payload.append('primary_image', primaryImage);
    }
    Object.entries(vehicleImages).forEach(([key, image]) => {
      if (image) payload.append(key, image);
    });

    publishVehicleMutation.mutate(payload);
  };

  // --- EDIT MODAL HANDLERS ---
  const startEditingVehicle = (car) => {
    setEditingVehicle(car);
    setEditVariants(car.variants ? car.variants.map((v) => ({ ...v })) : []);
    setEditForm({
      brand_name: car.brand_name || car.brand?.name || '',
      name: car.name || '',
      body_type: car.body_type || 'SUV',
      fuel_type: car.fuel_type || 'Petrol',
      ev_hybrid_cng_flag: car.ev_hybrid_cng_flag || 'No',
      starting_price: car.starting_price || '',
      top_variant_price: car.top_variant_price || '',
      ex_showroom_price: car.ex_showroom_price || '',
      seats: car.seats || '',
      transmission: car.transmission || 'Manual/Automatic',
      description: car.description || '',
      key_specs: typeof car.key_specs === 'object' ? JSON.stringify(car.key_specs) : (car.key_specs || ''),
      is_featured: Boolean(car.is_featured),
      is_tba: Boolean(car.is_tba),
      is_active: Boolean(car.is_active),
      meta_title: car.meta_title || '',
      meta_description: car.meta_description || '',
    });
    setEditImages({
      primary_image: null,
      front_image: null,
      exterior_image: null,
      interior_image: null,
      rear_image: null,
    });
  };

  const handleEditField = (event) => {
    const { name, value, type, checked } = event.target;
    if (name === 'starting_price' || name === 'ex_showroom_price') {
      setEditForm((prev) => ({ ...prev, starting_price: value, ex_showroom_price: value }));
      return;
    }
    setEditForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleEditImageChange = (event) => {
    const { name, files } = event.target;
    setEditImages((prev) => ({ ...prev, [name]: files?.[0] || null }));
  };

  const handleVariantChangeInEdit = (index, field, value) => {
    setEditVariants((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleAddVariantInEdit = () => {
    setEditVariants((prev) => [
      ...prev,
      {
        variant_name: '',
        ex_showroom_price: editForm.starting_price || editForm.ex_showroom_price || '',
        fuel_type: editForm.fuel_type || 'Petrol',
        transmission: 'Manual',
      },
    ]);
  };

  const handleRemoveVariantInEdit = (index) => {
    setEditVariants((prev) => {
      const next = [...prev];
      if (next[index].id) {
        next[index] = { ...next[index], delete: true };
      } else {
        next.splice(index, 1);
      }
      return next;
    });
  };

  const handleSaveVehicleEdit = (event) => {
    event.preventDefault();
    if (!editingVehicle) return;

    const payload = new FormData();
    Object.entries(editForm).forEach(([key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        payload.append(key, value);
      }
    });

    Object.entries(editImages).forEach(([key, file]) => {
      if (file) payload.append(key, file);
    });

    payload.append('variants_json', JSON.stringify(editVariants));

    updateVehicleMutation.mutate({ id: editingVehicle.id, payload });
  };

  const handleDeleteVehicle = (car) => {
    if (window.confirm(`Are you sure you want to delete ${car.brand_name || ''} ${car.name}?`)) {
      deleteVehicleMutation.mutate(car.id);
    }
  };

  const handleDeleteLead = (lead) => {
    if (window.confirm(`Delete the lead for ${lead.name}? This cannot be undone.`)) {
      deleteLeadMutation.mutate(lead.id);
    }
  };

  return (
    <>
      <SEOHead title="Admin Panel | Car Guide Media" description="Protected admin lead and car management dashboard." />
      <div className="min-h-screen bg-slate-950 py-10 text-slate-100">
        <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] font-semibold text-amber-400">Client Admin Control Panel</p>
              <h1 className="mt-1 text-3xl font-extrabold text-white tracking-tight">Management Dashboard</h1>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  refetchLeads();
                  refetchCars();
                }}
                className="flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-200 hover:bg-slate-700 transition"
              >
                <RefreshCw size={16} /> Refresh Data
              </button>
              <button
                onClick={handleExportLeads}
                className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-amber-400 transition"
              >
                <Download size={16} /> Export Filtered CSV
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 transition"
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          </div>

          {/* Toast notification */}
          {toastMessage && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-300 animate-fade-in flex items-center gap-2">
              <Check size={18} />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-800 gap-2">
            <button
              onClick={() => setActiveTab('leads')}
              className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition ${
                activeTab === 'leads'
                  ? 'border-amber-400 text-amber-400 bg-slate-900/50 rounded-t-xl'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Filter size={18} /> Leads & Filtering
              <span className="ml-1 rounded-full bg-slate-800 px-2.5 py-0.5 text-xs text-amber-300 font-bold">{leadCount}</span>
            </button>
            <button
              onClick={() => setActiveTab('cars')}
              className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition ${
                activeTab === 'cars'
                  ? 'border-amber-400 text-amber-400 bg-slate-900/50 rounded-t-xl'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Car size={18} /> Admin Cars Record (Update Price & Pics)
              <span className="ml-1 rounded-full bg-slate-800 px-2.5 py-0.5 text-xs text-amber-300 font-bold">{adminCars.length}</span>
            </button>
            <button
              onClick={() => setActiveTab('add-car')}
              className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition ${
                activeTab === 'add-car'
                  ? 'border-amber-400 text-amber-400 bg-slate-900/50 rounded-t-xl'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Plus size={18} /> Add New Car
            </button>
          </div>

          {/* TAB 1: LEADS & FILTERING */}
          {activeTab === 'leads' && (
            <div className="space-y-6">
              
              {/* Filter Control Box */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                    <Filter size={16} /> Filter Leads by Date, State, and Car
                  </h3>
                  <button
                    onClick={resetLeadFilters}
                    className="text-xs text-slate-400 hover:text-amber-300 underline underline-offset-4"
                  >
                    Reset all filters
                  </button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                  {/* Date Quick Presets */}
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-300 flex items-center gap-1.5">
                      <Calendar size={14} className="text-amber-400" /> Time / Date Range
                    </label>
                    <select
                      value={datePreset}
                      onChange={(e) => setDatePreset(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-amber-400"
                    >
                      <option value="all">All Time</option>
                      <option value="today">Today</option>
                      <option value="yesterday">Yesterday</option>
                      <option value="7days">Last 7 Days</option>
                      <option value="30days">Last 30 Days</option>
                      <option value="custom">Custom Date Range</option>
                    </select>
                  </div>

                  {/* Custom Date From */}
                  {datePreset === 'custom' && (
                    <>
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-slate-300">From Date</label>
                        <input
                          type="date"
                          value={dateFrom}
                          onChange={(e) => setDateFrom(e.target.value)}
                          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-slate-300">To Date</label>
                        <input
                          type="date"
                          value={dateTo}
                          onChange={(e) => setDateTo(e.target.value)}
                          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-amber-400"
                        />
                      </div>
                    </>
                  )}

                  {/* State Filter */}
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-300 flex items-center gap-1.5">
                      <MapPin size={14} className="text-amber-400" /> State
                    </label>
                    <select
                      value={stateFilter}
                      onChange={(e) => setStateFilter(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-amber-400"
                    >
                      <option value="all">All States</option>
                      {states.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Car Filter */}
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-300 flex items-center gap-1.5">
                      <Car size={14} className="text-amber-400" /> Car / Model
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Swift, Creta, Tata..."
                      value={carFilter === 'all' ? '' : carFilter}
                      onChange={(e) => setCarFilter(e.target.value || 'all')}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-amber-400"
                    />
                  </div>

                  {/* Export Status */}
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-300 flex items-center gap-1.5">
                      <Tag size={14} className="text-amber-400" /> Export Status
                    </label>
                    <select
                      value={leadExportFilter}
                      onChange={(e) => setLeadExportFilter(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-amber-400"
                    >
                      <option value="all">All Statuses</option>
                      <option value="false">Pending Export</option>
                      <option value="true">Already Exported</option>
                    </select>
                  </div>

                  {/* Search Query */}
                  <div className="lg:col-span-2">
                    <label className="mb-1.5 block text-xs font-medium text-slate-300 flex items-center gap-1.5">
                      <Search size={14} className="text-amber-400" /> Text Search
                    </label>
                    <input
                      type="text"
                      placeholder="Search name, phone number, city..."
                      value={leadSearch}
                      onChange={(e) => setLeadSearch(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>

              {/* Leads Table */}
              <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
                {leadsLoading ? (
                  <div className="p-12 text-center text-slate-400">Loading leads data...</div>
                ) : leads.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 space-y-2">
                    <p className="text-lg font-semibold text-slate-200">No leads found matching current filters.</p>
                    <p className="text-sm text-slate-500">Try adjusting your date range, state, or car filter.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                      <thead className="bg-slate-800/80 text-xs uppercase tracking-wider text-slate-300">
                        <tr>
                          <th className="px-4 py-3.5">Name</th>
                          <th className="px-4 py-3.5">Phone</th>
                          <th className="px-4 py-3.5">City</th>
                          <th className="px-4 py-3.5">State</th>
                          <th className="px-4 py-3.5">Brand</th>
                          <th className="px-4 py-3.5">Vehicle</th>
                          <th className="px-4 py-3.5">Ex-showroom</th>
                          <th className="px-4 py-3.5">On-road Price</th>
                          <th className="px-4 py-3.5">Source</th>
                          <th className="px-4 py-3.5">Date & Time</th>
                          <th className="px-4 py-3.5">Exported</th>
                          <th className="px-4 py-3.5">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 text-slate-200">
                        {leads.map((lead) => (
                          <tr key={lead.id} className="hover:bg-slate-800/50 transition">
                            <td className="px-4 py-3.5 font-medium text-white">{lead.name}</td>
                            <td className="px-4 py-3.5 font-mono text-amber-300">{lead.phone_number}</td>
                            <td className="px-4 py-3.5">{lead.city}</td>
                            <td className="px-4 py-3.5">{lead.state_name || '—'}</td>
                            <td className="px-4 py-3.5">{lead.brand_snapshot}</td>
                            <td className="px-4 py-3.5 font-semibold text-white">{lead.vehicle_name_snapshot}</td>
                            <td className="px-4 py-3.5">₹ {Number(lead.ex_showroom_price_at_query || 0).toLocaleString('en-IN')}</td>
                            <td className="px-4 py-3.5 text-emerald-400 font-bold">₹ {Number(lead.on_road_price_calculated || 0).toLocaleString('en-IN')}</td>
                            <td className="px-4 py-3.5 text-slate-400">{lead.source_page}</td>
                            <td className="px-4 py-3.5 text-xs text-slate-300">
                              {lead.created_at ? new Date(lead.created_at).toLocaleString('en-IN') : '—'}
                            </td>
                            <td className="px-4 py-3.5">
                              <span
                                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                  lead.is_exported
                                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                    : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                                }`}
                              >
                                {lead.is_exported ? 'Exported' : 'Pending'}
                              </span>
                            </td>
                            <td className="px-4 py-3.5">
                              <button
                                type="button"
                                onClick={() => handleDeleteLead(lead)}
                                disabled={deleteLeadMutation.isPending}
                                className="rounded-lg border border-red-500/30 p-2 text-red-400 transition hover:bg-red-500/10 disabled:opacity-40"
                                title="Delete lead"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Pagination */}
                {!leadsLoading && leads.length > 0 && (
                  <div className="flex items-center justify-between border-t border-slate-800 px-6 py-4 text-sm text-slate-300">
                    <span>
                      Page <strong className="text-white">{leadPage}</strong> of <strong className="text-white">{leadPageCount}</strong> ({leadCount} total leads)
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={leadPage === 1}
                        onClick={() => setLeadPage((page) => page - 1)}
                        className="rounded-lg border border-slate-700 px-4 py-1.5 text-slate-200 transition hover:bg-slate-800 disabled:opacity-40"
                      >
                        Previous
                      </button>
                      <button
                        type="button"
                        disabled={leadPage === leadPageCount}
                        onClick={() => setLeadPage((page) => page + 1)}
                        className="rounded-lg border border-slate-700 px-4 py-1.5 text-slate-200 transition hover:bg-slate-800 disabled:opacity-40"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: ADMIN CARS RECORD (UPDATE PRICE & PICS) */}
          {activeTab === 'cars' && (
            <div className="space-y-6">
              <div className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/90 p-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Car size={20} className="text-amber-400" /> Catalog & Admin Car Records
                  </h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Client and Admin records of all vehicles in system. Click <strong>Edit Price & Pics</strong> to update starting price, top variant price, or upload/replace photos.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="Search car name or brand..."
                    value={carSearch}
                    onChange={(e) => setCarSearch(e.target.value)}
                    className="rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-white outline-none focus:border-amber-400"
                  />
                  <select
                    value={carSourceFilter}
                    onChange={(e) => setCarSourceFilter(e.target.value)}
                    className="rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-white outline-none focus:border-amber-400"
                  >
                    <option value="manual">Admin Added</option>
                  </select>
                </div>
              </div>

              {adminCarsLoading ? (
                <div className="p-12 text-center text-slate-400">Loading car records...</div>
              ) : adminCars.length === 0 ? (
                <div className="p-12 text-center text-slate-400">No cars found matching search criteria.</div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {adminCars.map((car) => {
                    const primaryImg = toAppMediaUrl(car.primary_image);
                    const startPrice = car.starting_price || car.ex_showroom_price;
                    return (
                      <div
                        key={car.id}
                        className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg transition hover:border-slate-700"
                      >
                        <div className="space-y-4">
                          {/* Image Thumbnail */}
                          <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-950">
                            {primaryImg ? (
                              <img
                                src={primaryImg}
                                alt={car.name}
                                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                              />
                            ) : (
                              <div className="flex h-full w-full flex-col items-center justify-center text-slate-600">
                                <ImageIcon size={32} />
                                <span className="mt-1 text-xs">No picture</span>
                              </div>
                            )}
                            <div className="absolute top-2 right-2 flex gap-1">
                              {car.is_featured && (
                                <span className="rounded-md bg-amber-500/90 px-2 py-0.5 text-xs font-bold text-slate-950 shadow">
                                  Featured
                                </span>
                              )}
                              {car.is_tba && (
                                <span className="rounded-md bg-purple-500/90 px-2 py-0.5 text-xs font-bold text-white shadow">
                                  TBA
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Car Info */}
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                              {car.brand_name || car.brand?.name}
                            </p>
                            <h3 className="mt-1 text-xl font-bold text-white">{car.name}</h3>
                            <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-300">
                              <span className="rounded-md bg-slate-800 px-2.5 py-1">{car.body_type}</span>
                              <span className="rounded-md bg-slate-800 px-2.5 py-1">{car.fuel_type}</span>
                              {car.ev_hybrid_cng_flag !== 'No' && (
                                <span className="rounded-md bg-emerald-500/20 text-emerald-300 px-2 py-1 font-semibold">
                                  {car.ev_hybrid_cng_flag}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Prices */}
                          <div className="rounded-xl bg-slate-950/80 p-3 text-sm space-y-1 border border-slate-800/80">
                            <div className="flex justify-between text-slate-300">
                              <span className="text-xs text-slate-400">Starting Price:</span>
                              <span className="font-bold text-white">
                                {startPrice ? `₹ ${Number(startPrice).toLocaleString('en-IN')}` : 'TBA'}
                              </span>
                            </div>
                            {car.top_variant_price && (
                              <div className="flex justify-between text-slate-300">
                                <span className="text-xs text-slate-400">Top Variant:</span>
                                <span className="font-semibold text-slate-200">
                                  ₹ {Number(car.top_variant_price).toLocaleString('en-IN')}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-5 flex items-center justify-between border-t border-slate-800/80 pt-4 gap-2">
                          <Link
                            to={`/vehicles/${car.slug}`}
                            target="_blank"
                            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition"
                          >
                            <Eye size={14} /> View
                          </Link>
                          <div className="flex gap-2">
                            <button
                              onClick={() => startEditingVehicle(car)}
                              className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-3.5 py-1.5 text-xs font-bold text-slate-950 transition hover:bg-amber-400"
                            >
                              <Edit3 size={14} /> Edit Price & Pics
                            </button>
                            <button
                              onClick={() => handleDeleteVehicle(car)}
                              className="rounded-lg border border-red-500/30 p-1.5 text-red-400 hover:bg-red-500/10 transition"
                              title="Delete Car"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ADD NEW CAR */}
          {activeTab === 'add-car' && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-6">
              <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-amber-400 font-semibold">Publish New Vehicle</p>
                  <h2 className="mt-1 text-2xl font-bold text-white">Add Car to Database & Catalog</h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Published cars will immediately become live in New Cars listing, vehicle detail pages, and the on-road calculator.
                  </p>
                </div>
                {publishedVehicle && (
                  <Link
                    to={`/vehicles/${publishedVehicle.slug}`}
                    className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-emerald-400 transition"
                  >
                    View Published Car →
                  </Link>
                )}
              </div>

              <form onSubmit={handlePublishVehicle} className="grid gap-5 lg:grid-cols-4">
                {[
                  ['brand_name', 'Brand Name *', 'Maruti Suzuki'],
                  ['name', 'Car Model Name *', 'Swift'],
                  ['body_type', 'Body Type *', 'Hatchback'],
                  ['fuel_type', 'Fuel Type *', 'Petrol'],
                  ['starting_price', 'Starting Price (₹)', '579000'],
                  ['top_variant_price', 'Top Variant Price (₹)', '884000'],
                  ['seats', 'Seating Capacity', '5'],
                  ['transmission', 'Transmission', 'Manual/Automatic'],
                ].map(([name, label, placeholder]) => (
                  <label key={name} className="text-sm text-slate-300">
                    <span className="mb-1.5 block font-medium">{label}</span>
                    <input
                      name={name}
                      value={vehicleForm[name] || ''}
                      onChange={handleVehicleField}
                      placeholder={placeholder}
                      required={['brand_name', 'name', 'body_type', 'fuel_type'].includes(name)}
                      type={['starting_price', 'top_variant_price', 'seats'].includes(name) ? 'number' : 'text'}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white outline-none transition focus:border-amber-400"
                    />
                  </label>
                ))}

                <label className="text-sm text-slate-300">
                  <span className="mb-1.5 block font-medium">Powertrain Flag</span>
                  <select
                    name="ev_hybrid_cng_flag"
                    value={vehicleForm.ev_hybrid_cng_flag}
                    onChange={handleVehicleField}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white outline-none focus:border-amber-400"
                  >
                    <option value="No">No</option>
                    <option value="EV">EV</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="CNG">CNG</option>
                    <option value="Hybrid/CNG">Hybrid/CNG</option>
                  </select>
                </label>

                <label className="text-sm text-slate-300">
                  <span className="mb-1.5 block font-medium">Front Side Image (Main Photo)</span>
                  <input
                    name="front_image"
                    type="file"
                    accept="image/*"
                    onChange={handleVehicleImage}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-amber-500 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-slate-950"
                  />
                </label>

                {[
                  ['exterior_image', 'Exterior / Side View Photo'],
                  ['interior_image', 'Interior Cabin Photo'],
                  ['rear_image', 'Rear / Backside View Photo'],
                ].map(([name, label]) => (
                  <label key={name} className="text-sm text-slate-300">
                    <span className="mb-1.5 block font-medium">{label}</span>
                    <input
                      name={name}
                      type="file"
                      accept="image/*"
                      onChange={handleVehicleImage}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-amber-500 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-slate-950"
                    />
                  </label>
                ))}

                <label className="text-sm text-slate-300 lg:col-span-4">
                  <span className="mb-1.5 block font-medium">Vehicle Overview & Description</span>
                  <textarea
                    name="description"
                    value={vehicleForm.description}
                    onChange={handleVehicleField}
                    rows={4}
                    placeholder="Detailed overview for the vehicle detail page..."
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white outline-none transition focus:border-amber-400"
                  />
                </label>

                <label className="text-sm text-slate-300 lg:col-span-2">
                  <span className="mb-1.5 block font-medium">Key Specs (JSON Format)</span>
                  <textarea
                    name="key_specs"
                    value={vehicleForm.key_specs}
                    onChange={handleVehicleField}
                    rows={3}
                    placeholder={'{"engine":"1.5L Turbo","mileage":"18 kmpl"}'}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 font-mono text-sm text-white outline-none transition focus:border-amber-400"
                  />
                </label>

                <label className="text-sm text-slate-300 lg:col-span-2">
                  <span className="mb-1.5 block font-medium">Short Meta Description</span>
                  <textarea
                    name="meta_description"
                    value={vehicleForm.meta_description}
                    onChange={handleVehicleField}
                    rows={3}
                    placeholder="Short client-facing summary for SEO..."
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white outline-none transition focus:border-amber-400"
                  />
                </label>

                <div className="flex flex-wrap items-center gap-6 lg:col-span-4 border-t border-slate-800 pt-5">
                  <label className="inline-flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      name="is_featured"
                      checked={vehicleForm.is_featured}
                      onChange={handleVehicleField}
                      className="h-4 w-4 rounded border-slate-700 text-amber-500 focus:ring-amber-400"
                    />
                    Feature on Homepage
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      name="is_tba"
                      checked={vehicleForm.is_tba}
                      onChange={handleVehicleField}
                      className="h-4 w-4 rounded border-slate-700 text-amber-500 focus:ring-amber-400"
                    />
                    Price To Be Announced (TBA)
                  </label>

                  <button
                    disabled={publishVehicleMutation.isPending}
                    className="rounded-xl bg-amber-500 px-6 py-3 font-bold text-slate-950 transition hover:bg-amber-400 disabled:opacity-60 shadow-lg"
                  >
                    {publishVehicleMutation.isPending ? 'Publishing...' : 'Publish Car to Catalog'}
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      </div>

      {/* EDIT CAR MODAL (PRICE & PICS EDITOR) */}
      {editingVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="relative my-8 w-full max-w-3xl rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Edit3 size={14} /> Update Price & Pictures
                </p>
                <h3 className="mt-1 text-2xl font-bold text-white">
                  Edit {editingVehicle.brand_name || editingVehicle.brand?.name} {editingVehicle.name}
                </h3>
              </div>
              <button
                onClick={() => setEditingVehicle(null)}
                className="rounded-xl border border-slate-700 p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveVehicleEdit} className="space-y-6">
              {/* Prices Section */}
              <div className="rounded-2xl bg-slate-950 p-4 border border-slate-800 space-y-4">
                <h4 className="text-sm font-bold text-amber-300 flex items-center gap-1.5">
                  <DollarSign size={16} /> Update Car Prices (INR)
                </h4>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-xs text-slate-400">Starting Ex-Showroom Price</label>
                    <input
                      type="number"
                      name="starting_price"
                      value={editForm.starting_price || ''}
                      onChange={handleEditField}
                      placeholder="e.g. 600000"
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-slate-400">Top Variant Price</label>
                    <input
                      type="number"
                      name="top_variant_price"
                      value={editForm.top_variant_price || ''}
                      onChange={handleEditField}
                      placeholder="e.g. 950000"
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-slate-400">Ex-Showroom Price (Alias)</label>
                    <input
                      type="number"
                      name="ex_showroom_price"
                      value={editForm.ex_showroom_price || ''}
                      onChange={handleEditField}
                      placeholder="e.g. 600000"
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>

              {/* Variants Section */}
              <div className="rounded-2xl bg-slate-950 p-4 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-amber-300 flex items-center gap-1.5">
                    <Tag size={16} /> Trim Variants &amp; Prices ({editVariants.filter(v => !v.delete).length})
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddVariantInEdit}
                    className="flex items-center gap-1 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 px-3 py-1.5 rounded-lg transition"
                  >
                    <Plus size={14} /> Add Variant
                  </button>
                </div>

                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {editVariants.map((varItem, idx) => {
                    if (varItem.delete) return null;
                    return (
                      <div key={varItem.id || `new-${idx}`} className="flex flex-wrap sm:flex-nowrap items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 p-2.5">
                        <input
                          type="text"
                          placeholder="Variant Name (e.g. LXi 1.2)"
                          value={varItem.variant_name || ''}
                          onChange={(e) => handleVariantChangeInEdit(idx, 'variant_name', e.target.value)}
                          className="flex-1 min-w-[140px] rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-white outline-none focus:border-amber-400"
                        />
                        <input
                          type="number"
                          placeholder="Ex-Showroom (₹)"
                          value={varItem.ex_showroom_price || ''}
                          onChange={(e) => handleVariantChangeInEdit(idx, 'ex_showroom_price', e.target.value)}
                          className="w-28 rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-white outline-none focus:border-amber-400"
                        />
                        <input
                          type="text"
                          placeholder="Fuel (Petrol/EV)"
                          value={varItem.fuel_type || ''}
                          onChange={(e) => handleVariantChangeInEdit(idx, 'fuel_type', e.target.value)}
                          className="w-24 rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-white outline-none focus:border-amber-400"
                        />
                        <input
                          type="text"
                          placeholder="Transmission"
                          value={varItem.transmission || ''}
                          onChange={(e) => handleVariantChangeInEdit(idx, 'transmission', e.target.value)}
                          className="w-24 rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-white outline-none focus:border-amber-400"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveVariantInEdit(idx)}
                          className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition"
                          title="Remove Variant"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    );
                  })}
                  {editVariants.filter(v => !v.delete).length === 0 && (
                    <p className="text-xs text-slate-500 italic text-center py-2">No variants created yet. Click "+ Add Variant" to add specific trims.</p>
                  )}
                </div>
              </div>

              {/* Upload & Update Pictures Section */}
              <div className="rounded-2xl bg-slate-950 p-4 border border-slate-800 space-y-4">
                <h4 className="text-sm font-bold text-amber-300 flex items-center gap-1.5">
                  <ImageIcon size={16} /> Update Car Pictures / Upload New Photos
                </h4>
                
                {/* Current Images Preview */}
                {editingVehicle.images && editingVehicle.images.length > 0 && (
                  <div>
                    <span className="mb-2 block text-xs text-slate-400">Current Car Photos:</span>
                    <div className="flex flex-wrap gap-3">
                      {editingVehicle.images.map((img) => (
                        <div key={img.id} className="relative h-20 w-32 overflow-hidden rounded-lg border border-slate-700 bg-slate-900">
                          <img src={toAppMediaUrl(img.image_url)} alt={img.image_type} className="h-full w-full object-cover" />
                          <span className="absolute bottom-1 left-1 rounded bg-slate-950/80 px-1.5 py-0.5 text-[10px] uppercase font-bold text-amber-300">
                            {img.image_type}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-300">Front View / Main Photo</label>
                    <input
                      type="file"
                      name="front_image"
                      accept="image/*"
                      onChange={handleEditImageChange}
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-300 file:mr-2 file:rounded-md file:border-0 file:bg-amber-500 file:px-2.5 file:py-1 file:text-xs file:font-bold file:text-slate-950"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-300">Exterior Side View Photo</label>
                    <input
                      type="file"
                      name="exterior_image"
                      accept="image/*"
                      onChange={handleEditImageChange}
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-300 file:mr-2 file:rounded-md file:border-0 file:bg-amber-500 file:px-2.5 file:py-1 file:text-xs file:font-bold file:text-slate-950"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-300">Interior Cabin Photo</label>
                    <input
                      type="file"
                      name="interior_image"
                      accept="image/*"
                      onChange={handleEditImageChange}
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-300 file:mr-2 file:rounded-md file:border-0 file:bg-amber-500 file:px-2.5 file:py-1 file:text-xs file:font-bold file:text-slate-950"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-300">Rear Backside Photo</label>
                    <input
                      type="file"
                      name="rear_image"
                      accept="image/*"
                      onChange={handleEditImageChange}
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-300 file:mr-2 file:rounded-md file:border-0 file:bg-amber-500 file:px-2.5 file:py-1 file:text-xs file:font-bold file:text-slate-950"
                    />
                  </div>
                </div>
              </div>

              {/* General Details */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs text-slate-400">Car Model Name</label>
                  <input
                    type="text"
                    name="name"
                    value={editForm.name || ''}
                    onChange={handleEditField}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-white outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-slate-400">Brand Name</label>
                  <input
                    type="text"
                    name="brand_name"
                    value={editForm.brand_name || ''}
                    onChange={handleEditField}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-white outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-slate-400">Body Type</label>
                  <input
                    type="text"
                    name="body_type"
                    value={editForm.body_type || ''}
                    onChange={handleEditField}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-white outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-slate-400">Fuel Type</label>
                  <input
                    type="text"
                    name="fuel_type"
                    value={editForm.fuel_type || ''}
                    onChange={handleEditField}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-white outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Description & Specs */}
              <div>
                <label className="mb-1 block text-xs text-slate-400">Overview Description</label>
                <textarea
                  name="description"
                  value={editForm.description || ''}
                  onChange={handleEditField}
                  rows={3}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-white outline-none focus:border-amber-400"
                />
              </div>

              {/* Status Toggles */}
              <div className="flex flex-wrap gap-6 pt-2 border-t border-slate-800">
                <label className="inline-flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={editForm.is_active}
                    onChange={handleEditField}
                    className="h-4 w-4 rounded border-slate-700 text-amber-500 focus:ring-amber-400"
                  />
                  Active / Live on site
                </label>
                <label className="inline-flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_featured"
                    checked={editForm.is_featured}
                    onChange={handleEditField}
                    className="h-4 w-4 rounded border-slate-700 text-amber-500 focus:ring-amber-400"
                  />
                  Featured on Homepage
                </label>
                <label className="inline-flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_tba"
                    checked={editForm.is_tba}
                    onChange={handleEditField}
                    className="h-4 w-4 rounded border-slate-700 text-amber-500 focus:ring-amber-400"
                  />
                  Price TBA
                </label>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingVehicle(null)}
                  className="rounded-xl border border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateVehicleMutation.isPending}
                  className="rounded-xl bg-amber-500 px-6 py-2.5 text-sm font-bold text-slate-950 hover:bg-amber-400 transition disabled:opacity-60 shadow-lg"
                >
                  {updateVehicleMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
