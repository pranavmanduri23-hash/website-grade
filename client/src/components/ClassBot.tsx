import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader } from 'lucide-react';
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
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat history from local storage
  useEffect(() => {
    const savedHistory = localStorage.getItem('classbot_history');
    if (savedHistory) {
      try {
        setMessages(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to parse chat history', e);
        initializeDefaultMessage();
      }
    } else {
      initializeDefaultMessage();
    }
  }, []);

  const initializeDefaultMessage = () => {
    setMessages([
      {
        id: '1',
        text: "Hey there! I'm ClassBot, powered by Groq AI. I can help with school stuff, answer questions, and chat! What's on your mind?",
        sender: 'bot',
        timestamp: new Date().toISOString()
      }
    ]);
  };

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
  }, [messages, isOpen, isStreaming]);

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
    setIsStreaming(true);

    // Add a placeholder bot message for streaming
    const botPlaceholder: Message = {
      id: (Date.now() + 1).toString(),
      text: '',
      sender: 'bot',
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, botPlaceholder]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.text,
          conversationHistory: messages.map(m => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            content: m.text
          }))
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response from Groq');
      }

      let botResponseText = '';
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          botResponseText += chunk;

          // Update the last bot message with streaming text
          setMessages(prev => {
            const updated = [...prev];
            if (updated[updated.length - 1]?.sender === 'bot') {
              updated[updated.length - 1].text = botResponseText;
            }
            return updated;
          });
        }
      }

      // If no streaming, just add the response
      if (!botResponseText) {
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: "I'm having trouble connecting to the AI service. Please try again.",
          sender: 'bot',
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, botResponse]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I encountered an error. Please try again later.",
        sender: 'bot',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
      setIsStreaming(false);
    }
  };

  return (
    <>
      {/* Chat Widget Button - Dark Blue with Red Accent */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 neon-border"
        style={{
          background: 'linear-gradient(135deg, oklch(0.65 0.28 15), oklch(0.70 0.24 200))',
          boxShadow: '0 8px 32px rgba(255, 0, 0, 0.3)'
        }}
        title="Open ClassBot"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MessageCircle className="w-6 h-6 text-white" />
        )}
      </button>

      {/* Chat Drawer - Dark Blue Theme */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-2rem)] rounded-lg shadow-2xl flex flex-col h-96 z-40 transition-all duration-300 animate-in slide-in-from-bottom-5 dark-container"
          style={{
            background: 'rgba(13, 17, 23, 0.95)',
            backdropFilter: 'blur(12px)',
            borderColor: 'rgba(255, 0, 0, 0.5)',
            border: '2px solid'
          }}
        >
          {/* Header */}
          <div className="p-4 border-b flex justify-between items-center" style={{ borderColor: 'rgba(37, 80, 140, 0.4)' }}>
            <div>
              <h3 className="font-semibold text-primary flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                ClassBot AI
              </h3>
              <p className="text-xs text-muted-foreground">Powered by Groq</p>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => {
                if(confirm('Clear chat history?')) {
                  initializeDefaultMessage();
                  localStorage.removeItem('classbot_history');
                }
              }}
              className="text-muted-foreground hover:text-secondary"
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
                  className="max-w-xs px-4 py-2 rounded-lg text-sm whitespace-pre-wrap break-words"
                  style={{
                    background: message.sender === 'user'
                      ? 'rgba(255, 0, 0, 0.15)'
                      : 'rgba(112, 128, 144, 0.2)',
                    color: message.sender === 'user' ? 'oklch(0.95 0.01 0)' : 'oklch(0.95 0.01 0)',
                    borderLeft: message.sender === 'user'
                      ? '3px solid oklch(0.65 0.28 15)'
                      : '3px solid oklch(0.70 0.24 200)'
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
                  background: 'rgba(112, 128, 144, 0.2)'
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
                onKeyDown={(e) => e.key === 'Enter' && !isStreaming && handleSendMessage()}
                disabled={isStreaming}
                className="text-foreground placeholder-muted-foreground"
                style={{
                  background: 'rgba(13, 17, 23, 0.8)',
                  borderColor: 'rgba(37, 80, 140, 0.5)'
                }}
              />
              <Button
                onClick={handleSendMessage}
                disabled={isStreaming}
                size="icon"
                className="neon-button"
              >
                {isStreaming ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
