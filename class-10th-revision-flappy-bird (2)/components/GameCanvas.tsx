
import React, { useEffect, useRef, useState } from 'react';
import { GameStatus, GameSettings, GameDifficulty } from '../types';
import { audioService } from '../services/audioService';

interface GameCanvasProps {
  status: GameStatus;
  settings: GameSettings;
  score: number;
  birdColor?: string;
  onScoreUpdate: (score: number) => void;
  onCollision: () => void;
  onGameStart: () => void;
  shouldReset?: boolean;
}

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 450;
const BIRD_SIZE = 34;
const PIPE_WIDTH = 64;
const GROUND_HEIGHT = 40;

const PHYSICS_CONFIGS: Record<GameDifficulty, any> = {
  'Relaxed': {
    gravity: 0.10,     // Even lighter gravity
    jump: -3.8,       // Very gentle jump
    pipeGap: 260,     // Ultra massive gap for ease
    baseSpeed: 1.3,   // Very slow
    spawnRate: 240    // Pipes much further apart
  },
  'Normal': {
    gravity: 0.18,
    jump: -4.8,
    pipeGap: 200,
    baseSpeed: 2.0,
    spawnRate: 190
  },
  'Challenging': {
    gravity: 0.28,
    jump: -6.5,
    pipeGap: 155,
    baseSpeed: 3.2,
    spawnRate: 140
  }
};

const GameCanvas: React.FC<GameCanvasProps> = ({ 
  status, 
  settings, 
  score, 
  birdColor = '#fde047',
  onScoreUpdate, 
  onCollision,
  onGameStart,
  shouldReset 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [birdY, setBirdY] = useState(CANVAS_HEIGHT / 2);
  const [birdVelocity, setBirdVelocity] = useState(0);
  const [pipes, setPipes] = useState<{ x: number; height: number; passed: boolean }[]>([]);
  const [frame, setFrame] = useState(0);
  const [groundOffset, setGroundOffset] = useState(0);
  const animationRef = useRef<number>(null);

  const config = PHYSICS_CONFIGS[settings.gameDifficulty];

  const pipeSpeed = config.baseSpeed + Math.min(score * 0.02, 2.0);
  const pipeSpawnRate = Math.max(config.spawnRate - Math.floor(score * 1.0), 100);

  const resetGame = () => {
    setBirdY(CANVAS_HEIGHT / 2 - 20);
    setBirdVelocity(0);
    setPipes([]);
    setFrame(0);
    setGroundOffset(0);
  };

  useEffect(() => {
    if (shouldReset) resetGame();
  }, [shouldReset]);

  const performJump = () => {
    if (status === GameStatus.READY) {
      onGameStart();
      setBirdVelocity(config.jump);
      if (settings.soundEnabled) audioService.playSfx('jump', settings.volume);
    } else if (status === GameStatus.PLAYING) {
      setBirdVelocity(config.jump);
      if (settings.soundEnabled) audioService.playSfx('jump', settings.volume);
    }
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        performJump();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [status, settings, performJump]);

  useEffect(() => {
    if (status !== GameStatus.PLAYING && status !== GameStatus.READY) return;

    const loop = () => {
      if (status === GameStatus.PLAYING) {
        setFrame((f) => f + 1);
        setGroundOffset((o) => (o + pipeSpeed) % 40);

        setBirdVelocity((v) => v + config.gravity);
        setBirdY((y) => {
          const nextY = y + birdVelocity;
          // Forgiving ground collision - slightly better threshold
          if (nextY < -20 || nextY > CANVAS_HEIGHT - GROUND_HEIGHT - BIRD_SIZE + 5) {
            if (settings.soundEnabled) audioService.playSfx('hit', settings.volume);
            onCollision();
            return y;
          }
          return nextY;
        });

        setPipes((prevPipes) => {
          const newPipes = prevPipes
            .map((p) => ({ ...p, x: p.x - pipeSpeed }))
            .filter((p) => p.x > -PIPE_WIDTH);

          if (frame > 60 && frame % pipeSpawnRate === 0) {
            const height = Math.random() * (CANVAS_HEIGHT - GROUND_HEIGHT - config.pipeGap - 100) + 50;
            newPipes.push({ x: CANVAS_WIDTH, height, passed: false });
          }

          newPipes.forEach((p) => {
            const birdX = 120;
            const birdRight = birdX + BIRD_SIZE - 10; // Forgiving horizontal hitbox
            const birdLeft = birdX + 10;
            const birdTop = birdY + 8;
            const birdBottom = birdY + BIRD_SIZE - 8;

            if (!p.passed && birdX > p.x + PIPE_WIDTH) {
              p.passed = true;
              onScoreUpdate(score + 1);
              if (settings.soundEnabled) audioService.playSfx('point', settings.volume);
            }

            // Forgiving vertical hitbox checks
            if (
              birdRight > p.x + 4 &&
              birdLeft < p.x + PIPE_WIDTH - 4 &&
              (birdTop < p.height || birdBottom > p.height + config.pipeGap)
            ) {
              if (settings.soundEnabled) audioService.playSfx('hit', settings.volume);
              onCollision();
            }
          });

          return newPipes;
        });
      } else if (status === GameStatus.READY) {
        setBirdY(CANVAS_HEIGHT / 2 + Math.sin(Date.now() / 250) * 12);
        setGroundOffset((o) => (o + 0.8) % 40);
      }

      animationRef.current = requestAnimationFrame(loop);
    };

    animationRef.current = requestAnimationFrame(loop);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [status, birdY, birdVelocity, pipes, frame, score, settings, onScoreUpdate, onCollision, onGameStart, pipeSpeed, pipeSpawnRate, config]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // SKY
    const bgGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    bgGrad.addColorStop(0, '#1e1b4b');
    bgGrad.addColorStop(1, '#312e81');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // PIPES
    pipes.forEach((p) => {
      const grad = ctx.createLinearGradient(p.x, 0, p.x + PIPE_WIDTH, 0);
      grad.addColorStop(0, '#065f46');
      grad.addColorStop(0.5, '#10b981');
      grad.addColorStop(1, '#065f46');
      ctx.fillStyle = grad;
      ctx.strokeStyle = '#064e3b';
      ctx.lineWidth = 3;

      // Top Pipe
      ctx.fillRect(p.x, 0, PIPE_WIDTH, p.height);
      ctx.strokeRect(p.x, -5, PIPE_WIDTH, p.height + 5);
      
      // Top Pipe Cap
      ctx.fillRect(p.x - 4, p.height - 20, PIPE_WIDTH + 8, 20);
      ctx.strokeRect(p.x - 4, p.height - 20, PIPE_WIDTH + 8, 20);

      // Bottom Pipe
      const bottomHeight = CANVAS_HEIGHT - GROUND_HEIGHT - (p.height + config.pipeGap);
      ctx.fillRect(p.x, p.height + config.pipeGap, PIPE_WIDTH, bottomHeight);
      ctx.strokeRect(p.x, p.height + config.pipeGap, PIPE_WIDTH, bottomHeight + 5);

      // Bottom Pipe Cap
      ctx.fillRect(p.x - 4, p.height + config.pipeGap, PIPE_WIDTH + 8, 20);
      ctx.strokeRect(p.x - 4, p.height + config.pipeGap, PIPE_WIDTH + 8, 20);
    });

    // GROUND
    ctx.fillStyle = '#431407'; 
    ctx.fillRect(0, CANVAS_HEIGHT - GROUND_HEIGHT, CANVAS_WIDTH, GROUND_HEIGHT);
    ctx.fillStyle = '#065f46';
    ctx.fillRect(0, CANVAS_HEIGHT - GROUND_HEIGHT, CANVAS_WIDTH, 12);

    // BIRD
    const birdX = 120;
    ctx.save();
    ctx.translate(birdX + BIRD_SIZE / 2, birdY + BIRD_SIZE / 2);
    ctx.rotate(Math.min(Math.max(birdVelocity * 0.1, -0.6), 0.8));
    
    // Body
    ctx.fillStyle = birdColor;
    ctx.beginPath();
    ctx.arc(0, 0, BIRD_SIZE/2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Eye
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(8, -4, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(10, -4, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Beak
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.moveTo(12, 0);
    ctx.lineTo(24, 4);
    ctx.lineTo(12, 8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore();

    // Score Text Overlay
    if (status === GameStatus.PLAYING || status === GameStatus.READY) {
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 54px Fredoka One';
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 10;
      ctx.fillText(score.toString(), CANVAS_WIDTH / 2, 80);
      ctx.shadowBlur = 0;
    }
  }, [birdY, birdVelocity, pipes, status, score, frame, groundOffset, pipeSpeed, config, birdColor]);

  return (
    <div 
      className="relative overflow-hidden rounded-[2rem] shadow-2xl border-4 border-white/10 w-full touch-none bg-slate-900"
      onTouchStart={(e) => { e.preventDefault(); performJump(); }}
    >
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        onClick={performJump}
        style={{ width: '100%', height: 'auto', display: 'block' }}
        className={`transition-all duration-700 cursor-pointer ${
          status === GameStatus.QUESTION || status === GameStatus.GAMEOVER ? 'blur-md opacity-50' : ''
        }`}
      />
    </div>
  );
};

export default GameCanvas;
