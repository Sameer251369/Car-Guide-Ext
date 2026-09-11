import React from 'react';
import { Link } from 'react-router-dom';
import { Car, Shield, Calculator, BookOpen, ExternalLink, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 text-slate-400 text-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-bold">
                <Car className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold text-white font-serif">CAR GUIDE MEDIA</span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              India's premier automotive portfolio, editorial review platform, and config-driven state road tax calculator.
            </p>
            <div className="pt-2 text-xs text-slate-500">
              Client: <span className="text-slate-300">Rishabh Arora</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-xs uppercase tracking-wider text-amber-400">Navigation</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/" className="hover:text-white transition-colors">Home Page</Link></li>
              <li><Link to="/vehicles" className="hover:text-white transition-colors">Automotive Portfolio</Link></li>
              <li><Link to="/calculator" className="hover:text-white transition-colors">On-Road Price Calculator</Link></li>
              <li><Link to="/blog" className="hover:text-white transition-colors">Editorial Blog & Advice</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
            </ul>
          </div>

          {/* Tax Calculation Guides */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-xs uppercase tracking-wider text-amber-400">Supported States & Tax Rules</h4>
            <ul className="space-y-2.5 text-xs">
              <li><span className="text-slate-300 font-medium">Delhi (NCT):</span> Ex-showroom slab rates</li>
              <li><span className="text-slate-300 font-medium">Maharashtra:</span> Standard state RTO slabs</li>
              <li><span className="text-slate-300 font-medium">Gujarat:</span> Pre-GST tax basis rules</li>
              <li><span className="text-slate-300 font-medium">Chandigarh:</span> UT Pre-GST concessions</li>
              <li><span className="text-slate-300 font-medium">EV Discount:</span> 0% Road Tax applicability</li>
            </ul>
          </div>

          {/* Trust & Legal */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold mb-4 text-xs uppercase tracking-wider text-amber-400">Calculation Transparency</h4>
            <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-400 space-y-2">
              <div className="flex items-center space-x-1.5 text-amber-400 font-medium">
                <Shield className="w-4 h-4" />
                <span>Self-Hosted Pricing Engine</span>
              </div>
              <p className="text-[11px] leading-normal text-slate-400">
                All tax rates, RTO fees, and TCS rules (1% for &gt;₹10L) are maintained in our managed database for accurate estimates without third-party fees.
              </p>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            &copy; {new Date().getFullYear()} Car Guide Media. All rights reserved.
          </div>
          <div className="flex items-center space-x-1 text-slate-400">
            <span>Crafted & Delivered by</span>
            <span className="font-semibold text-slate-200">KaarBaar Solutions</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
