import React, { useState } from 'react';
import { Lock, ShieldCheck, Sparkles, AlertCircle, Phone, User, MapPin, ArrowRight, X } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-amber-500/30 p-6 md:p-8 shadow-2xl shadow-amber-500/10">
        
        {/* Close Button */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-slate-400 hover:text-slate-200"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        )}
        
        {/* Top Lock Badge */}
        <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 p-0.5 shadow-lg shadow-amber-500/30 mb-5">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
            <Lock className="w-7 h-7 text-amber-400" />
          </div>
        </div>

        {/* Modal Header */}
        <div className="text-center space-y-2">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Instant Access Gate</span>
          </span>

          <h2 className="text-2xl font-bold text-white font-serif">
            Unlock Itemized On-Road Price Breakdown
          </h2>

          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            Enter your details below to generate your personalized RTO tax, insurance, TCS &amp; dealer breakdown for <strong className="text-white">{vehicle?.brand_name || vehicle?.brand?.name} {vehicle?.name}</strong> in <strong className="text-amber-400">{stateName}</strong>.
          </p>
        </div>

        {/* Errors */}
        {error && (
          <div className="mt-4 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/40 space-y-2">
            <div className="flex items-start space-x-2 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold">Calculation Error</p>
                <p className="text-rose-200/90 mt-0.5">{error}</p>
              </div>
            </div>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="mt-2 text-xs font-semibold text-rose-300 hover:text-rose-200 underline"
              >
                Close and Try Different Settings
              </button>
            )}
          </div>
        )}

        {validationError && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Lead Capture Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          
          {/* Name Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Your Full Name *</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                disabled={isLoading}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Rishabh Arora"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 placeholder-slate-600 transition-all disabled:opacity-50"
              />
            </div>
          </div>

          {/* Phone Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">10-Digit Mobile Number *</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 text-xs font-mono">
                +91
              </div>
              <input
                type="tel"
                required
                disabled={isLoading}
                maxLength={10}
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                placeholder="9876543210"
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm font-mono focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 placeholder-slate-600 transition-all disabled:opacity-50"
              />
            </div>
          </div>

          {/* City Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">City / Region *</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <MapPin className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                disabled={isLoading}
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="e.g. Mumbai, Ahmedabad, New Delhi"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 placeholder-slate-600 transition-all disabled:opacity-50"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !!error}
            className="w-full mt-2 py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 focus:outline-none transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span>Calculating &amp; Unlocking...</span>
            ) : (
              <>
                <span>Unlock Full Price Breakdown</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="pt-2 flex items-center justify-center space-x-2 text-[11px] text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Zero Spam Guarantee • Verified Car Guide Media Leads</span>
          </div>

        </form>

      </div>
    </div>
  );
}
