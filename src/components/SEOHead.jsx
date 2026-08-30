import React, { useEffect } from 'react';

export default function SEOHead({ title, description, canonical }) {
  useEffect(() => {
    // Set Title
    document.title = title ? `${title} | Car Guide Media` : 'Car Guide Media | Automotive Portfolio & On-Road Price Calculator';

    // Set Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = description || 'Car Guide Media provides accurate config-driven on-road price estimates across Indian states, vehicle specs portfolio, and editorial reviews.';
  }, [title, description]);

  return null;
}
