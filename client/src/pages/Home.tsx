import { useState } from 'react';
import Header from '@/components/Header';
import AnnouncementBoard from '@/components/AnnouncementBoard';
import Timetable from '@/components/Timetable';
import Leaderboard from '@/components/Leaderboard';
import ClassBot from '@/components/ClassBot';
import ArcadeSection from '@/components/ArcadeSection';
import Gallery from '@/components/Gallery';
import AnonymousChat from '@/components/AnonymousChat';
import PresentationBoard from '@/components/PresentationBoard';
import ThemeEditor from '@/components/ThemeEditor';
import Teachers from '@/components/Teachers';
import AboutPage from './About';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Gamepad2, Bell, Clock, Trophy, Images, Users, Code, Presentation, Palette } from 'lucide-react';

/**
 * Home Page - School Class Hub Dashboard
 * 
 * Design Philosophy: Neon Arcade
 * - Dark background with neon cyan, magenta, and lime accents
 * - Glassmorphism panels with backdrop blur
 * - Smooth transitions and interactive feedback
 * - Public viewing for all content, admin mode for editing
 */
export default function Home() {
  const [isAdmin, setIsAdmin] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header with Auth & Theme */}
      <Header isAdmin={isAdmin} onAdminToggle={setIsAdmin} />

      {/* Main Content - Add top padding for fixed header */}
      <main className="pt-24 pb-8">
        <div className="container mx-auto px-4">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-2">
              Class of 2026 - Elite Hub
            </h1>
            <p className="text-muted-foreground text-lg">
              Your ultimate digital classroom experience
            </p>
          </div>

          {/* Tabs Navigation */}
          <Tabs defaultValue="dashboard" className="w-full">
            <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-9' : 'grid-cols-8'} mb-8`} style={{
              background: 'rgba(24, 28, 50, 0.4)',
              backdropFilter: 'blur(12px)',
              borderColor: 'rgba(37, 80, 140, 0.4)'
            }}>
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="timetable" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span className="hidden sm:inline">Timetable</span>
              </TabsTrigger>
              <TabsTrigger value="leaderboard" className="flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                <span className="hidden sm:inline">Leaderboard</span>
              </TabsTrigger>
              <TabsTrigger value="gallery" className="flex items-center gap-2">
                <Images className="w-4 h-4" />
                <span className="hidden sm:inline">Gallery</span>
              </TabsTrigger>
              <TabsTrigger value="arcade" className="flex items-center gap-2">
                <Gamepad2 className="w-4 h-4" />
                <span className="hidden sm:inline">Arcade</span>
              </TabsTrigger>
              <TabsTrigger value="teachers" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Teachers</span>
              </TabsTrigger>
              <TabsTrigger value="presentations" className="flex items-center gap-2">
                <Presentation className="w-4 h-4" />
                <span className="hidden sm:inline">Presentations</span>
              </TabsTrigger>
              <TabsTrigger value="about" className="flex items-center gap-2">
                <Code className="w-4 h-4" />
                <span className="hidden sm:inline">About</span>
              </TabsTrigger>
              {isAdmin && (
                <TabsTrigger value="ui-editor" className="flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  <span className="hidden sm:inline">UI Editor</span>
                </TabsTrigger>
              )}
            </TabsList>

            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="space-y-6">
              <AnnouncementBoard isAdmin={isAdmin} />
            </TabsContent>

            {/* Timetable Tab */}
            <TabsContent value="timetable" className="space-y-6">
              <Timetable isAdmin={isAdmin} />
            </TabsContent>

            {/* Leaderboard Tab */}
            <TabsContent value="leaderboard" className="space-y-6">
              <Leaderboard isAdmin={isAdmin} />
            </TabsContent>

            {/* Gallery Tab */}
            <TabsContent value="gallery" className="space-y-6">
              <Gallery isAdmin={isAdmin} />
            </TabsContent>

            {/* Arcade Tab */}
            <TabsContent value="arcade" className="space-y-6">
              <ArcadeSection />
            </TabsContent>

            {/* Teachers Tab */}
            <TabsContent value="teachers" className="space-y-6">
              <Teachers isAdmin={isAdmin} />
            </TabsContent>

            {/* Presentations Tab */}
            <TabsContent value="presentations" className="space-y-6">
              <PresentationBoard isAdmin={isAdmin} />
            </TabsContent>

            {/* About Tab */}
            <TabsContent value="about" className="space-y-6">
              <AboutPage />
            </TabsContent>

            {/* UI Editor Tab */}
            {isAdmin && (
              <TabsContent value="ui-editor" className="space-y-6">
                <ThemeEditor />
              </TabsContent>
            )}
          </Tabs>
        </div>
      </main>

      {/* ClassBot Floating Widget */}
      <ClassBot />

      {/* Anonymous Chat Widget */}
      <AnonymousChat />
    </div>
  );
}
