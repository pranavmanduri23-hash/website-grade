# School Class Hub

An ultra-modern, responsive web application designed as a digital classroom hub for students and teachers. Built with React, Tailwind CSS, and a stunning Neon Arcade aesthetic featuring glassmorphism design, dark/light mode, admin authentication, and interactive mini-games.

## 🎨 Design Philosophy: Neon Arcade

The application features a cohesive **Neon Arcade** aesthetic with:

- **Dark Background:** Deep charcoal-purple (`oklch(0.12 0.01 280)`) that reduces eye strain
- **Neon Accents:** Electric cyan, magenta, and lime colors for interactive elements
- **Glassmorphism:** Translucent panels with backdrop blur effects
- **Smooth Animations:** All interactions feature fluid transitions and visual feedback
- **Typography:** Orbitron font for headers (futuristic), Inter for body text (readable)

## ✨ Features

### 1. Authentication & Admin System
- **Role-Based Access:** Student (view-only) and Admin (full editing)
- **PIN Protection:** Secure admin mode with default PIN `2026`
- **Visual Indicators:** Glowing "ADMIN ACTIVE" badge when admin mode is enabled
- **Access Control:** Edit, Add, and Delete buttons appear only for admins

### 2. Main Dashboard
- **Header:** Fixed navigation with live date/time clock, theme toggle, and admin login
- **Class Announcements:** Central feed for updates with admin posting capabilities
- **Timetable/Schedule:** Weekly calendar grid showing periods, subjects, and teachers
- **Leaderboard:** Gamified ranking system with points, achievements, and attendance tracking

### 3. ClassBot AI Chatbot
- **Floating Widget:** Always-accessible chat interface in bottom-right corner
- **Smart Responses:** Keyword-matching system for instant responses about:
  - Schedule information
  - Homework deadlines
  - Leaderboard standings
  - Game instructions
  - General help
- **Session Memory:** Maintains conversation history during the session
- **Typing Indicator:** Visual feedback while bot processes queries

### 4. Interactive Arcade
Two engaging mini-games to make learning fun:

**Game 1: Number Guesser (Exam Score Predictor)**
- Guess a random number between 1 and 50
- 5 attempts to find the correct number
- Score calculation based on attempts remaining
- High score tracking

**Game 2: Fast Clicker (Brain Break)**
- 10-second arcade challenge
- Click the moving target as many times as possible
- Target jumps randomly around the play area
- High score tracking

## 🛠️ Technology Stack

- **Frontend Framework:** React 19 with TypeScript
- **Styling:** Tailwind CSS 4 with custom theme
- **UI Components:** shadcn/ui with Radix UI primitives
- **Icons:** Lucide React
- **Routing:** Wouter (lightweight client-side router)
- **Notifications:** Sonner (toast notifications)
- **State Management:** React Hooks (useState, useEffect)

## 📱 Responsive Design

The application is fully responsive across all devices:

- **Desktop:** Full-featured experience with all components visible
- **Tablet:** Optimized grid layout with adjusted spacing
- **Mobile:** Single-column layout with touch-friendly buttons
- **Breakpoints:** Tailwind's responsive utilities (sm, md, lg, xl)

## 🎮 How to Use

### For Students
1. Open the application and explore the Dashboard
2. Check the Timetable for your class schedule
3. View your ranking on the Leaderboard
4. Chat with ClassBot for quick information
5. Play arcade games to take a brain break

### For Admins
1. Click "Admin Mode" button in the header
2. Enter PIN: `2026`
3. Once activated, you'll see:
   - "Post Announcement" button on Dashboard
   - "Add Slot" button on Timetable
   - Edit and Delete buttons on all components
4. Make changes as needed
5. Click "Exit Admin" to deactivate admin mode

## 🌙 Theme Switching

Click the sun/moon icon in the header to toggle between dark and light modes. The theme preference is maintained during your session.

## 📊 Leaderboard System

Students are ranked by:
- **Points:** Earned through participation and achievements
- **Achievements:** Badges for completing milestones
- **Attendance:** Percentage of classes attended

The leaderboard displays top 8 students with their rankings, scores, and stats.

## 🤖 ClassBot Commands

Try asking ClassBot about:
- "What's my schedule?" or "When's math class?"
- "What homework is due?" or "Upcoming deadlines?"
- "Where do I rank?" or "Show leaderboard"
- "How do I play?" or "What games are available?"
- "Help" or "What can you do?"

## 🎨 Customization

### Colors
Edit the color palette in `client/src/index.css`:
- Primary (Neon Cyan): `oklch(0.65 0.22 200)`
- Secondary (Neon Magenta): `oklch(0.60 0.25 320)`
- Accent (Neon Lime): `oklch(0.75 0.20 120)`
- Background: `oklch(0.12 0.01 280)`

### Fonts
Fonts are imported from Google Fonts in `client/index.html`:
- Headers: Orbitron (geometric, futuristic)
- Body: Inter (clean, readable)

### Admin PIN
Change the default PIN in `client/src/components/Header.tsx`:
```typescript
const DEFAULT_PIN = '2026'; // Change this value
```

## 📁 Project Structure

```
client/
├── src/
│   ├── pages/
│   │   ├── Home.tsx           # Main dashboard page
│   │   └── NotFound.tsx       # 404 page
│   ├── components/
│   │   ├── Header.tsx         # Navigation & auth
│   │   ├── AnnouncementBoard.tsx
│   │   ├── Timetable.tsx
│   │   ├── Leaderboard.tsx
│   │   ├── ClassBot.tsx       # AI chatbot widget
│   │   ├── ArcadeSection.tsx  # Mini-games
│   │   └── ui/                # shadcn/ui components
│   ├── contexts/
│   │   └── ThemeContext.tsx   # Dark/light mode
│   ├── App.tsx                # Route definitions
│   ├── main.tsx               # React entry point
│   └── index.css              # Global styles & theme
├── index.html                 # HTML template
└── public/                    # Static assets
```

## 🚀 Development

### Start Development Server
```bash
pnpm dev
```

### Build for Production
```bash
pnpm build
```

### Type Checking
```bash
pnpm check
```

### Format Code
```bash
pnpm format
```

## 📝 Notes

- All data is stored in React state and will reset on page refresh
- For persistent storage, integrate with a backend database
- The ClassBot uses local keyword matching; for advanced AI, integrate with an LLM API
- High scores in arcade games are stored in component state (not persistent)

## 🎯 Future Enhancements

- Backend database integration for persistent data
- Real-time notifications
- File upload for assignments
- Video conferencing integration
- Advanced analytics dashboard
- Mobile app version
- Dark/light mode persistence
- User profiles and customization

## 📄 License

This project is created as an educational demonstration of modern web development practices.

---

**Built with ❤️ using React, Tailwind CSS, and the Neon Arcade design philosophy**
