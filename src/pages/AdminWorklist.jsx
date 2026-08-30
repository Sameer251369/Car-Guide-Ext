import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../api/client';
import SEOHead from '../components/SEOHead';

export default function AdminWorklist({ onLogout }) {
  const queryClient = useQueryClient();
  const [leadFilter, setLeadFilter] = useState('all');
  const [vehicleForm, setVehicleForm] = useState({
    brand_name: '',
    name: '',
    body_type: 'SUV',
    fuel_type: 'Petrol',
    ev_hybrid_cng_flag: 'No',
    starting_price: '',
    top_variant_price: '',
    seats: '',
    transmission: 'Manual/Automatic',
    is_featured: false,
    is_tba: false,
    meta_description: '',
  });
  const [primaryImage, setPrimaryImage] = useState(null);
  const [publishedVehicle, setPublishedVehicle] = useState(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-leads', leadFilter],
    queryFn: () => api.getAdminLeads({ is_exported: leadFilter === 'all' ? undefined : leadFilter }),
  });

  const leads = data?.results || [];

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
        seats: '',
        transmission: 'Manual/Automatic',
        is_featured: false,
        is_tba: false,
        meta_description: '',
      });
      setPrimaryImage(null);
      queryClient.invalidateQueries({ queryKey: ['vehicles-301'] });
      queryClient.invalidateQueries({ queryKey: ['vehicle-facets'] });
    },
  });

  const summary = useMemo(() => {
    const total = leads.length;
    const exported = leads.filter((lead) => lead.is_exported).length;
    return { total, exported };
  }, [leads]);

  const handleExportLeads = async () => {
    try {
      const blob = await api.exportLeadsCsv({ is_exported: 'false' });
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `car_guide_leads_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error('Export failed', err);
      alert('Lead export failed. Check console for details.');
    }
  };

  const handleLogout = async () => {
    if (onLogout) await onLogout();
  };

  const handleVehicleField = (event) => {
    const { name, value, type, checked } = event.target;
    setVehicleForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
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
    if (primaryImage) {
      payload.append('primary_image', primaryImage);
    }

    publishVehicleMutation.mutate(payload);
  };

  return (
    <>
      <SEOHead title="Admin Leads | Car Guide Media" description="Protected admin lead dashboard for Car Guide Media." />
      <div className="min-h-screen bg-slate-950 py-12">
        <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-amber-300">Client admin</p>
              <h1 className="mt-2 text-2xl font-bold text-white">Lead dashboard</h1>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={() => refetch()} className="rounded-lg bg-slate-800 px-3 py-2 text-sm text-slate-200">Refresh</button>
              <button onClick={handleExportLeads} className="rounded-lg bg-amber-500 px-3 py-2 text-sm font-semibold text-slate-950">Export CSV</button>
              <button onClick={handleLogout} className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200">Logout</button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Total leads</div>
              <div className="mt-3 text-3xl font-bold text-white">{summary.total}</div>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Exported</div>
              <div className="mt-3 text-3xl font-bold text-emerald-400">{summary.exported}</div>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Filter</div>
              <select value={leadFilter} onChange={(e) => setLeadFilter(e.target.value)} className="mt-3 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100">
                <option value="all">All leads</option>
                <option value="true">Exported</option>
                <option value="false">Pending export</option>
              </select>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-amber-300">Publish to frontend</p>
                <h2 className="mt-2 text-xl font-bold text-white">Add car like a blog post</h2>
                <p className="mt-1 text-sm text-slate-400">Published cars are active immediately in New Cars, vehicle detail pages, and the calculator.</p>
              </div>
              {publishedVehicle && (
                <Link to={`/vehicles/${publishedVehicle.slug}`} className="rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-slate-950">
                  View published car
                </Link>
              )}
            </div>

            <form onSubmit={handlePublishVehicle} className="grid gap-4 lg:grid-cols-4">
              {[
                ['brand_name', 'Brand name', 'Maruti Suzuki'],
                ['name', 'Car model', 'Swift'],
                ['body_type', 'Body type', 'Hatchback'],
                ['fuel_type', 'Fuel type', 'Petrol'],
                ['starting_price', 'Starting price', '579000'],
                ['top_variant_price', 'Top variant price', '884000'],
                ['seats', 'Seats', '5'],
                ['transmission', 'Transmission', 'Manual/Automatic'],
              ].map(([name, label, placeholder]) => (
                <label key={name} className="text-sm text-slate-300">
                  <span className="mb-1.5 block">{label}</span>
                  <input
                    name={name}
                    value={vehicleForm[name] || ''}
                    onChange={handleVehicleField}
                    placeholder={placeholder}
                    required={['brand_name', 'name', 'body_type', 'fuel_type'].includes(name)}
                    type={['starting_price', 'top_variant_price', 'seats'].includes(name) ? 'number' : 'text'}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none transition focus:border-amber-400"
                  />
                </label>
              ))}

              <label className="text-sm text-slate-300">
                <span className="mb-1.5 block">Powertrain flag</span>
                <select name="ev_hybrid_cng_flag" value={vehicleForm.ev_hybrid_cng_flag} onChange={handleVehicleField} className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-amber-400">
                  <option value="No">No</option>
                  <option value="EV">EV</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="CNG">CNG</option>
                  <option value="Hybrid/CNG">Hybrid/CNG</option>
                </select>
              </label>

              <label className="text-sm text-slate-300 lg:col-span-2">
                <span className="mb-1.5 block">Primary car image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => setPrimaryImage(event.target.files?.[0] || null)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-300 file:mr-3 file:rounded-md file:border-0 file:bg-amber-500 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-slate-950"
                />
              </label>

              <label className="text-sm text-slate-300 lg:col-span-4">
                <span className="mb-1.5 block">Short description / SEO description</span>
                <textarea
                  name="meta_description"
                  value={vehicleForm.meta_description}
                  onChange={handleVehicleField}
                  rows={3}
                  placeholder="Short client-facing summary for this car."
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none transition focus:border-amber-400"
                />
              </label>

              <div className="flex flex-wrap items-center gap-4 lg:col-span-4">
                <label className="inline-flex items-center gap-2 text-sm text-slate-300">
                  <input type="checkbox" name="is_featured" checked={vehicleForm.is_featured} onChange={handleVehicleField} className="h-4 w-4 rounded border-slate-600" />
                  Feature on homepage
                </label>
                <label className="inline-flex items-center gap-2 text-sm text-slate-300">
                  <input type="checkbox" name="is_tba" checked={vehicleForm.is_tba} onChange={handleVehicleField} className="h-4 w-4 rounded border-slate-600" />
                  Price TBA
                </label>
                <button disabled={publishVehicleMutation.isPending} className="rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-amber-400 disabled:opacity-60">
                  {publishVehicleMutation.isPending ? 'Publishing...' : 'Publish car to frontend'}
                </button>
                {publishVehicleMutation.error && (
                  <span className="text-sm text-red-300">
                    {publishVehicleMutation.error?.response?.data?.non_field_errors?.[0] || publishVehicleMutation.error?.response?.data?.starting_price?.[0] || 'Could not publish car.'}
                  </span>
                )}
                {publishedVehicle && <span className="text-sm font-semibold text-emerald-300">{publishedVehicle.brand_name} {publishedVehicle.name} is live.</span>}
              </div>
            </form>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
            {isLoading ? (
              <div className="p-8 text-center text-slate-400">Loading leads...</div>
            ) : leads.length === 0 ? (
              <div className="p-8 text-center text-slate-400">No leads found for this filter.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-800 text-xs uppercase tracking-wider text-slate-300">
                    <tr>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Phone</th>
                      <th className="px-4 py-3">City</th>
                      <th className="px-4 py-3">State</th>
                      <th className="px-4 py-3">Brand</th>
                      <th className="px-4 py-3">Vehicle</th>
                      <th className="px-4 py-3">Ex-showroom</th>
                      <th className="px-4 py-3">On-road</th>
                      <th className="px-4 py-3">Source</th>
                      <th className="px-4 py-3">Created</th>
                      <th className="px-4 py-3">Exported</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-200">
                    {leads.map((lead) => (
                      <tr key={lead.id}>
                        <td className="px-4 py-3 font-medium text-white">{lead.name}</td>
                        <td className="px-4 py-3">{lead.phone_number}</td>
                        <td className="px-4 py-3">{lead.city}</td>
                        <td className="px-4 py-3">{lead.state_name || '—'}</td>
                        <td className="px-4 py-3">{lead.brand_snapshot}</td>
                        <td className="px-4 py-3">{lead.vehicle_name_snapshot}</td>
                        <td className="px-4 py-3">₹ {Number(lead.ex_showroom_price_at_query || 0).toLocaleString('en-IN')}</td>
                        <td className="px-4 py-3">₹ {Number(lead.on_road_price_calculated || 0).toLocaleString('en-IN')}</td>
                        <td className="px-4 py-3">{lead.source_page}</td>
                        <td className="px-4 py-3">{lead.created_at ? new Date(lead.created_at).toLocaleString('en-IN') : '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2 py-1 text-xs font-medium ${lead.is_exported ? 'bg-emerald-500/15 text-emerald-300' : 'bg-amber-500/15 text-amber-300'}`}>
                            {lead.is_exported ? 'Yes' : 'No'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
