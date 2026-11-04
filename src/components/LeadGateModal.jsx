import React, { useState } from 'react';
import { Lock, ShieldCheck, Sparkles, AlertCircle, Phone, User, MapPin, ArrowRight, X } from 'lucide-react';

const fieldCls =
  'w-full rounded-xl border border-white/10 bg-white/[0.05] py-3 pr-4 text-sm text-white placeholder-white/30 transition-all focus:border-[#ff3b2f] focus:bg-white/[0.08] focus:outline-none focus:ring-4 focus:ring-[#ff3b2f]/20 disabled:opacity-50';
const labelCls = 'mb-1.5 block text-xs font-semibold text-white/75';

export default function LeadGateModal({ isOpen, vehicle, stateName, onSubmit, isLoading, error, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    phone_number: '',
    city: '',
  });

  const [validationError, setValidationError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    const phoneDigits = formData.phone_number.replace(/\D/g, '');
    let cleanPhone = phoneDigits;
    if (cleanPhone.length === 12 && cleanPhone.startsWith('91')) {
      cleanPhone = cleanPhone.substring(2);
    }

    if (!formData.name.trim()) {
      setValidationError('Please enter your full name.');
      return;
    }
    if (cleanPhone.length !== 10 || !'6789'.includes(cleanPhone[0])) {
      setValidationError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }
    if (!formData.city.trim()) {
      setValidationError('Please enter your city.');
      return;
    }

    onSubmit({
      name: formData.name.trim(),
      phone_number: cleanPhone,
      city: formData.city.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-fade-in">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="lead-gate-title"
        className="relative max-h-[95vh] w-full max-w-lg overflow-y-auto rounded-[28px] border border-white/10 bg-[#0a0a0b] p-6 shadow-[0_40px_100px_-30px_rgba(255,59,47,0.45)] md:p-8"
      >
        {/* ambient glow */}
        <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[#ff3b2f]/25 blur-[90px]" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-[#ff3b2f]/10 blur-[90px]" />

        {/* corner accents */}
        <span aria-hidden="true" className="pointer-events-none absolute -right-px -top-px h-14 w-14 rounded-tr-[28px] border-r-2 border-t-2 border-[#ff3b2f]/70" />
        <span aria-hidden="true" className="pointer-events-none absolute -bottom-px -left-px h-14 w-14 rounded-bl-[28px] border-b-2 border-l-2 border-[#ff3b2f]/30" />

        {/* Close Button */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="absolute right-4 top-4 z-10 rounded-full border border-white/15 p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff3b2f] disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        <div className="relative">
          {/* Top Lock Badge */}
          <div className="relative mx-auto mb-5 flex h-16 w-16 items-center justify-center">
            <span aria-hidden="true" className="absolute inset-0 -skew-x-12 rounded-xl bg-[#ff3b2f] shadow-[0_0_36px_rgba(255,59,47,0.65)]" />
            <Lock className="relative h-7 w-7 text-white" />
          </div>

          {/* Modal Header */}
          <div className="space-y-3 text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white backdrop-blur-xl">
              <span className="h-3.5 w-1 -skew-x-12 rounded-sm bg-[#ff3b2f]" aria-hidden="true" />
              <Sparkles className="h-3.5 w-3.5 text-[#ff6b5f]" />
              <span>Instant Access Gate</span>
            </span>

            <h2 id="lead-gate-title" className="text-3xl font-black leading-[1.05] tracking-[-0.03em] text-white">
              Unlock Itemized On-Road Price Breakdown
            </h2>

            <p className="mx-auto max-w-md text-sm leading-relaxed text-white/60">
              Enter your details below to generate your personalized RTO tax, insurance, TCS &amp; dealer breakdown for <strong className="text-white">{vehicle?.brand_name || vehicle?.brand?.name} {vehicle?.name}</strong> in <strong className="text-[#ff6b5f]">{stateName}</strong>.
            </p>
          </div>

          {/* Errors */}
          {error && (
            <div role="alert" className="mt-5 space-y-2 rounded-2xl border border-rose-500/40 bg-rose-500/15 p-3.5">
              <div className="flex items-start gap-2 text-xs text-rose-300">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <p className="font-semibold">Calculation Error</p>
                  <p className="mt-0.5 text-rose-200/90">{error}</p>
                </div>
              </div>
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-2 text-xs font-semibold text-rose-300 underline underline-offset-4 hover:text-rose-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff3b2f]"
                >
                  Close and Try Different Settings
                </button>
              )}
            </div>
          )}

          {validationError && (
            <div role="alert" className="mt-5 flex items-center gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Lead Capture Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {/* Name Field */}
            <div>
              <label htmlFor="lead-name" className={labelCls}>Your Full Name *</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-white/40">
                  <User className="h-4 w-4" />
                </div>
                <input
                  id="lead-name"
                  type="text"
                  required
                  disabled={isLoading}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Rishabh Arora"
                  className={`${fieldCls} pl-10`}
                />
              </div>
            </div>

            {/* Phone Field */}
            <div>
              <label htmlFor="lead-phone" className={labelCls}>10-Digit Mobile Number *</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 font-mono text-xs text-white/50">
                  +91
                </div>
                <input
                  id="lead-phone"
                  type="tel"
                  required
                  disabled={isLoading}
                  maxLength={10}
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  placeholder="9876543210"
                  className={`${fieldCls} pl-12 font-mono`}
                />
              </div>
            </div>

            {/* City Field */}
            <div>
              <label htmlFor="lead-city" className={labelCls}>City / Region *</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-white/40">
                  <MapPin className="h-4 w-4" />
                </div>
                <input
                  id="lead-city"
                  type="text"
                  required
                  disabled={isLoading}
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="e.g. Mumbai, Ahmedabad, New Delhi"
                  className={`${fieldCls} pl-10`}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !!error}
              className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#ff3b2f] px-6 py-3.5 text-sm font-bold text-white shadow-[0_14px_34px_-10px_rgba(255,59,47,0.75)] transition-all hover:-translate-y-0.5 hover:bg-[#ff5247] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff3b2f] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0b] disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
            >
              {isLoading ? (
                <span>Calculating &amp; Unlocking...</span>
              ) : (
                <>
                  <span>Unlock Full Price Breakdown</span>
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 pt-2 text-[11px] text-white/50">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Zero Spam Guarantee • Verified Car Guide Media Leads</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}