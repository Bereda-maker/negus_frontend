'use client';

import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronUp, ChevronDown, Play, Pause, Eye, Radio,
  Maximize, Minimize, X
} from 'lucide-react';
import Hls from 'hls.js';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/api';
import { Product } from '@/types';
import '@/i18n';

// ─── Types ──────────────────────────────────────────────
interface LiveStream {
  streamKey: string;
  title?: string;
  viewerCount?: number;
  seller?: { _id: string; name: string; avatar?: { url: string } | null };
  [key: string]: unknown;
}

type FeedItem = { type: 'live'; data: LiveStream } | { type: 'product'; data: Product };

// ─── Live Stream Player ──────────────────────────────────
function LiveStreamPlayer({ streamKey }: { streamKey: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let hls: Hls | undefined;
    const loadStream = () => {
      const video = videoRef.current;
      if (!video) return;
      if (Hls.isSupported()) {
        hls = new Hls();
        hls.loadSource(`http://localhost:8000/live/${streamKey}/index.m3u8`);
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = `http://localhost:8000/live/${streamKey}/index.m3u8`;
      }
    };
    loadStream();
    return () => hls?.destroy();
  }, [streamKey]);

  return (
    <video
      ref={videoRef}
      className="absolute inset-0 h-full w-full object-cover"
      autoPlay
      playsInline
      muted={false}
    />
  );
}

// ─── Main Component ──────────────────────────────────────
export default function ReelsPage() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  // ── State ──
  const [products, setProducts] = useState<Product[]>([]);
  const [liveStreams, setLiveStreams] = useState<LiveStream[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Refs
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const currentVideoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const feedContainerRef = useRef<HTMLDivElement>(null);

  // ─── Hide navbar/footer on this page ───────────────────
  useEffect(() => {
    // Add a class to the body to hide the main layout elements
    document.body.classList.add('reels-page');

    // Optionally, if you have specific IDs for navbar/footer, hide them directly
    // Example: document.getElementById('navbar')?.style.display = 'none';

    return () => {
      document.body.classList.remove('reels-page');
      // Restore visibility if you hid by ID
    };
  }, []);

  // ── Fetch Data ──
  useEffect(() => {
    const fetchData = async () => {
      let all: Product[] = [];
      try {
        const response = await api.get('/products', { params: { hasVideo: true } });
        all = response.data.data || [];
      } catch (err) {
        console.warn('hasVideo query failed, fetching all products', err);
        try {
          const fallback = await api.get('/products');
          all = fallback.data.data || [];
        } catch (fallbackErr) {
          console.error('Fallback also failed:', fallbackErr);
          setLoading(false);
          return;
        }
      }
      const withVideos = all.filter((p) => p.videos && p.videos.length > 0);
      setProducts(withVideos);

      try {
        const liveRes = await api.get('/live-stream/live');
        setLiveStreams(liveRes.data.data || []);
      } catch (err) {
        console.warn('Failed to fetch live streams:', err);
        setLiveStreams([]);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  // ── Build Feed ──
  const feedItems: FeedItem[] = useMemo(() => {
    const items: FeedItem[] = [
      ...liveStreams.map((s) => ({ type: 'live' as const, data: s })),
      ...products.map((p) => ({ type: 'product' as const, data: p })),
    ];
    return items;
  }, [liveStreams, products]);

  // ── Track current video element ──
  useEffect(() => {
    const item = feedItems[currentIndex];
    if (item?.type === 'product') {
      currentVideoRef.current = videoRefs.current[currentIndex] || null;
    } else {
      currentVideoRef.current = null;
    }
  }, [currentIndex, feedItems]);

  // ── Auto‑play / pause ──
  useEffect(() => {
    const item = feedItems[currentIndex];
    if (item?.type !== 'product') return;
    const video = currentVideoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [currentIndex, isPlaying, feedItems]);

  // ── Navigation ──
  const goNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < feedItems.length - 1 ? prev + 1 : prev));
    setIsPlaying(true);
  }, [feedItems.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
    setIsPlaying(true);
  }, []);

  // ── Keyboard shortcuts ──
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goNext, goPrev]);

  // ── Touch / mouse swipe inside container ──
  const touchStartY = useRef(0);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartY.current - e.changedTouches[0].clientY;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goNext();
      else goPrev();
    }
  };

  // ── Full‑screen toggle ──
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  // ── Play/Pause toggle ──
  const togglePlay = () => setIsPlaying((prev) => !prev);

  // ── Go back to previous page ──
  const handleClose = () => {
    router.back();
  };

  // ── Loading ──
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black text-white">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold border-t-transparent" />
      </div>
    );
  }

  // ── Empty state ──
  if (feedItems.length === 0) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-black text-white px-4">
        <h2 className="text-2xl font-bold">{t('reels.empty.title')}</h2>
        <p className="mt-2 text-gray-400">{t('reels.empty.description')}</p>
        {isAuthenticated && (
          <Link
            href="/sell"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 font-bold text-black shadow-lg hover:shadow-xl transition"
          >
            {t('reels.empty.cta')}
          </Link>
        )}
      </div>
    );
  }

  // ── Render ──
  const currentItem = feedItems[currentIndex];
  const seller = currentItem.data.seller;

  return (
    <div
      className="relative flex h-screen w-full items-center justify-center bg-black"
      ref={containerRef}
    >
      {/* --- Close Button --- */}
      <button
        onClick={handleClose}
        className="absolute top-4 left-4 z-30 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition"
        aria-label="Close reels"
      >
        <X className="h-6 w-6" />
      </button>

      {/* --- Full‑screen Toggle --- */}
      <button
        onClick={toggleFullscreen}
        className="absolute top-4 right-4 z-30 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition"
        aria-label={isFullscreen ? 'Exit full screen' : 'Full screen'}
      >
        {isFullscreen ? (
          <Minimize className="h-6 w-6" />
        ) : (
          <Maximize className="h-6 w-6" />
        )}
      </button>

      {/* --- Mobile‑style Feed Container --- */}
      <div
        className="relative h-full max-h-[90vh] w-full max-w-[420px] overflow-hidden rounded-2xl bg-black shadow-2xl md:h-[80vh]"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        ref={feedContainerRef}
      >
        {/* ─── Video / Stream ─── */}
        {currentItem.type === 'live' ? (
          <>
            <LiveStreamPlayer streamKey={currentItem.data.streamKey} />
            <div className="absolute top-3 left-3 z-20 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              {t('reels.liveBadge')}
            </div>
          </>
        ) : (
          <video
            ref={(el) => {
              videoRefs.current[currentIndex] = el;
            }}
            src={currentItem.data.videos?.[0]?.url}
            className="absolute inset-0 h-full w-full object-cover"
            loop
            playsInline
            muted={false}
            autoPlay={isPlaying}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
        )}

        {/* ─── Overlay Gradient ─── */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

        {/* ─── Side Navigation Arrows (desktop) ─── */}
        <div className="absolute right-2 top-1/2 z-20 hidden -translate-y-1/2 flex-col gap-4 md:flex">
          <button
            onClick={goPrev}
            disabled={currentIndex === 0}
            className="rounded-full bg-black/50 p-2 text-white transition hover:bg-black/70 disabled:opacity-30"
            aria-label={t('reels.aria.prev')}
          >
            <ChevronUp className="h-5 w-5" />
          </button>
          <button
            onClick={goNext}
            disabled={currentIndex === feedItems.length - 1}
            className="rounded-full bg-black/50 p-2 text-white transition hover:bg-black/70 disabled:opacity-30"
            aria-label={t('reels.aria.next')}
          >
            <ChevronDown className="h-5 w-5" />
          </button>
        </div>

        {/* ─── Progress Dots ─── */}
        <div className="absolute right-3 top-1/2 z-20 hidden -translate-y-1/2 translate-x-6 flex-col items-center gap-2 md:flex">
          {feedItems.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 w-1.5 rounded-full transition-all ${
                idx === currentIndex ? 'h-6 w-1.5 bg-gold' : 'bg-white/40'
              }`}
            />
          ))}
        </div>

        {/* ─── Info & Controls ─── */}
        <div className="absolute bottom-0 left-0 right-0 z-20 p-4 pb-6 text-white">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 space-y-1.5">
              {/* Seller */}
              <button
                onClick={() => router.push(`/seller/${seller?._id}`)}
                className="flex items-center gap-2 hover:underline focus:outline-none"
              >
                {seller?.avatar?.url ? (
                  <img
                    src={seller.avatar.url}
                    alt={seller.name}
                    className="h-8 w-8 rounded-full object-cover border-2 border-white/30"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold/30 text-sm font-bold">
                    {seller?.name?.charAt(0) || 'U'}
                  </div>
                )}
                <span className="text-sm font-semibold">
                  {seller?.name || t('reels.sellerFallback')}
                </span>
              </button>

              {/* Content */}
              {currentItem.type === 'live' ? (
                <div>
                  <h2 className="text-lg font-bold leading-tight">
                    {currentItem.data.title || t('reels.liveTitleFallback')}
                  </h2>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-red-400 flex items-center gap-1">
                      <Radio className="h-3 w-3" /> {t('reels.liveBadge')}
                    </span>
                    <span className="text-white/60">
                      {t('reels.viewerCount', { count: currentItem.data.viewerCount || 0 })}
                    </span>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-lg font-bold leading-tight line-clamp-2">
                    {currentItem.data.title}
                  </h2>
                  <p className="text-gold text-base font-bold">
                    {currentItem.data.price} ETB
                  </p>
                  <Link
                    href={`/product/${currentItem.data._id}`}
                    className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur-sm hover:bg-white/30 transition"
                  >
                    {t('reels.viewProduct')} <Eye className="h-3 w-3" />
                  </Link>
                </>
              )}
            </div>

            {/* Play/Pause */}
            {currentItem.type === 'product' && (
              <button
                onClick={togglePlay}
                className="rounded-full bg-black/40 p-2 backdrop-blur-sm transition hover:bg-black/60"
                aria-label={isPlaying ? t('reels.aria.pause') : t('reels.aria.play')}
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5" />
                )}
              </button>
            )}
          </div>

          {/* Progress bar */}
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-white/60">
              {t('reels.progress', { current: currentIndex + 1, total: feedItems.length })}
            </span>
            <div className="h-1 flex-1 rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-gold transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / feedItems.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* ─── Swipe Hint (first item only) ─── */}
        {currentIndex === 0 && (
          <div className="absolute bottom-24 left-1/2 z-20 -translate-x-1/2 animate-bounce text-white/60 text-xs">
            {t('reels.swipeHint')}
          </div>
        )}
      </div>
    </div>
  );
}
