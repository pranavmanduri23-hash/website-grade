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
    frameCount: 0,
  });

  const restartGame = () => {
    stateRef.current.isGameOver = false;
    stateRef.current.score = 0;
    stateRef.current.gameSpeed = 5;
    stateRef.current.position = 0;
    stateRef.current.isJumping = false;
    setScore(0);
    setGameState('playing');
    
    // Clear obstacles
    stateRef.current.obstacles.forEach(obs => obs.remove());
    stateRef.current.obstacles = [];
    
    if (dinoRef.current) {
      dinoRef.current.style.bottom = '0px';
    }
  };

  useEffect(() => {
    const state = stateRef.current;
    let obstacleTimeout: NodeJS.Timeout;

    const jump = () => {
      if (state.isJumping || state.isGameOver) return;
      state.isJumping = true;
      state.velocity = 12; // Adjusted jump force for better feel
      
      const internalJump = () => {
        if (state.isGameOver) return;

        state.velocity -= state.gravity;
        state.position += state.velocity;
        
        if (state.position <= 0) {
          state.position = 0;
          state.isJumping = false;
          state.velocity = 0;
          if (dinoRef.current) dinoRef.current.style.bottom = '0px';
          return;
        }
        
        if (dinoRef.current) {
          dinoRef.current.style.bottom = `${state.position}px`;
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
      cactus.style.width = '20px';
      cactus.style.backgroundColor = '#FF1744'; // Red accent
      cactus.style.boxShadow = '0 0 10px #FF1744';
      
      const height = Math.floor(Math.random() * 30) + 30; 
      cactus.style.height = `${height}px`;
      
      let cactusPosition = 800; 
      cactus.style.left = `${cactusPosition}px`;
      containerRef.current.appendChild(cactus);
      state.obstacles.push(cactus);

      const moveCactus = () => {
        if (state.isGameOver) return;

        cactusPosition -= state.gameSpeed;
        cactus.style.left = `${cactusPosition}px`;

        // Collision Detection
        if (dinoRef.current) {
          const dinoRect = dinoRef.current.getBoundingClientRect();
          const cactusRect = cactus.getBoundingClientRect();

          if (
            dinoRect.right > cactusRect.left + 5 &&
            dinoRect.left < cactusRect.right - 5 &&
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
          state.gameSpeed += 0.15;
        } else {
          requestAnimationFrame(moveCactus);
        }
      };
      requestAnimationFrame(moveCactus);

      const randomTime = Math.floor(Math.random() * 1000) + 800 - (state.gameSpeed * 10);
      obstacleTimeout = setTimeout(createCactus, Math.max(500, randomTime));
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
    };
  }, [onGameOver]);

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-4xl">
      <div 
        ref={containerRef}
        className="relative w-full h-[300px] bg-[#0B0F19] border-b-4 border-[#FF1744] overflow-hidden rounded-t-xl cyan-border"
        style={{ background: 'rgba(13, 17, 23, 0.8)' }}
      >
        {/* Score Board */}
        <div className="absolute top-4 right-6 text-2xl font-bold text-[#00D4FF] drop-shadow-[0_0_8px_#00D4FF]">
          Score: {score}
        </div>

        {/* Dino */}
        <div 
          ref={dinoRef}
          className="absolute left-[100px] bottom-0 w-12 h-14 bg-[#00D4FF] rounded-t-md"
          style={{ 
            boxShadow: '0 0 15px #00D4FF',
            transition: 'bottom 0.05s linear'
          }}
        >
          {/* Dino Eye */}
          <div className="absolute top-2 right-2 w-2 h-2 bg-[#0B0F19] rounded-full" />
        </div>

        {/* Game Over Overlay */}
        {gameState === 'gameOver' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-10">
            <h2 className="text-5xl font-black text-[#FF1744] mb-4 drop-shadow-[0_0_15px_#FF1744] animate-bounce">
              GAME OVER
            </h2>
            <p className="text-[#00D4FF] text-xl font-bold mb-6">Final Score: {score}</p>
            <button 
              onClick={restartGame}
              className="px-8 py-3 bg-[#FF1744] text-white font-bold rounded-full hover:scale-110 transition-transform neon-border"
            >
              RESTART (SPACE)
            </button>
          </div>
        )}

        {/* Ground Pattern */}
        <div className="absolute bottom-0 w-full h-1 bg-gradient-to-r from-transparent via-[#FF1744] to-transparent opacity-50" />
      </div>

      <div className="text-center space-y-2">
        <p className="text-[#00D4FF] font-medium">Press <span className="text-[#FF1744] font-bold">SPACE</span> to jump and avoid the red obstacles!</p>
        <p className="text-muted-foreground text-sm italic">The faster you go, the more points you earn.</p>
      </div>
    </div>
  );
};
