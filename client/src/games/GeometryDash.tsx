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
      size: 28,
      velocityY: 0,
      jumping: false,
      rotation: 0,
      rotationVelocity: 0,
      isAirborne: false,
    },
    obstacles: [] as any[],
    gameSpeed: 5,
    frameCount: 0,
    platforms: [] as any[],
    jumpPower: 0,
    isHolding: false,
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

      // Gradient cube
      const gradient = ctx!.createLinearGradient(-player.size / 2, -player.size / 2, player.size / 2, player.size / 2);
      gradient.addColorStop(0, '#FF1744');
      gradient.addColorStop(1, '#FF6B6B');
      ctx!.fillStyle = gradient;
      ctx!.fillRect(-player.size / 2, -player.size / 2, player.size, player.size);

      // Neon red outline
      ctx!.strokeStyle = '#FF0000';
      ctx!.lineWidth = 2;
      ctx!.strokeRect(-player.size / 2, -player.size / 2, player.size, player.size);

      // Inner glow
      ctx!.strokeStyle = 'rgba(255, 107, 107, 0.5)';
      ctx!.lineWidth = 1;
      ctx!.strokeRect(-player.size / 2 + 3, -player.size / 2 + 3, player.size - 6, player.size - 6);

      ctx!.restore();
    };

    const drawObstacle = (obstacle: any) => {
      if (obstacle.type === 'spike') {
        // Spike obstacle
        ctx!.fillStyle = '#0B0F19';
        ctx!.beginPath();
        ctx!.moveTo(obstacle.x, obstacle.y);
        ctx!.lineTo(obstacle.x + obstacle.width / 2, obstacle.y - obstacle.height);
        ctx!.lineTo(obstacle.x + obstacle.width, obstacle.y);
        ctx!.closePath();
        ctx!.fill();
        
        // Glow
        ctx!.strokeStyle = 'rgba(255, 0, 0, 0.5)';
        ctx!.lineWidth = 2;
        ctx!.stroke();
      } else if (obstacle.type === 'block') {
        // Block obstacle
        ctx!.fillStyle = '#0B0F19';
        ctx!.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        
        // Neon border
        ctx!.strokeStyle = '#FF1744';
        ctx!.lineWidth = 2;
        ctx!.strokeRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
      } else if (obstacle.type === 'circle') {
        // Circle obstacle
        ctx!.fillStyle = '#0B0F19';
        ctx!.beginPath();
        ctx!.arc(obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height / 2, obstacle.width / 2, 0, Math.PI * 2);
        ctx!.fill();
        
        // Neon border
        ctx!.strokeStyle = '#00D4FF';
        ctx!.lineWidth = 2;
        ctx!.stroke();
      } else if (obstacle.type === 'platform') {
        // Moving platform
        ctx!.fillStyle = 'rgba(112, 128, 144, 0.6)';
        ctx!.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        
        // Cyan border
        ctx!.strokeStyle = '#00D4FF';
        ctx!.lineWidth = 2;
        ctx!.strokeRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
      }
    };

    const drawBackground = () => {
      // Dark blue background
      ctx!.fillStyle = '#0B0F19';
      ctx!.fillRect(0, 0, canvasWidth, canvasHeight);

      // Parallax grid pattern
      const offset = (state.frameCount * state.gameSpeed) % 50;
      ctx!.strokeStyle = 'rgba(112, 128, 144, 0.15)';
      ctx!.lineWidth = 1;
      for (let i = 0; i < canvasWidth; i += 50) {
        ctx!.beginPath();
        ctx!.moveTo(i - offset, 0);
        ctx!.lineTo(i - offset, canvasHeight);
        ctx!.stroke();
      }

      // Ground
      ctx!.fillStyle = '#161B22';
      ctx!.fillRect(0, groundY, canvasWidth, canvasHeight - groundY);
      
      // Neon red ground line
      ctx!.strokeStyle = '#FF1744';
      ctx!.lineWidth = 3;
      ctx!.beginPath();
      ctx!.moveTo(0, groundY);
      ctx!.lineTo(canvasWidth, groundY);
      ctx!.stroke();
    };

    const drawScore = () => {
      ctx!.fillStyle = '#00D4FF';
      ctx!.font = 'bold 24px Arial';
      ctx!.textAlign = 'left';
      ctx!.fillText(`Score: ${state.score}`, 20, 40);
      ctx!.font = '16px Arial';
      ctx!.fillStyle = '#FF1744';
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

      // Update player physics
      player.velocityY += 0.7; // gravity
      player.y += player.velocityY;

      // Ground collision
      if (player.y + player.size >= groundY) {
        player.y = groundY - player.size;
        player.velocityY = 0;
        player.jumping = false;
        player.isAirborne = false;
      } else {
        player.isAirborne = true;
      }

      // Update rotation
      if (player.jumping || player.isAirborne) {
        player.rotationVelocity = 0.12;
      } else {
        player.rotationVelocity *= 0.92;
      }
      player.rotation += player.rotationVelocity;

      drawPlayer();

      // Update and draw obstacles
      state.obstacles = state.obstacles.filter((obs: any) => {
        obs.x -= state.gameSpeed;
        
        // Update moving platforms
        if (obs.type === 'platform') {
          obs.y = groundY - 50 + Math.sin(state.frameCount * 0.05 + obs.id) * 15;
        }
        
        drawObstacle(obs);

        // Check collision
        if (checkCollision(player, obs)) {
          state.gameRunning = false;
          setGameState('gameOver');
          onGameOver?.(state.score);
        }

        return obs.x > -100;
      });

      // Spawn obstacles with varied patterns
      const spawnRate = Math.max(45, 130 - state.gameSpeed * 6);
      if (state.frameCount % spawnRate === 0) {
        const rand = Math.random();
        
        if (rand > 0.75) {
          // Circle obstacle
          state.obstacles.push({
            x: canvasWidth,
            y: groundY - 40,
            width: 35,
            height: 35,
            type: 'circle',
          });
        } else if (rand > 0.5) {
          // Spike obstacle
          state.obstacles.push({
            x: canvasWidth,
            y: groundY,
            width: 30,
            height: 45,
            type: 'spike',
          });
        } else if (rand > 0.25) {
          // Block obstacle
          state.obstacles.push({
            x: canvasWidth,
            y: groundY - 50,
            width: 40,
            height: 50,
            type: 'block',
          });
        } else {
          // Moving platform
          state.obstacles.push({
            x: canvasWidth,
            y: groundY - 50,
            width: 50,
            height: 15,
            type: 'platform',
            id: Math.random(),
          });
        }
      }

      // Increase difficulty smoothly
      state.gameSpeed = Math.min(14, 5 + state.score / 500);
      state.score += 1;
      state.frameCount++;

      setScore(state.score);
      drawScore();

      requestAnimationFrame(gameLoop);
    };

    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.code === 'Space' || e.code === 'ArrowUp') && state.gameRunning) {
        e.preventDefault();
        if (!state.player.jumping && !state.player.isAirborne) {
          state.player.jumping = true;
          state.player.velocityY = -16;
          state.isHolding = true;
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if ((e.code === 'Space' || e.code === 'ArrowUp') && state.gameRunning) {
        state.isHolding = false;
      }
    };

    const handleTouchStart = () => {
      if (!state.player.jumping && !state.player.isAirborne && state.gameRunning) {
        state.player.jumping = true;
        state.player.velocityY = -16;
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
        className="border-2 rounded-lg cursor-pointer cyan-border"
        style={{ maxWidth: '100%', height: 'auto' }}
      />
      <div className="text-center">
        <p className="text-sm text-muted-foreground">Press SPACE or tap to jump</p>
        {gameState === 'gameOver' && (
          <p className="text-lg font-bold text-secondary mt-2">Game Over! Final Score: {score}</p>
        )}
      </div>
    </div>
  );
};
