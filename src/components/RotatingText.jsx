import React, { useEffect, useState } from 'react';

/**
 * Cycles through an array of short sentences, fading between them.
 * Keeps only one line visible at a time instead of a long static paragraph.
 */
export default function RotatingText({ phrases, interval = 3000, className = '' }) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!phrases || phrases.length <= 1) return undefined;

    const fadeOutTimer = setInterval(() => {
      setVisible(false);
      const nextTimer = setTimeout(() => {
        setIndex((prev) => (prev + 1) % phrases.length);
        setVisible(true);
      }, 300); // matches CSS transition duration below
      return () => clearTimeout(nextTimer);
    }, interval);

    return () => clearInterval(fadeOutTimer);
  }, [phrases, interval]);

  if (!phrases || phrases.length === 0) return null;

  return (
    <p
      className={`cg-rotating-text ${className}`}
      style={{
        opacity: visible ? 1 : 0,
        transition: 'opacity 300ms ease',
      }}
      aria-live="polite"
    >
      {phrases[index]}
    </p>
  );
}