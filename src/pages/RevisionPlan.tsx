import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '@/lib/auth-context';
import { generateRevisionPlan } from '@/lib/ai';
import { ArrowLeft, Calendar, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

const RevisionPlan = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [examDate, setExamDate] = useState(user?.examDate || '');
  const [plan, setPlan] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!examDate || !user?.subjects?.length) return;
    setLoading(true);
    setPlan('');
    try {
      const result = await generateRevisionPlan(user.subjects, examDate, user.level || 'student');
      setPlan(result);
      updateUser({ examDate });
    } catch {
      setPlan('⚠️ Failed to generate revision plan. Please try again.');
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
          <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
            <Calendar className="w-4 h-4 text-success" />
          </div>
          <h1 className="text-lg font-bold font-display">AI Revision Plan</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-6 shadow-card mb-6">
            <h2 className="text-xl font-bold font-display mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent" /> Generate Your Revision Plan
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Enter your exam date and we'll create a personalized revision schedule based on your subjects.
            </p>
            <div className="flex gap-3 items-end">
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium">Exam Date</label>
                <Input type="date" value={examDate} onChange={e => setExamDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
              </div>
              <Button onClick={handleGenerate} disabled={loading || !examDate} className="gradient-primary text-primary-foreground h-10">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Generate Plan'}
              </Button>
            </div>
            {user?.subjects && (
              <div className="mt-3 flex flex-wrap gap-2">
                {user.subjects.map(s => (
                  <span key={s} className="px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary">{s}</span>
                ))}
              </div>
            )}
          </Card>

          {loading && (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-3" />
                <p className="text-muted-foreground">Creating your personalized revision plan...</p>
              </div>
            </div>
          )}

          {plan && !loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card className="p-6 shadow-card prose prose-sm max-w-none">
                <ReactMarkdown>{plan}</ReactMarkdown>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default RevisionPlan;
