import { useState } from 'react';
import { Moon, Sun, Lock, LogOut, Zap } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface HeaderProps {
  className?: string;
  isAdmin: boolean;
  onAdminToggle: (isAdmin: boolean) => void;
}

export default function Header({ className = '', isAdmin, onAdminToggle }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [pin, setPin] = useState('');
  const [attempts, setAttempts] = useState(0);
  
  const DEFAULT_PIN = '2026';
  const MAX_ATTEMPTS = 3;

  const handleAdminClick = () => {
    if (isAdmin) {
      onAdminToggle(false);
      toast.success('Admin mode deactivated');
    } else {
      setShowPinDialog(true);
      setPin('');
      setAttempts(0);
    }
  };

  const handlePinSubmit = () => {
    if (pin === DEFAULT_PIN) {
      onAdminToggle(true);
      setShowPinDialog(false);
      toast.success('Admin mode activated! 🎓');
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      
      if (newAttempts >= MAX_ATTEMPTS) {
        setShowPinDialog(false);
        toast.error('Too many attempts. Try again later.');
      } else {
        toast.error(`Incorrect PIN. ${MAX_ATTEMPTS - newAttempts} attempts remaining.`);
        setPin('');
      }
    }
  };

  const getCurrentDate = () => {
    const now = new Date();
    return now.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 border-b ${className}`} style={{
      background: 'rgba(13, 17, 23, 0.8)',
      backdropFilter: 'blur(12px)',
      borderColor: 'rgba(255, 0, 0, 0.3)'
    }}>
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-secondary to-primary flex items-center justify-center neon-border">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-primary">Class Hub</h1>
            <p className="text-xs text-muted-foreground">{getCurrentDate()}</p>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          {/* Admin Badge */}
          {isAdmin && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/20 border border-secondary/50 animate-pulse">
              <Zap className="w-4 h-4 text-secondary" />
              <span className="text-xs font-semibold text-secondary">ADMIN ACTIVE</span>
            </div>
          )}

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="cyan-border"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-primary" />
            ) : (
              <Moon className="w-5 h-5 text-primary" />
            )}
          </Button>

          {/* Admin Toggle */}
          <Button
            onClick={handleAdminClick}
            className={`neon-button ${isAdmin ? 'bg-secondary/80 border-secondary' : ''}`}
            title={isAdmin ? 'Deactivate Admin Mode' : 'Activate Admin Mode'}
          >
            {isAdmin ? (
              <>
                <LogOut className="w-4 h-4 mr-2" />
                Exit Admin
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 mr-2" />
                Admin Mode
              </>
            )}
          </Button>
        </div>
      </div>

      {/* PIN Dialog */}
      <Dialog open={showPinDialog} onOpenChange={setShowPinDialog}>
        <DialogContent className="border-secondary/50 neon-border" style={{
          background: 'rgba(13, 17, 23, 0.95)',
          backdropFilter: 'blur(12px)'
        }}>
          <DialogHeader>
            <DialogTitle className="text-primary">Enter Admin PIN</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Enter the PIN to activate Admin Mode and unlock editing capabilities.
            </p>
            <Input
              type="password"
              placeholder="Enter PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handlePinSubmit()}
              className="text-foreground placeholder-muted-foreground"
              style={{
                background: 'rgba(13, 17, 23, 0.8)',
                borderColor: 'rgba(255, 0, 0, 0.3)'
              }}
              autoFocus
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowPinDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handlePinSubmit}
                className="neon-button flex-1"
              >
                Unlock
              </Button>
            </div>
            {attempts > 0 && attempts < MAX_ATTEMPTS && (
              <p className="text-xs text-destructive text-center">
                {MAX_ATTEMPTS - attempts} attempts remaining
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}
