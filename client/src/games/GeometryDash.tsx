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
      x: 50,
      y: 0,
      size: 30,
      velocityY: 0,
      jumping: false,
      rotation: 0,
      rotationVelocity: 0,
    },
    obstacles: [] as any[],
    gameSpeed: 5,
    frameCount: 0,
    platforms: [] as any[],
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const state = gameStateRef.current;
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const groundY = canvasHeight - 50;

    // Draw player cube with rotation
    const drawPlayer = () => {
      const { player } = state;
      ctx!.save();
      ctx!.translate(player.x + player.size / 2, player.y + player.size / 2);
      ctx!.rotate(player.rotation);

      // Draw cube
      ctx!.fillStyle = '#FF6B6B';
      ctx!.fillRect(-player.size / 2, -player.size / 2, player.size, player.size);

      // Draw outline
      ctx!.strokeStyle = '#FF0000';
      ctx!.lineWidth = 2;
      ctx!.strokeRect(-player.size / 2, -player.size / 2, player.size, player.size);

      // Draw inner pattern
      ctx!.strokeStyle = '#FFB3B3';
      ctx!.lineWidth = 1;
      ctx!.beginPath();
      ctx!.moveTo(-player.size / 2 + 5, -player.size / 2);
      ctx!.lineTo(-player.size / 2 + 5, player.size / 2);
      ctx!.moveTo(-player.size / 2, -player.size / 2 + 5);
      ctx!.lineTo(player.size / 2, -player.size / 2 + 5);
      ctx!.stroke();

      ctx!.restore();
    };

    const drawObstacle = (obstacle: any) => {
      if (obstacle.type === 'spike') {
        ctx!.fillStyle = '#333';
        ctx!.beginPath();
        ctx!.moveTo(obstacle.x, obstacle.y);
        ctx!.lineTo(obstacle.x + obstacle.width / 2, obstacle.y - obstacle.height);
        ctx!.lineTo(obstacle.x + obstacle.width, obstacle.y);
        ctx!.closePath();
        ctx!.fill();
      } else if (obstacle.type === 'block') {
        ctx!.fillStyle = '#4A4A4A';
        ctx!.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        ctx!.strokeStyle = '#666';
        ctx!.lineWidth = 2;
        ctx!.strokeRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
      }
    };

    const drawBackground = () => {
      // Parallax background
      const offset = (state.frameCount * state.gameSpeed) % 100;
      ctx!.fillStyle = '#2c3e50';
      ctx!.fillRect(0, 0, canvasWidth, canvasHeight);

      // Grid pattern
      ctx!.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx!.lineWidth = 1;
      for (let i = 0; i < canvasWidth; i += 50) {
        ctx!.beginPath();
        ctx!.moveTo(i - offset, 0);
        ctx!.lineTo(i - offset, canvasHeight);
        ctx!.stroke();
      }

      // Ground
      ctx!.fillStyle = '#34495e';
      ctx!.fillRect(0, groundY, canvasWidth, canvasHeight - groundY);
      ctx!.strokeStyle = '#FF6B6B';
      ctx!.lineWidth = 3;
      ctx!.beginPath();
      ctx!.moveTo(0, groundY);
      ctx!.lineTo(canvasWidth, groundY);
      ctx!.stroke();
    };

    const drawScore = () => {
      ctx!.fillStyle = '#fff';
      ctx!.font = 'bold 24px Arial';
      ctx!.textAlign = 'left';
      ctx!.fillText(`Score: ${state.score}`, 20, 40);
      ctx!.font = '16px Arial';
      ctx!.fillText(`Speed: ${(state.gameSpeed / 5).toFixed(1)}x`, 20, 65);
    };

    const checkCollision = (rect1: any, rect2: any) => {
      return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.size > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.size > rect2.y
      );
    };

    const gameLoop = () => {
      if (!state.gameRunning) return;

      drawBackground();

      const { player } = state;

      // Update player
      player.velocityY += 0.6; // gravity
      player.y += player.velocityY;

      // Ground collision
      if (player.y + player.size >= groundY) {
        player.y = groundY - player.size;
        player.velocityY = 0;
        player.jumping = false;
      }

      // Update rotation
      if (player.jumping) {
        player.rotationVelocity = 0.15;
      } else {
        player.rotationVelocity *= 0.95;
      }
      player.rotation += player.rotationVelocity;

      drawPlayer();

      // Update and draw obstacles
      state.obstacles = state.obstacles.filter((obs: any) => {
        obs.x -= state.gameSpeed;
        drawObstacle(obs);

        // Check collision
        if (checkCollision(player, obs)) {
          state.gameRunning = false;
          setGameState('gameOver');
          onGameOver?.(state.score);
        }

        return obs.x > -100;
      });

      // Spawn obstacles
      if (state.frameCount % Math.max(50, 120 - state.gameSpeed * 5) === 0) {
        const type = Math.random() > 0.6 ? 'spike' : 'block';
        if (type === 'spike') {
          state.obstacles.push({
            x: canvasWidth,
            y: groundY,
            width: 30,
            height: 40,
            type: 'spike',
          });
        } else {
          state.obstacles.push({
            x: canvasWidth,
            y: groundY - 50,
            width: 40,
            height: 50,
            type: 'block',
          });
        }
      }

      // Increase difficulty
      state.gameSpeed = Math.min(12, 5 + state.score / 400);
      state.score += 1;
      state.frameCount++;

      setScore(state.score);
      drawScore();

      requestAnimationFrame(gameLoop);
    };

    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.code === 'Space' || e.code === 'ArrowUp') && !state.player.jumping && state.gameRunning) {
        state.player.jumping = true;
        state.player.velocityY = -15;
      }
    };

    const handleTouchStart = () => {
      if (!state.player.jumping && state.gameRunning) {
        state.player.jumping = true;
        state.player.velocityY = -15;
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
        className="border-2 border-primary rounded-lg cursor-pointer"
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
