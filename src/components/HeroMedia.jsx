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
      video
        .play()
        .then(() => setMediaState('playing'))
        .catch(() => setMediaState('paused'));
      return;
    }

    video.pause();
    setMediaState('paused');
  };

  const isPlaying = mediaState === 'playing';

  return (
    <div className="relative isolate overflow-hidden bg-[#0a0e13]">
      {/* Media layer */}
      <video
        ref={videoRef}
        className="absolute inset-0 z-0 h-full w-full object-cover"
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

      {/* Scrim: darkens the left for the headline and the bottom for the search panel */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(90deg,rgba(10,14,19,0.7)_0%,rgba(10,14,19,0.25)_55%,rgba(10,14,19,0.1)_100%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-1/2 bg-gradient-to-t from-[#0a0e13] to-transparent"
      />

      {/* Sodium-lamp hairline along the bottom edge */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-[2px] bg-gradient-to-r from-[#ffb224] via-[#ffb224]/30 to-transparent"
      />

      <div className="relative z-10">{children}</div>

      <p className="sr-only">{HERO_POSTER_ALT}</p>

      {videoEnabled && mediaState !== 'failed' && (
        <button
          type="button"
          onClick={handleToggle}
          aria-label={isPlaying ? 'Pause hero video' : 'Play hero video'}
          title={isPlaying ? 'Pause hero video' : 'Play hero video'}
          className="absolute right-4 top-4 z-20 grid h-11 w-11 place-items-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur-xl transition-colors duration-200 hover:border-[#ffb224] hover:bg-[#ffb224] hover:text-[#0a0e13] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffb224] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0e13] sm:right-6 sm:top-6"
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Play className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      )}
    </div>
  );
}