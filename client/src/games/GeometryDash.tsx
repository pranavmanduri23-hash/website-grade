import React, { useEffect, useRef, useState } from 'react';

interface GeometryDashProps {
  onGameOver?: (score: number) => void;
}

export const GeometryDash: React.FC<GeometryDashProps> = ({ onGameOver }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'playing' | 'gameOver'>('playing');
  const [score, setScore] = useState(0);
  const gameStateRef = useRef({
    score: 0,
    gameRunning: true,
    player: {
      x: 100,
      y: 0,
      size: 30,
      velocityY: 0,
      rotation: 0,
      isAirborne: false,
    },
    obstacles: [] as any[],
    gameSpeed: 6,
    frameCount: 0,
  });

  const restartGame = () => {
    const state = gameStateRef.current;
    state.score = 0;
    state.gameRunning = true;
    state.player.y = 0;
    state.player.velocityY = 0;
    state.player.rotation = 0;
    state.obstacles = [];
    state.gameSpeed = 6;
    state.frameCount = 0;
    setScore(0);
    setGameState('playing');
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const state = gameStateRef.current;
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const groundY = canvasHeight - 60;

    const drawPlayer = () => {
      const { player } = state;
      ctx!.save();
      ctx!.translate(player.x + player.size / 2, player.y + player.size / 2);
      ctx!.rotate(player.rotation);

      // Player Cube - Neon Cyan with Red Glow
      ctx!.fillStyle = '#00D4FF';
      ctx!.shadowBlur = 15;
      ctx!.shadowColor = '#00D4FF';
      ctx!.fillRect(-player.size / 2, -player.size / 2, player.size, player.size);
      
      // Outline
      ctx!.strokeStyle = '#FFFFFF';
      ctx!.lineWidth = 2;
      ctx!.strokeRect(-player.size / 2, -player.size / 2, player.size, player.size);

      ctx!.restore();
    };

    const drawObstacle = (obs: any) => {
      ctx!.fillStyle = '#FF1744'; // Red Obstacles
      ctx!.shadowBlur = 10;
      ctx!.shadowColor = '#FF1744';

      if (obs.type === 'spike') {
        ctx!.beginPath();
        ctx!.moveTo(obs.x, obs.y);
        ctx!.lineTo(obs.x + obs.width / 2, obs.y - obs.height);
        ctx!.lineTo(obs.x + obs.width, obs.y);
        ctx!.closePath();
        ctx!.fill();
      } else {
        ctx!.fillRect(obs.x, obs.y - obs.height, obs.width, obs.height);
      }
      ctx!.shadowBlur = 0;
    };

    const gameLoop = () => {
      if (!state.gameRunning) return;

      // Clear Canvas
      ctx!.fillStyle = '#0B0F19';
      ctx!.fillRect(0, 0, canvasWidth, canvasHeight);

      // Draw Ground - RED LINE AS REQUESTED
      ctx!.strokeStyle = '#FF1744';
      ctx!.lineWidth = 4;
      ctx!.shadowBlur = 10;
      ctx!.shadowColor = '#FF1744';
      ctx!.beginPath();
      ctx!.moveTo(0, groundY);
      ctx!.lineTo(canvasWidth, groundY);
      ctx!.stroke();
      ctx!.shadowBlur = 0;

      // Update Player
      const { player } = state;
      player.velocityY += 0.8; // Gravity
      player.y += player.velocityY;

      if (player.y + player.size >= groundY) {
        player.y = groundY - player.size;
        player.velocityY = 0;
        player.isAirborne = false;
        // Snap rotation to nearest 90 degrees when landing
        player.rotation = Math.round(player.rotation / (Math.PI / 2)) * (Math.PI / 2);
      } else {
        player.isAirborne = true;
        player.rotation += 0.15; // Continuous rotation in air
      }

      drawPlayer();

      // Update Obstacles
      state.obstacles = state.obstacles.filter(obs => {
        obs.x -= state.gameSpeed;
        drawObstacle(obs);

        // Collision Detection
        if (
          player.x < obs.x + obs.width - 5 &&
          player.x + player.size > obs.x + 5 &&
          player.y + player.size > obs.y - obs.height + 5
        ) {
          state.gameRunning = false;
          setGameState('gameOver');
          onGameOver?.(state.score);
        }

        return obs.x > -100;
      });

      // Spawn Obstacles
      if (state.frameCount % Math.max(40, 100 - Math.floor(state.score / 50)) === 0) {
        const type = Math.random() > 0.5 ? 'spike' : 'block';
        state.obstacles.push({
          x: canvasWidth,
          y: groundY,
          width: 30,
          height: type === 'spike' ? 40 : 30,
          type: type
        });
      }

      state.score += 1;
      state.frameCount++;
      state.gameSpeed = 6 + (state.score / 1000);
      setScore(Math.floor(state.score / 10));

      requestAnimationFrame(gameLoop);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.code === 'Space' || e.code === 'ArrowUp') && !state.player.isAirborne && state.gameRunning) {
        state.player.velocityY = -14;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const animationId = requestAnimationFrame(gameLoop);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      cancelAnimationFrame(animationId);
    };
  }, [gameState, onGameOver]);

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <div className="relative w-full max-w-4xl h-[400px] rounded-xl overflow-hidden cyan-border shadow-2xl">
        <canvas
          ref={canvasRef}
          width={800}
          height={400}
          className="w-full h-full bg-[#0B0F19]"
        />
        
        {/* Score Display */}
        <div className="absolute top-6 left-6 text-3xl font-black text-[#00D4FF] italic drop-shadow-[0_0_10px_rgba(0,212,255,0.5)]">
          SCORE: {score}
        </div>

        {/* Game Over Overlay */}
        {gameState === 'gameOver' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-md z-20">
            <h2 className="text-6xl font-black text-[#FF1744] mb-2 drop-shadow-[0_0_20px_#FF1744]">CRASHED!</h2>
            <p className="text-[#00D4FF] text-2xl font-bold mb-8">FINAL SCORE: {score}</p>
            <button 
              onClick={restartGame}
              className="px-10 py-4 bg-[#00D4FF] text-[#0B0F19] font-black rounded-sm hover:bg-white transition-colors uppercase tracking-widest shadow-[0_0_20px_rgba(0,212,255,0.4)]"
            >
              Retry
            </button>
          </div>
        )}
      </div>
      <p className="text-muted-foreground text-sm uppercase tracking-widest font-bold">
        [Space] to jump over <span className="text-[#FF1744]">Red Hazards</span>
      </p>
    </div>
  );
};
