import React, { useEffect, useRef, useState } from 'react';

interface DinoGameProps {
  onGameOver?: (score: number) => void;
}

export const DinoGame: React.FC<DinoGameProps> = ({ onGameOver }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const dinoRef = useRef<HTMLDivElement>(null);
  const [gameState, setGameState] = useState<'playing' | 'gameOver'>('playing');
  const [score, setScore] = useState(0);
  
  const stateRef = useRef({
    isJumping: false,
    gravity: 0.6,
    position: 0,
    velocity: 0,
    isGameOver: false,
    score: 0,
    gameSpeed: 5,
    obstacles: [] as HTMLDivElement[],
    nextObstacleTime: 0,
  });

  const restartGame = () => {
    const state = stateRef.current;
    state.isGameOver = false;
    state.score = 0;
    state.gameSpeed = 5;
    state.position = 0;
    state.isJumping = false;
    state.velocity = 0;
    state.nextObstacleTime = 0;
    setScore(0);
    setGameState('playing');
    
    // Clear obstacles
    state.obstacles.forEach(obs => obs.remove());
    state.obstacles = [];
    
    if (dinoRef.current) {
      dinoRef.current.style.bottom = '0px';
    }
  };

  useEffect(() => {
    const state = stateRef.current;
    let animationId: number;

    const gameLoop = () => {
      if (state.isGameOver) return;

      // 1. Apply Gravity to Dino
      if (state.isJumping) {
        state.position += state.velocity;
        state.velocity -= state.gravity;

        if (state.position <= 0) {
          state.position = 0;
          state.isJumping = false;
          state.velocity = 0;
        }
        if (dinoRef.current) {
          dinoRef.current.style.bottom = `${state.position}px`;
        }
      }

      // 2. Score Management
      state.score += 0.15;
      const currentScore = Math.floor(state.score);
      setScore(currentScore);

      // Gradually speed up the game
      if (currentScore > 0 && currentScore % 100 === 0 && state.gameSpeed < 15) {
        state.gameSpeed += 0.005;
      }

      // 3. Spawning Obstacles
      state.nextObstacleTime -= 1;
      if (state.nextObstacleTime <= 0) {
        spawnObstacle();
        // Randomize interval between obstacles
        state.nextObstacleTime = Math.random() * (150 - 70) + 70; 
      }

      // 4. Move Obstacles & Collision Check
      for (let i = state.obstacles.length - 1; i >= 0; i--) {
        const obstacle = state.obstacles[i];
        let currentLeft = parseFloat(obstacle.style.left);

        // Move left
        currentLeft -= state.gameSpeed;
        obstacle.style.left = `${currentLeft}px`;

        // Remove out-of-bounds obstacles
        if (currentLeft < -50) {
          obstacle.remove();
          state.obstacles.splice(i, 1);
          continue;
        }

        // Hitbox Collision Math
        // Dino Left: 100px, Width: 50px -> Right edge is 150px
        if (
          currentLeft > 100 && currentLeft < 145 && // X-axis overlap
          state.position < 45 // Y-axis overlap
        ) {
          state.isGameOver = true;
          setGameState('gameOver');
          onGameOver?.(currentScore);
          return;
        }
      }

      animationId = requestAnimationFrame(gameLoop);
    };

    const spawnObstacle = () => {
      if (state.isGameOver || !containerRef.current) return;
      const obstacle = document.createElement("div");
      obstacle.style.position = 'absolute';
      obstacle.style.bottom = '0';
      obstacle.style.width = '25px';
      obstacle.style.height = '50px';
      obstacle.style.left = "800px"; // Start at right wall
      
      // Cactus SVG Look
      obstacle.innerHTML = `
        <svg viewBox="0 0 25 50" style="width: 100%; height: 100%; filter: drop-shadow(0 0 8px #FF1744);">
          <path d="M8,0h8v50H8V0z M0,12h8v8H0V12z M16,16h8v8h-8V16z" fill="#FF1744" />
        </svg>
      `;
      
      containerRef.current.appendChild(obstacle);
      state.obstacles.push(obstacle);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        if (state.isGameOver) {
          restartGame();
        } else if (!state.isJumping) {
          state.isJumping = true;
          state.velocity = 10;
        }
      }
    };

    const handleTouchStart = () => {
      if (state.isGameOver) {
        restartGame();
      } else if (!state.isJumping) {
        state.isJumping = true;
        state.velocity = 10;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('touchstart', handleTouchStart);
    animationId = requestAnimationFrame(gameLoop);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('touchstart', handleTouchStart);
      cancelAnimationFrame(animationId);
      state.obstacles.forEach(obs => obs.remove());
    };
  }, [onGameOver]);

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-4xl">
      <div 
        ref={containerRef}
        className="relative w-full h-[320px] bg-[#0B0F19] border-b-4 border-[#FF1744] overflow-hidden rounded-xl cyan-border shadow-2xl"
      >
        {/* Score Board */}
        <div className="absolute top-6 right-8 text-3xl font-black text-[#00D4FF] italic drop-shadow-[0_0_10px_#00D4FF]">
          {String(score).padStart(5, '0')}
        </div>

        {/* Dino Avatar */}
        <div 
          ref={dinoRef}
          className="absolute left-[100px] bottom-0 w-[50px] h-[50px] z-20"
          style={{ bottom: '0px' }}
        >
          <svg viewBox="0 0 44 47" style="width: 100%; height: 100%; filter: drop-shadow(0 0 8px #00D4FF);">
            <path d="M22,0h18v4h4v12h-4v4h-6v4h6v4h4v4h-2v4h-4v4h-4v4h-2v-4h-4v-4h-4v-4h-2v-8h-4v4h-4v4h-4v-4H4v-4H0v-4h4v-4h4v-4h4v-4h4V4h4V0z" fill="#00D4FF" />
            <rect x="30" y="8" width="4" height="4" fill="#0B0F19" />
          </svg>
        </div>

        {/* Game Over Overlay */}
        {gameState === 'gameOver' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-md z-30">
            <h2 className="text-6xl font-black text-[#FF1744] mb-2 drop-shadow-[0_0_20px_#FF1744] tracking-widest italic">
              GAME OVER
            </h2>
            <button 
              onClick={restartGame}
              className="px-10 py-4 bg-[#00D4FF] text-[#0B0F19] font-black rounded-sm hover:scale-110 transition-transform uppercase tracking-widest shadow-[0_0_20px_rgba(0,212,255,0.4)]"
            >
              Retry
            </button>
          </div>
        )}

        {/* Ground Line Glow */}
        <div className="absolute bottom-0 w-full h-1 bg-gradient-to-r from-transparent via-[#FF1744] to-transparent opacity-60 blur-[2px]" />
      </div>

      <div className="text-center space-y-2">
        <p className="text-[#00D4FF] font-black uppercase tracking-widest text-sm">
          Press <span className="text-[#FF1744]">SPACE</span> to jump over the hazards
        </p>
        <p className="text-muted-foreground text-xs italic font-bold">LEGACY DINO LOGIC ENABLED</p>
      </div>
    </div>
  );
};
