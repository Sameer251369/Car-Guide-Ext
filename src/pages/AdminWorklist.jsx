import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Car,
  Check,
  Download,
  Edit3,
  Eye,
  Image as ImageIcon,
  IndianRupee,
  LogOut,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  Tag,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import api, { toAppMediaUrl } from '../api/client';
import SEOHead from '../components/SEOHead';

/*
  Admin layout
  - Flat-black sidebar (nav + refresh + logout), light workspace so tables and forms stay readable
  - Brand red #dc2626 only for the primary action in each view, focus rings and pending status
  - Add Car: two-column form with a sticky photos + publish column
  - Edit Car: slide-over drawer with sticky header and footer
*/

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#dc2626] focus-visible:ring-offset-2';

const inputCls =
  'w-full rounded-xl border border-black/15 bg-white px-3.5 py-2.5 text-sm text-black placeholder:text-black/40 transition-colors focus:border-[#dc2626] focus:outline-none focus:ring-2 focus:ring-[#dc2626]/20';
const fileCls = `${inputCls} p-2 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-black file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-[#dc2626]`;

const btnPrimary = `inline-flex items-center justify-center gap-2 rounded-xl bg-[#dc2626] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#b91c1c] disabled:cursor-not-allowed disabled:opacity-60 ${focusRing}`;
const btnDark = `inline-flex items-center justify-center gap-2 rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-black/80 disabled:opacity-60 ${focusRing}`;
const btnGhost = `inline-flex items-center justify-center gap-2 rounded-xl border border-black/15 bg-white px-4 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-black/5 ${focusRing}`;
const iconBtnDanger = `rounded-lg border border-red-200 p-2 text-red-600 transition-colors hover:bg-red-50 disabled:opacity-40 ${focusRing}`;

const tabs = [
  { id: 'leads', label: 'Leads', icon: Users },
  { id: 'cars', label: 'Cars', icon: Car },
  { id: 'add-car', label: 'Add car', icon: Plus },
];

const tabMeta = {
  leads: ['Leads', 'Enquiries from the on-road price calculator. Filter them, then export what you see as CSV.'],
  cars: ['Cars', 'Every vehicle in the catalog. Edit prices, variants and photos.'],
  'add-car': ['Add a car', 'Published cars go live in New Cars, vehicle pages and the calculator right away.'],
};

const emptyVehicleForm = {
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
};

const emptyEditImages = {
  primary_image: null,
  front_image: null,
  exterior_image: null,
  interior_image: null,
  rear_image: null,
};

const formatINR = (value) => `₹ ${Number(value || 0).toLocaleString('en-IN')}`;

const apiErrorText = (error) => {
  const data = error?.response?.data;
  return data && typeof data === 'object' ? Object.values(data).flat().join(' ') : '';
};

/* ---------- small presentational helpers (module level so inputs never remount) ---------- */

function Field({ label, hint, className = '', children }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-sm font-medium text-black/80">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-black/50">{hint}</span>}
    </label>
  );
}

function Panel({ title, icon: Icon, action, children, className = '' }) {
  return (
    <section className={`rounded-2xl border border-black/10 bg-white p-5 sm:p-6 ${className}`}>
      {(title || action) && (
        <div className="mb-5 flex items-center justify-between gap-3">
          <h3 className="flex items-center gap-2 text-base font-bold tracking-tight">
            {Icon && <Icon size={18} className="text-[#dc2626]" aria-hidden="true" />}
            {title}
          </h3>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

function Toggle({ label, ...props }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2.5 text-sm font-medium text-black/80">
      <input type="checkbox" className="h-4 w-4 rounded border-black/30 accent-[#dc2626]" {...props} />
      {label}
    </label>
  );
}

function StatusPill({ exported }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
        exported ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
      }`}
    >
      {exported ? 'Exported' : 'Pending'}
    </span>
  );
}

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
  const [editImages, setEditImages] = useState(emptyEditImages);

  // --- ADD VEHICLE STATE ---
  const [vehicleForm, setVehicleForm] = useState(emptyVehicleForm);
  const [primaryImage, setPrimaryImage] = useState(null);
  const [vehicleImages, setVehicleImages] = useState({
    front_image: null,
    exterior_image: null,
    interior_image: null,
    rear_image: null,
  });
  const [publishedVehicle, setPublishedVehicle] = useState(null);
  const [toast, setToast] = useState(null);

  const showNotification = (message, tone = 'success') => {
    setToast({ message, tone });
    setTimeout(() => setToast(null), 4000);
  };

  // --- QUERIES ---
  const { data: statesData } = useQuery({
    queryKey: ['calculator-states'],
    queryFn: () => api.getStates(),
  });
  const states = statesData || [];

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

  const activeFilterCount = [
    leadExportFilter !== 'all',
    datePreset !== 'all',
    stateFilter !== 'all',
    carFilter !== 'all',
    Boolean(leadSearch.trim()),
  ].filter(Boolean).length;

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

  // Escape closes the edit drawer
  useEffect(() => {
    if (!editingVehicle) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setEditingVehicle(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [editingVehicle]);

  // --- MUTATIONS ---
  const publishVehicleMutation = useMutation({
    mutationFn: (payload) => api.createAdminVehicle(payload),
    onSuccess: (result) => {
      setPublishedVehicle(result.vehicle);
      setVehicleForm(emptyVehicleForm);
      setPrimaryImage(null);
      setVehicleImages({ front_image: null, exterior_image: null, interior_image: null, rear_image: null });
      queryClient.invalidateQueries({ queryKey: ['admin-vehicles-record'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles-301'] });
      queryClient.invalidateQueries({ queryKey: ['vehicle-facets'] });
      showNotification('Car published.');
    },
    onError: (error) => {
      const details = apiErrorText(error);
      showNotification(details ? `Publish failed: ${details}` : 'Publish failed. Please try again.', 'error');
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
      showNotification('Car and variants updated.');
    },
    onError: (error) => {
      const details = apiErrorText(error);
      showNotification(details ? `Update failed: ${details}` : 'Car update failed. Please try again.', 'error');
    },
  });

  const deleteVehicleMutation = useMutation({
    mutationFn: (id) => api.deleteAdminVehicle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-vehicles-record'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles-301'] });
      showNotification('Car deleted.');
    },
    onError: () => showNotification('Could not delete the car. Please try again.', 'error'),
  });

  const deleteLeadMutation = useMutation({
    mutationFn: (id) => api.deleteAdminLead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-leads'] });
      showNotification('Lead deleted.');
    },
    onError: () => showNotification('Could not delete the lead. Please try again.', 'error'),
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
      showNotification('Leads exported.');
    } catch (err) {
      console.error('Export failed', err);
      showNotification('Lead export failed.', 'error');
    }
  };

  const handleLogout = async () => {
    if (onLogout) await onLogout();
  };

  const handleRefresh = () => {
    refetchLeads();
    refetchCars();
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

  // --- EDIT HANDLERS ---
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
    setEditImages(emptyEditImages);
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

  const tabCounts = { leads: leadCount, cars: adminCars.length };
  const [pageTitle, pageIntro] = tabMeta[activeTab];
  const visibleEditVariants = editVariants.filter((v) => !v.delete);

  return (
    <>
      <SEOHead title="Admin Panel | Car Guide Media" description="Protected admin lead and car management dashboard." />

      <div className="min-h-screen bg-[#f4f4f4] text-black">
        {/* SIDEBAR (desktop) */}
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-black text-white lg:flex">
          <div className="px-6 pb-6 pt-8">
            <p className="text-xl font-extrabold tracking-tight">Car Guide Media</p>
            <p className="mt-1 text-sm text-white/55">Admin dashboard</p>
          </div>

          <nav className="flex-1 space-y-1 px-3" aria-label="Admin sections">
            {tabs.map(({ id, label, icon: Icon }) => {
              const active = activeTab === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveTab(id)}
                  aria-current={active ? 'page' : undefined}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-base font-semibold transition-colors ${focusRing} focus-visible:ring-offset-black ${
                    active ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span className={`h-5 w-1 rounded-full ${active ? 'bg-[#dc2626]' : 'bg-transparent'}`} aria-hidden="true" />
                  <Icon size={18} aria-hidden="true" />
                  <span className="flex-1">{label}</span>
                  {tabCounts[id] !== undefined && (
                    <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-bold text-white/80">
                      {tabCounts[id]}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="space-y-1 border-t border-white/10 p-3">
            <button
              type="button"
              onClick={handleRefresh}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-white/70 transition-colors hover:bg-white/5 hover:text-white ${focusRing} focus-visible:ring-offset-black`}
            >
              <RefreshCw size={16} aria-hidden="true" /> Refresh data
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-white/70 transition-colors hover:bg-white/5 hover:text-white ${focusRing} focus-visible:ring-offset-black`}
            >
              <LogOut size={16} aria-hidden="true" /> Log out
            </button>
          </div>
        </aside>

        {/* TOP BAR (mobile / tablet) */}
        <header className="sticky top-0 z-30 bg-black text-white lg:hidden">
          <div className="flex items-center justify-between px-4 py-3 sm:px-6">
            <p className="text-lg font-extrabold tracking-tight">Admin</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRefresh}
                aria-label="Refresh data"
                className={`rounded-full border border-white/20 p-2.5 ${focusRing} focus-visible:ring-offset-black`}
              >
                <RefreshCw size={16} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={handleLogout}
                aria-label="Log out"
                className={`rounded-full border border-white/20 p-2.5 ${focusRing} focus-visible:ring-offset-black`}
              >
                <LogOut size={16} aria-hidden="true" />
              </button>
            </div>
          </div>
          <nav className="flex gap-1 overflow-x-auto px-3 pb-3 sm:px-5" aria-label="Admin sections">
            {tabs.map(({ id, label, icon: Icon }) => {
              const active = activeTab === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveTab(id)}
                  aria-current={active ? 'page' : undefined}
                  className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${focusRing} focus-visible:ring-offset-black ${
                    active ? 'bg-white text-black' : 'bg-white/10 text-white/75'
                  }`}
                >
                  <Icon size={15} aria-hidden="true" />
                  {label}
                  {tabCounts[id] !== undefined && <span className="text-xs opacity-70">{tabCounts[id]}</span>}
                </button>
              );
            })}
          </nav>
        </header>

        {/* WORKSPACE */}
        <main className="lg:pl-64">
          <div className="mx-auto w-full max-w-[1280px] space-y-6 px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{pageTitle}</h1>
                <p className="mt-2 max-w-[60ch] text-base text-black/60">{pageIntro}</p>
              </div>

              {activeTab === 'leads' && (
                <button type="button" onClick={handleExportLeads} className={btnPrimary}>
                  <Download size={16} aria-hidden="true" /> Export CSV
                </button>
              )}
              {activeTab === 'cars' && (
                <button type="button" onClick={() => setActiveTab('add-car')} className={btnPrimary}>
                  <Plus size={16} aria-hidden="true" /> Add a car
                </button>
              )}
              {activeTab === 'add-car' && publishedVehicle && (
                <Link to={`/vehicles/${publishedVehicle.slug}`} className={btnDark}>
                  <Eye size={16} aria-hidden="true" /> View published car
                </Link>
              )}
            </div>

            {/* ===== LEADS ===== */}
            {activeTab === 'leads' && (
              <>
                <Panel
                  title="Filters"
                  action={
                    <div className="flex items-center gap-3 text-sm">
                      {activeFilterCount > 0 && (
                        <span className="rounded-full bg-black px-2.5 py-0.5 text-xs font-bold text-white">
                          {activeFilterCount} active
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={resetLeadFilters}
                        className={`rounded-sm font-semibold underline underline-offset-4 hover:text-[#dc2626] ${focusRing}`}
                      >
                        Reset all
                      </button>
                    </div>
                  }
                >
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-12">
                    <Field label="Search" className="lg:col-span-4">
                      <div className="relative">
                        <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-black/40" aria-hidden="true" />
                        <input
                          type="text"
                          placeholder="Name, phone number or city"
                          value={leadSearch}
                          onChange={(e) => setLeadSearch(e.target.value)}
                          className={`${inputCls} pl-10`}
                        />
                      </div>
                    </Field>

                    <Field label="Date range" className="lg:col-span-2">
                      <div className="relative">
                        <Calendar size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-black/40" aria-hidden="true" />
                        <select value={datePreset} onChange={(e) => setDatePreset(e.target.value)} className={`${inputCls} pl-10`}>
                          <option value="all">All time</option>
                          <option value="today">Today</option>
                          <option value="yesterday">Yesterday</option>
                          <option value="7days">Last 7 days</option>
                          <option value="30days">Last 30 days</option>
                          <option value="custom">Custom range</option>
                        </select>
                      </div>
                    </Field>

                    <Field label="State" className="lg:col-span-2">
                      <div className="relative">
                        <MapPin size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-black/40" aria-hidden="true" />
                        <select value={stateFilter} onChange={(e) => setStateFilter(e.target.value)} className={`${inputCls} pl-10`}>
                          <option value="all">All states</option>
                          {states.map((s) => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                      </div>
                    </Field>

                    <Field label="Car or model" className="lg:col-span-2">
                      <div className="relative">
                        <Car size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-black/40" aria-hidden="true" />
                        <input
                          type="text"
                          placeholder="e.g. Swift, Creta"
                          value={carFilter === 'all' ? '' : carFilter}
                          onChange={(e) => setCarFilter(e.target.value || 'all')}
                          className={`${inputCls} pl-10`}
                        />
                      </div>
                    </Field>

                    <Field label="Export status" className="lg:col-span-2">
                      <div className="relative">
                        <Tag size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-black/40" aria-hidden="true" />
                        <select value={leadExportFilter} onChange={(e) => setLeadExportFilter(e.target.value)} className={`${inputCls} pl-10`}>
                          <option value="all">All</option>
                          <option value="false">Pending export</option>
                          <option value="true">Already exported</option>
                        </select>
                      </div>
                    </Field>

                    {datePreset === 'custom' && (
                      <>
                        <Field label="From" className="lg:col-span-3">
                          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className={inputCls} />
                        </Field>
                        <Field label="To" className="lg:col-span-3">
                          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className={inputCls} />
                        </Field>
                      </>
                    )}
                  </div>
                </Panel>

                <section className="overflow-hidden rounded-2xl border border-black/10 bg-white" aria-busy={leadsLoading}>
                  {leadsLoading ? (
                    <div className="p-12 text-center text-black/60" role="status">Loading leads…</div>
                  ) : leads.length === 0 ? (
                    <div className="p-12 text-center">
                      <p className="text-xl font-bold tracking-tight">No leads match these filters</p>
                      <p className="mt-2 text-black/60">Widen the date range or clear the state and car filters.</p>
                      {activeFilterCount > 0 && (
                        <button type="button" onClick={resetLeadFilters} className={`${btnDark} mt-6`}>
                          Reset all filters
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-left text-sm">
                        <thead className="border-b border-black/10 bg-[#f4f4f4] text-black/60">
                          <tr>
                            <th scope="col" className="px-5 py-3.5 font-semibold">Lead</th>
                            <th scope="col" className="px-5 py-3.5 font-semibold">Vehicle</th>
                            <th scope="col" className="px-5 py-3.5 font-semibold">Price</th>
                            <th scope="col" className="px-5 py-3.5 font-semibold">Source</th>
                            <th scope="col" className="px-5 py-3.5 font-semibold">Status</th>
                            <th scope="col" className="px-5 py-3.5"><span className="sr-only">Actions</span></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-black/10">
                          {leads.map((lead) => (
                            <tr key={lead.id} className="align-top transition-colors hover:bg-black/[0.03]">
                              <td className="px-5 py-4">
                                <p className="font-bold">{lead.name}</p>
                                <p className="mt-0.5 font-mono text-[#b91c1c]">{lead.phone_number}</p>
                                <p className="mt-0.5 text-black/55">
                                  {[lead.city, lead.state_name].filter(Boolean).join(', ') || '—'}
                                </p>
                              </td>
                              <td className="px-5 py-4">
                                <p className="font-bold">{lead.vehicle_name_snapshot}</p>
                                <p className="mt-0.5 text-black/55">{lead.brand_snapshot}</p>
                              </td>
                              <td className="whitespace-nowrap px-5 py-4">
                                <p className="font-bold">{formatINR(lead.on_road_price_calculated)}</p>
                                <p className="mt-0.5 text-black/55">Ex-showroom {formatINR(lead.ex_showroom_price_at_query)}</p>
                              </td>
                              <td className="px-5 py-4">
                                <p>{lead.source_page || '—'}</p>
                                <p className="mt-0.5 text-black/55">
                                  {lead.created_at ? new Date(lead.created_at).toLocaleString('en-IN') : '—'}
                                </p>
                              </td>
                              <td className="px-5 py-4"><StatusPill exported={lead.is_exported} /></td>
                              <td className="px-5 py-4 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteLead(lead)}
                                  disabled={deleteLeadMutation.isPending}
                                  className={iconBtnDanger}
                                  aria-label={`Delete lead for ${lead.name}`}
                                >
                                  <Trash2 size={16} aria-hidden="true" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {!leadsLoading && leads.length > 0 && (
                    <div className="flex flex-col items-start justify-between gap-3 border-t border-black/10 px-5 py-4 text-sm sm:flex-row sm:items-center">
                      <span className="text-black/60">
                        Page <strong className="text-black">{leadPage}</strong> of <strong className="text-black">{leadPageCount}</strong> · {leadCount} total leads
                      </span>
                      <div className="flex gap-2">
                        <button type="button" disabled={leadPage === 1} onClick={() => setLeadPage((page) => page - 1)} className={`${btnGhost} px-4 py-2 disabled:opacity-40`}>
                          Previous
                        </button>
                        <button type="button" disabled={leadPage === leadPageCount} onClick={() => setLeadPage((page) => page + 1)} className={`${btnGhost} px-4 py-2 disabled:opacity-40`}>
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </section>
              </>
            )}

            {/* ===== CARS ===== */}
            {activeTab === 'cars' && (
              <>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="relative flex-1">
                    <label htmlFor="car-search" className="sr-only">Search cars</label>
                    <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-black/40" aria-hidden="true" />
                    <input
                      id="car-search"
                      type="search"
                      placeholder="Search by car name or brand"
                      value={carSearch}
                      onChange={(e) => setCarSearch(e.target.value)}
                      className={`${inputCls} pl-10`}
                    />
                  </div>
                  <div>
                    <label htmlFor="car-source" className="sr-only">Data source</label>
                    <select
                      id="car-source"
                      value={carSourceFilter}
                      onChange={(e) => setCarSourceFilter(e.target.value)}
                      className={`${inputCls} sm:w-48`}
                    >
                      <option value="all">All sources</option>
                      <option value="manual">Admin added</option>
                    </select>
                  </div>
                </div>

                {adminCarsLoading ? (
                  <div className="rounded-2xl border border-black/10 bg-white p-12 text-center text-black/60" role="status">
                    Loading cars…
                  </div>
                ) : adminCars.length === 0 ? (
                  <div className="rounded-2xl border border-black/10 bg-white p-12 text-center">
                    <p className="text-xl font-bold tracking-tight">No cars found</p>
                    <p className="mt-2 text-black/60">Try a different search, or add a new car.</p>
                  </div>
                ) : (
                  <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {adminCars.map((car) => {
                      const primaryImg = toAppMediaUrl(car.primary_image);
                      const startPrice = car.starting_price || car.ex_showroom_price;
                      return (
                        <article key={car.id} className="group flex flex-col overflow-hidden rounded-2xl border border-black/10 bg-white">
                          <div className="relative aspect-[16/10] overflow-hidden bg-[#eeeeee]">
                            {primaryImg ? (
                              <img
                                src={primaryImg}
                                alt={`${car.brand_name || car.brand?.name || ''} ${car.name}`}
                                className="h-full w-full object-cover motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-105"
                                loading="lazy"
                              />
                            ) : (
                              <div className="flex h-full w-full flex-col items-center justify-center text-black/35">
                                <ImageIcon size={32} aria-hidden="true" />
                                <span className="mt-1 text-sm">No photo yet</span>
                              </div>
                            )}
                            <div className="absolute left-3 top-3 flex gap-2">
                              {car.is_featured && (
                                <span className="rounded-full bg-black px-2.5 py-1 text-xs font-bold text-white">Featured</span>
                              )}
                              {car.is_tba && (
                                <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-black">TBA</span>
                              )}
                              {car.is_active === false && (
                                <span className="rounded-full bg-[#dc2626] px-2.5 py-1 text-xs font-bold text-white">Hidden</span>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-1 flex-col gap-4 p-5">
                            <div>
                              <p className="text-sm font-medium text-black/55">{car.brand_name || car.brand?.name}</p>
                              <h3 className="mt-0.5 text-xl font-extrabold tracking-tight">{car.name}</h3>
                              <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium">
                                {car.body_type && <span className="rounded-full bg-[#eeeeee] px-3 py-1">{car.body_type}</span>}
                                {car.fuel_type && <span className="rounded-full bg-[#eeeeee] px-3 py-1">{car.fuel_type}</span>}
                                {car.ev_hybrid_cng_flag && car.ev_hybrid_cng_flag !== 'No' && (
                                  <span className="rounded-full bg-green-50 px-3 py-1 text-green-700">{car.ev_hybrid_cng_flag}</span>
                                )}
                              </div>
                            </div>

                            <dl className="space-y-1.5 rounded-xl bg-[#f4f4f4] p-3.5 text-sm">
                              <div className="flex justify-between gap-3">
                                <dt className="text-black/60">Starting price</dt>
                                <dd className="font-bold">{startPrice ? formatINR(startPrice) : 'TBA'}</dd>
                              </div>
                              {car.top_variant_price && (
                                <div className="flex justify-between gap-3">
                                  <dt className="text-black/60">Top variant</dt>
                                  <dd className="font-semibold">{formatINR(car.top_variant_price)}</dd>
                                </div>
                              )}
                            </dl>

                            <div className="mt-auto flex items-center justify-between gap-2 border-t border-black/10 pt-4">
                              <Link
                                to={`/vehicles/${car.slug}`}
                                target="_blank"
                                className={`inline-flex items-center gap-1.5 rounded-sm text-sm font-semibold text-black/65 hover:text-black ${focusRing}`}
                              >
                                <Eye size={15} aria-hidden="true" /> View
                              </Link>
                              <div className="flex gap-2">
                                <button type="button" onClick={() => startEditingVehicle(car)} className={`${btnDark} px-3.5 py-2`}>
                                  <Edit3 size={14} aria-hidden="true" /> Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteVehicle(car)}
                                  className={iconBtnDanger}
                                  aria-label={`Delete ${car.name}`}
                                >
                                  <Trash2 size={16} aria-hidden="true" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {/* ===== ADD CAR ===== */}
            {activeTab === 'add-car' && (
              <form onSubmit={handlePublishVehicle} className="grid gap-6 lg:grid-cols-[1fr_22rem]">
                <div className="space-y-6">
                  <Panel title="Basics" icon={Car}>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Brand name *">
                        <input name="brand_name" value={vehicleForm.brand_name} onChange={handleVehicleField} placeholder="Maruti Suzuki" required className={inputCls} />
                      </Field>
                      <Field label="Car model name *">
                        <input name="name" value={vehicleForm.name} onChange={handleVehicleField} placeholder="Swift" required className={inputCls} />
                      </Field>
                      <Field label="Body type *">
                        <input name="body_type" value={vehicleForm.body_type} onChange={handleVehicleField} placeholder="Hatchback" required className={inputCls} />
                      </Field>
                      <Field label="Fuel type *">
                        <input name="fuel_type" value={vehicleForm.fuel_type} onChange={handleVehicleField} placeholder="Petrol" required className={inputCls} />
                      </Field>
                      <Field label="Powertrain flag">
                        <select name="ev_hybrid_cng_flag" value={vehicleForm.ev_hybrid_cng_flag} onChange={handleVehicleField} className={inputCls}>
                          <option value="No">No</option>
                          <option value="EV">EV</option>
                          <option value="Hybrid">Hybrid</option>
                          <option value="CNG">CNG</option>
                          <option value="Hybrid/CNG">Hybrid/CNG</option>
                        </select>
                      </Field>
                      <Field label="Seating capacity">
                        <input name="seats" type="number" value={vehicleForm.seats} onChange={handleVehicleField} placeholder="5" className={inputCls} />
                      </Field>
                      <Field label="Transmission" className="sm:col-span-2">
                        <input name="transmission" value={vehicleForm.transmission} onChange={handleVehicleField} placeholder="Manual/Automatic" className={inputCls} />
                      </Field>
                    </div>
                  </Panel>

                  <Panel title="Pricing" icon={IndianRupee}>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Starting price (₹)" hint="Also used as the ex-showroom price.">
                        <input name="starting_price" type="number" value={vehicleForm.starting_price} onChange={handleVehicleField} placeholder="579000" className={inputCls} />
                      </Field>
                      <Field label="Top variant price (₹)">
                        <input name="top_variant_price" type="number" value={vehicleForm.top_variant_price} onChange={handleVehicleField} placeholder="884000" className={inputCls} />
                      </Field>
                    </div>
                  </Panel>

                  <Panel title="Content" icon={Tag}>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Overview and description" className="sm:col-span-2">
                        <textarea name="description" value={vehicleForm.description} onChange={handleVehicleField} rows={4} placeholder="Overview shown on the vehicle detail page" className={inputCls} />
                      </Field>
                      <Field label="Key specs (JSON)">
                        <textarea name="key_specs" value={vehicleForm.key_specs} onChange={handleVehicleField} rows={4} placeholder={'{"engine":"1.5L Turbo","mileage":"18 kmpl"}'} className={`${inputCls} font-mono`} />
                      </Field>
                      <Field label="Short meta description" hint="Shown in search results.">
                        <textarea name="meta_description" value={vehicleForm.meta_description} onChange={handleVehicleField} rows={4} placeholder="Short summary for SEO" className={inputCls} />
                      </Field>
                    </div>
                  </Panel>
                </div>

                <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
                  <Panel title="Photos" icon={ImageIcon}>
                    <div className="space-y-4">
                      <Field label="Front view (main photo)">
                        <input name="front_image" type="file" accept="image/*" onChange={handleVehicleImage} className={fileCls} />
                      </Field>
                      <Field label="Exterior / side view">
                        <input name="exterior_image" type="file" accept="image/*" onChange={handleVehicleImage} className={fileCls} />
                      </Field>
                      <Field label="Interior cabin">
                        <input name="interior_image" type="file" accept="image/*" onChange={handleVehicleImage} className={fileCls} />
                      </Field>
                      <Field label="Rear view">
                        <input name="rear_image" type="file" accept="image/*" onChange={handleVehicleImage} className={fileCls} />
                      </Field>
                    </div>
                  </Panel>

                  <Panel title="Publish">
                    <div className="space-y-3">
                      <Toggle label="Feature on homepage" name="is_featured" checked={vehicleForm.is_featured} onChange={handleVehicleField} />
                      <Toggle label="Price to be announced (TBA)" name="is_tba" checked={vehicleForm.is_tba} onChange={handleVehicleField} />
                    </div>
                    <button type="submit" disabled={publishVehicleMutation.isPending} className={`${btnPrimary} mt-6 w-full py-3`}>
                      {publishVehicleMutation.isPending ? 'Publishing…' : 'Publish car to catalog'}
                    </button>
                  </Panel>
                </div>
              </form>
            )}
          </div>
        </main>
      </div>

      {/* TOAST */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-5 right-5 z-[60] flex max-w-sm items-start gap-3 rounded-2xl px-5 py-4 text-sm font-semibold text-white shadow-2xl ${
            toast.tone === 'error' ? 'bg-[#dc2626]' : 'bg-black'
          }`}
        >
          {toast.tone === 'error' ? <X size={18} className="mt-0.5 shrink-0" aria-hidden="true" /> : <Check size={18} className="mt-0.5 shrink-0" aria-hidden="true" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* EDIT DRAWER */}
      {editingVehicle && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <button
            type="button"
            aria-label="Close editor"
            onClick={() => setEditingVehicle(null)}
            className="absolute inset-0 cursor-default bg-black/50 backdrop-blur-sm"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-car-title"
            className="relative flex h-full w-full max-w-3xl flex-col bg-[#f4f4f4] shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-black/10 bg-white px-6 py-5">
              <div>
                <p className="text-sm font-medium text-black/55">Edit car</p>
                <h2 id="edit-car-title" className="text-2xl font-extrabold tracking-tight">
                  {editingVehicle.brand_name || editingVehicle.brand?.name} {editingVehicle.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setEditingVehicle(null)}
                aria-label="Close editor"
                className={`rounded-full border border-black/15 p-2.5 hover:bg-black/5 ${focusRing}`}
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleSaveVehicleEdit} className="flex min-h-0 flex-1 flex-col">
              <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
                <Panel title="Prices (₹)" icon={IndianRupee}>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <Field label="Starting ex-showroom">
                      <input type="number" name="starting_price" value={editForm.starting_price || ''} onChange={handleEditField} placeholder="600000" className={inputCls} />
                    </Field>
                    <Field label="Top variant">
                      <input type="number" name="top_variant_price" value={editForm.top_variant_price || ''} onChange={handleEditField} placeholder="950000" className={inputCls} />
                    </Field>
                    <Field label="Ex-showroom (alias)" hint="Stays in sync with starting price.">
                      <input type="number" name="ex_showroom_price" value={editForm.ex_showroom_price || ''} onChange={handleEditField} placeholder="600000" className={inputCls} />
                    </Field>
                  </div>
                </Panel>

                <Panel
                  title={`Variants (${visibleEditVariants.length})`}
                  icon={Tag}
                  action={
                    <button type="button" onClick={handleAddVariantInEdit} className={`${btnDark} px-3.5 py-2`}>
                      <Plus size={14} aria-hidden="true" /> Add variant
                    </button>
                  }
                >
                  <div className="space-y-3">
                    {editVariants.map((varItem, idx) => {
                      if (varItem.delete) return null;
                      return (
                        <div
                          key={varItem.id || `new-${idx}`}
                          className="grid items-center gap-2 rounded-xl bg-[#f4f4f4] p-3 sm:grid-cols-[2fr_1.3fr_1fr_1fr_auto]"
                        >
                          <input
                            type="text"
                            aria-label="Variant name"
                            placeholder="Variant name (e.g. LXi 1.2)"
                            value={varItem.variant_name || ''}
                            onChange={(e) => handleVariantChangeInEdit(idx, 'variant_name', e.target.value)}
                            className={inputCls}
                          />
                          <input
                            type="number"
                            aria-label="Variant ex-showroom price"
                            placeholder="Ex-showroom (₹)"
                            value={varItem.ex_showroom_price || ''}
                            onChange={(e) => handleVariantChangeInEdit(idx, 'ex_showroom_price', e.target.value)}
                            className={inputCls}
                          />
                          <input
                            type="text"
                            aria-label="Variant fuel type"
                            placeholder="Fuel"
                            value={varItem.fuel_type || ''}
                            onChange={(e) => handleVariantChangeInEdit(idx, 'fuel_type', e.target.value)}
                            className={inputCls}
                          />
                          <input
                            type="text"
                            aria-label="Variant transmission"
                            placeholder="Transmission"
                            value={varItem.transmission || ''}
                            onChange={(e) => handleVariantChangeInEdit(idx, 'transmission', e.target.value)}
                            className={inputCls}
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveVariantInEdit(idx)}
                            className={`${iconBtnDanger} justify-self-end`}
                            aria-label="Remove variant"
                          >
                            <Trash2 size={16} aria-hidden="true" />
                          </button>
                        </div>
                      );
                    })}
                    {visibleEditVariants.length === 0 && (
                      <p className="py-3 text-center text-sm text-black/55">
                        No variants yet. Use “Add variant” to add specific trims.
                      </p>
                    )}
                  </div>
                </Panel>

                <Panel title="Photos" icon={ImageIcon}>
                  {editingVehicle.images && editingVehicle.images.length > 0 && (
                    <div className="mb-5">
                      <p className="mb-2 text-sm font-medium text-black/70">Current photos</p>
                      <div className="flex flex-wrap gap-3">
                        {editingVehicle.images.map((img) => (
                          <div key={img.id} className="relative h-20 w-32 overflow-hidden rounded-lg bg-[#eeeeee]">
                            <img src={toAppMediaUrl(img.image_url)} alt={img.image_type} className="h-full w-full object-cover" />
                            <span className="absolute bottom-1 left-1 rounded bg-black/75 px-1.5 py-0.5 text-[10px] font-bold text-white">
                              {img.image_type}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Front view / main photo">
                      <input type="file" name="front_image" accept="image/*" onChange={handleEditImageChange} className={fileCls} />
                    </Field>
                    <Field label="Exterior side view">
                      <input type="file" name="exterior_image" accept="image/*" onChange={handleEditImageChange} className={fileCls} />
                    </Field>
                    <Field label="Interior cabin">
                      <input type="file" name="interior_image" accept="image/*" onChange={handleEditImageChange} className={fileCls} />
                    </Field>
                    <Field label="Rear view">
                      <input type="file" name="rear_image" accept="image/*" onChange={handleEditImageChange} className={fileCls} />
                    </Field>
                  </div>
                </Panel>

                <Panel title="Details" icon={Car}>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Car model name">
                      <input type="text" name="name" value={editForm.name || ''} onChange={handleEditField} className={inputCls} />
                    </Field>
                    <Field label="Brand name">
                      <input type="text" name="brand_name" value={editForm.brand_name || ''} onChange={handleEditField} className={inputCls} />
                    </Field>
                    <Field label="Body type">
                      <input type="text" name="body_type" value={editForm.body_type || ''} onChange={handleEditField} className={inputCls} />
                    </Field>
                    <Field label="Fuel type">
                      <input type="text" name="fuel_type" value={editForm.fuel_type || ''} onChange={handleEditField} className={inputCls} />
                    </Field>
                    <Field label="Overview description" className="sm:col-span-2">
                      <textarea name="description" value={editForm.description || ''} onChange={handleEditField} rows={4} className={inputCls} />
                    </Field>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-x-8 gap-y-3 border-t border-black/10 pt-5">
                    <Toggle label="Active (live on site)" name="is_active" checked={Boolean(editForm.is_active)} onChange={handleEditField} />
                    <Toggle label="Featured on homepage" name="is_featured" checked={Boolean(editForm.is_featured)} onChange={handleEditField} />
                    <Toggle label="Price TBA" name="is_tba" checked={Boolean(editForm.is_tba)} onChange={handleEditField} />
                  </div>
                </Panel>
              </div>

              <div className="flex justify-end gap-3 border-t border-black/10 bg-white px-6 py-4">
                <button type="button" onClick={() => setEditingVehicle(null)} className={btnGhost}>
                  Cancel
                </button>
                <button type="submit" disabled={updateVehicleMutation.isPending} className={btnPrimary}>
                  {updateVehicleMutation.isPending ? 'Saving…' : 'Save changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}