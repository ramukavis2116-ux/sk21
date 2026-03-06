import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { solveDoubt } from '@/lib/ai';
import { ArrowLeft, MessageCircle, Send, Loader2, BookOpen, Bot, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const DoubtSolver = () => {
  const navigate = useNavigate();
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!question.trim() || loading) return;
    const q = question.trim();
    setQuestion('');
    setMessages(prev => [...prev, { role: 'user', content: q }]);
    setLoading(true);
    try {
      const answer = await solveDoubt(q);
      setMessages(prev => [...prev, { role: 'assistant', content: answer }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Failed to get answer. Please try again.' }]);
    }
    setLoading(false);
  };

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

      <main className="flex-1 container mx-auto px-4 py-6 max-w-3xl flex flex-col">
        <div className="flex-1 space-y-4 overflow-y-auto mb-4">
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full min-h-[300px]">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4">
                  <Bot className="w-8 h-8 text-primary-foreground" />
                </div>
                <h2 className="text-xl font-bold font-display mb-2">Ask any study doubt!</h2>
                <p className="text-muted-foreground text-sm">I can explain concepts, solve problems, and help you understand topics better.</p>
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
              <Card className={`p-4 max-w-[80%] ${msg.role === 'user' ? 'gradient-primary text-primary-foreground' : 'shadow-soft'}`}>
                {msg.role === 'assistant' ? (
                  <div className="prose prose-sm max-w-none">
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
        </div>

        <div className="flex gap-3 pt-4 border-t border-border">
          <Input
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
  );
};

export default DoubtSolver;
