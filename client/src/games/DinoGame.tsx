import React, { useEffect, useRef, useState } from 'react';

interface DinoGameProps {
  onGameOver?: (score: number) => void;
  background?: string;
}

interface GameState {
  isJumping: boolean;
  gravity: number;
  position: number;
  velocity: number;
  isGameOver: boolean;
  score: number;
  gameSpeed: number;
  obstacles: HTMLDivElement[];
  nextObstacleTime: number;
  speedScale: number;
  dinoFrame: number;
  currentFrameTime: number;
  lastTime: number | null;
}

const JUMP_SPEED = 0.45;
const GRAVITY = 0.0015;
const DINO_FRAME_COUNT = 2;
const FRAME_TIME = 100;
const CACTUS_INTERVAL_MIN = 500;
const CACTUS_INTERVAL_MAX = 2000;
const SPEED_SCALE_INCREASE = 0.00005; // Increased for more noticeable speedup
const WORLD_WIDTH = 100;
const WORLD_HEIGHT = 30;

export const DinoGame: React.FC<DinoGameProps> = ({ onGameOver }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const dinoRef = useRef<HTMLImageElement>(null);
  const groundRefs = useRef<HTMLImageElement[]>([]);
  const cloudRefs = useRef<HTMLImageElement[]>([]);
  const [gameState, setGameState] = useState<'playing' | 'gameOver' | 'start'>('start');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const stateRef = useRef<GameState>({
    isJumping: false,
    gravity: GRAVITY,
    position: 0,
    velocity: 0,
    isGameOver: false,
    score: 0,
    gameSpeed: 5,
    obstacles: [],
    nextObstacleTime: CACTUS_INTERVAL_MIN,
    speedScale: 1,
    dinoFrame: 0,
    currentFrameTime: 0,
    lastTime: null,
  });

  // Audio references
  const jumpSoundRef = useRef<HTMLAudioElement | null>(null);
  const hitSoundRef = useRef<HTMLAudioElement | null>(null);

  const restartGame = () => {
    const state = stateRef.current;
    state.isGameOver = false;
    state.score = 0;
    state.speedScale = 1;
    state.position = 0;
    state.isJumping = false;
    state.velocity = 0;
    state.nextObstacleTime = CACTUS_INTERVAL_MIN;
    state.dinoFrame = 0;
    state.currentFrameTime = 0;
    state.lastTime = null;
    setScore(0);
    setGameState('playing');

    // Clear obstacles
    state.obstacles.forEach(obs => obs.remove());
    state.obstacles = [];

    if (dinoRef.current) {
      dinoRef.current.src = '/games/dino/images/dino-stationary.png';
      dinoRef.current.style.bottom = '0px';
    }

    // Reset ground and clouds
    groundRefs.current.forEach((ground, idx) => {
      if (ground) {
        ground.style.setProperty('--left', idx === 0 ? '0px' : '300px');
      }
    });

    cloudRefs.current.forEach((cloud, idx) => {
      if (cloud) {
        cloud.style.setProperty('--left', idx === 0 ? '0px' : '300px');
      }
    });
  };

  const handleStart = () => {
    restartGame();
  };

  useEffect(() => {
    const state = stateRef.current;
    let animationId: number;

    const setPixelToWorldScale = () => {
      if (!containerRef.current) return;
      let worldToPixelScale;
      if (window.innerWidth / window.innerHeight < WORLD_WIDTH / WORLD_HEIGHT) {
        worldToPixelScale = window.innerWidth / WORLD_WIDTH;
      } else {
        worldToPixelScale = window.innerHeight / WORLD_HEIGHT;
      }

      containerRef.current.style.width = `${WORLD_WIDTH * worldToPixelScale}px`;
      containerRef.current.style.height = `${WORLD_HEIGHT * worldToPixelScale}px`;
    };

    setPixelToWorldScale();
    window.addEventListener('resize', setPixelToWorldScale);

    const spawnObstacle = () => {
      if (state.isGameOver || !containerRef.current || gameState !== 'playing') return;
      const cactus = document.createElement('img');
      cactus.src = '/games/dino/images/cactus.png';
      cactus.style.position = 'absolute';
      cactus.style.bottom = '0';
      cactus.style.left = '100%';
      cactus.style.width = 'auto';
      cactus.style.height = '40px';
      cactus.className = 'dino-cactus';
      containerRef.current.appendChild(cactus);
      state.obstacles.push(cactus);
    };

    const updateGround = (delta: number) => {
      groundRefs.current.forEach((ground) => {
        if (!ground) return;
        const currentLeft = parseFloat(ground.style.getPropertyValue('--left') || '0');
        let newLeft = currentLeft + delta * state.speedScale * 0.05 * -1;
        if (newLeft <= -300) {
          newLeft += 600;
        }
        ground.style.setProperty('--left', `${newLeft}px`);
      });
    };

    const updateClouds = (delta: number) => {
      cloudRefs.current.forEach((cloud) => {
        if (!cloud) return;
        const currentLeft = parseFloat(cloud.style.getPropertyValue('--left') || '0');
        let newLeft = currentLeft + delta * state.speedScale * 0.05 * -1;
        if (newLeft <= -300) {
          newLeft += 600;
        }
        cloud.style.setProperty('--left', `${newLeft}px`);
      });
    };

    const handleRun = (delta: number) => {
      if (state.isJumping || !dinoRef.current) return;

      if (state.currentFrameTime >= FRAME_TIME) {
        state.dinoFrame = (state.dinoFrame + 1) % DINO_FRAME_COUNT;
        dinoRef.current.src = `/games/dino/images/dino-run-${state.dinoFrame}.png`;
        state.currentFrameTime -= FRAME_TIME;
      }
      state.currentFrameTime += delta * state.speedScale;
    };

    const handleJump = (delta: number) => {
      if (!state.isJumping || !dinoRef.current) return;

      state.position += state.velocity * delta;
      state.velocity -= state.gravity * delta;

      if (state.position <= 0) {
        state.position = 0;
        state.isJumping = false;
        state.velocity = 0;
      }

      dinoRef.current.style.bottom = `${state.position}px`;
    };

    const gameLoop = (time: number) => {
      if (state.lastTime === null) {
        state.lastTime = time;
        animationId = requestAnimationFrame(gameLoop);
        return;
      }

      const delta = time - state.lastTime;

      if (!state.isGameOver && gameState === 'playing') {
        updateClouds(delta);
        updateGround(delta);
        handleRun(delta);
        handleJump(delta);

        // Update speed scale
        state.speedScale += delta * SPEED_SCALE_INCREASE;

        // Update score
        state.score += delta * 0.01;
        const currentScore = Math.floor(state.score);
        setScore(currentScore);

        // Spawn obstacles
        state.nextObstacleTime -= delta;
        if (state.nextObstacleTime <= 0) {
          spawnObstacle();
          state.nextObstacleTime =
            (Math.random() * (CACTUS_INTERVAL_MAX - CACTUS_INTERVAL_MIN) +
              CACTUS_INTERVAL_MIN) /
            state.speedScale;
        }

        // Move obstacles and check collision
        for (let i = state.obstacles.length - 1; i >= 0; i--) {
          const obstacle = state.obstacles[i];
          // Use style.left for movement instead of custom property for simplicity in React/DOM interaction
          const currentLeft = parseFloat(obstacle.style.left) || 100;
          const newLeft = currentLeft - delta * state.speedScale * 0.08; // Adjusted speed multiplier
          obstacle.style.left = `${newLeft}%`;

          if (newLeft <= -20) {
            obstacle.remove();
            state.obstacles.splice(i, 1);
            continue;
          }

          // Collision detection
          if (dinoRef.current) {
            const dinoRect = dinoRef.current.getBoundingClientRect();
            const obstacleRect = obstacle.getBoundingClientRect();

            // Shrink hitboxes slightly for better feel
            const paddingX = dinoRect.width * 0.2;
            const paddingY = dinoRect.height * 0.2;

            if (
              obstacleRect.left + paddingX < dinoRect.right - paddingX &&
              obstacleRect.top + paddingY < dinoRect.bottom - paddingY &&
              obstacleRect.right - paddingX > dinoRect.left + paddingX &&
              obstacleRect.bottom - paddingY > dinoRect.top + paddingY
            ) {
              state.isGameOver = true;
              setGameState('gameOver');
              if (hitSoundRef.current) {
                hitSoundRef.current.play().catch(() => {});
              }
              if (currentScore > highScore) {
                setHighScore(currentScore);
              }
              onGameOver?.(currentScore);
              return;
            }
          }
        }
      }

      state.lastTime = time;
      animationId = requestAnimationFrame(gameLoop);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        if (gameState === 'start') {
          handleStart();
        } else if (gameState === 'gameOver') {
          handleStart();
        } else if (!state.isJumping && gameState === 'playing') {
          state.isJumping = true;
          state.velocity = JUMP_SPEED;
          if (jumpSoundRef.current) {
            jumpSoundRef.current.play().catch(() => {});
          }
        }
      }
    };

    const handleTouchStart = () => {
      if (gameState === 'start') {
        handleStart();
      } else if (gameState === 'gameOver') {
        handleStart();
      } else if (!state.isJumping && gameState === 'playing') {
        state.isJumping = true;
        state.velocity = JUMP_SPEED;
        if (jumpSoundRef.current) {
          jumpSoundRef.current.play().catch(() => {});
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('touchstart', handleTouchStart);
    animationId = requestAnimationFrame(gameLoop);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('resize', setPixelToWorldScale);
      cancelAnimationFrame(animationId);
      state.obstacles.forEach(obs => obs.remove());
    };
  }, [gameState, onGameOver, highScore]);

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-4xl">
      <audio ref={jumpSoundRef} src="/games/dino/audio/press_sound.mp3" />
      <audio ref={hitSoundRef} src="/games/dino/audio/hit_sound.mp3" />

      <div
        ref={containerRef}
        className="relative w-full overflow-hidden rounded-lg border-b-4 border-[#333]"
        style={{
          aspectRatio: '100 / 30',
          fontFamily: '"Press Start 2P", cursive',
          backgroundColor: background || '#F7F7F7',
        }}
      >
        {/* Score Display */}
        <div
          className="absolute top-4 right-6 text-[#333] font-bold"
          style={{
            fontSize: '12px',
            letterSpacing: '2px',
          }}
        >
          <div>
            <span style={{ marginRight: '20px' }}>
              HI <span style={{ marginLeft: '10px' }}>{String(highScore).padStart(5, '0')}</span>
            </span>
            <span>{String(score).padStart(5, '0')}</span>
          </div>
        </div>

        {/* Clouds */}
        <img
          ref={(el) => {
            if (el) cloudRefs.current[0] = el;
          }}
          src="/games/dino/images/clouds.png"
          className="absolute"
          style={{
            bottom: '70%',
            width: '300px',
            height: 'auto',
            opacity: 0.5,
            left: 'var(--left, 0px)',
          }}
          alt="clouds"
        />
        <img
          ref={(el) => {
            if (el) cloudRefs.current[1] = el;
          }}
          src="/games/dino/images/clouds.png"
          className="absolute"
          style={{
            bottom: '70%',
            width: '300px',
            height: 'auto',
            opacity: 0.5,
            left: 'var(--left, 300px)',
          }}
          alt="clouds"
        />

        {/* Ground */}
        <img
          ref={(el) => {
            if (el) groundRefs.current[0] = el;
          }}
          src="/games/dino/images/ground.png"
          className="absolute bottom-0"
          style={{
            width: '300px',
            height: 'auto',
            left: 'var(--left, 0px)',
          }}
          alt="ground"
        />
        <img
          ref={(el) => {
            if (el) groundRefs.current[1] = el;
          }}
          src="/games/dino/images/ground.png"
          className="absolute bottom-0"
          style={{
            width: '300px',
            height: 'auto',
            left: 'var(--left, 300px)',
          }}
          alt="ground"
        />

        {/* Dino */}
        <img
          ref={dinoRef}
          src="/games/dino/images/dino-stationary.png"
          className="absolute"
          style={{
            bottom: '0px',
            left: '10%',
            width: 'auto',
            height: '40px',
            zIndex: 10,
          }}
          alt="dino"
        />

        {/* Start Screen */}
        {gameState === 'start' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-20">
            <div
              style={{
                fontSize: '16px',
                color: '#333',
                textAlign: 'center',
                letterSpacing: '2px',
              }}
            >
              Press any key to Start
            </div>
          </div>
        )}

        {/* Game Over Screen */}
        {gameState === 'gameOver' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 z-20">
            <div
              style={{
                fontSize: '20px',
                color: '#FF1744',
                fontWeight: 'bold',
                marginBottom: '20px',
                letterSpacing: '2px',
              }}
            >
              GAME OVER
            </div>
            <div
              style={{
                fontSize: '12px',
                color: '#333',
                marginBottom: '10px',
                letterSpacing: '1px',
              }}
            >
              Score: {String(score).padStart(5, '0')}
            </div>
            <div
              style={{
                fontSize: '10px',
                color: '#666',
                letterSpacing: '1px',
              }}
            >
              Press any key to Restart
            </div>
          </div>
        )}
      </div>

      <div className="text-center space-y-2">
        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
          Press <span className="text-primary">SPACE</span> to jump
        </p>
        <p className="text-xs text-muted-foreground italic">Avoid the cactus to survive!</p>
      </div>
    </div>
  );
};
