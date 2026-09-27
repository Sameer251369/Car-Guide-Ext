import { useLayoutEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

const scrollPositions = new Map();

export default function ScrollToTop() {
  const { key } = useLocation();
  const navigationType = useNavigationType();

  useLayoutEffect(() => {
    window.history.scrollRestoration = 'manual';

    const restorePosition = scrollPositions.get(key);
    if (navigationType === 'POP' && restorePosition !== undefined) {
      window.scrollTo({ top: restorePosition, left: 0, behavior: 'instant' });
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }

    const savePosition = () => scrollPositions.set(key, window.scrollY);
    window.addEventListener('scroll', savePosition, { passive: true });

    return () => {
      savePosition();
      window.removeEventListener('scroll', savePosition);
    };
  }, [key, navigationType]);

  return null;
}
