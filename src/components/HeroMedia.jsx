import React, { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';

const HERO_POSTER = 'https://images.unsplash.com/photo-1560100820-c8de014ed221?auto=format&fit=crop&w=2200&q=84';
const HERO_POSTER_ALT = 'Red performance coupe on a wet road at night, photographed by Wassim Chouak on Unsplash.';
const HERO_VIDEO = `${import.meta.env.BASE_URL}hero/car-guide-hero.mp4`;

const canUseVideo = () => {
  if (typeof window === 'undefined') return true;

  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const saveData = Boolean(navigator.connection?.saveData);
  return !reducedMotion && !saveData;
};

export default function HeroMedia({ children }) {
  const videoRef = useRef(null);
  const [videoEnabled] = useState(canUseVideo);
  const [mediaState, setMediaState] = useState(videoEnabled ? 'paused' : 'poster');

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoEnabled) return undefined;

    let cancelled = false;

    const playVideo = () => {
      const playPromise = video.play();
      if (!playPromise?.then) {
        setMediaState('playing');
        return;
      }

      playPromise
        .then(() => {
          if (!cancelled) setMediaState('playing');
        })
        .catch(() => {
          if (!cancelled) setMediaState('paused');
        });
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        video.pause();
        setMediaState('paused');
      } else if (!video.error) {
        playVideo();
      }
    };

    playVideo();
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [videoEnabled]);

  const handleToggle = () => {
    const video = videoRef.current;
    if (!video || mediaState === 'failed') return;

    if (video.paused) {
      video.play()
        .then(() => setMediaState('playing'))
        .catch(() => setMediaState('paused'));
      return;
    }

    video.pause();
    setMediaState('paused');
  };

  return (
    <div className="cg-hero-media">
      <video
        ref={videoRef}
        className="cg-hero-media__video"
        autoPlay={videoEnabled}
        muted
        loop
        playsInline
        preload={videoEnabled ? 'metadata' : 'none'}
        poster={HERO_POSTER}
        onError={() => setMediaState('failed')}
        aria-hidden="true"
      >
        <source src={HERO_VIDEO} type="video/mp4" />
      </video>
      <div className="cg-hero-media__scrim" aria-hidden="true" />
      <span className="cg-hero-media__lane cg-hero-media__lane--white" aria-hidden="true" />
      <span className="cg-hero-media__lane cg-hero-media__lane--red" aria-hidden="true" />
      <div className="cg-hero-media__content">{children}</div>
      <p className="cg-sr-only">{HERO_POSTER_ALT}</p>
      {videoEnabled && mediaState !== 'failed' && (
        <button
          type="button"
          className="cg-hero-media__control"
          onClick={handleToggle}
          aria-label={mediaState === 'playing' ? 'Pause hero video' : 'Play hero video'}
          title={mediaState === 'playing' ? 'Pause hero video' : 'Play hero video'}
        >
          {mediaState === 'playing' ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
        </button>
      )}
    </div>
  );
}
