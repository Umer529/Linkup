import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { fetchMessages, sendMessage } from '@/lib/api';
import supabase from '@/lib/supabase';
import type { Message } from '@/lib/types';

const ActivityChat = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Load message history
  useEffect(() => {
    if (!id || !token) return;
    fetchMessages(id)
      .then((data) => setMessages(data ?? []))
      .catch((err) => setError(err?.response?.data?.error || 'Failed to load messages'));
  }, [id, token]);

  // Supabase Realtime subscription
  useEffect(() => {
    if (!id) return;
    const channel = supabase
      .channel(`messages:${id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `activity_id=eq.${id}` },
        async (payload) => {
          const newMsg = payload.new as Message;
          // Fetch user info for the new message
          const { data: userRow } = await supabase
            .from('users')
            .select('id, name, avatar')
            .eq('id', newMsg.user_id)
            .single();
          setMessages((prev) =>
            prev.some((m) => m.id === newMsg.id)
              ? prev
              : [...prev, { ...newMsg, users: userRow ?? undefined }]
          );
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [id]);

  // Scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    const content = input.trim();
    if (!content || sending) return;
    setSending(true);
    setInput('');
    try {
      await sendMessage(id!, content);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setError(e?.response?.data?.error || 'Failed to send message');
      setInput(content); // restore input on failure
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  if (!token) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-muted-foreground">You must be logged in to chat.</p>
        <Button onClick={() => navigate('/login')}>Login</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col max-w-2xl mx-auto" style={{ height: 'calc(100vh - 64px)' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/activity/${id}`)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="font-display font-semibold text-base">Activity Chat</h2>
      </div>

      {/* Error banner */}
      {error && (
        <div className="px-4 py-2 bg-destructive/10 text-destructive text-xs text-center">
          {error}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-sm text-muted-foreground mt-10">
            No messages yet. Say hello! 👋
          </p>
        )}
        {messages.map((msg) => {
          const isMe = msg.user_id === user?.id;
          return (
            <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              {!isMe && (
                <span className="text-xs text-muted-foreground mb-1 ml-1">
                  {msg.users?.name ?? 'Unknown'}
                </span>
              )}
              <div
                className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm break-words ${
                  isMe
                    ? 'bg-green-500 text-white rounded-br-sm'
                    : 'bg-muted text-foreground rounded-bl-sm'
                }`}
              >
                {msg.content}
              </div>
              <span className="text-[10px] text-muted-foreground mt-0.5 mx-1">
                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-border bg-card flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="flex-1"
          disabled={sending}
        />
        <Button
          onClick={send}
          disabled={!input.trim() || sending}
          size="icon"
          className="gradient-bg text-primary-foreground border-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ActivityChat;
