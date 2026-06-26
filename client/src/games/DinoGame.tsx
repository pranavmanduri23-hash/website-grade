import React, { useEffect, useRef, useState } from 'react';

interface DinoGameProps {
  onGameOver?: (score: number) => void;
}

export const DinoGame: React.FC<DinoGameProps> = ({ onGameOver }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [gameState, setGameState] = useState<'playing' | 'gameOver'>('playing');
  const [score, setScore] = useState(0);
  
  const stateRef = useRef({
    isJumping: false,
    gravity: 0.8, // Stronger gravity for less "floaty" feel
    position: 0,
    velocity: 0,
    isGameOver: false,
    score: 0,
    gameSpeed: 6,
    obstacles: [] as HTMLDivElement[],
    dinoElement: null as HTMLDivElement | null,
  });

  const restartGame = () => {
    const state = stateRef.current;
    state.isGameOver = false;
    state.score = 0;
    state.gameSpeed = 6;
    state.position = 0;
    state.isJumping = false;
    setScore(0);
    setGameState('playing');
    
    // Clear obstacles
    state.obstacles.forEach(obs => obs.remove());
    state.obstacles = [];
    
    if (state.dinoElement) {
      state.dinoElement.style.bottom = '0px';
    }
  };

  useEffect(() => {
    const state = stateRef.current;
    let obstacleTimeout: NodeJS.Timeout;

    // Create the Dino Avatar (SVG based for actual Dino look)
    if (containerRef.current && !state.dinoElement) {
      const dino = document.createElement("div");
      dino.style.position = 'absolute';
      dino.style.left = '100px';
      dino.style.bottom = '0px';
      dino.style.width = '50px';
      dino.style.height = '50px';
      dino.style.zIndex = '20';
      
      // Dino SVG for actual avatar look
      dino.innerHTML = `
        <svg viewBox="0 0 100 100" style="width: 100%; height: 100%; filter: drop-shadow(0 0 8px #00D4FF);">
          <path d="M70,20 L85,20 L85,45 L70,45 L70,35 L60,35 L60,25 L70,25 Z" fill="#00D4FF" />
          <path d="M20,45 L75,45 L75,75 L20,75 L20,45 Z" fill="#00D4FF" />
          <path d="M10,55 L20,55 L20,70 L10,70 Z" fill="#00D4FF" />
          <path d="M25,75 L35,75 L35,85 L25,85 Z" fill="#00D4FF" />
          <path d="M55,75 L65,75 L65,85 L55,85 Z" fill="#00D4FF" />
          <rect x="75" y="25" width="5" height="5" fill="#0B0F19" />
        </svg>
      `;
      
      containerRef.current.appendChild(dino);
      state.dinoElement = dino;
    }

    const jump = () => {
      if (state.isJumping || state.isGameOver) return;
      state.isJumping = true;
      state.velocity = 14; // Snappy jump force
      
      const internalJump = () => {
        if (state.isGameOver) return;

        state.velocity -= state.gravity;
        state.position += state.velocity;
        
        if (state.position <= 0) {
          state.position = 0;
          state.isJumping = false;
          state.velocity = 0;
          if (state.dinoElement) state.dinoElement.style.bottom = '0px';
          return;
        }
        
        if (state.dinoElement) {
          state.dinoElement.style.bottom = `${state.position}px`;
        }
        requestAnimationFrame(internalJump);
      };
      requestAnimationFrame(internalJump);
    };

    const createCactus = () => {
      if (state.isGameOver || !containerRef.current) return;

      const cactus = document.createElement("div");
      cactus.style.position = 'absolute';
      cactus.style.bottom = '0';
      cactus.style.width = '25px';
      cactus.style.backgroundColor = '#FF1744'; // Red Hazards
      cactus.style.boxShadow = '0 0 12px #FF1744';
      cactus.style.borderRadius = '4px 4px 0 0';
      
      const height = Math.floor(Math.random() * 25) + 35; 
      cactus.style.height = `${height}px`;
      
      let cactusPosition = 850; 
      cactus.style.left = `${cactusPosition}px`;
      containerRef.current.appendChild(cactus);
      state.obstacles.push(cactus);

      const moveCactus = () => {
        if (state.isGameOver) return;

        cactusPosition -= state.gameSpeed;
        cactus.style.left = `${cactusPosition}px`;

        // Accurate Collision Detection
        if (state.dinoElement) {
          const dinoRect = state.dinoElement.getBoundingClientRect();
          const cactusRect = cactus.getBoundingClientRect();

          // Shrink hitboxes slightly for fairer gameplay
          if (
            dinoRect.right > cactusRect.left + 8 &&
            dinoRect.left < cactusRect.right - 8 &&
            dinoRect.bottom > cactusRect.top + 5
          ) {
            state.isGameOver = true;
            setGameState('gameOver');
            onGameOver?.(state.score);
            return;
          }
        }

        if (cactusPosition < -50) {
          cactus.remove();
          state.obstacles = state.obstacles.filter(obs => obs !== cactus);
          state.score += 10;
          setScore(state.score);
          state.gameSpeed += 0.12;
        } else {
          requestAnimationFrame(moveCactus);
        }
      };
      requestAnimationFrame(moveCactus);

      const randomTime = Math.floor(Math.random() * 1000) + 700 - (state.gameSpeed * 12);
      obstacleTimeout = setTimeout(createCactus, Math.max(450, randomTime));
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        if (state.isGameOver) {
          restartGame();
        } else {
          jump();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    createCactus();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(obstacleTimeout);
      state.obstacles.forEach(obs => obs.remove());
      if (state.dinoElement) {
        state.dinoElement.remove();
        state.dinoElement = null;
      }
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
          SCORE: {score}
        </div>

        {/* Game Over Overlay */}
        {gameState === 'gameOver' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-md z-30">
            <h2 className="text-6xl font-black text-[#FF1744] mb-2 drop-shadow-[0_0_20px_#FF1744] tracking-tighter italic">
              EXTINCT!
            </h2>
            <p className="text-[#00D4FF] text-2xl font-bold mb-8">FINAL SCORE: {score}</p>
            <button 
              onClick={restartGame}
              className="px-10 py-4 bg-[#FF1744] text-white font-black rounded-sm hover:scale-110 transition-transform uppercase tracking-widest neon-border shadow-[0_0_20px_rgba(255,23,68,0.4)]"
            >
              Restart
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
        <p className="text-muted-foreground text-xs italic">Physics-based jumping enabled. Beware of the speed ramp!</p>
      </div>
    </div>
  );
};
