'use client';

import { useEffect, useRef } from 'react';
import Hls from 'hls.js';

interface LiveStreamPlayerProps {
  streamKey: string;
}

export default function LiveStreamPlayer({ streamKey }: LiveStreamPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hls: Hls | undefined;

    if (Hls.isSupported()) {
      hls = new Hls();
      hls.loadSource(`http://localhost:8000/live/${streamKey}/index.m3u8`);
      hls.attachMedia(video);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = `http://localhost:8000/live/${streamKey}/index.m3u8`;
    }

    return () => {
      hls?.destroy();
    };
  }, [streamKey]);

  return <video ref={videoRef} className="w-full h-full object-cover" autoPlay controls muted={false} />;
}
