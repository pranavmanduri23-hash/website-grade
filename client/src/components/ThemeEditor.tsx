import { useState, useEffect } from 'react';
import { Palette, Save, RotateCcw, Layout } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface ThemeConfig {
  primary: string;
  accent: string;
  secondary: string;
  background: string;
  buttonRadius: string;
  glassOpacity: string;
}

const DEFAULT_THEME: ThemeConfig = {
  primary: 'oklch(0.65 0.22 200)', // Cyan
  accent: 'oklch(0.75 0.20 120)',  // Lime
  secondary: 'oklch(0.60 0.25 320)', // Magenta
  background: 'oklch(0.15 0.05 250)', // Dark Blue/Slate
  buttonRadius: '0.5rem',
  glassOpacity: '0.4'
};

export default function ThemeEditor() {
  const [theme, setTheme] = useState<ThemeConfig>(DEFAULT_THEME);

  useEffect(() => {
    const savedTheme = localStorage.getItem('app_theme_config');
    if (savedTheme) {
      try {
        const parsed = JSON.parse(savedTheme);
        setTheme(parsed);
        applyTheme(parsed);
      } catch (e) {
        console.error('Failed to load theme', e);
      }
    }
  }, []);

  const applyTheme = (config: ThemeConfig) => {
    const root = document.documentElement;
    root.style.setProperty('--primary', config.primary);
    root.style.setProperty('--accent', config.accent);
    root.style.setProperty('--secondary', config.secondary);
    root.style.setProperty('--background', config.background);
    root.style.setProperty('--radius', config.buttonRadius);
    root.style.setProperty('--glass-opacity', config.glassOpacity);
    
    // Also update background color for the body
    document.body.style.backgroundColor = config.background;
  };

  const handleSave = () => {
    localStorage.setItem('app_theme_config', JSON.stringify(theme));
    applyTheme(theme);
    toast.success('Theme updated successfully!');
  };

  const handleReset = () => {
    setTheme(DEFAULT_THEME);
    applyTheme(DEFAULT_THEME);
    localStorage.removeItem('app_theme_config');
    toast.info('Theme reset to default');
  };

  return (
    <div className="p-6 rounded-xl space-y-6" style={{
      background: 'rgba(24, 28, 50, 0.4)',
      backdropFilter: 'blur(12px)',
      borderColor: 'rgba(37, 80, 140, 0.4)',
      border: '1px solid'
    }}>
      <div className="flex items-center gap-2 mb-4">
        <Palette className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-semibold text-foreground">UI Customizer</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Colors */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Colors</h3>
          
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Primary Color (Cyan/Main)</label>
            <div className="flex gap-2">
              <Input 
                type="color" 
                value={theme.primary.startsWith('oklch') ? '#00d4ff' : theme.primary} 
                onChange={(e) => setTheme({...theme, primary: e.target.value})}
                className="w-12 h-10 p-1 cursor-pointer bg-transparent border-none"
              />
              <Input 
                value={theme.primary} 
                onChange={(e) => setTheme({...theme, primary: e.target.value})}
                className="flex-1 bg-slate-900/50 border-slate-700 font-mono text-xs"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Accent Color (Lime/Success)</label>
            <div className="flex gap-2">
              <Input 
                type="color" 
                value={theme.accent.startsWith('oklch') ? '#00ff88' : theme.accent} 
                onChange={(e) => setTheme({...theme, accent: e.target.value})}
                className="w-12 h-10 p-1 cursor-pointer bg-transparent border-none"
              />
              <Input 
                value={theme.accent} 
                onChange={(e) => setTheme({...theme, accent: e.target.value})}
                className="flex-1 bg-slate-900/50 border-slate-700 font-mono text-xs"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Secondary Color (Magenta/Action)</label>
            <div className="flex gap-2">
              <Input 
                type="color" 
                value={theme.secondary.startsWith('oklch') ? '#ff00ff' : theme.secondary} 
                onChange={(e) => setTheme({...theme, secondary: e.target.value})}
                className="w-12 h-10 p-1 cursor-pointer bg-transparent border-none"
              />
              <Input 
                value={theme.secondary} 
                onChange={(e) => setTheme({...theme, secondary: e.target.value})}
                className="flex-1 bg-slate-900/50 border-slate-700 font-mono text-xs"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Background Color</label>
            <div className="flex gap-2">
              <Input 
                type="color" 
                value={theme.background.startsWith('oklch') ? '#0a0e1a' : theme.background} 
                onChange={(e) => setTheme({...theme, background: e.target.value})}
                className="w-12 h-10 p-1 cursor-pointer bg-transparent border-none"
              />
              <Input 
                value={theme.background} 
                onChange={(e) => setTheme({...theme, background: e.target.value})}
                className="flex-1 bg-slate-900/50 border-slate-700 font-mono text-xs"
              />
            </div>
          </div>
        </div>

        {/* Styles */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Styles</h3>
          
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Button Roundness (Radius)</label>
            <select 
              value={theme.buttonRadius}
              onChange={(e) => setTheme({...theme, buttonRadius: e.target.value})}
              className="w-full bg-slate-900/50 border-slate-700 rounded p-2 text-sm text-foreground"
            >
              <option value="0">Sharp (0px)</option>
              <option value="0.25rem">Slightly Rounded (4px)</option>
              <option value="0.5rem">Standard (8px)</option>
              <option value="1rem">Very Rounded (16px)</option>
              <option value="9999px">Pill (Full)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Panel Transparency (Glass Opacity)</label>
            <input 
              type="range" 
              min="0.1" 
              max="0.9" 
              step="0.1"
              value={theme.glassOpacity}
              onChange={(e) => setTheme({...theme, glassOpacity: e.target.value})}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>Transparent</span>
              <span>Opaque</span>
            </div>
          </div>

          <div className="pt-4 space-y-3">
            <Button onClick={handleSave} className="w-full neon-button gap-2">
              <Save className="w-4 h-4" />
              Apply & Save Theme
            </Button>
            <Button onClick={handleReset} variant="outline" className="w-full gap-2 border-slate-700">
              <RotateCcw className="w-4 h-4" />
              Reset to Default
            </Button>
          </div>
        </div>
      </div>

      {/* Preview Section */}
      <div className="mt-8 pt-6 border-t border-slate-800">
        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Preview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button style={{ background: theme.primary, borderRadius: theme.buttonRadius }} className="text-black font-bold">Primary</Button>
          <Button style={{ background: theme.secondary, borderRadius: theme.buttonRadius }} className="text-white font-bold">Secondary</Button>
          <Button style={{ background: theme.accent, borderRadius: theme.buttonRadius }} className="text-black font-bold">Accent</Button>
          <div style={{ 
            background: `rgba(255, 255, 255, ${theme.glassOpacity})`, 
            borderRadius: theme.buttonRadius,
            border: `1px solid ${theme.primary}`
          }} className="flex items-center justify-center text-[10px] font-bold">
            GLASS PANEL
          </div>
        </div>
      </div>
    </div>
  );
}
