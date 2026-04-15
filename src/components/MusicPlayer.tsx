import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, Music } from 'lucide-react';
import { motion } from 'motion/react';

interface Track {
  id: number;
  title: string;
  artist: string;
  url: string;
  cover: string;
}

const TRACKS: Track[] = [
  {
    id: 1,
    title: "Neon Pulse",
    artist: "AI Synthwave",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    cover: "https://picsum.photos/seed/neon1/400/400"
  },
  {
    id: 2,
    title: "Cyber Rhythm",
    artist: "Neural Beats",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    cover: "https://picsum.photos/seed/neon2/400/400"
  },
  {
    id: 3,
    title: "Digital Horizon",
    artist: "Binary Soul",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    cover: "https://picsum.photos/seed/neon3/400/400"
  }
];

interface MusicPlayerProps {
  onPlayPause: (isPlaying: boolean) => void;
}

export default function MusicPlayer({ onPlayPause }: MusicPlayerProps) {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentTrack = TRACKS[currentTrackIndex];

  const playAudio = async () => {
    if (audioRef.current) {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
        onPlayPause(true);
        setError(null);
      } catch (err) {
        console.error("Playback failed:", err);
        setError("AUTOPLAY_BLOCKED: CLICK PLAY");
        setIsPlaying(false);
        onPlayPause(false);
      }
    }
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
        onPlayPause(false);
      } else {
        playAudio();
      }
    }
  };

  const handleNext = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
    // Play will be triggered by useEffect
  };

  const handlePrev = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
    // Play will be triggered by useEffect
  };

  useEffect(() => {
    if (isPlaying) {
      playAudio();
    }
  }, [currentTrackIndex]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const duration = audioRef.current.duration;
      if (duration) {
        setProgress((current / duration) * 100);
      }
    }
  };

  const handleAudioError = (e: any) => {
    console.error("Audio error:", e);
    setError("SIGNAL_LOST: SOURCE_UNREACHABLE");
  };

  return (
    <div className="w-full flex items-center justify-between gap-8 font-mono">
      {/* Track Info */}
      <div className="flex items-center gap-4 w-[250px] flex-shrink-0">
        <div className="w-12 h-12 border-2 border-magenta bg-magenta/10 flex-shrink-0 overflow-hidden relative">
          <img
            src={currentTrack.cover}
            alt={currentTrack.title}
            className="w-full h-full object-cover opacity-50 grayscale contrast-150"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-magenta/20 mix-blend-overlay" />
          {error && (
            <div className="absolute inset-0 bg-red-500/40 flex items-center justify-center">
              <span className="text-[8px] font-bold text-white animate-pulse">ERR</span>
            </div>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold truncate text-cyan glitch-text" data-text={currentTrack.title}>{currentTrack.title}</p>
          <p className="text-[10px] text-magenta/70 truncate">
            {error ? <span className="text-red-500">{error}</span> : `ARTIST::${currentTrack.artist}`}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-6">
        <button onClick={handlePrev} className="p-2 text-cyan/60 hover:text-cyan hover:bg-cyan/10 border border-transparent hover:border-cyan transition-all">
          <SkipBack size={20} fill="currentColor" />
        </button>
        
        <button
          onClick={togglePlay}
          className="w-12 h-12 flex items-center justify-center bg-cyan text-dark hover:bg-magenta hover:text-dark transition-all shadow-[0_0_15px_rgba(0,255,255,0.5)]"
        >
          {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
        </button>

        <button onClick={handleNext} className="p-2 text-cyan/60 hover:text-cyan hover:bg-cyan/10 border border-transparent hover:border-cyan transition-all">
          <SkipForward size={20} fill="currentColor" />
        </button>
      </div>

      {/* Progress & Volume */}
      <div className="flex-1 flex items-center gap-6 max-w-[450px]">
        {/* Progress */}
        <div className="flex-1">
          <div className="flex justify-between text-[10px] text-cyan/40 mb-1">
            <span>{`T_ELAPSED::${Math.floor(progress)}%`}</span>
            <span>{`STATUS::${isPlaying ? 'STREAMING' : 'BUFFERING'}`}</span>
          </div>
          <div className="h-2 w-full bg-cyan/10 border border-cyan/30 overflow-hidden">
            <motion.div
              className="h-full bg-cyan shadow-[0_0_10px_#00ffff]"
              animate={{ width: `${progress}%` }}
              transition={{ type: "spring", bounce: 0, duration: 0.1 }}
            />
          </div>
        </div>

        {/* Volume Slider */}
        <div className="w-24 flex flex-col gap-1">
          <div className="flex justify-between text-[10px] text-magenta/60">
            <span>VOL</span>
            <span>{Math.round(volume * 100)}</span>
          </div>
          <div className="relative h-2 w-full bg-magenta/10 border border-magenta/30">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <motion.div
              className="h-full bg-magenta shadow-[0_0_10px_#ff00ff]"
              animate={{ width: `${volume * 100}%` }}
              transition={{ type: "spring", bounce: 0, duration: 0.1 }}
            />
          </div>
        </div>
      </div>

      <audio
        ref={audioRef}
        src={currentTrack.url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleNext}
        onError={handleAudioError}
      />
    </div>
  );
}
