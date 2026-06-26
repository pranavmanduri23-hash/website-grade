import React, { useEffect, useRef, useState } from 'react';

interface GeometryDashProps {
  onGameOver?: (score: number) => void;
}

export const GeometryDash: React.FC<GeometryDashProps> = ({ onGameOver }) => {
  const windowRef = useRef<HTMLDivElement>(null);
  const cubeRef = useRef<HTMLDivElement>(null);
  const [attempt, setAttempt] = useState(1);
  const [progress, setProgress] = useState(0);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'crashed' | 'victory'>('start');

  const stateRef = useRef({
    cubeY: 40,
    velocityY: 0,
    rotation: 0,
    isGrounded: true,
    isHoldingJump: false,
    isPlaying: false,
    distanceTraveled: 0,
    obstacles: [] as { element: HTMLDivElement; data: any }[],
    GRAVITY: 0.55,
    JUMP_FORCE: 9.5,
    FLOOR_Y: 40,
    BASE_SPEED: 6,
    LEVEL_LENGTH: 3600,
    levelMap: [
      { x: 600, type: 'spike' },
      { x: 900, type: 'spike' },
      { x: 1200, type: 'block', w: 60, h: 30, y: 40 },
      { x: 1215, type: 'spike', y: 70 },
      { x: 1500, type: 'spike' },
      { x: 1535, type: 'spike' },
      { x: 1900, type: 'block', w: 90, h: 30, y: 40 },
      { x: 2050, type: 'block', w: 90, h: 60, y: 40 },
      { x: 2300, type: 'spike' },
      { x: 2500, type: 'spike' },
      { x: 2535, type: 'spike' },
      { x: 2570, type: 'spike' },
      { x: 2900, type: 'block', w: 120, h: 20, y: 80 },
      { x: 2940, type: 'spike', y: 100 },
      { x: 3300, type: 'spike' },
    ]
  });

  const startGame = () => {
    const state = stateRef.current;
    state.isPlaying = true;
    state.distanceTraveled = 0;
    state.cubeY = state.FLOOR_Y;
    state.velocityY = 0;
    state.rotation = 0;
    setGameState('playing');
    setProgress(0);

    // Clear old elements
    state.obstacles.forEach(obj => obj.element.remove());
    state.obstacles = [];

    // Build level elements
    if (windowRef.current) {
      state.levelMap.forEach(data => {
        const el = document.createElement("div");
        el.style.position = 'absolute';
        el.style.left = '0px';
        
        if (data.type === 'spike') {
          el.style.bottom = `${data.y || state.FLOOR_Y}px`;
          el.style.width = '0';
          el.style.height = '0';
          el.style.borderLeft = '15px solid transparent';
          el.style.borderRight = '15px solid transparent';
          el.style.borderBottom = '30px solid #FF1744'; // Red Spikes
          el.style.filter = 'drop-shadow(0 0 8px #FF1744)';
        } else if (data.type === 'block') {
          el.style.backgroundColor = '#00D4FF'; // Cyan Blocks
          el.style.border = '2px solid #fff';
          el.style.boxSizing = 'border-box';
          el.style.boxShadow = '0 0 10px #00D4FF';
          el.style.width = `${data.w}px`;
          el.style.height = `${data.h}px`;
          el.style.bottom = `${data.y}px`;
        }
        
        windowRef.current?.appendChild(el);
        state.obstacles.push({ element: el, data: data });
      });
    }
  };

  useEffect(() => {
    const state = stateRef.current;
    let animationId: number;

    const update = () => {
      if (!state.isPlaying) return;

      state.distanceTraveled += state.BASE_SPEED;
      const currentProgress = Math.min(Math.floor((state.distanceTraveled / state.LEVEL_LENGTH) * 100), 100);
      setProgress(currentProgress);

      if (currentProgress >= 100) {
        state.isPlaying = false;
        setGameState('victory');
        return;
      }

      if (state.isGrounded && state.isHoldingJump) {
        state.velocityY = state.JUMP_FORCE;
        state.isGrounded = false;
      }

      state.velocityY -= state.GRAVITY;
      state.cubeY += state.velocityY;

      let currentFloor = state.FLOOR_Y;
      let hitAWall = false;
      const cubeRect = { left: 150, right: 180, bottom: state.cubeY, top: state.cubeY + 30 };

      state.obstacles.forEach(obj => {
        const elementX = obj.data.x - state.distanceTraveled + 150;
        obj.element.style.left = `${elementX}px`;

        const obsLeft = elementX;
        const obsRight = elementX + (obj.data.w || 30);
        const obsBottom = obj.data.y || state.FLOOR_Y;
        const obsTop = obsBottom + (obj.data.h || 30);

        if (cubeRect.right > obsLeft + 2 && cubeRect.left < obsRight - 2) {
          if (obj.data.type === 'spike') {
            if (cubeRect.bottom < obsTop - 5 && cubeRect.top > obsBottom + 5) {
              hitAWall = true;
            }
          } else if (obj.data.type === 'block') {
            if (cubeRect.bottom >= obsTop - 10 && state.velocityY <= 0) {
              currentFloor = obsTop;
            } else if (cubeRect.bottom < obsTop - 5 && cubeRect.top > obsBottom + 5) {
              hitAWall = true;
            }
          }
        }
      });

      if (hitAWall) {
        state.isPlaying = false;
        setGameState('crashed');
        setAttempt(prev => prev + 1);
        onGameOver?.(currentProgress);
        return;
      }

      if (state.cubeY <= currentFloor) {
        state.cubeY = currentFloor;
        state.velocityY = 0;
        state.isGrounded = true;
        state.rotation = Math.round(state.rotation / 90) * 90;
      } else {
        state.isGrounded = false;
        state.rotation += 8;
      }

      if (cubeRef.current) {
        cubeRef.current.style.bottom = `${state.cubeY}px`;
        cubeRef.current.style.transform = `rotate(${state.rotation}deg)`;
      }

      animationId = requestAnimationFrame(update);
    };

    if (gameState === 'playing') {
      animationId = requestAnimationFrame(update);
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        state.isHoldingJump = true;
        if (gameState !== 'playing') startGame();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        state.isHoldingJump = false;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      cancelAnimationFrame(animationId);
    };
  }, [gameState, onGameOver]);

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-4xl">
      <div 
        ref={windowRef}
        className="relative w-full h-[350px] bg-[#0B0F19] border-4 border-[#333] rounded-xl overflow-hidden shadow-2xl cyan-border"
        onMouseDown={() => {
          stateRef.current.isHoldingJump = true;
          if (gameState !== 'playing') startGame();
        }}
        onMouseUp={() => stateRef.current.isHoldingJump = false}
      >
        {/* UI Layer */}
        <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-10">
          <div className="text-xl font-black text-[#FF1744] italic tracking-tighter drop-shadow-[0_0_8px_#FF1744]">
            ATTEMPT {attempt}
          </div>
          <div className="text-xl font-black text-[#00D4FF] italic tracking-tighter drop-shadow-[0_0_8px_#00D4FF]">
            PROGRESS: {progress}%
          </div>
        </div>

        {/* Floor - RED LINE AS REQUESTED */}
        <div className="absolute bottom-0 w-full h-[40px] bg-[#FF1744] shadow-[0_-4px_15px_rgba(255,23,68,0.6)]" />

        {/* Cube */}
        <div 
          ref={cubeRef}
          className="absolute left-[150px] w-[30px] h-[30px] bg-[#00D4FF] border-2 border-white rounded-sm shadow-[0_0_15px_#00D4FF] z-20"
          style={{ bottom: '40px' }}
        />

        {/* Screen Messages */}
        {gameState === 'start' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px] z-30">
            <h2 className="text-4xl font-black text-white mb-2 tracking-widest animate-pulse">GEOMETRY DASH</h2>
            <p className="text-[#00D4FF] font-bold">CLICK OR SPACE TO START</p>
          </div>
        )}

        {gameState === 'crashed' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-30">
            <h2 className="text-6xl font-black text-[#FF1744] mb-2 drop-shadow-[0_0_15px_#FF1744]">CRASHED!</h2>
            <button 
              onClick={startGame}
              className="px-8 py-3 bg-[#00D4FF] text-[#0B0F19] font-black rounded-sm hover:scale-110 transition-transform uppercase"
            >
              Retry (Space)
            </button>
          </div>
        )}

        {gameState === 'victory' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md z-30">
            <h2 className="text-6xl font-black text-[#00ffcc] mb-2 drop-shadow-[0_0_15px_#00ffcc]">LEVEL COMPLETE!</h2>
            <button 
              onClick={startGame}
              className="px-8 py-3 bg-[#00ffcc] text-[#0B0F19] font-black rounded-sm hover:scale-110 transition-transform uppercase"
            >
              Run it back
            </button>
          </div>
        )}
      </div>
      <p className="text-muted-foreground text-sm uppercase tracking-widest font-bold">
        Hold <span className="text-[#00D4FF]">Space</span> to continuous jump over <span className="text-[#FF1744]">Red Hazards</span>
      </p>
    </div>
  );
};
