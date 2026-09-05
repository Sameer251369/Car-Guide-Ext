import React from 'react';

const defaultItems = [
  { value: '301', label: 'car models' },
  { value: '36', label: 'states & UTs' },
  { value: 'Itemized', label: 'price breakup' },
];

export default function ProofRail({ items = defaultItems }) {
  return (
    <div className="cg-proof-rail" aria-label="Car Guide Media coverage">
      <div className="cg-proof-rail__inner">
        {items.map((item, index) => (
          <div className={`cg-proof-rail__item${index === 0 ? ' cg-proof-rail__item--lead' : ''}`} key={`${item.value}-${item.label}`}>
            <strong>{item.value}</strong>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
