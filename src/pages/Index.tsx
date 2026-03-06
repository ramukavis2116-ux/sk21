import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Brain, Calendar, MessageCircle, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="gradient-hero min-h-[85vh] flex items-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-accent rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="flex items-center gap-3 justify-center mb-8">
                <div className="w-14 h-14 rounded-2xl gradient-accent flex items-center justify-center">
                  <BookOpen className="w-8 h-8 text-accent-foreground" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold font-display text-primary-foreground">StudyAI</h1>
              </div>

              <h2 className="text-3xl md:text-5xl font-bold font-display text-primary-foreground mb-6 leading-tight">
                Your AI-Powered
                <br />
                <span className="text-accent">Study Companion</span>
              </h2>

              <p className="text-lg text-primary-foreground/70 mb-10 max-w-xl mx-auto">
                Generate smart notes, solve doubts instantly, and get personalized revision plans — all powered by AI.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="gradient-accent text-accent-foreground font-semibold h-12 px-8 text-base" onClick={() => navigate('/signup')}>
                  Get Started Free <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 h-12 px-8 text-base" onClick={() => navigate('/login')}>
                  Sign In
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Features */}
      <section className="py-20 container mx-auto px-4">
        <h3 className="text-3xl font-bold font-display text-center mb-12">
          Everything you need to <span className="text-gradient">ace your exams</span>
        </h3>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            { icon: Sparkles, title: 'AI Notes Generator', desc: 'Enter any topic and get well-structured study notes with key headings and summaries.' },
            { icon: MessageCircle, title: 'Instant Doubt Solving', desc: 'Ask any question and get clear, step-by-step explanations from AI.' },
            { icon: Calendar, title: 'Smart Revision Plans', desc: 'Enter your exam date and get a personalized day-by-day revision schedule.' },
          ].map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15 }} viewport={{ once: true }}
              className="p-6 rounded-xl bg-card shadow-card hover:shadow-elevated transition-shadow"
            >
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4">
                <f.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <h4 className="text-lg font-bold font-display mb-2">{f.title}</h4>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center">
        <p className="text-sm text-muted-foreground">© 2026 StudyAI. Built with ❤️ for students everywhere.</p>
      </footer>
    </div>
  );
};

export default Index;
