import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '@/lib/auth-context';
import { generateNotes } from '@/lib/ai';
import { BookOpen, ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

const StudyPage = () => {
  const { subject } = useParams<{ subject: string }>();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [topic, setTopic] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const decodedSubject = decodeURIComponent(subject || '');

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setNotes('');
    try {
      const result = await generateNotes(decodedSubject, topic, user?.level || 'student');
      setNotes(result);
      if (user) updateUser({ topicsCompleted: (user.topicsCompleted || 0) + 1 });
    } catch (err) {
      setNotes('⚠️ Failed to generate notes. Please try again.');
    }
    setLoading(false);
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
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
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

          {loading && (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-3" />
                <p className="text-muted-foreground">Generating notes for "{topic}"...</p>
              </div>
            </div>
          )}

          {notes && !loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card className="p-6 shadow-card prose prose-sm max-w-none">
                <ReactMarkdown>{notes}</ReactMarkdown>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default StudyPage;
