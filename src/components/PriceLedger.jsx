import React from 'react';
import { Calculator } from 'lucide-react';
import { Link } from 'react-router-dom';

const charges = ['Ex-showroom price', 'RTO fees', 'Insurance', 'TCS', 'Finance charges'];

export default function PriceLedger() {
  return (
    <section className="cg-price-ledger" aria-labelledby="price-ledger-title">
      <div className="cg-container">
        <div className="cg-paired-rule" aria-hidden="true">
          <span />
          <span />
        </div>
        <div className="cg-price-ledger__intro">
          <p className="cg-operational-label">Price anatomy</p>
          <h2 id="price-ledger-title">See where the on-road estimate comes from</h2>
        </div>

        <div className="cg-price-ledger__body">
          <ol className="cg-price-ledger__equation" aria-label="On-road estimate calculation">
            {charges.map((charge, index) => (
              <React.Fragment key={charge}>
                <li className={index === 0 ? 'is-base' : ''}>{charge}</li>
                {index < charges.length - 1 && <li className="cg-price-ledger__operator" aria-hidden="true">+</li>}
              </React.Fragment>
            ))}
            <li className="cg-price-ledger__operator cg-price-ledger__operator--arrow" aria-hidden="true">→</li>
            <li className="is-total">Itemized estimate</li>
          </ol>

          <div className="cg-price-ledger__notes">
            <p>State-wise rates come from the managed pricing data.</p>
            <p>Every estimate includes a disclaimer and state data note.</p>
            <p>Published cars appear in both the catalog and calculator.</p>
            <Link to="/calculator" className="cg-primary-action cg-primary-action--compact">
              <Calculator aria-hidden="true" />
              <span>Calculate a price</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
