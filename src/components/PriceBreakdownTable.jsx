import React from 'react';
import { CheckCircle2, Info, Printer, Shield, AlertTriangle, AlertCircle, ExternalLink, Calendar, FileText } from 'lucide-react';

export default function PriceBreakdownTable({ breakdown, vehicleName, variantName, leadId }) {
  if (!breakdown) return null;

  const formatRupees = (val) => {
    if (val === null || val === undefined) return '--';
    return `₹ ${Number(val).toLocaleString('en-IN')}`;
  };

  const mandatoryDisclaimer = breakdown.disclaimer || (
    "Estimated on-road price = ex-showroom + state lifetime road tax + road safety cess + green tax + municipal cess + " +
    "₹600 registration + ₹200 smart card + ₹400 HSRP + ₹500 FASTag + IRDAI compliant comprehensive insurance (1-Yr OD + 3-Yr TP) + " +
    "₹1,000 miscellaneous charges. Excludes loan/hypothecation charges, accessories, dealer handling, discounts, " +
    "and special imported/CBU rules. EV road-tax waivers are applied where reported. Actual on-road price " +
    "can differ by city, RTO, variant, insurer, and state notification — please verify with your local RTO/dealer before purchase."
  );

  // Data Not Available for State / Fuel combination
  if (breakdown.data_available === false) {
    return (
      <div className="rounded-lg bg-red-50 border border-red-200 p-6 md:p-8 shadow-xl space-y-4">
        <div className="flex items-center space-x-3 text-red-700">
          <AlertTriangle className="w-7 h-7 shrink-0 text-red-600" />
          <div>
            <h2 className="text-xl font-bold text-slate-950">{vehicleName}</h2>
            <p className="text-xs text-red-700 font-medium">
              Tax Rule Data Gap • {breakdown.state_name} ({breakdown.state_code})
            </p>
          </div>
        </div>

        <div className="p-4 rounded-md bg-white border border-red-200 text-slate-700 text-xs space-y-2">
          <h3 className="font-bold text-red-700 text-sm">Verified RTO Data Gap</h3>
          <p className="leading-relaxed">
            {breakdown.message || `State tax rules for ${breakdown.state_name} have not been verified in our rule engine. We surface this data gap explicitly rather than silently estimating a flat tax percentage.`}
          </p>
        </div>
      </div>
    );
  }

  // If vehicle is TBA
  if (breakdown.is_tba) {
    return (
      <div className="rounded-lg bg-white border border-amber-300 p-6 md:p-8 shadow-xl space-y-6">
        <div className="flex items-center space-x-3 text-amber-800">
          <AlertCircle className="w-8 h-8 shrink-0 text-amber-600" />
          <div>
            <h2 className="text-2xl font-bold text-slate-950">{vehicleName}</h2>
            <p className="text-xs text-amber-700 font-medium">
              Price to be announced • {breakdown.state_name || 'All States'}
            </p>
          </div>
        </div>

        <div className="p-6 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-sm space-y-2">
          <h3 className="font-bold text-amber-800 text-base">Unlaunched / Pricing TBA Vehicle</h3>
          <p>
            Official prices for <span className="font-semibold text-slate-950">{vehicleName}</span> have not been announced by the manufacturer yet. On-road price estimates will be available immediately upon official launch.
          </p>
        </div>

        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-500 space-y-1">
          <p className="font-semibold text-slate-700 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Mandatory Legal Disclaimer:</span>
          </p>
          <p className="leading-relaxed font-light">{mandatoryDisclaimer}</p>
        </div>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const insBreakdown = breakdown.insurance_breakdown || {};
  const meta = breakdown.rule_metadata || {};

  // Define Badge Pill Renderer
  const renderBadge = (type) => {
    if (type === 'gov') {
      return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">Official Government</span>;
    }
    if (type === 'statutory') {
      return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-blue-100 text-blue-800 border border-blue-300">Official Statutory</span>;
    }
    if (type === 'ins') {
      return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-purple-100 text-purple-800 border border-purple-300">Official Insurance</span>;
    }
    if (type === 'tax') {
      return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-800 border border-amber-300">Official Tax</span>;
    }
    return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-700 border border-slate-300">Optional / Dealer</span>;
  };

  return (
    <div className="rounded-lg bg-white border border-slate-200 p-6 md:p-8 shadow-xl shadow-slate-200/70 space-y-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-red-600 font-semibold uppercase tracking-wider mb-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Rule-Engine State-Wise On-Road Price Unlocked</span>
            {leadId && <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px]">Ref #{leadId}</span>}
          </div>
          <h2 className="text-2xl font-bold text-slate-950">{vehicleName}</h2>
          <p className="text-xs text-slate-500 font-medium">
            {variantName} • {breakdown.state_name} ({breakdown.state_code}) • Powertrain: <strong className="text-slate-900 uppercase">{breakdown.effective_fuel_type}</strong> • Ownership: <strong className="text-slate-900 uppercase">{breakdown.ownership_type || 'individual'}</strong>
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center space-x-1.5 px-4 py-2 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors"
        >
          <Printer className="w-4 h-4 text-red-600" />
          <span>Print Quotation</span>
        </button>
      </div>

      {breakdown.note && (
        <div className="p-3.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center space-x-2">
          <Info className="w-4 h-4 shrink-0 text-amber-600" />
          <span>Note: {breakdown.note}</span>
        </div>
      )}

      {/* Auditable 4-Column Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs font-bold text-slate-600 uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="py-3.5 px-4">Component</th>
              <th className="py-3.5 px-4">Methodology &amp; Details</th>
              <th className="py-3.5 px-4 text-right">Amount (INR)</th>
              <th className="py-3.5 px-4 text-center">Charge Type</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">

            {/* Module 1: Base Ex-Showroom */}
            <tr>
              <td className="py-3.5 px-4 font-semibold text-slate-950">1. Ex-Showroom Price</td>
              <td className="py-3.5 px-4 text-xs text-slate-500">Verified manufacturer ex-factory price</td>
              <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-950">{formatRupees(breakdown.ex_showroom_price)}</td>
              <td className="py-3.5 px-4 text-center">{renderBadge('gov')}</td>
            </tr>

            {/* Module 2: State Lifetime Road Tax */}
            <tr>
              <td className="py-3.5 px-4 font-medium">2. State Lifetime Road Tax</td>
              <td className="py-3.5 px-4 text-xs text-slate-500">
                {breakdown.road_tax_rate_percent}% slab rate ({breakdown.state_code} {breakdown.effective_fuel_type}, {breakdown.ownership_type})
              </td>
              <td className="py-3.5 px-4 text-right font-mono font-medium">{formatRupees(breakdown.road_tax)}</td>
              <td className="py-3.5 px-4 text-center">{renderBadge('gov')}</td>
            </tr>

            {/* Module 3: Registration Fee */}
            <tr>
              <td className="py-3.5 px-4 font-medium">3. RTO Registration Fee</td>
              <td className="py-3.5 px-4 text-xs text-slate-500">Statutory RTO initial registration fee</td>
              <td className="py-3.5 px-4 text-right font-mono">{formatRupees(breakdown.registration_fee)}</td>
              <td className="py-3.5 px-4 text-center">{renderBadge('gov')}</td>
            </tr>

            {/* Module 4: Smart Card RC */}
            <tr>
              <td className="py-3.5 px-4 font-medium">4. Smart Card RC Fee</td>
              <td className="py-3.5 px-4 text-xs text-slate-500">Physical chip-embedded Registration Certificate fee</td>
              <td className="py-3.5 px-4 text-right font-mono">{formatRupees(breakdown.smart_card_fee)}</td>
              <td className="py-3.5 px-4 text-center">{renderBadge('gov')}</td>
            </tr>

            {/* Module 5: HSRP */}
            <tr>
              <td className="py-3.5 px-4 font-medium">5. High Security Registration Plate (HSRP)</td>
              <td className="py-3.5 px-4 text-xs text-slate-500">Tamper-proof HSRP license plate &amp; snap-lock fee</td>
              <td className="py-3.5 px-4 text-right font-mono">{formatRupees(breakdown.hsrp_fee)}</td>
              <td className="py-3.5 px-4 text-center">{renderBadge('gov')}</td>
            </tr>

            {/* Module 6: Hypothecation Fee (if financed) */}
            {breakdown.is_financed && (
              <tr>
                <td className="py-3.5 px-4 font-medium text-indigo-900">6. Bank Hypothecation Fee</td>
                <td className="py-3.5 px-4 text-xs text-indigo-800/80">RTO bank loan lien endorsement charge</td>
                <td className="py-3.5 px-4 text-right font-mono text-indigo-950">{formatRupees(breakdown.hypothecation_fee)}</td>
                <td className="py-3.5 px-4 text-center">{renderBadge('statutory')}</td>
              </tr>
            )}

            {/* Module 7: Temporary Registration Fee */}
            {breakdown.temp_registration_fee > 0 && (
              <tr>
                <td className="py-3.5 px-4 font-medium">7. Temporary Registration Fee</td>
                <td className="py-3.5 px-4 text-xs text-slate-500">Inter-state transit temporary RTO permit</td>
                <td className="py-3.5 px-4 text-right font-mono">{formatRupees(breakdown.temp_registration_fee)}</td>
                <td className="py-3.5 px-4 text-center">{renderBadge('statutory')}</td>
              </tr>
            )}

            {/* Module 8: Road Safety Cess */}
            {breakdown.road_safety_cess > 0 && (
              <tr>
                <td className="py-3.5 px-4 font-medium">8. Road Safety Cess</td>
                <td className="py-3.5 px-4 text-xs text-slate-500">
                  {breakdown.cess_rate_percent}% state transport safety infrastructure cess
                </td>
                <td className="py-3.5 px-4 text-right font-mono">{formatRupees(breakdown.road_safety_cess)}</td>
                <td className="py-3.5 px-4 text-center">{renderBadge('gov')}</td>
              </tr>
            )}

            {/* Module 9: Green Tax */}
            {breakdown.green_tax > 0 && (
              <tr>
                <td className="py-3.5 px-4 font-medium">9. Green Tax / Environmental Levy</td>
                <td className="py-3.5 px-4 text-xs text-slate-500">State environmental protection green tax</td>
                <td className="py-3.5 px-4 text-right font-mono">{formatRupees(breakdown.green_tax)}</td>
                <td className="py-3.5 px-4 text-center">{renderBadge('gov')}</td>
              </tr>
            )}

            {/* Module 10: Municipal / Infra Cess */}
            {breakdown.municipal_cess > 0 && (
              <tr>
                <td className="py-3.5 px-4 font-medium">10. Municipal / Infrastructure Cess</td>
                <td className="py-3.5 px-4 text-xs text-slate-500">Local municipal corporation infrastructure levy</td>
                <td className="py-3.5 px-4 text-right font-mono">{formatRupees(breakdown.municipal_cess)}</td>
                <td className="py-3.5 px-4 text-center">{renderBadge('gov')}</td>
              </tr>
            )}

            {/* Module 11: Comprehensive Insurance */}
            <tr>
              <td className="py-3.5 px-4 font-medium">11. Comprehensive Insurance (1-Yr OD + 3-Yr TP)</td>
              <td className="py-3.5 px-4 text-xs text-slate-500">
                IRDAI standard: 95% IDV ({formatRupees(insBreakdown.idv || breakdown.ex_showroom_price * 0.95)}) • OD: {formatRupees(insBreakdown.own_damage_premium)} + 3-Yr TP: {formatRupees(insBreakdown.third_party_premium)}
              </td>
              <td className="py-3.5 px-4 text-right font-mono">{formatRupees(breakdown.insurance_estimate)}</td>
              <td className="py-3.5 px-4 text-center">{renderBadge('ins')}</td>
            </tr>

            {/* Module 12: FASTag Fee */}
            <tr>
              <td className="py-3.5 px-4 font-medium">12. FASTag Fee</td>
              <td className="py-3.5 px-4 text-xs text-slate-500">Mandatory NHAI RFID national highway toll tag</td>
              <td className="py-3.5 px-4 text-right font-mono">{formatRupees(breakdown.fastag_fee)}</td>
              <td className="py-3.5 px-4 text-center">{renderBadge('statutory')}</td>
            </tr>

            {/* Module 13: TCS (1% > ₹10L) */}
            {breakdown.tcs_amount > 0 && (
              <tr className="bg-amber-50/50">
                <td className="py-3.5 px-4 font-medium text-amber-900">13. TCS (1% Income Tax Act &gt; ₹10L)</td>
                <td className="py-3.5 px-4 text-xs text-amber-800/80">
                  1% Tax Collected at Source (Section 206C) on ex-showroom &gt; ₹10 Lakhs
                </td>
                <td className="py-3.5 px-4 text-right font-mono font-semibold text-amber-900">{formatRupees(breakdown.tcs_amount)}</td>
                <td className="py-3.5 px-4 text-center">{renderBadge('tax')}</td>
              </tr>
            )}

            {/* Optional Dealer Handling */}
            <tr>
              <td className="py-3.5 px-4 font-medium">Dealer Handling &amp; Logistics</td>
              <td className="py-3.5 px-4 text-xs text-slate-500">Handling, logistics &amp; miscellaneous preparation fees</td>
              <td className="py-3.5 px-4 text-right font-mono">{formatRupees(Number(breakdown.dealer_charges || 0) + Number(breakdown.misc_fee || 0))}</td>
              <td className="py-3.5 px-4 text-center">{renderBadge('optional')}</td>
            </tr>

          </tbody>
        </table>
      </div>

      {/* Bottom Subtotals Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Total Government &amp; RTO Charges</span>
          <span className="text-lg font-extrabold text-slate-900 font-mono mt-1 block">
            {formatRupees(breakdown.total_government_charges)}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Road Tax + Reg + Cesses + TCS</span>
        </div>

        <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-200">
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 block">Total Insurance (1+3 Yr)</span>
          <span className="text-lg font-extrabold text-purple-900 font-mono mt-1 block">
            {formatRupees(breakdown.total_insurance)}
          </span>
          <span className="text-[10px] text-purple-600 block mt-0.5">IRDAI Statutory 1-Yr OD + 3-Yr TP</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Optional &amp; FASTag Charges</span>
          <span className="text-lg font-extrabold text-slate-900 font-mono mt-1 block">
            {formatRupees(breakdown.optional_charges)}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">FASTag + Handling &amp; Preparation</span>
        </div>

        <div className="p-4 rounded-xl bg-red-600 text-white shadow-lg shadow-red-200">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-red-100 block">Final On-Road Price</span>
          <span className="text-xl font-black font-mono mt-1 block">
            {formatRupees(breakdown.final_on_road_price || breakdown.total_on_road_price)}
          </span>
          <span className="text-[10px] text-red-100 block mt-0.5 font-medium">All Charges Included</span>
        </div>

      </div>

      {/* Rule Engine Verification Footer Box */}
      {meta.notificationNumber && (
        <div className="p-4 rounded-xl bg-slate-900 text-slate-300 text-xs space-y-2 border border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-bold text-amber-400 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-amber-400" />
              <span>Official RTO Gazette Rule Verification:</span>
            </span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Rule Active &amp; Verified
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-[11px] font-mono pt-1">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-sans">Notification ID</span>
              <span className="text-slate-200 font-bold">{meta.notificationNumber}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-sans">Effective Date</span>
              <span className="text-slate-200">{meta.effectiveFrom} – {meta.effectiveTo}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-sans">Last Verified Date</span>
              <span className="text-slate-200">{meta.lastVerified}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-sans">Gazette Source</span>
              <a href={meta.sourceURL} target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline flex items-center gap-1">
                <span>MoRTH Portal</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Mandatory legal disclaimer */}
      <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-500 space-y-1.5">
        <p className="font-semibold text-slate-700 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-red-600 shrink-0" />
          <span>Mandatory Disclaimer:</span>
        </p>
        <p className="leading-relaxed font-light text-slate-600">{mandatoryDisclaimer}</p>
      </div>

    </div>
  );
}
