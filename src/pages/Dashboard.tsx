import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import { BookOpen, GraduationCap, Brain, Calendar, LogOut, Flame, CheckCircle, Clock, Target, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getLevels, getDegrees, getBranches, getCompetitiveExams, getSubjectsForLevel } from '@/lib/ai';
import { useToast } from '@/hooks/use-toast';

const Dashboard = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedLevel, setSelectedLevel] = useState(user?.level || '');
  const [selectedDegree, setSelectedDegree] = useState(user?.degree || '');
  const [selectedBranch, setSelectedBranch] = useState(user?.branch || '');
  const [examDate, setExamDate] = useState(user?.examDate || '');
  const [subjects, setSubjects] = useState<string[]>(user?.subjects || []);
  const [setupDone, setSetupDone] = useState(!!(user?.level && user?.subjects?.length));

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  useEffect(() => {
    if (selectedLevel === 'College' && selectedDegree && selectedBranch) {
      setSubjects(getSubjectsForLevel('College', selectedDegree, selectedBranch));
    } else if (selectedLevel === 'Competitive' && selectedDegree) {
      setSubjects(getSubjectsForLevel('Competitive', selectedDegree));
    } else if (selectedLevel && selectedLevel !== 'College' && selectedLevel !== 'Competitive') {
      setSubjects(getSubjectsForLevel(selectedLevel));
    }
  }, [selectedLevel, selectedDegree, selectedBranch]);

  const handleSaveSetup = () => {
    if (!selectedLevel) { toast({ title: 'Select your level', variant: 'destructive' }); return; }
    updateUser({ level: selectedLevel, degree: selectedDegree, branch: selectedBranch, examDate, subjects });
    setSetupDone(true);
    toast({ title: 'Setup saved!' });
  };

  const daysUntilExam = examDate ? Math.max(0, Math.ceil((new Date(examDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : null;

  if (!user) return null;

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.4 } }),
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold font-display">StudyAI</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">Hi, {user.name}</span>
            <Button variant="ghost" size="sm" onClick={() => { logout(); navigate('/login'); }}>
              <LogOut className="w-4 h-4 mr-1" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Setup Section */}
        {!setupDone && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="p-6 mb-8 shadow-card">
              <h2 className="text-2xl font-bold font-display mb-4 flex items-center gap-2">
                <GraduationCap className="w-6 h-6 text-primary" /> Set Up Your Profile
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Your Level</label>
                  <Select value={selectedLevel} onValueChange={v => { setSelectedLevel(v); setSelectedDegree(''); setSelectedBranch(''); }}>
                    <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                    <SelectContent>
                      {getLevels().map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {selectedLevel === 'College' && (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Degree</label>
                      <Select value={selectedDegree} onValueChange={v => { setSelectedDegree(v); setSelectedBranch(''); }}>
                        <SelectTrigger><SelectValue placeholder="Select degree" /></SelectTrigger>
                        <SelectContent>
                          {getDegrees().map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    {selectedDegree && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Branch</label>
                        <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                          <SelectTrigger><SelectValue placeholder="Select branch" /></SelectTrigger>
                          <SelectContent>
                            {getBranches(selectedDegree).map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </>
                )}

                {selectedLevel === 'Competitive' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Exam</label>
                    <Select value={selectedDegree} onValueChange={setSelectedDegree}>
                      <SelectTrigger><SelectValue placeholder="Select exam" /></SelectTrigger>
                      <SelectContent>
                        {getCompetitiveExams().map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium">Exam Date (optional)</label>
                  <Input type="date" value={examDate} onChange={e => setExamDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
                </div>
              </div>

              {subjects.length > 0 && (
                <div className="mt-4">
                  <label className="text-sm font-medium mb-2 block">Your Subjects</label>
                  <div className="flex flex-wrap gap-2">
                    {subjects.map(s => (
                      <span key={s} className="px-3 py-1 rounded-full text-sm bg-primary/10 text-primary font-medium">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              <Button className="mt-6 gradient-primary text-primary-foreground" onClick={handleSaveSetup}>
                Save & Continue
              </Button>
            </Card>
          </motion.div>
        )}

        {/* Dashboard Cards */}
        {setupDone && (
          <>
            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { icon: Flame, label: 'Study Streak', value: `${user.studyStreak || 0} days`, color: 'text-accent' },
                { icon: CheckCircle, label: 'Topics Completed', value: `${user.topicsCompleted || 0}`, color: 'text-success' },
                { icon: Target, label: 'Subjects', value: `${subjects.length}`, color: 'text-primary' },
                { icon: Clock, label: 'Days to Exam', value: daysUntilExam !== null ? `${daysUntilExam}` : 'Not set', color: daysUntilExam !== null && daysUntilExam < 30 ? 'text-destructive' : 'text-muted-foreground' },
              ].map((stat, i) => (
                <motion.div key={stat.label} custom={i} variants={cardVariants} initial="hidden" animate="visible">
                  <Card className="p-5 shadow-soft hover:shadow-card transition-shadow">
                    <div className="flex items-center gap-3">
                      <stat.icon className={`w-8 h-8 ${stat.color}`} />
                      <div>
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                        <p className="text-2xl font-bold font-display">{stat.value}</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Subjects Grid */}
            <h2 className="text-2xl font-bold font-display mb-4">Your Subjects</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {subjects.map((subject, i) => (
                <motion.div key={subject} custom={i + 4} variants={cardVariants} initial="hidden" animate="visible">
                  <Card
                    className="p-5 shadow-soft hover:shadow-card transition-all cursor-pointer hover:-translate-y-1 group"
                    onClick={() => navigate(`/study/${encodeURIComponent(subject)}`)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                        <BookOpen className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{subject}</h3>
                        <p className="text-xs text-muted-foreground">Click to study</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Quick Actions */}
            <h2 className="text-2xl font-bold font-display mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="p-5 shadow-soft hover:shadow-card transition-all cursor-pointer hover:-translate-y-1" onClick={() => navigate('/doubts')}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg gradient-accent flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-accent-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Ask a Doubt</h3>
                    <p className="text-xs text-muted-foreground">Get instant AI explanations</p>
                  </div>
                </div>
              </Card>
              <Card className="p-5 shadow-soft hover:shadow-card transition-all cursor-pointer hover:-translate-y-1" onClick={() => navigate('/revision-plan')}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Revision Plan</h3>
                    <p className="text-xs text-muted-foreground">AI-generated study schedule</p>
                  </div>
                </div>
              </Card>
              <Card className="p-5 shadow-soft hover:shadow-card transition-all cursor-pointer hover:-translate-y-1" onClick={() => { setSetupDone(false); }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Change Level</h3>
                    <p className="text-xs text-muted-foreground">Update your study profile</p>
                  </div>
                </div>
              </Card>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
