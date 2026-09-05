import React, { useState } from 'react';
import { ArrowRight, Search } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SearchGantry({ value, onChange, onSubmit }) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <form className="cg-search-gantry" onSubmit={onSubmit} role="search">
      <div className="cg-search-gantry__field">
        <label htmlFor="home-car-search">Search by brand or model</label>
        <div className="cg-search-gantry__input-wrap">
          <Search className="cg-search-gantry__icon" aria-hidden="true" />
          <input
            id="home-car-search"
            type="search"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Nexon, Swift or Creta"
            autoComplete="off"
            aria-label="Search by brand or model"
          />
          <motion.span
            className="cg-search-gantry__focus-rule"
            aria-hidden="true"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: isFocused ? 1 : 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          />
        </div>
      </div>
      <button type="submit" className="cg-primary-action">
        <span>Search cars</span>
        <ArrowRight aria-hidden="true" />
      </button>
    </form>
  );
}
