import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { solveDoubt } from '@/lib/ai';
import {
  Chat,
  ChatMessage,
  deleteChat,
  getChat,
  loadChats,
  newChatId,
  titleFrom,
  upsertChat,
} from '@/lib/chat-store';
import { ArrowLeft, MessageCircle, Send, Loader2, Bot, User, Plus, Trash2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

const formatTime = (ts: number) =>
  new Date(ts).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

const DoubtSolver = () => {
  const navigate = useNavigate();
  const { chatId } = useParams<{ chatId: string }>();
  const [chats, setChats] = useState<Chat[]>(() => loadChats());
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(() => (chatId ? getChat(chatId)?.messages ?? [] : []));
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  // Restore messages for the chat in the URL
  useEffect(() => {
    setMessages(chatId ? getChat(chatId)?.messages ?? [] : []);
    setLoading(false);
    inputRef.current?.focus();
  }, [chatId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const persist = useCallback((id: string, msgs: ChatMessage[]) => {
    const existing = getChat(id);
    const chat: Chat = {
      chatId: id,
      title: existing?.title || titleFrom(msgs.find(m => m.role === 'user')?.content ?? ''),
      messages: msgs,
      timestamp: Date.now(),
    };
    setChats(upsertChat(chat));
  }, []);

  const handleAsk = async () => {
    if (!question.trim() || loading) return;
    const q = question.trim();
    setQuestion('');

    const id = chatId ?? newChatId();
    const base = chatId ? messages : [];
    const withUser: ChatMessage[] = [...base, { role: 'user', content: q }];

    setMessages(withUser);
    persist(id, withUser);
    if (!chatId) navigate(`/doubts/${id}`, { replace: true });

    setLoading(true);
    try {
      const answer = await solveDoubt(q);
      const withAnswer: ChatMessage[] = [...withUser, { role: 'assistant', content: answer }];
      setMessages(withAnswer);
      persist(id, withAnswer);
    } catch {
      const failed: ChatMessage[] = [
        ...withUser,
        { role: 'assistant', content: '⚠️ Failed to get answer. Please try again.' },
      ];
      setMessages(failed);
      persist(id, failed);
    }
    setLoading(false);
    inputRef.current?.focus();
  };

  const handleDelete = (id: string) => {
    const next = deleteChat(id);
    setChats(next);
    if (id === chatId) navigate('/doubts', { replace: true });
  };

  const sortedChats = useMemo(() => [...chats].sort((a, b) => b.timestamp - a.timestamp), [chats]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="w-8 h-8 rounded-lg gradient-accent flex items-center justify-center">
            <MessageCircle className="w-4 h-4 text-accent-foreground" />
          </div>
          <h1 className="text-lg font-bold font-display">AI Doubt Solver</h1>
        </div>
      </header>

      <div className="flex-1 container mx-auto px-4 py-6 flex gap-6">
        {/* Chat history */}
        <aside className="hidden md:flex w-64 flex-col shrink-0">
          <Button
            onClick={() => navigate('/doubts')}
            className="gradient-primary text-primary-foreground mb-3 w-full"
          >
            <Plus className="w-4 h-4 mr-2" /> New chat
          </Button>
          <ScrollArea className="flex-1 max-h-[70vh] pr-2">
            <div className="space-y-1">
              {sortedChats.length === 0 && (
                <p className="text-xs text-muted-foreground px-2 py-4">No previous chats yet.</p>
              )}
              {sortedChats.map(chat => (
                <div
                  key={chat.chatId}
                  className={`group flex items-start gap-2 rounded-lg px-2 py-2 text-left transition-colors ${
                    chat.chatId === chatId ? 'bg-muted' : 'hover:bg-muted/60'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => navigate(`/doubts/${chat.chatId}`)}
                    className="flex-1 min-w-0 text-left"
                  >
                    <span className="flex items-center gap-2 text-sm font-medium truncate">
                      <MessageSquare className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                      <span className="truncate">{chat.title || 'New chat'}</span>
                    </span>
                    <span className="block text-[11px] text-muted-foreground mt-0.5">
                      {formatTime(chat.timestamp)}
                    </span>
                  </button>
                  <button
                    type="button"
                    aria-label="Delete chat"
                    onClick={() => handleDelete(chat.chatId)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </aside>

        <main className="flex-1 max-w-3xl flex flex-col">
          <div className="flex-1 space-y-4 overflow-y-auto mb-4">
            {messages.length === 0 && !loading && (
              <div className="flex items-center justify-center h-full min-h-[300px]">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4">
                    <Bot className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <h2 className="text-xl font-bold font-display mb-2">Ask any study doubt!</h2>
                  <p className="text-muted-foreground text-sm">
                    I can explain concepts, solve problems, and help you understand topics better.
                  </p>
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
                <Card className={`p-4 max-w-[80%] ${msg.role === 'user' ? 'gradient-primary text-primary-foreground' : 'shadow-soft'}`}>
                  {msg.role === 'assistant' ? (
                    <div className="prose prose-sm max-w-none [&>*]:mb-4 [&_li]:mb-2 [&_ol]:space-y-3 [&_ul]:space-y-3">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p>{msg.content}</p>
                  )}
                </Card>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 mt-1">
                    <User className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
              </motion.div>
            ))}

            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-primary-foreground" />
                </div>
                <Card className="p-4 shadow-soft">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                </Card>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="flex gap-3 pt-4 border-t border-border">
            <Input
              ref={inputRef}
              autoFocus
              placeholder="Type your question..."
              value={question}
              onChange={e => setQuestion(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAsk()}
              className="flex-1"
            />
            <Button onClick={handleAsk} disabled={loading || !question.trim()} className="gradient-primary text-primary-foreground">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DoubtSolver;
