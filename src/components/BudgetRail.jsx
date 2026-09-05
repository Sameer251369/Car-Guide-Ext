import React, { useRef } from 'react';
import { motion } from 'framer-motion';

const budgetTabs = [
  { label: 'Under ₹10 lakh', value: 'under10' },
  { label: '₹10–20 lakh', value: 'ten20' },
  { label: 'Above ₹20 lakh', value: 'above20' },
];

export default function BudgetRail({ value, onChange }) {
  const tabRefs = useRef({});

  const moveFocus = (nextValue) => {
    onChange(nextValue);
    window.requestAnimationFrame(() => tabRefs.current[nextValue]?.focus());
  };

  const handleKeyDown = (event, index) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;

    event.preventDefault();
    let nextIndex = index;
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % budgetTabs.length;
    if (event.key === 'ArrowLeft') nextIndex = (index - 1 + budgetTabs.length) % budgetTabs.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = budgetTabs.length - 1;
    moveFocus(budgetTabs[nextIndex].value);
  };

  return (
    <div className="cg-budget-rail" role="tablist" aria-label="Filter cars by budget">
      {budgetTabs.map((tab, index) => {
        const active = value === tab.value;
        return (
          <button
            key={tab.value}
            ref={(element) => { tabRefs.current[tab.value] = element; }}
            type="button"
            role="tab"
            aria-selected={active}
            aria-controls="budget-results"
            tabIndex={active ? 0 : -1}
            className={`cg-budget-rail__tab${active ? ' is-active' : ''}`}
            onClick={() => onChange(tab.value)}
            onKeyDown={(event) => handleKeyDown(event, index)}
          >
            <span>{tab.label}</span>
            {active && (
              <motion.span
                className="cg-budget-rail__indicator"
                layoutId="cg-budget-indicator"
                transition={{ duration: 0.18, ease: 'easeOut' }}
                aria-hidden="true"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
