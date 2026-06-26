import { useState, useEffect, useRef } from 'react';
import { Send, User, Trash2, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface Message {
  id: string;
  text: string;
  timestamp: string;
  sender_id: string;
  color: string;
}

interface AnonymousChatProps {
  isAdmin: boolean;
}

const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD',
  '#D4A5A5', '#9B59B6', '#3498DB', '#E67E22', '#2ECC71'
];

export default function AnonymousChat({ isAdmin }: AnonymousChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [userId] = useState(() => Math.random().toString(36).substr(2, 9));
  const [userColor] = useState(() => COLORS[Math.floor(Math.random() * COLORS.length)]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
    
    // Subscribe to new messages
    const channel = supabase
      .channel('public:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        setMessages(prev => [...prev, payload.new as Message]);
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'messages' }, (payload) => {
        setMessages(prev => prev.filter(m => m.id !== payload.old.id));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('timestamp', { ascending: true });
      
      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert([{
          text: newMessage,
          sender_id: userId,
          color: userColor,
          timestamp: new Date().toISOString()
        }]);

      if (error) throw error;
      setNewMessage('');
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!isAdmin) return;
    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast.success('Message deleted');
    } catch (error) {
      toast.error('Failed to delete message');
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-[500px] rounded-xl overflow-hidden border" style={{
      background: 'rgba(24, 28, 50, 0.4)',
      backdropFilter: 'blur(12px)',
      borderColor: 'rgba(37, 80, 140, 0.4)'
    }}>
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'rgba(37, 80, 140, 0.4)' }}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <h3 className="font-semibold text-foreground">Anonymous Class Chat</h3>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <User className="w-3 h-3" />
          <span>You are anonymous</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
            <ShieldAlert className="w-8 h-8 mb-2 opacity-20" />
            <p className="text-sm">No messages yet. Say hi!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender_id === userId ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] text-muted-foreground">{formatTime(msg.timestamp)}</span>
              </div>
              <div className="flex items-start gap-2 group">
                <div
                  className="px-4 py-2 rounded-2xl text-sm max-w-[250px] break-words"
                  style={{
                    background: msg.sender_id === userId ? 'rgba(0, 212, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid',
                    borderColor: msg.sender_id === userId ? 'rgba(0, 212, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                    color: msg.sender_id === userId ? '#fff' : '#e2e8f0'
                  }}
                >
                  {msg.text}
                </div>
                {isAdmin && (
                  <button
                    onClick={() => handleDeleteMessage(msg.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t flex gap-2" style={{ borderColor: 'rgba(37, 80, 140, 0.4)' }}>
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="bg-slate-900/50 border-slate-700"
        />
        <Button type="submit" size="icon" className="neon-button">
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
