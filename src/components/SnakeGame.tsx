import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface SnakeGameProps {
  onScoreChange: (score: number) => void;
  isPaused: boolean;
}

const GRID_SIZE = 20;
const INITIAL_SNAKE = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 },
];
const INITIAL_DIRECTION = { x: 0, y: -1 };

export default function SnakeGame({ onScoreChange, isPaused }: SnakeGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  
  const lastUpdateRef = useRef<number>(0);
  const requestRef = useRef<number>(0);

  const generateFood = useCallback(() => {
    const newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
    // Ensure food doesn't spawn on snake
    if (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y)) {
      return generateFood();
    }
    return newFood;
  }, [snake]);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setFood(generateFood());
    setGameOver(false);
    setScore(0);
    onScoreChange(0);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          if (direction.y === 0) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
          if (direction.y === 0) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
          if (direction.x === 0) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
          if (direction.x === 0) setDirection({ x: 1, y: 0 });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction]);

  const update = useCallback((time: number) => {
    if (gameOver || isPaused) {
      requestRef.current = requestAnimationFrame(update);
      return;
    }

    const deltaTime = time - lastUpdateRef.current;
    const speed = Math.max(100, 200 - score * 5); // Speed up as score increases

    if (deltaTime > speed) {
      lastUpdateRef.current = time;

      setSnake(prevSnake => {
        const newHead = {
          x: (prevSnake[0].x + direction.x + GRID_SIZE) % GRID_SIZE,
          y: (prevSnake[0].y + direction.y + GRID_SIZE) % GRID_SIZE,
        };

        // Check collision with self
        if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
          setGameOver(true);
          if (score > highScore) setHighScore(score);
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        // Check collision with food
        if (newHead.x === food.x && newHead.y === food.y) {
          const newScore = score + 10;
          setScore(newScore);
          onScoreChange(newScore);
          setFood(generateFood());
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }

    requestRef.current = requestAnimationFrame(update);
  }, [direction, food, gameOver, isPaused, score, highScore, onScoreChange, generateFood]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(requestRef.current);
  }, [update]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cellSize = canvas.width / GRID_SIZE;

    // Clear canvas
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid lines (subtle)
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, canvas.height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(canvas.width, i * cellSize);
      ctx.stroke();
    }

    // Draw food (neon magenta - pixelated)
    ctx.fillStyle = '#ff00ff';
    ctx.shadowBlur = 0;
    ctx.fillRect(
      food.x * cellSize + 2,
      food.y * cellSize + 2,
      cellSize - 4,
      cellSize - 4
    );

    // Draw snake (cyan - pixelated)
    snake.forEach((segment, index) => {
      const isHead = index === 0;
      ctx.fillStyle = isHead ? '#00ffff' : 'rgba(0, 255, 255, 0.5)';
      
      // Glitch effect: occasionally offset a segment
      let glitchX = 0;
      let glitchY = 0;
      if (Math.random() > 0.98) {
        glitchX = (Math.random() - 0.5) * 10;
        glitchY = (Math.random() - 0.5) * 10;
      }

      ctx.fillRect(
        segment.x * cellSize + 1 + glitchX,
        segment.y * cellSize + 1 + glitchY,
        cellSize - 2,
        cellSize - 2
      );

      // Add "eyes" for head
      if (isHead) {
        ctx.fillStyle = '#000000';
        ctx.fillRect(segment.x * cellSize + 4, segment.y * cellSize + 4, 4, 4);
        ctx.fillRect(segment.x * cellSize + cellSize - 8, segment.y * cellSize + 4, 4, 4);
      }
    });
    ctx.shadowBlur = 0;

  }, [snake, food]);

  return (
    <div className="relative flex flex-col items-center justify-center p-4 overflow-hidden">
      <canvas
        ref={canvasRef}
        width={440}
        height={440}
        className="border-4 border-cyan shadow-[0_0_20px_rgba(0,255,255,0.3)]"
      />

      <AnimatePresence>
        {gameOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-dark/90 z-10 border-4 border-magenta"
          >
            <h2 className="text-6xl font-black text-magenta mb-2 glitch-text" data-text="CRITICAL_FAILURE">CRITICAL_FAILURE</h2>
            <p className="text-cyan font-mono mb-8">BUFFER_SCORE: {score}</p>
            <button
              onClick={resetGame}
              className="px-8 py-3 bg-magenta text-dark font-bold hover:bg-cyan transition-all uppercase tracking-widest"
            >
              REBOOT_SYSTEM
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-6 flex gap-4 text-[10px] uppercase tracking-widest text-cyan/40 font-mono">
        <span>[ARROW_KEYS] TO NAVIGATE</span>
        <span>•</span>
        <span>[MAGENTA_ORBS] ARE DATA</span>
      </div>
    </div>
  );
}
