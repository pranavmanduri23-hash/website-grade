import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: string;
}

export default function ClassBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat history from local storage
  useEffect(() => {
    const savedHistory = localStorage.getItem('classbot_history');
    if (savedHistory) {
      try {
        setMessages(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to parse chat history', e);
      }
    } else {
      setMessages([
        {
          id: '1',
          text: "Hey there! I'm ClassBot. I can help with school stuff, answer general questions, or just chat! What's on your mind?",
          sender: 'bot',
          timestamp: new Date().toISOString()
        }
      ]);
    }
  }, []);

  // Save chat history to local storage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('classbot_history', JSON.stringify(messages));
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const generateBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase().trim();

    // Greeting responses
    if (lowerMessage.match(/^(hi|hello|hey|greetings|sup|yo)/)) {
      const greetings = [
        "Hey there! 👋 How can I help you today?",
        "Hello! What's up? 😊",
        "Yo! What do you need?",
        "Hi! Nice to see you! How's it going?"
      ];
      return greetings[Math.floor(Math.random() * greetings.length)];
    }

    // School-specific responses
    if (lowerMessage.match(/(schedule|timetable|class|when|time|period)/)) {
      return "📅 Here's today's schedule:\n\n• 9:00 - 9:45: Mathematics (Mr. Smith)\n• 9:45 - 10:30: English (Ms. Johnson)\n• 10:45 - 11:30: Science (Dr. Brown)\n\nCheck the Timetable tab for the full weekly schedule!";
    }

    if (lowerMessage.match(/(exam|homework|assignment|deadline|test|due)/)) {
      return "📚 Upcoming deadlines:\n\n• Math Assignment - Due Friday\n• English Essay - Due Next Monday\n• Science Project - Due Next Wednesday\n\nStay on top of your work! 💪";
    }

    if (lowerMessage.match(/(leaderboard|rank|points|score|top|leader)/)) {
      return "🏆 You're doing great! Check the Leaderboard tab to see where you stand and compete with your classmates. Keep earning points!";
    }

    if (lowerMessage.match(/(game|arcade|play|fun|break|dino|geometry)/)) {
      return "🎮 Ready for some fun? Head to the Arcade tab to play:\n\n• Dino Game - Run and jump through obstacles\n• Geometry Dash - Navigate through geometric challenges\n• Number Guesser - Predict the mystery number\n• Fast Clicker - Click as fast as you can\n• MPC Quiz - Test your math knowledge\n• Memory Master - Remember the sequence\n\nHave fun and beat the high scores!";
    }

    if (lowerMessage.match(/(teacher|professor|instructor|staff)/)) {
      return "👨‍🏫 Check the Teachers tab to learn about our amazing educators! You can find their contact info, office locations, and specialties there.";
    }

    // General knowledge responses
    if (lowerMessage.match(/(what is|what's|define|meaning|explain)/)) {
      if (lowerMessage.includes('artificial intelligence') || lowerMessage.includes('ai')) {
        return "🤖 Artificial Intelligence (AI) is the simulation of human intelligence by machines. It includes learning, reasoning, and self-correction. AI powers things like chatbots (like me!), recommendation systems, and autonomous vehicles.";
      }
      if (lowerMessage.includes('python')) {
        return "🐍 Python is a popular programming language known for its simple syntax and readability. It's used for web development, data science, artificial intelligence, and automation. Great for beginners!";
      }
      if (lowerMessage.includes('machine learning')) {
        return "🧠 Machine Learning is a subset of AI where computers learn from data without being explicitly programmed. It powers things like image recognition, recommendation systems, and predictive analytics.";
      }
      if (lowerMessage.includes('web development')) {
        return "🌐 Web Development is the process of building websites and web applications. It typically involves frontend (HTML, CSS, JavaScript), backend (servers, databases), and deployment.";
      }
      return "I can help explain that! Could you be more specific about what you'd like to know?";
    }

    // Math questions
    if (lowerMessage.match(/(math|calculate|solve|equation|algebra|geometry|calculus)/)) {
      if (lowerMessage.includes('derivative')) {
        return "📐 A derivative measures how a function changes as its input changes. For example, the derivative of x² is 2x. It's fundamental to calculus!";
      }
      if (lowerMessage.includes('integral')) {
        return "∫ An integral is the reverse of a derivative. It's used to find areas under curves and the accumulation of quantities. The integral of 2x is x² + C.";
      }
      if (lowerMessage.includes('pythagorean')) {
        return "📐 The Pythagorean theorem states that in a right triangle: a² + b² = c², where c is the hypotenuse. Super useful!";
      }
      return "📊 I can help with math! Ask me about specific concepts like derivatives, integrals, algebra, geometry, or trigonometry.";
    }

    // Science questions
    if (lowerMessage.match(/(science|physics|chemistry|biology|atom|element)/)) {
      if (lowerMessage.includes('photosynthesis')) {
        return "🌱 Photosynthesis is the process plants use to convert sunlight into chemical energy. The equation: 6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂";
      }
      if (lowerMessage.includes('gravity')) {
        return "🌍 Gravity is a fundamental force that attracts objects with mass. Newton's law: F = G(m₁m₂)/r². Einstein later explained it through spacetime curvature.";
      }
      if (lowerMessage.includes('atom')) {
        return "⚛️ An atom is the smallest unit of matter. It consists of a nucleus (protons and neutrons) surrounded by electrons. Everything is made of atoms!";
      }
      return "🔬 I can help with science! Ask me about physics, chemistry, biology, or specific concepts.";
    }

    // History and general knowledge
    if (lowerMessage.match(/(history|when|year|date|event|war|revolution)/)) {
      if (lowerMessage.includes('world war')) {
        return "⚔️ World War II (1939-1945) was one of the most significant events in history. It involved most of the world's nations and resulted in major geopolitical changes.";
      }
      if (lowerMessage.includes('renaissance')) {
        return "🎨 The Renaissance (14th-17th centuries) was a period of cultural rebirth in Europe, marked by advances in art, science, and humanism.";
      }
      return "📚 I can discuss history! Ask me about specific periods, events, or historical figures.";
    }

    // Motivation and encouragement
    if (lowerMessage.match(/(tired|stressed|hard|difficult|can't|stuck|help me)/)) {
      const encouragements = [
        "💪 You've got this! Take a break if you need to, then come back stronger.",
        "🌟 Don't worry, everyone struggles sometimes. You're doing better than you think!",
        "🎯 Focus on one small step at a time. You'll get there!",
        "✨ Remember why you started. You're capable of amazing things!"
      ];
      return encouragements[Math.floor(Math.random() * encouragements.length)];
    }

    // Fun and casual responses
    if (lowerMessage.match(/(joke|funny|laugh|haha|lol)/)) {
      const jokes = [
        "😄 Why did the student do multiplication problems on the floor? Because the teacher told them not to use tables!",
        "🤓 Why was the equal sign so humble? Because it knew it wasn't less than or greater than anyone else!",
        "😆 What did the calculator say to the student? You can count on me!",
        "🎉 Why do programmers prefer dark mode? Because light attracts bugs!"
      ];
      return jokes[Math.floor(Math.random() * jokes.length)];
    }

    // Help/Info
    if (lowerMessage.match(/(help|how|what can you do|features|info)/)) {
      return "ℹ️ I can help you with:\n\n• 📅 Schedule and class info\n• 📚 Homework and deadlines\n• 🏆 Leaderboard standings\n• 🎮 Game instructions\n• 🧠 General knowledge (math, science, history, etc.)\n• 💡 Study tips and motivation\n• 👨‍🏫 Teacher information\n\nJust ask me anything!";
    }

    // How are you
    if (lowerMessage.match(/(how are you|how's it going|how do you feel)/)) {
      return "😊 I'm doing great! Thanks for asking. I'm here and ready to help with whatever you need!";
    }

    // Fallback response with encouragement
    return "🤔 That's an interesting question! I'm still learning, but I've logged your question. Feel free to ask about schedules, homework, games, general knowledge, or anything else on your mind. I'm here to help! 🎓";
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate bot thinking time
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: generateBotResponse(input),
        sender: 'bot',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 500);
  };

  return (
    <>
      {/* Chat Widget Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
        style={{
          background: 'linear-gradient(135deg, oklch(0.65 0.22 200), oklch(0.60 0.25 320))',
          boxShadow: '0 8px 32px rgba(0, 212, 255, 0.4)'
        }}
        title="Open ClassBot"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-primary-foreground" />
        ) : (
          <MessageCircle className="w-6 h-6 text-primary-foreground" />
        )}
      </button>

      {/* Chat Drawer */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-2rem)] rounded-lg shadow-2xl flex flex-col h-96 z-40 transition-all duration-300 animate-in slide-in-from-bottom-5"
          style={{
            background: 'rgba(24, 28, 50, 0.95)',
            backdropFilter: 'blur(12px)',
            borderColor: 'rgba(0, 212, 255, 0.5)',
            border: '1px solid'
          }}
        >
          {/* Header */}
          <div className="p-4 border-b flex justify-between items-center" style={{ borderColor: 'rgba(37, 80, 140, 0.4)' }}>
            <div>
              <h3 className="font-semibold text-primary flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                ClassBot
              </h3>
              <p className="text-xs text-muted-foreground">Always here to help</p>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => {
                if(confirm('Clear chat history?')) {
                  setMessages([{
                    id: '1',
                    text: "Chat history cleared. How can I help you?",
                    sender: 'bot',
                    timestamp: new Date().toISOString()
                  }]);
                  localStorage.removeItem('classbot_history');
                }
              }}
              className="text-muted-foreground hover:text-destructive"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map(message => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className="max-w-xs px-4 py-2 rounded-lg text-sm whitespace-pre-wrap"
                  style={{
                    background: message.sender === 'user'
                      ? 'rgba(0, 212, 255, 0.2)'
                      : 'rgba(96, 40, 255, 0.2)',
                    color: message.sender === 'user' ? 'oklch(0.65 0.22 200)' : 'oklch(0.95 0.01 0)',
                    borderLeft: message.sender === 'user'
                      ? '2px solid oklch(0.65 0.22 200)'
                      : '2px solid oklch(0.60 0.25 320)'
                  }}
                >
                  {message.text}
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="px-4 py-2 rounded-lg" style={{
                  background: 'rgba(96, 40, 255, 0.2)'
                }}>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t" style={{ borderColor: 'rgba(37, 80, 140, 0.4)' }}>
            <div className="flex gap-2">
              <Input
                placeholder="Ask me anything..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                className="text-foreground placeholder-muted-foreground"
                style={{
                  background: 'rgba(24, 28, 50, 0.5)',
                  borderColor: 'rgba(37, 80, 140, 0.5)'
                }}
              />
              <Button
                onClick={handleSendMessage}
                size="icon"
                className="neon-button"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
