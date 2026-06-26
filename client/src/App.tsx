import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import { useEffect } from "react";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    const savedTheme = localStorage.getItem('app_theme_config');
    if (savedTheme) {
      try {
        const config = JSON.parse(savedTheme);
        const root = document.documentElement;
        root.style.setProperty('--primary', config.primary);
        root.style.setProperty('--accent', config.accent);
        root.style.setProperty('--secondary', config.secondary);
        root.style.setProperty('--background', config.background);
        root.style.setProperty('--radius', config.buttonRadius);
        root.style.setProperty('--glass-opacity', config.glassOpacity);
        document.body.style.backgroundColor = config.background;
      } catch (e) {
        console.error('Failed to load theme', e);
      }
    }
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
        switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
