import React, { useState } from 'react';
import SnakeGame from './components/SnakeGame';
import MusicPlayer from './components/MusicPlayer';
import { motion } from 'motion/react';

export default function App() {
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="h-screen w-screen bg-dark text-cyan font-sans flex flex-col relative overflow-hidden crt-flicker">
      {/* Glitch Overlays */}
      <div className="noise" />
      <div className="scanline" />

      <div className="relative z-10 flex flex-1 p-4 gap-4 overflow-hidden">
        {/* Left Terminal */}
        <aside className="w-[280px] border-2 border-cyan bg-dark/80 p-4 flex flex-col gap-4">
          <div className="border-b-2 border-cyan pb-2">
            <h2 className="text-lg font-bold glitch-text" data-text="SYSTEM_LOG">SYSTEM_LOG</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto font-mono text-[10px] space-y-1 custom-scrollbar">
            <p className="text-magenta">{`[${new Date().toISOString()}] BOOT_SEQUENCE_INIT`}</p>
            <p>{`[${new Date().toISOString()}] NEURAL_LINK_ESTABLISHED`}</p>
            <p>{`[${new Date().toISOString()}] AUDIO_DRIVER_LOADED`}</p>
            <p className={isPlaying ? "text-cyan" : "text-magenta"}>{`[${new Date().toISOString()}] AUDIO_ENGINE: ${isPlaying ? 'RUNNING' : 'HALTED'}`}</p>
            <p>{`[${new Date().toISOString()}] SCORE_BUFFER_SYNC: ${score}`}</p>
            <p className="animate-pulse">{`[${new Date().toISOString()}] WAITING_FOR_INPUT...`}</p>
          </div>

          <div className="border-t-2 border-cyan pt-4">
            <div className="p-2 border border-magenta bg-magenta/10">
              <h4 className="text-xs font-bold text-magenta mb-2">COLLECTION_MANIFEST</h4>
              <div className="space-y-2">
                {[
                  { title: 'CYBER_DREAMS', active: true },
                  { title: 'NEON_HORIZON', active: false },
                  { title: 'DIGITAL_ECHO', active: false },
                ].map((track, i) => (
                  <div key={i} className={`text-[10px] flex justify-between ${track.active ? 'text-cyan' : 'text-cyan/40'}`}>
                    <span>{track.title}</span>
                    <span>{track.active ? '[PLAYING]' : '[IDLE]'}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Central Core */}
        <main className="flex-1 flex flex-col gap-4">
          <div className="flex-1 border-2 border-cyan bg-dark/90 flex items-center justify-center relative overflow-hidden">
            <div className="absolute top-4 left-4 border border-cyan px-2 py-1 bg-cyan/10 text-xs z-20">
              CORE_PROCESS: SNAKE_v2.0
            </div>
            <div className="absolute top-4 right-4 border border-magenta px-2 py-1 bg-magenta/10 text-magenta text-xl font-bold z-20">
              DATA_POINTS: {score}
            </div>
            
            <SnakeGame onScoreChange={setScore} isPaused={!isPlaying} />
          </div>
        </main>
      </div>

      {/* Control Interface */}
      <footer className="h-[80px] border-t-2 border-cyan bg-dark px-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-4 w-full">
          <div className="text-[10px] font-mono text-magenta border-r-2 border-magenta pr-4 h-full flex items-center">
            SIGNAL_PROCESSOR_v1
          </div>
          <MusicPlayer onPlayPause={setIsPlaying} />
        </div>
      </footer>
    </div>
  );
}
