import React, { useEffect, useRef, useState } from 'react';

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
    dino: { x: 50, y: 0, width: 40, height: 50, velocityY: 0, jumping: false },
    obstacles: [] as any[],
    clouds: [] as any[],
    gameSpeed: 6,
    frameCount: 0,
    dayNight: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const state = gameStateRef.current;
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // Draw functions
    const drawDino = () => {
      const { dino } = state;
      // Draw dino body (simplified sprite)
      ctx!.fillStyle = '#333';
      ctx!.fillRect(dino.x, dino.y, dino.width, dino.height);
      // Draw dino head
      ctx!.fillRect(dino.x + 25, dino.y - 15, 20, 20);
      // Draw dino eye
      ctx!.fillStyle = '#fff';
      ctx!.fillRect(dino.x + 30, dino.y - 10, 5, 5);
      // Draw dino legs
      ctx!.fillStyle = '#333';
      ctx!.fillRect(dino.x + 10, dino.y + dino.height, 8, 15);
      ctx!.fillRect(dino.x + 25, dino.y + dino.height, 8, 15);
    };

    const drawObstacle = (obstacle: any) => {
      if (obstacle.type === 'cactus') {
        ctx!.fillStyle = '#2d5016';
        ctx!.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        // Draw cactus spikes
        ctx!.fillStyle = '#3d6b1f';
        ctx!.fillRect(obstacle.x - 5, obstacle.y + 10, 5, 10);
        ctx!.fillRect(obstacle.x + obstacle.width, obstacle.y + 15, 5, 10);
      } else if (obstacle.type === 'bird') {
        ctx!.fillStyle = '#555';
        ctx!.beginPath();
        ctx!.moveTo(obstacle.x, obstacle.y);
        ctx!.lineTo(obstacle.x + 20, obstacle.y - 5);
        ctx!.lineTo(obstacle.x + 30, obstacle.y);
        ctx!.lineTo(obstacle.x + 20, obstacle.y + 5);
        ctx!.closePath();
        ctx!.fill();
      }
    };

    const drawClouds = () => {
      ctx!.fillStyle = `rgba(200, 200, 200, ${0.3 + state.dayNight * 0.1})`;
      state.clouds.forEach((cloud: any) => {
        ctx!.beginPath();
        ctx!.arc(cloud.x, cloud.y, 15, 0, Math.PI * 2);
        ctx!.arc(cloud.x + 20, cloud.y - 5, 20, 0, Math.PI * 2);
        ctx!.arc(cloud.x + 40, cloud.y, 15, 0, Math.PI * 2);
        ctx!.fill();
      });
    };

    const drawGround = () => {
      ctx!.strokeStyle = '#999';
      ctx!.lineWidth = 2;
      ctx!.beginPath();
      ctx!.moveTo(0, canvasHeight - 20);
      ctx!.lineTo(canvasWidth, canvasHeight - 20);
      ctx!.stroke();
    };

    const drawScore = () => {
      ctx!.fillStyle = '#333';
      ctx!.font = 'bold 20px Arial';
      ctx!.textAlign = 'right';
      ctx!.fillText(`Score: ${state.score}`, canvasWidth - 20, 30);
      ctx!.fillText(`Speed: ${(state.gameSpeed / 6).toFixed(1)}x`, canvasWidth - 20, 60);
    };

    const checkCollision = (rect1: any, rect2: any) => {
      return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
      );
    };

    const gameLoop = () => {
      if (!state.gameRunning) return;

      // Clear canvas
      const bgColor = state.dayNight > 0.5 ? '#87CEEB' : '#f0f0f0';
      ctx!.fillStyle = bgColor;
      ctx!.fillRect(0, 0, canvasWidth, canvasHeight);

      // Update dino
      const { dino } = state;
      dino.y = canvasHeight - 20 - dino.height;
      if (dino.jumping) {
        dino.velocityY += 0.6; // gravity
        dino.y -= dino.velocityY;
        if (dino.y >= canvasHeight - 20 - dino.height) {
          dino.y = canvasHeight - 20 - dino.height;
          dino.jumping = false;
          dino.velocityY = 0;
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
          onGameOver?.(state.score);
        }

        return obs.x > -50;
      });

      // Spawn obstacles
      if (state.frameCount % Math.max(60, 120 - state.gameSpeed * 5) === 0) {
        const type = Math.random() > 0.7 ? 'bird' : 'cactus';
        if (type === 'bird') {
          state.obstacles.push({
            x: canvasWidth,
            y: canvasHeight - 100,
            width: 30,
            height: 15,
            type: 'bird',
          });
        } else {
          state.obstacles.push({
            x: canvasWidth,
            y: canvasHeight - 20 - 40,
            width: 20,
            height: 40,
            type: 'cactus',
          });
        }
      }

      // Update clouds
      state.clouds = state.clouds.filter((cloud: any) => {
        cloud.x -= state.gameSpeed * 0.3;
        return cloud.x > -50;
      });

      if (state.frameCount % 200 === 0) {
        state.clouds.push({
          x: canvasWidth,
          y: Math.random() * 100 + 20,
        });
      }

      // Increase difficulty
      state.gameSpeed = Math.min(12, 6 + state.score / 500);
      state.score += 1;
      state.dayNight = (state.frameCount / 1000) % 1;
      state.frameCount++;

      setScore(state.score);
      drawScore();

      requestAnimationFrame(gameLoop);
    };

    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.code === 'Space' || e.code === 'ArrowUp') && !state.dino.jumping && state.gameRunning) {
        state.dino.jumping = true;
        state.dino.velocityY = 15;
      }
    };

    const handleTouchStart = () => {
      if (!state.dino.jumping && state.gameRunning) {
        state.dino.jumping = true;
        state.dino.velocityY = 15;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    canvas.addEventListener('touchstart', handleTouchStart);
    gameLoop();

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      canvas.removeEventListener('touchstart', handleTouchStart);
    };
  }, [onGameOver]);

  return (
    <div className="flex flex-col items-center gap-4">
      <canvas
        ref={canvasRef}
        width={800}
        height={400}
        className="border-2 border-primary rounded-lg bg-white cursor-pointer"
        style={{ maxWidth: '100%', height: 'auto' }}
      />
      <div className="text-center">
        <p className="text-sm text-muted-foreground">Press SPACE or tap to jump</p>
        {gameState === 'gameOver' && (
          <p className="text-lg font-bold text-destructive mt-2">Game Over! Final Score: {score}</p>
        )}
      </div>
    </div>
  );
};
