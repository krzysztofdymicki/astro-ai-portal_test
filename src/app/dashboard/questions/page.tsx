'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { createClient } from '@/utils/supabase/client';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Sparkles, ArrowLeft, Star, Award, CheckCircle2, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

// Define the question interface
interface Question {
  id: string;
  question_text: string;
  options: {
    id: string;
    text: string;
    is_correct?: boolean;
  }[];
  credits_reward: number;
  answered?: boolean;
}

export default function QuestionsPage() {
  const supabase = createClient();
  const { profile, credits, refreshUserData } = useUser();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<string>>(new Set());
  const [earned, setEarned] = useState(0);
  const [showReward, setShowReward] = useState(false);

  // Fetch questions from the database
  useEffect(() => {
    async function fetchQuestions() {
      try {
        // Get all questions
        const { data, error } = await supabase
          .from('additional_questions')
          .select('*')
          .order('created_at');

        if (error) throw error;
        
        // Get user's answered questions
        const { data: answeredData, error: answeredError } = await supabase
          .from('user_answered_questions')
          .select('question_id')
          .eq('user_id', profile?.id || '');

        if (answeredError) throw answeredError;
        
        // Mark questions as answered
        const answeredSet = new Set((answeredData || []).map(item => item.question_id));
        setAnsweredQuestions(answeredSet);
        
        // Process questions and their options
        if (data) {
          const processedQuestions = await Promise.all(data.map(async (q: any) => {
            // Fetch options for each question
            const { data: options } = await supabase
              .from('question_options')
              .select('*')
              .eq('question_id', q.id);
            
            return {
              id: q.id,
              question_text: q.question_text,
              credits_reward: q.credits_reward,
              options: options || [],
              answered: answeredSet.has(q.id)
            };
          }));
          
          setQuestions(processedQuestions);
        }
      } catch (error) {
        console.error('Error fetching questions:', error);
        toast.error('Nie udało się załadować pytań');
      } finally {
        setLoadingQuestions(false);
      }
    }
    
    if (profile?.id) {
      fetchQuestions();
    }
  }, [supabase, profile?.id]);

  // Handle submitting an answer
  const handleSubmitAnswer = async () => {
    if (!selectedOption || !profile?.id) return;
    
    setIsSubmitting(true);
    const currentQuestion = questions[currentQuestionIndex];
    
    try {
      // Check if the answer is correct
      const selectedOptionObj = currentQuestion.options.find(opt => opt.id === selectedOption);
      
      if (selectedOptionObj?.is_correct) {
        // Save the answered question
        await supabase.from('user_answered_questions').insert({
          user_id: profile.id,
          question_id: currentQuestion.id,
          selected_option_id: selectedOption,
          is_correct: true
        });
        
        // Update user credits
        await supabase.rpc('add_user_credits', {
          user_id_param: profile.id,
          amount_param: currentQuestion.credits_reward
        });
        
        // Show reward animation
        setEarned(currentQuestion.credits_reward);
        setShowReward(true);
        
        // Refresh user data to get updated credits
        await refreshUserData();
        
        setTimeout(() => {
          setShowReward(false);
          // Mark question as answered
          setAnsweredQuestions(prev => new Set(prev).add(currentQuestion.id));
          // Move to next question if available
          if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
          }
          setSelectedOption(null);
        }, 2000);
      } else {
        // Save the incorrect answer
        await supabase.from('user_answered_questions').insert({
          user_id: profile.id,
          question_id: currentQuestion.id,
          selected_option_id: selectedOption,
          is_correct: false
        });
        
        toast.error('Nieprawidłowa odpowiedź. Spróbuj ponownie!');
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      toast.error('Nie udało się zapisać odpowiedzi');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Calculate completion percentage
  const completionPercentage = questions.length > 0
    ? (answeredQuestions.size / questions.length) * 100
    : 0;

  // Get current question
  const currentQuestion = questions[currentQuestionIndex];
  const isCurrentQuestionAnswered = currentQuestion 
    ? answeredQuestions.has(currentQuestion.id)
    : false;

  return (
    <div className="space-y-6 py-4" data-testid="questions-page-container">
      {/* Header section */}
      <div className="flex justify-between items-center mb-6">
        <Link 
          href="/dashboard" 
          className="flex items-center text-indigo-300 hover:text-indigo-100 transition-colors"
          data-testid="back-to-dashboard"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Powrót do Panelu
        </Link>
        
        <div className="flex items-center bg-indigo-900/60 px-4 py-2 rounded-full">
          <Star className="h-5 w-5 text-yellow-300 mr-2" />
          <span className="text-white font-medium">Kredyty: {credits?.balance || 0}</span>
        </div>
      </div>
      
      {/* Main page header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mystical-glow" data-testid="questions-heading">
          Pytania Dodatkowe
        </h1>
        <p className="text-indigo-200 mt-2" data-testid="questions-subheading">
          Odpowiadaj na pytania i zdobywaj kredyty na ekskluzywne przepowiednie
        </p>
      </div>
      
      {/* Progress section */}
      <Card className="bg-indigo-950/40 border-indigo-300/30 mb-8">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-indigo-200">Postęp odpowiedzi</span>
              <span className="text-indigo-100 font-medium">
                {answeredQuestions.size} / {questions.length}
              </span>
            </div>
            <Progress 
              value={completionPercentage} 
              className="h-2 bg-indigo-950"
            />
            <p className="text-indigo-300 text-sm italic">
              {completionPercentage === 100 
                ? "Wszystkie pytania zostały ukończone! Wróć później po więcej." 
                : "Odpowiedz na wszystkie pytania, aby zdobyć maksymalną liczbę kredytów."}
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* Questions area */}
      <AnimatePresence mode="wait">
        {loadingQuestions ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex justify-center items-center py-20"
          >
            <div className="loader"></div>
          </motion.div>
        ) : questions.length === 0 ? (
          <motion.div
            key="no-questions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center py-20"
          >
            <HelpCircle className="mx-auto h-16 w-16 text-indigo-400/60 mb-4" />
            <h3 className="text-xl text-white font-medium">Brak dostępnych pytań</h3>
            <p className="text-indigo-200 mt-2">
              Zajrzyj do nas później, dodamy więcej pytań wkrótce!
            </p>
          </motion.div>
        ) : (
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-indigo-900/40 border-indigo-300/30 text-white shadow-lg hover:shadow-indigo-500/20 transition-all">
              <CardHeader>
                <div className="flex justify-between items-center mb-2">
                  <CardTitle className="text-xl">Pytanie {currentQuestionIndex + 1}</CardTitle>
                  <div className="flex items-center">
                    <Sparkles className="h-4 w-4 text-yellow-300 mr-1" />
                    <span className="text-yellow-200 text-sm">
                      +{currentQuestion?.credits_reward || 0} kredytów
                    </span>
                  </div>
                </div>
                <CardDescription className="text-indigo-200/70">
                  {isCurrentQuestionAnswered 
                    ? "To pytanie zostało już przez Ciebie rozwiązane"
                    : "Wybierz prawidłową odpowiedź, aby otrzymać kredyty"}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-6">
                  <div className="text-lg text-white font-medium">
                    {currentQuestion?.question_text}
                  </div>
                  
                  <RadioGroup
                    value={selectedOption || ""}
                    onValueChange={setSelectedOption}
                    disabled={isCurrentQuestionAnswered}
                    className="space-y-3"
                  >
                    {currentQuestion?.options?.map((option) => (
                      <div key={option.id} className="flex items-center">
                        <div className="w-full bg-indigo-800/30 rounded-lg hover:bg-indigo-800/50 transition-colors">
                          <div className="flex items-center space-x-2 p-3">
                            <RadioGroupItem 
                              value={option.id} 
                              id={option.id} 
                              className="text-indigo-200"
                            />
                            <Label 
                              htmlFor={option.id} 
                              className="text-indigo-100 flex-grow cursor-pointer"
                            >
                              {option.text}
                            </Label>
                          </div>
                        </div>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </CardContent>
              
              <CardFooter>
                <div className="flex justify-between w-full">
                  <Button
                    variant="ghost"
                    className="text-indigo-300 hover:text-indigo-100 hover:bg-indigo-800/50"
                    onClick={() => {
                      if (currentQuestionIndex > 0) {
                        setCurrentQuestionIndex(currentQuestionIndex - 1);
                        setSelectedOption(null);
                      }
                    }}
                    disabled={currentQuestionIndex === 0 || isSubmitting}
                  >
                    Poprzednie
                  </Button>
                  
                  {isCurrentQuestionAnswered ? (
                    <Button
                      variant="outline"
                      className="bg-emerald-900/40 text-emerald-100 border-emerald-500/30"
                      onClick={() => {
                        if (currentQuestionIndex < questions.length - 1) {
                          setCurrentQuestionIndex(currentQuestionIndex + 1);
                          setSelectedOption(null);
                        }
                      }}
                      disabled={currentQuestionIndex === questions.length - 1}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Następne pytanie
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmitAnswer}
                      disabled={!selectedOption || isSubmitting}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      {isSubmitting ? (
                        <>Zapisywanie</>
                      ) : (
                        <>Zatwierdź odpowiedź</>
                      )}
                    </Button>
                  )}
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Navigation dots */}
      {questions.length > 0 && (
        <div className="flex justify-center mt-6 space-x-2">
          {questions.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentQuestionIndex(idx);
                setSelectedOption(null);
              }}
              className={`w-3 h-3 rounded-full transition-all ${
                idx === currentQuestionIndex
                  ? "bg-indigo-400 scale-125"
                  : answeredQuestions.has(questions[idx]?.id || '')
                  ? "bg-indigo-600"
                  : "bg-indigo-900"
              }`}
            />
          ))}
        </div>
      )}
      
      {/* Reward animation */}
      <AnimatePresence>
        {showReward && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.2, opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 bg-black/40"
          >
            <motion.div
              className="bg-indigo-900/80 backdrop-blur-md border border-indigo-400/40 rounded-xl p-8 text-center shadow-xl"
              animate={{ y: [0, -10, 0], transition: { repeat: 3, duration: 0.5 } }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, ease: "linear", repeat: Infinity }}
                className="mx-auto mb-4 bg-indigo-700/50 p-4 rounded-full w-24 h-24 flex items-center justify-center"
              >
                <Award className="h-12 w-12 text-yellow-300" />
              </motion.div>
              <h2 className="text-2xl font-bold text-white mb-2">Brawo!</h2>
              <p className="text-indigo-200 mb-4">Poprawna odpowiedź!</p>
              <div className="text-yellow-300 text-3xl font-bold flex items-center justify-center">
                +{earned} <Star className="h-5 w-5 ml-2" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Custom styles */}
      <style jsx global>{`
        .mystical-glow {
          text-shadow: 0 0 10px rgba(139, 92, 246, 0.7), 0 0 20px rgba(139, 92, 246, 0.5);
        }
        
        .loader {
          width: 48px;
          height: 48px;
          border: 5px solid rgba(139, 92, 246, 0.3);
          border-bottom-color: rgba(139, 92, 246, 0.8);
          border-radius: 50%;
          display: inline-block;
          box-sizing: border-box;
          animation: rotation 1s linear infinite;
        }
        
        @keyframes rotation {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}