import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '@/lib/auth-context';
import { generateNotes, solveDoubt } from '@/lib/ai';
import { Chat, ChatMessage, findChatByTitle, newChatId, upsertChat } from '@/lib/chat-store';
import { BookOpen, ArrowLeft, Loader2, Sparkles, Send, MessageSquarePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

const StudyPage = () => {
  const { subject } = useParams<{ subject: string }>();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [topic, setTopic] = useState('');
  const [followUp, setFollowUp] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeTopic, setActiveTopic] = useState('');
  const [chatId, setChatId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const decodedSubject = decodeURIComponent(subject || '');

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const persist = (id: string, title: string, msgs: ChatMessage[]) => {
    const existing = findChatByTitle(title);
    const chat: Chat = {
      chatId: id,
      title,
      messages: msgs,
      timestamp: Date.now(),
    };
    upsertChat(existing && existing.chatId === id ? { ...existing, ...chat } : chat);
  };

  const handleGenerate = async () => {
    const trimmedTopic = topic.trim();
    if (!trimmedTopic || loading) return;

    const existing = findChatByTitle(trimmedTopic);
    const id = existing?.chatId || newChatId();
    const userMessage: ChatMessage = {
      role: 'user',
      content: `Generate study notes for ${trimmedTopic} in ${decodedSubject}`,
    };
    const base: ChatMessage[] = [...(existing?.messages || []), userMessage];

    setActiveTopic(trimmedTopic);
    setChatId(id);
    setMessages(base);
    setTopic('');
    setLoading(true);

    try {
      const result = await generateNotes(decodedSubject, trimmedTopic, user?.level || 'student');
      const next: ChatMessage[] = [...base, { role: 'assistant', content: result }];
      setMessages(next);
      persist(id, trimmedTopic, next);
      if (user) updateUser({ topicsCompleted: (user.topicsCompleted || 0) + 1 });
    } catch {
      setMessages([...base, { role: 'assistant', content: '⚠️ Failed to generate notes. Please try again.' }]);
    }
    setLoading(false);
  };

  const handleFollowUp = async () => {
    const q = followUp.trim();
    if (!q || loading || !chatId) return;

    const base: ChatMessage[] = [...messages, { role: 'user', content: q }];
    setMessages(base);
    setFollowUp('');
    setLoading(true);

    try {
      const result = await solveDoubt(q, `${decodedSubject} — ${activeTopic}`, messages);
      const next: ChatMessage[] = [...base, { role: 'assistant', content: result }];
      setMessages(next);
      persist(chatId, activeTopic, next);
    } catch {
      setMessages([...base, { role: 'assistant', content: '⚠️ Failed to answer. Please try again.' }]);
    }
    setLoading(false);
  };

  const startNewChat = () => {
    setMessages([]);
    setChatId(null);
    setActiveTopic('');
    setTopic('');
    setFollowUp('');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-primary-foreground" />
          </div>
          <h1 className="text-lg font-bold font-display">{decodedSubject}</h1>
          {chatId && (
            <Button variant="outline" size="sm" className="ml-auto gap-2" onClick={startNewChat}>
              <MessageSquarePlus className="w-4 h-4" /> New Topic
            </Button>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {!chatId && (
            <Card className="p-6 shadow-card mb-6">
              <h2 className="text-xl font-bold font-display mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent" /> Generate Study Notes
              </h2>
              <div className="flex gap-3">
                <Input
                  placeholder={`Enter a topic from ${decodedSubject}...`}
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleGenerate()}
                  className="flex-1"
                />
                <Button onClick={handleGenerate} disabled={loading || !topic.trim()} className="gradient-primary text-primary-foreground">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Generate'}
                </Button>
              </div>
            </Card>
          )}

          {chatId && (
            <p className="text-sm text-muted-foreground mb-4">
              Topic: <span className="font-semibold text-foreground">{activeTopic}</span>
            </p>
          )}

          <div className="space-y-4">
            {messages.map((m, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                {m.role === 'user' ? (
                  <div className="flex justify-end">
                    <div className="bg-primary text-primary-foreground rounded-2xl rounded-br-sm px-4 py-2 max-w-[85%]">
                      {m.content}
                    </div>
                  </div>
                ) : (
                  <Card className="p-6 shadow-card prose prose-sm max-w-none [&>*]:mb-4 [&_li]:mb-2 [&_ol]:space-y-3 [&_ul]:space-y-3">
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </Card>
                )}
              </motion.div>
            ))}

            {loading && (
              <div className="flex items-center gap-3 text-muted-foreground py-6">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <span>Thinking...</span>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {chatId && (
            <Card className="p-3 shadow-card mt-6 sticky bottom-4 bg-card/95 backdrop-blur-sm">
              <div className="flex gap-3">
                <Input
                  placeholder={`Ask a follow-up about ${activeTopic}...`}
                  value={followUp}
                  onChange={e => setFollowUp(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleFollowUp()}
                  className="flex-1"
                />
                <Button onClick={handleFollowUp} disabled={loading || !followUp.trim()} className="gradient-primary text-primary-foreground">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default StudyPage;
