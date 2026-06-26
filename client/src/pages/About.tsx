import { Code, Terminal, Cpu, Globe, GraduationCap, Target } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-foreground mb-2">About Class Hub</h2>
        <p className="text-muted-foreground">Learn more about our platform and the developer behind it</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* About Section */}
        <div
          className="p-8 rounded-2xl relative overflow-hidden group"
          style={{
            background: 'rgba(24, 28, 50, 0.4)',
            backdropFilter: 'blur(12px)',
            borderColor: 'rgba(37, 80, 140, 0.4)',
            border: '1px solid'
          }}
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Globe className="w-32 h-32 text-primary" />
          </div>
          
          <h3 className="text-2xl font-bold text-primary mb-6 flex items-center gap-3">
            <Globe className="w-6 h-6" />
            What is Class Hub?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Class Hub is a modern, interactive digital classroom platform designed to enhance student engagement and learning outcomes. Our platform combines essential classroom tools with fun, gamified elements to make learning more enjoyable and accessible for everyone.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 bg-accent/20 p-1 rounded">
                    <span className="text-accent text-xs">✓</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Real-time announcements and interactive schedule management</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 bg-accent/20 p-1 rounded">
                    <span className="text-accent text-xs">✓</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Gamified leaderboard system for friendly classroom competition</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 bg-accent/20 p-1 rounded">
                    <span className="text-accent text-xs">✓</span>
                  </div>
                  <p className="text-sm text-muted-foreground">AI-powered chatbot and anonymous student discussion channels</p>
                </div>
              </div>
            </div>
            <div className="bg-slate-900/40 rounded-xl p-6 border border-slate-800/50">
              <h4 className="text-accent font-bold mb-4 flex items-center gap-2">
                <Cpu className="w-4 h-4" />
                Core Technology
              </h4>
              <ul className="space-y-3">
                <li className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Frontend</span>
                  <span className="text-primary font-mono">React 19 + TS</span>
                </li>
                <li className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Styling</span>
                  <span className="text-primary font-mono">Tailwind CSS</span>
                </li>
                <li className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Backend</span>
                  <span className="text-primary font-mono">Express.js</span>
                </li>
                <li className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Build Tool</span>
                  <span className="text-primary font-mono">Vite</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Developer Section - Pranav */}
        <div
          className="p-8 rounded-2xl relative overflow-hidden"
          style={{
            background: 'rgba(24, 28, 50, 0.6)',
            backdropFilter: 'blur(16px)',
            borderColor: 'rgba(0, 212, 255, 0.3)',
            border: '1px solid'
          }}
        >
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-1 space-y-6">
              <div>
                <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent mb-2">
                  Hey there, I'm Pranav! 👋
                </h3>
                <p className="text-xl text-muted-foreground font-medium">
                  Coder & Developer | Birla Open Minds International School
                </p>
              </div>

              <p className="text-muted-foreground leading-relaxed">
                I am a passionate Coder & Developer currently studying at Birla Open Minds International School. 
                I love turning logical problems into functional code and building digital tools that make an 
                impact—whether that's developing complex backend systems, programming interactive applications, 
                or crafting modern user interfaces.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-primary font-bold flex items-center gap-2">
                    <Terminal className="w-5 h-5" />
                    🛠️ What I Do
                  </h4>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li>
                      <span className="text-accent font-bold">Bot Development:</span> Writing scalable, multi-command systems with advanced features like automation and database syncing.
                    </li>
                    <li>
                      <span className="text-accent font-bold">Full-Stack Projects:</span> Creating dynamic web applications with interactive elements and seamless file handling.
                    </li>
                    <li>
                      <span className="text-accent font-bold">Strategic Logic:</span> Applying deep analytical thinking to code optimization and game theory mechanics.
                    </li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h4 className="text-primary font-bold flex items-center gap-2">
                    <Cpu className="w-5 h-5" />
                    💻 Tech Stack
                  </h4>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {['JavaScript', 'Python', 'HTML5', 'CSS3', 'Node.js', 'Discord.js', 'PostgreSQL', 'MongoDB', 'Tailwind'].map(tech => (
                        <span key={tech} className="px-2 py-1 rounded bg-primary/10 border border-primary/20 text-xs text-primary font-mono">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div className="p-5 rounded-xl bg-slate-900/40 border border-slate-800/50">
                  <h4 className="text-accent font-bold mb-3 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5" />
                    🏫 Education & Growth
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Actively balancing academic excellence with hands-on software development. 
                    Constantly learning new frameworks and exploring system architectures to build the "next big thing."
                  </p>
                </div>
                <div className="p-5 rounded-xl bg-slate-900/40 border border-slate-800/50">
                  <h4 className="text-accent font-bold mb-3 flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    🎯 My Philosophy
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    I believe that code should be highly efficient under the hood and incredibly clean on the surface. 
                    I build scalable projects that are easy to maintain and fun to interact with.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
