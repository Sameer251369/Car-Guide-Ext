import React from 'react';
import { CheckCircle2, Info, Printer, AlertTriangle, AlertCircle, ExternalLink, FileText } from 'lucide-react';

/* --- Shared style tokens: replace with your existing ones if you have them --- */
const display = { fontFamily: 'var(--font-display, inherit)' };
const slant = { clipPath: 'polygon(0 0, 100% 0, calc(100% - 12px) 100%, 0 100%)' };
const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f6c945] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d0e10]';

/* Glass surface shared by cards, table and notices */
const glass =
  'border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.02] backdrop-blur-xl';

/* Faint grid + red glow used behind each state of the component */
const gridMask = {
  backgroundImage:
    'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
  backgroundSize: '44px 44px',
  maskImage: 'radial-gradient(ellipse at 80% 0%, black 10%, transparent 65%)',
  WebkitMaskImage: 'radial-gradient(ellipse at 80% 0%, black 10%, transparent 65%)',
};

const BADGES = {
  gov: { label: 'Official Government', cls: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/40' },
  statutory: { label: 'Official Statutory', cls: 'bg-sky-500/15 text-sky-300 border-sky-400/40' },
  ins: { label: 'Official Insurance', cls: 'bg-violet-500/15 text-violet-300 border-violet-400/40' },
  tax: { label: 'Official Tax', cls: 'bg-[#f6c945]/15 text-[#f6c945] border-[#f6c945]/40' },
  optional: { label: 'Optional / Dealer', cls: 'bg-white/5 text-white/60 border-white/20' },
};

const renderBadge = (type) => {
  const badge = BADGES[type] || BADGES.optional;
  return (
    <span
      className={`inline-block border py-1 pl-2.5 pr-4 text-[10px] font-extrabold uppercase italic tracking-wider backdrop-blur ${badge.cls}`}
      style={slant}
    >
      {badge.label}
    </span>
  );
};

const TONES = {
  default: { row: 'hover:bg-white/[0.04]', title: 'text-white', detail: 'text-white/50', amount: 'text-white', bar: 'bg-transparent' },
  strong: { row: 'bg-white/[0.04] hover:bg-white/[0.07]', title: 'text-white font-bold', detail: 'text-white/55', amount: 'text-white font-bold', bar: 'bg-white/60' },
  indigo: { row: 'bg-indigo-500/10 hover:bg-indigo-500/15', title: 'text-indigo-200', detail: 'text-indigo-200/70', amount: 'text-indigo-100', bar: 'bg-indigo-400' },
  amber: { row: 'bg-[#f6c945]/10 hover:bg-[#f6c945]/15', title: 'text-[#f6c945]', detail: 'text-[#f6c945]/70', amount: 'text-[#f6c945] font-semibold', bar: 'bg-[#f6c945]' },
};

function Row({ title, detail, amount, badge, tone = 'default' }) {
  const t = TONES[tone];
  return (
    <tr className={`group transition-colors ${t.row}`}>
      <td className={`relative px-4 py-4 font-medium ${t.title}`}>
        <span
          aria-hidden="true"
          className={`absolute inset-y-3 left-0 w-[3px] -skew-x-12 rounded-full ${t.bar} transition-colors ${tone === 'default' ? 'group-hover:bg-[#dc2626]' : ''}`}
        />
        {title}
      </td>
      <td className={`px-4 py-4 text-xs leading-relaxed ${t.detail}`}>{detail}</td>
      <td className={`px-4 py-4 text-right font-mono tabular-nums ${t.amount}`}>{amount}</td>
      <td className="px-4 py-4 text-center">{renderBadge(badge)}</td>
    </tr>
  );
}

function Disclaimer({ text, label }) {
  return (
    <div className={`space-y-1.5 p-4 text-[11px] ${glass} bg-[#0d0e10]/70`}>
      <p className="flex items-center gap-1.5 font-extrabold uppercase italic tracking-wider text-white/80" style={display}>
        <Info className="h-3.5 w-3.5 shrink-0 text-[#dc2626]" aria-hidden="true" />
        <span>{label}</span>
      </p>
      <p className="leading-relaxed text-white/50">{text}</p>
    </div>
  );
}

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
      <div className="relative space-y-5 overflow-hidden border border-[#dc2626]/50 bg-[#121316] p-6 shadow-[0_30px_70px_-40px_rgba(220,38,38,0.7)] md:p-8">
        <div aria-hidden="true" className="pointer-events-none absolute -right-10 top-0 h-full w-1/2 -skew-x-12 bg-gradient-to-l from-[#dc2626]/25 to-transparent" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.05]" style={gridMask} />
        <div className="relative flex items-center gap-4">
          <span className="relative flex h-14 w-14 shrink-0 items-center justify-center" aria-hidden="true">
            <span className="absolute inset-0 -skew-x-12 bg-[#dc2626]/20 shadow-[0_0_30px_rgba(220,38,38,0.5)]" />
            <AlertTriangle className="relative h-7 w-7 text-[#ef4444]" />
          </span>
          <div>
            <h2 className="text-2xl font-extrabold italic leading-none tracking-tight text-white" style={display}>{vehicleName}</h2>
            <p className="mt-1.5 text-xs font-bold uppercase tracking-widest text-[#ef4444]">
              Tax Rule Data Gap • {breakdown.state_name} ({breakdown.state_code})
            </p>
          </div>
        </div>

        <div className={`relative space-y-2 p-5 text-xs text-white/70 ${glass} bg-[#0d0e10]/70`}>
          <h3 className="text-sm font-extrabold uppercase italic tracking-wide text-[#f6c945]" style={display}>Verified RTO Data Gap</h3>
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
      <div className="relative space-y-6 overflow-hidden border border-[#f6c945]/40 bg-[#121316] p-6 shadow-[0_30px_70px_-40px_rgba(246,201,69,0.45)] md:p-8">
        <div aria-hidden="true" className="pointer-events-none absolute -right-10 top-0 h-full w-1/2 -skew-x-12 bg-gradient-to-l from-[#f6c945]/15 to-transparent" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.05]" style={gridMask} />
        <div className="relative flex items-center gap-4">
          <span className="relative flex h-14 w-14 shrink-0 items-center justify-center" aria-hidden="true">
            <span className="absolute inset-0 -skew-x-12 bg-[#f6c945]/15 shadow-[0_0_30px_rgba(246,201,69,0.4)]" />
            <AlertCircle className="relative h-8 w-8 text-[#f6c945]" />
          </span>
          <div>
            <h2 className="text-3xl font-extrabold italic leading-none tracking-tight text-white" style={display}>{vehicleName}</h2>
            <p className="mt-1.5 text-xs font-bold uppercase tracking-widest text-[#f6c945]">
              Price to be announced • {breakdown.state_name || 'All States'}
            </p>
          </div>
        </div>

        <div className="relative space-y-2 border border-[#f6c945]/30 bg-gradient-to-br from-[#f6c945]/15 to-[#f6c945]/5 p-6 text-sm text-white/80 backdrop-blur-xl">
          <h3 className="text-lg font-extrabold uppercase italic tracking-wide text-[#f6c945]" style={display}>
            Unlaunched / Pricing TBA Vehicle
          </h3>
          <p>
            Official prices for <span className="font-bold text-white">{vehicleName}</span> have not been announced by the manufacturer yet. On-road price estimates will be available immediately upon official launch.
          </p>
        </div>

        <div className="relative">
          <Disclaimer label="Mandatory Legal Disclaimer:" text={mandatoryDisclaimer} />
        </div>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const insBreakdown = breakdown.insurance_breakdown || {};
  const meta = breakdown.rule_metadata || {};

  const isEvFree =
    Number(breakdown.road_tax_rate_percent) === 0 &&
    String(breakdown.effective_fuel_type).toLowerCase().includes('electric');

  return (
    <div className="relative space-y-8 overflow-hidden border border-white/10 bg-[#121316] p-6 text-white shadow-[0_40px_90px_-50px_rgba(0,0,0,0.9)] md:p-8">
      {/* Decorative backdrop: speed panels, glow and masked grid */}
      <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-10 h-72 w-72 -skew-x-12 bg-gradient-to-br from-[#dc2626]/20 to-transparent" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-[#dc2626]/15 blur-[120px]" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-40 -left-24 h-80 w-80 rounded-full bg-[#f6c945]/[0.07] blur-[120px]" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.05]" style={gridMask} />

      {/* ---------- Header ---------- */}
      <div className="relative flex flex-col justify-between gap-5 border-b border-white/10 pb-7 md:flex-row md:items-center">
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-[#f6c945]">
            <span aria-hidden="true" className="h-[3px] w-7 -skew-x-[30deg] bg-[#dc2626] shadow-[0_0_12px_rgba(220,38,38,0.9)]" />
            <CheckCircle2 className="h-4 w-4 text-emerald-400" aria-hidden="true" />
            <span>Rule-Engine State-Wise On-Road Price Unlocked</span>
            {leadId && (
              <span className="border border-white/20 bg-white/5 px-2 py-0.5 text-[10px] text-white/70 backdrop-blur">Ref #{leadId}</span>
            )}
          </div>
          <h2
            className="bg-gradient-to-b from-white to-white/70 bg-clip-text text-4xl font-extrabold italic leading-none tracking-[-0.03em] text-transparent sm:text-5xl"
            style={display}
          >
            {vehicleName}
          </h2>
          <p className="mt-3 text-xs font-medium text-white/50">
            {variantName} • {breakdown.state_name} ({breakdown.state_code}) • Powertrain:{' '}
            <strong className="uppercase text-white">{breakdown.effective_fuel_type}</strong> • Ownership:{' '}
            <strong className="uppercase text-white">{breakdown.ownership_type || 'individual'}</strong>
          </p>
        </div>

        <button
          type="button"
          onClick={handlePrint}
          className={`group relative inline-flex h-11 items-center justify-center gap-2 overflow-hidden bg-[#dc2626] pl-5 pr-7 text-xs font-extrabold uppercase italic tracking-wide text-white transition-all duration-300 hover:bg-[#f6c945] hover:text-[#0d0e10] active:scale-[0.97] ${focusRing}`}
          style={{ ...slant, ...display }}
        >
          <span aria-hidden="true" className="absolute inset-y-0 -left-1/2 w-1/3 -skew-x-[22deg] bg-white/30 transition-all duration-700 group-hover:left-[130%]" />
          <Printer className="relative h-4 w-4" aria-hidden="true" />
          <span className="relative">Print Quotation</span>
        </button>
      </div>

      {breakdown.note && (
        <div className="relative flex items-center gap-2 border border-[#f6c945]/40 bg-gradient-to-r from-[#f6c945]/15 to-[#f6c945]/5 p-3.5 text-xs text-[#f6c945] backdrop-blur-xl">
          <Info className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>Note: {breakdown.note}</span>
        </div>
      )}

      {/* ---------- Auditable 4-column table ---------- */}
      <div className={`relative overflow-x-auto bg-[#0d0e10]/70 ${glass}`}>
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[#dc2626]/60 bg-black/40 text-xs font-extrabold uppercase tracking-widest text-white/60">
            <tr>
              <th className="px-4 py-4">Component</th>
              <th className="px-4 py-4">Methodology &amp; Details</th>
              <th className="px-4 py-4 text-right">Amount (INR)</th>
              <th className="px-4 py-4 text-center">Charge Type</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.08] text-white/80">
            <Row
              tone="strong"
              title="1. Ex-Showroom Price"
              detail="Verified manufacturer ex-factory price"
              amount={formatRupees(breakdown.ex_showroom_price)}
              badge="gov"
            />

            <Row
              title="2. State Lifetime Road Tax"
              detail={
                isEvFree
                  ? `EV road-tax exemption (${breakdown.state_code})`
                  : `${breakdown.road_tax_rate_percent}% slab rate (${breakdown.state_code} ${breakdown.effective_fuel_type}, ${breakdown.ownership_type})`
              }
              amount={formatRupees(breakdown.road_tax)}
              badge="gov"
            />

            <Row
              title="3. RTO Registration Fee"
              detail="Statutory RTO initial registration fee"
              amount={formatRupees(breakdown.registration_fee)}
              badge="gov"
            />

            <Row
              title="4. Smart Card RC Fee"
              detail="Physical chip-embedded Registration Certificate fee"
              amount={formatRupees(breakdown.smart_card_fee)}
              badge="gov"
            />

            <Row
              title="5. High Security Registration Plate (HSRP)"
              detail="Tamper-proof HSRP license plate & snap-lock fee"
              amount={formatRupees(breakdown.hsrp_fee)}
              badge="gov"
            />

            {breakdown.is_financed && (
              <Row
                tone="indigo"
                title="6. Bank Hypothecation Fee"
                detail="RTO bank loan lien endorsement charge"
                amount={formatRupees(breakdown.hypothecation_fee)}
                badge="statutory"
              />
            )}

            {breakdown.temp_registration_fee > 0 && (
              <Row
                title="7. Temporary Registration Fee"
                detail="Inter-state transit temporary RTO permit"
                amount={formatRupees(breakdown.temp_registration_fee)}
                badge="statutory"
              />
            )}

            {breakdown.road_safety_cess > 0 && (
              <Row
                title="8. Road Safety Cess"
                detail={`${breakdown.cess_rate_percent}% state transport safety infrastructure cess`}
                amount={formatRupees(breakdown.road_safety_cess)}
                badge="gov"
              />
            )}

            {breakdown.green_tax > 0 && (
              <Row
                title="9. Green Tax / Environmental Levy"
                detail="State environmental protection green tax"
                amount={formatRupees(breakdown.green_tax)}
                badge="gov"
              />
            )}

            {breakdown.municipal_cess > 0 && (
              <Row
                title="10. Municipal / Infrastructure Cess"
                detail="Local municipal corporation infrastructure levy"
                amount={formatRupees(breakdown.municipal_cess)}
                badge="gov"
              />
            )}

            <Row
              title="11. Comprehensive Insurance (1-Yr OD + 3-Yr TP)"
              detail={`IRDAI standard: 95% IDV (${formatRupees(insBreakdown.idv || breakdown.ex_showroom_price * 0.95)}) • OD: ${formatRupees(insBreakdown.own_damage_premium)} + 3-Yr TP: ${formatRupees(insBreakdown.third_party_premium)}`}
              amount={formatRupees(breakdown.insurance_estimate)}
              badge="ins"
            />

            <Row
              title="12. FASTag Fee"
              detail="Mandatory NHAI RFID national highway toll tag"
              amount={formatRupees(breakdown.fastag_fee)}
              badge="statutory"
            />

            {breakdown.tcs_amount > 0 && (
              <Row
                tone="amber"
                title="13. TCS (1% Income Tax Act > ₹10L)"
                detail="1% Tax Collected at Source (Section 206C) on ex-showroom > ₹10 Lakhs"
                amount={formatRupees(breakdown.tcs_amount)}
                badge="tax"
              />
            )}

            <Row
              title="Dealer Handling & Logistics"
              detail="Handling, logistics & miscellaneous preparation fees"
              amount={formatRupees(Number(breakdown.dealer_charges || 0) + Number(breakdown.misc_fee || 0))}
              badge="optional"
            />
          </tbody>
        </table>
      </div>

      {/* ---------- Subtotals ---------- */}
      <div className="relative grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2 lg:grid-cols-4">
        <div className={`p-4 transition-colors hover:border-[#dc2626]/60 ${glass}`}>
          <span className="block text-[10px] font-extrabold uppercase tracking-widest text-white/50">Total Government &amp; RTO Charges</span>
          <span className="mt-1.5 block font-mono text-xl font-extrabold tabular-nums text-white">
            {formatRupees(breakdown.total_government_charges)}
          </span>
          <span className="mt-0.5 block text-[10px] text-white/40">Road Tax + Reg + Cesses + TCS</span>
        </div>

        <div className="border border-violet-400/30 bg-gradient-to-b from-violet-500/20 to-violet-500/5 p-4 backdrop-blur-xl transition-colors hover:border-violet-300/70">
          <span className="block text-[10px] font-extrabold uppercase tracking-widest text-violet-300">Total Insurance (1+3 Yr)</span>
          <span className="mt-1.5 block font-mono text-xl font-extrabold tabular-nums text-violet-100">
            {formatRupees(breakdown.total_insurance)}
          </span>
          <span className="mt-0.5 block text-[10px] text-violet-300/70">IRDAI Statutory 1-Yr OD + 3-Yr TP</span>
        </div>

        <div className={`p-4 transition-colors hover:border-[#dc2626]/60 ${glass}`}>
          <span className="block text-[10px] font-extrabold uppercase tracking-widest text-white/50">Optional &amp; FASTag Charges</span>
          <span className="mt-1.5 block font-mono text-xl font-extrabold tabular-nums text-white">
            {formatRupees(breakdown.optional_charges)}
          </span>
          <span className="mt-0.5 block text-[10px] text-white/40">FASTag + Handling &amp; Preparation</span>
        </div>

        <div
          className="relative overflow-hidden bg-gradient-to-br from-[#ef4444] to-[#b91c1c] py-4 pl-4 pr-8 text-white shadow-[0_24px_40px_-16px_rgba(220,38,38,0.9)]"
          style={slant}
        >
          <div aria-hidden="true" className="absolute -right-6 top-0 h-full w-1/2 -skew-x-12 bg-white/10" />
          <div aria-hidden="true" className="absolute -left-8 -top-8 h-24 w-24 rounded-full bg-white/20 blur-2xl" />
          <span className="relative block text-[10px] font-extrabold uppercase tracking-widest text-white/80">Final On-Road Price</span>
          <span className="relative mt-1 block font-mono text-3xl font-extrabold italic tabular-nums text-white" style={display}>
            {formatRupees(breakdown.final_on_road_price || breakdown.total_on_road_price)}
          </span>
          <span className="relative mt-0.5 block text-[10px] font-medium text-white/80">All Charges Included</span>
        </div>
      </div>

      {/* ---------- Rule engine verification ---------- */}
      {meta.notificationNumber && (
        <div className="relative space-y-2 border border-[#f6c945]/30 bg-gradient-to-b from-[#f6c945]/[0.07] to-[#0d0e10]/70 p-4 text-xs text-white/70 backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2">
            <span className="flex items-center gap-1.5 text-sm font-extrabold uppercase italic tracking-wide text-[#f6c945]" style={display}>
              <FileText className="h-4 w-4" aria-hidden="true" />
              <span>Official RTO Gazette Rule Verification:</span>
            </span>
            <span className="border border-emerald-400/30 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] text-emerald-300">
              Rule Active &amp; Verified
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 pt-1 font-mono text-[11px] sm:grid-cols-2 md:grid-cols-4">
            <div>
              <span className="block font-sans text-[10px] uppercase tracking-widest text-white/40">Notification ID</span>
              <span className="font-bold text-white">{meta.notificationNumber}</span>
            </div>
            <div>
              <span className="block font-sans text-[10px] uppercase tracking-widest text-white/40">Effective Date</span>
              <span className="text-white">{meta.effectiveFrom} – {meta.effectiveTo}</span>
            </div>
            <div>
              <span className="block font-sans text-[10px] uppercase tracking-widest text-white/40">Last Verified Date</span>
              <span className="text-white">{meta.lastVerified}</span>
            </div>
            <div>
              <span className="block font-sans text-[10px] uppercase tracking-widest text-white/40">Gazette Source</span>
              <a
                href={meta.sourceURL}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-1 text-[#f6c945] underline decoration-[#dc2626] decoration-2 underline-offset-4 hover:text-white ${focusRing}`}
              >
                <span>MoRTH Portal</span>
                <ExternalLink className="h-3 w-3" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ---------- Mandatory legal disclaimer ---------- */}
      <div className="relative">
        <Disclaimer label="Mandatory Disclaimer:" text={mandatoryDisclaimer} />
      </div>
    </div>
  );
}