import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, CheckCircle2, XCircle, RefreshCcw } from 'lucide-react';

interface Question {
  id: number;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
}

export default function MBIPCQuiz() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      // Fetch 10 random questions from mbipc table
      const { data, error } = await supabase
        .from('mbipc')
        .select('*');
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Shuffle and take 10
        const shuffled = [...data].sort(() => 0.5 - Math.random());
        setQuestions(shuffled.slice(0, 10));
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast.error('Failed to load quiz questions');
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (option: string) => {
    if (selectedOption) return;
    
    setSelectedOption(option);
    const correct = option === questions[currentQuestionIndex].correct_option;
    setIsCorrect(correct);
    
    if (correct) {
      setScore(prev => prev + 1);
      toast.success('Correct answer!');
    } else {
      toast.error(`Wrong! Correct was ${questions[currentQuestionIndex].correct_option}`);
    }

    setTimeout(() => {
      if (currentQuestionIndex + 1 < questions.length) {
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedOption(null);
        setIsCorrect(null);
      } else {
        setShowResult(true);
      }
    }, 1500);
  };

  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setShowResult(false);
    setSelectedOption(null);
    setIsCorrect(null);
    fetchQuestions();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading MBIPC Quiz...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-destructive">No questions found in the database.</p>
        <Button onClick={fetchQuestions} className="mt-4">Retry</Button>
      </div>
    );
  }

  if (showResult) {
    return (
      <Card className="w-full max-w-2xl mx-auto border-primary/20 bg-slate-900/40 backdrop-blur-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary">Quiz Complete!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <div className="text-5xl font-black text-secondary">
            {score} / {questions.length}
          </div>
          <p className="text-muted-foreground">
            {score === questions.length ? 'Perfect Score! You are an expert!' : 
             score >= questions.length / 2 ? 'Great job! Keep learning.' : 
             'Keep practicing to improve your score.'}
          </p>
          <Button onClick={restartQuiz} className="neon-button gap-2">
            <RefreshCcw className="w-4 h-4" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <Card className="w-full max-w-2xl mx-auto border-primary/20 bg-slate-900/40 backdrop-blur-md">
      <CardHeader>
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-bold uppercase tracking-widest text-secondary">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
          <span className="text-xs font-bold text-primary">
            Score: {score}
          </span>
        </div>
        <CardTitle className="text-xl text-foreground leading-relaxed">
          {currentQuestion.question}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-3">
        {[
          { id: 'A', text: currentQuestion.option_a },
          { id: 'B', text: currentQuestion.option_b },
          { id: 'C', text: currentQuestion.option_c },
          { id: 'D', text: currentQuestion.option_d }
        ].map((opt) => (
          <Button
            key={opt.id}
            variant="outline"
            className={`h-auto py-4 px-6 justify-start text-left transition-all duration-200 ${
              selectedOption === opt.id 
                ? isCorrect 
                  ? 'bg-green-500/20 border-green-500 text-green-500' 
                  : 'bg-red-500/20 border-red-500 text-red-500'
                : 'hover:bg-primary/10 border-slate-700'
            }`}
            onClick={() => handleOptionSelect(opt.id)}
            disabled={!!selectedOption}
          >
            <span className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center mr-4 text-sm font-bold border border-slate-700">
              {opt.id}
            </span>
            <span className="flex-1">{opt.text}</span>
            {selectedOption === opt.id && (
              isCorrect ? <CheckCircle2 className="w-5 h-5 ml-2" /> : <XCircle className="w-5 h-5 ml-2" />
            )}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
