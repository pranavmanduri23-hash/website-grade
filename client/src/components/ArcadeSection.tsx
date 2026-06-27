import { useState, useEffect } from 'react';
import { Gamepad2, Trophy, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DinoGame } from '@/games/DinoGame';
import { GeometryDash } from '@/games/GeometryDash';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface HighScore {
  id: string;
  game: string;
  score: number;
  player_name: string;
  created_at: string;
}

export default function ArcadeSection({ isAdmin }: { isAdmin?: boolean }) {
  const [activeGame, setActiveGame] = useState<'dino' | 'dash'>('dino');
  const [gameKey, setGameKey] = useState(0);
  const [highScores, setHighScores] = useState<HighScore[]>([]);
  const [playerName, setPlayerName] = useState('Player');
  const [showNameInput, setShowNameInput] = useState(false);
  const [dinoBg, setDinoBg] = useState(() => localStorage.getItem('dino_bg') || '#F7F7F7');

  useEffect(() => {
    fetchHighScores();
  }, []);

  const handleBgChange = (color: string) => {
    setDinoBg(color);
    localStorage.setItem('dino_bg', color);
    toast.success('Dino background updated!');
  };

  const fetchHighScores = async () => {
    try {
      const { data, error } = await supabase
        .from('high_scores')
        .select('*')
        .order('score', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      setHighScores(data || []);
    } catch (error) {
      console.error('Error fetching high scores:', error);
    }
  };

  const handleGameOver = async (score: number) => {
    try {
      const { error } = await supabase
        .from('high_scores')
        .insert([{
          game: activeGame,
          score,
          player_name: playerName
        }]);

      if (error) throw error;
      
      toast.success(`Score saved! ${score} points!`);
      fetchHighScores();
    } catch (error) {
      console.error('Error saving score:', error);
      toast.error('Failed to save score');
    }
  };

  const handleRestartGame = () => {
    setGameKey(prev => prev + 1);
  };

  const topScores = highScores
    .filter(s => s.game === activeGame)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Gamepad2 className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-semibold text-foreground">Arcade Games</h2>
        </div>
      </div>

      <Tabs value={activeGame} onValueChange={(v) => setActiveGame(v as 'dino' | 'dash')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="dino">🦖 Dino Game</TabsTrigger>
          <TabsTrigger value="dash">🔺 Geometry Dash</TabsTrigger>
        </TabsList>

        <TabsContent value="dino" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Jump over obstacles and survive!</p>
            </div>
            <Button onClick={handleRestartGame} variant="outline" size="sm" className="gap-2">
              <RotateCcw className="w-4 h-4" />
              New Game
            </Button>
          </div>
          <div className="bg-slate-900/20 rounded-xl p-4 flex flex-col items-center gap-4">
            <DinoGame key={gameKey} onGameOver={handleGameOver} background={dinoBg} />
            {isAdmin && (
              <div className="flex items-center gap-4 p-3 bg-slate-800/50 rounded-lg border border-slate-700 w-full max-w-md">
                <span className="text-sm font-medium text-slate-300">Admin: Change BG</span>
                <div className="flex gap-2">
                  {['#F7F7F7', '#E3F2FD', '#F1F8E9', '#FFF3E0', '#FCE4EC', '#263238'].map((color) => (
                    <button
                      key={color}
                      onClick={() => handleBgChange(color)}
                      className={`w-6 h-6 rounded-full border-2 ${dinoBg === color ? 'border-primary' : 'border-transparent'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                  <input
                    type="color"
                    value={dinoBg}
                    onChange={(e) => handleBgChange(e.target.value)}
                    className="w-6 h-6 rounded bg-transparent border-none cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="dash" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Jump and rotate to avoid obstacles!</p>
            </div>
            <Button onClick={handleRestartGame} variant="outline" size="sm" className="gap-2">
              <RotateCcw className="w-4 h-4" />
              New Game
            </Button>
          </div>
          <div className="bg-slate-900/20 rounded-xl p-4 flex justify-center">
            <GeometryDash key={gameKey} onGameOver={handleGameOver} />
          </div>
        </TabsContent>
      </Tabs>

      {/* High Scores Leaderboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl p-6 border" style={{
          background: 'rgba(24, 28, 50, 0.4)',
          backdropFilter: 'blur(12px)',
          borderColor: 'rgba(37, 80, 140, 0.4)'
        }}>
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <h3 className="font-bold text-foreground">Top Scores - {activeGame === 'dino' ? 'Dino' : 'Geometry Dash'}</h3>
          </div>
          
          {topScores.length === 0 ? (
            <p className="text-muted-foreground text-sm">No scores yet. Be the first!</p>
          ) : (
            <div className="space-y-2">
              {topScores.map((score, idx) => (
                <div key={score.id} className="flex items-center justify-between p-2 rounded bg-slate-800/30">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-primary">#{idx + 1}</span>
                    <div>
                      <p className="font-semibold text-foreground">{score.player_name}</p>
                      <p className="text-xs text-muted-foreground">{new Date(score.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-primary">{score.score}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Player Info */}
        <div className="rounded-xl p-6 border" style={{
          background: 'rgba(24, 28, 50, 0.4)',
          backdropFilter: 'blur(12px)',
          borderColor: 'rgba(37, 80, 140, 0.4)'
        }}>
          <h3 className="font-bold text-foreground mb-4">Your Info</h3>
          
          {showNameInput ? (
            <div className="space-y-3">
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-3 py-2 rounded bg-slate-900/50 border border-slate-700 text-foreground"
              />
              <Button
                onClick={() => setShowNameInput(false)}
                className="w-full neon-button"
              >
                Save Name
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-3 rounded bg-slate-800/30">
                <p className="text-sm text-muted-foreground">Playing as:</p>
                <p className="text-lg font-bold text-primary">{playerName}</p>
              </div>
              <Button
                onClick={() => setShowNameInput(true)}
                variant="outline"
                className="w-full"
              >
                Change Name
              </Button>
            </div>
          )}

          <div className="mt-6 p-4 rounded bg-primary/10 border border-primary/20">
            <p className="text-xs text-muted-foreground mb-2">💡 Tips:</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Press SPACE or tap to jump</li>
              <li>• Avoid obstacles to increase score</li>
              <li>• Games get harder as you progress</li>
              <li>• Your scores are saved automatically</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
