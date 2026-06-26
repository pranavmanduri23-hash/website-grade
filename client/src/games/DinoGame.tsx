import React, { useEffect, useRef, useState } from 'react';

// Dino Game - Enhanced Chrome Dino mechanics

interface DinoGameProps {
  onGameOver?: (score: number) => void;
}

export const DinoGame: React.FC<DinoGameProps> = ({ onGameOver }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'playing' | 'gameOver'>('playing');
  const [score, setScore] = useState(0);
  const gameStateRef = useRef({
    score: 0,
    gameRunning: true,
    dino: { 
      x: 50, 
      y: 0, 
      width: 44, 
      height: 47, 
      velocityY: 0, 
      jumping: false,
      ducking: false,
      duckHeight: 25
    },
    obstacles: [] as any[],
    clouds: [] as any[],
    gameSpeed: 6,
    frameCount: 0,
    dayNight: 0,
    highSpeed: false,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const state = gameStateRef.current;
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const groundY = canvasHeight - 20;

    // Draw functions
    const drawDino = () => {
      const { dino } = state;
      ctx!.save();
      ctx!.fillStyle = '#0B0F19';
      
      if (dino.ducking) {
        // Draw ducking dino
        ctx!.fillRect(dino.x, groundY - dino.duckHeight, dino.width, dino.duckHeight);
        // Head
        ctx!.fillRect(dino.x + 30, groundY - dino.duckHeight - 8, 12, 12);
        // Eye
        ctx!.fillStyle = '#FFFFFF';
        ctx!.fillRect(dino.x + 35, groundY - dino.duckHeight - 5, 3, 3);
      } else {
        // Draw standing dino
        ctx!.fillRect(dino.x, dino.y, dino.width, dino.height);
        // Head
        ctx!.fillRect(dino.x + 30, dino.y - 12, 14, 14);
        // Eye
        ctx!.fillStyle = '#FFFFFF';
        ctx!.fillRect(dino.x + 36, dino.y - 8, 4, 4);
        // Legs
        ctx!.fillStyle = '#0B0F19';
        ctx!.fillRect(dino.x + 12, dino.y + dino.height, 6, 12);
        ctx!.fillRect(dino.x + 28, dino.y + dino.height, 6, 12);
      }
      ctx!.restore();
    };

    const drawObstacle = (obstacle: any) => {
      ctx!.fillStyle = '#0B0F19';
      if (obstacle.type === 'cactus-small') {
        // Small cactus
        ctx!.fillRect(obstacle.x, obstacle.y, 10, 35);
        ctx!.fillRect(obstacle.x - 5, obstacle.y + 8, 5, 8);
        ctx!.fillRect(obstacle.x + 10, obstacle.y + 15, 5, 8);
      } else if (obstacle.type === 'cactus-large') {
        // Large cactus
        ctx!.fillRect(obstacle.x, obstacle.y, 12, 50);
        ctx!.fillRect(obstacle.x - 6, obstacle.y + 10, 6, 10);
        ctx!.fillRect(obstacle.x + 12, obstacle.y + 20, 6, 10);
        ctx!.fillRect(obstacle.x - 6, obstacle.y + 30, 6, 10);
      } else if (obstacle.type === 'bird') {
        // Flying bird
        ctx!.save();
        ctx!.translate(obstacle.x + 15, obstacle.y);
        // Body
        ctx!.fillRect(-8, -5, 16, 10);
        // Head
        ctx!.fillRect(6, -6, 6, 6);
        // Wing animation
        const wingFlap = Math.sin(state.frameCount * 0.1) * 3;
        ctx!.fillRect(-12, -2 + wingFlap, 6, 4);
        ctx!.fillRect(8, -2 + wingFlap, 6, 4);
        ctx!.restore();
      }
    };

    const drawClouds = () => {
      ctx!.fillStyle = `rgba(200, 200, 200, ${0.2 + state.dayNight * 0.1})`;
      state.clouds.forEach((cloud: any) => {
        ctx!.beginPath();
        ctx!.arc(cloud.x, cloud.y, 12, 0, Math.PI * 2);
        ctx!.arc(cloud.x + 18, cloud.y - 4, 16, 0, Math.PI * 2);
        ctx!.arc(cloud.x + 36, cloud.y, 12, 0, Math.PI * 2);
        ctx!.fill();
      });
    };

    const drawGround = () => {
      ctx!.strokeStyle = '#0B0F19';
      ctx!.lineWidth = 2;
      ctx!.beginPath();
      ctx!.moveTo(0, groundY);
      ctx!.lineTo(canvasWidth, groundY);
      ctx!.stroke();

      // Dashes for ground pattern
      ctx!.strokeStyle = '#0B0F19';
      ctx!.lineWidth = 1;
      for (let i = 0; i < canvasWidth; i += 30) {
        ctx!.beginPath();
        ctx!.moveTo(i - (state.frameCount * state.gameSpeed) % 30, groundY + 5);
        ctx!.lineTo(i - (state.frameCount * state.gameSpeed) % 30 + 15, groundY + 5);
        ctx!.stroke();
      }
    };

    const drawScore = () => {
      ctx!.fillStyle = '#0B0F19';
      ctx!.font = 'bold 20px Arial';
      ctx!.textAlign = 'right';
      ctx!.fillText(`HI ${Math.floor(state.score / 10)}`, canvasWidth - 20, 30);
      ctx!.fillText(`${Math.floor(state.score / 10)}`, canvasWidth - 20, 60);
      
      // Speed indicator
      if (state.highSpeed) {
        ctx!.fillStyle = '#FF0000';
        ctx!.font = 'bold 16px Arial';
        ctx!.fillText('HIGH SPEED!', canvasWidth - 20, 90);
      }
    };

    const checkCollision = (rect1: any, rect2: any) => {
      const r1 = {
        x: rect1.x,
        y: rect1.ducking ? groundY - rect1.duckHeight : rect1.y,
        width: rect1.width,
        height: rect1.ducking ? rect1.duckHeight : rect1.height
      };
      return (
        r1.x < rect2.x + rect2.width &&
        r1.x + r1.width > rect2.x &&
        r1.y < rect2.y + rect2.height &&
        r1.y + r1.height > rect2.y
      );
    };

    const gameLoop = () => {
      if (!state.gameRunning) return;

      // Clear canvas with dark blue background
      const bgColor = state.dayNight > 0.5 ? '#87CEEB' : '#F7F7F7';
      ctx!.fillStyle = bgColor;
      ctx!.fillRect(0, 0, canvasWidth, canvasHeight);

      // Update dino
      const { dino } = state;
      if (!dino.ducking) {
        dino.y = groundY - dino.height;
        if (dino.jumping) {
          dino.velocityY += 0.6; // gravity
          dino.y -= dino.velocityY;
          if (dino.y >= groundY - dino.height) {
            dino.y = groundY - dino.height;
            dino.jumping = false;
            dino.velocityY = 0;
          }
        }
      }

      // Draw elements
      drawClouds();
      drawGround();
      drawDino();

      // Update and draw obstacles
      state.obstacles = state.obstacles.filter((obs: any) => {
        obs.x -= state.gameSpeed;
        drawObstacle(obs);

        // Check collision
        if (checkCollision(dino, obs)) {
          state.gameRunning = false;
          setGameState('gameOver');
          onGameOver?.(Math.floor(state.score / 10));
        }

        return obs.x > -50;
      });

      // Spawn obstacles with increasing difficulty
      const spawnRate = Math.max(40, 120 - state.gameSpeed * 8);
      if (state.frameCount % spawnRate === 0) {
        const rand = Math.random();
        if (rand > 0.8) {
          // Flying bird
          state.obstacles.push({
            x: canvasWidth,
            y: groundY - 50,
            width: 30,
            height: 15,
            type: 'bird',
          });
        } else if (rand > 0.4) {
          // Large cactus
          state.obstacles.push({
            x: canvasWidth,
            y: groundY - 50,
            width: 12,
            height: 50,
            type: 'cactus-large',
          });
        } else {
          // Small cactus
          state.obstacles.push({
            x: canvasWidth,
            y: groundY - 35,
            width: 10,
            height: 35,
            type: 'cactus-small',
          });
        }
      }

      // Update clouds
      state.clouds = state.clouds.filter((cloud: any) => {
        cloud.x -= state.gameSpeed * 0.2;
        return cloud.x > -50;
      });

      if (state.frameCount % 250 === 0) {
        state.clouds.push({
          x: canvasWidth,
          y: Math.random() * 80 + 20,
        });
      }

      // Increase difficulty
      state.gameSpeed = Math.min(15, 6 + state.score / 600);
      state.highSpeed = state.gameSpeed > 12;
      state.score += 1;
      state.dayNight = (state.frameCount / 1200) % 1;
      state.frameCount++;

      setScore(Math.floor(state.score / 10));
      drawScore();

      requestAnimationFrame(gameLoop);
    };

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        if (!state.dino.jumping && !state.dino.ducking && state.gameRunning) {
          state.dino.jumping = true;
          state.dino.velocityY = 16;
        }
      } else if (e.code === 'ArrowDown') {
        e.preventDefault();
        if (!state.dino.jumping && state.gameRunning) {
          state.dino.ducking = true;
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowDown') {
        state.dino.ducking = false;
      }
    };

    const handleTouchStart = () => {
      if (!state.dino.jumping && !state.dino.ducking && state.gameRunning) {
        state.dino.jumping = true;
        state.dino.velocityY = 16;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    window.addEventListener('keyup', handleKeyUp);
    canvas.addEventListener('touchstart', handleTouchStart);
    gameLoop();

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      window.removeEventListener('keyup', handleKeyUp);
      canvas.removeEventListener('touchstart', handleTouchStart);
    };
  }, [onGameOver]);

  return (
    <div className="flex flex-col items-center gap-4">
      <canvas
        ref={canvasRef}
        width={800}
        height={400}
        className="border-2 rounded-lg bg-white cursor-pointer neon-border"
        style={{ maxWidth: '100%', height: 'auto' }}
      />
      <div className="text-center">
        <p className="text-sm text-muted-foreground">Press SPACE to jump, DOWN to duck</p>
        {gameState === 'gameOver' && (
          <p className="text-lg font-bold text-secondary mt-2">Game Over! Final Score: {score}</p>
        )}
      </div>
    </div>
  );
};
