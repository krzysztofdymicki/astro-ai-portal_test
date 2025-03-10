'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Star, Award, ArrowRight, HelpCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function QuestionsPage() {
  const { profileQuestions, profileAnswers, credits, loading, submitProfileAnswer, isQuestionAnswered, getQuestionAnswer } = useUser();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answerText, setAnswerText] = useState('');
  const [textareaEmpty, setTextareaEmpty] = useState(true);
  const [showReward, setShowReward] = useState(false);
  const [earnedCredits, setEarnedCredits] = useState(0);

  // Ustawienie tekstu odpowiedzi przy zmianie pytania
  useEffect(() => {
    if (profileQuestions.length > 0) {
      const currentQuestion = profileQuestions[currentQuestionIndex];
      const savedAnswer = getQuestionAnswer(currentQuestion.id);
      
      if (savedAnswer) {
        setAnswerText(savedAnswer);
        setTextareaEmpty(false);
      } else {
        setAnswerText('');
        setTextareaEmpty(true);
      }
    }
  }, [currentQuestionIndex, profileQuestions, getQuestionAnswer]);

  // Obsługa zapisywania odpowiedzi
  const handleSubmitAnswer = async () => {
    if (loading.submitting || textareaEmpty || profileQuestions.length === 0) return;
    
    const currentQuestion = profileQuestions[currentQuestionIndex];
    const wasAnsweredBefore = isQuestionAnswered(currentQuestion.id);
    
    const success = await submitProfileAnswer(currentQuestion.id, answerText);
    
    if (success && !wasAnsweredBefore) {
      // Pokaż animację nagrody tylko dla nowych odpowiedzi
      setEarnedCredits(currentQuestion.credits_reward);
      setShowReward(true);
      
      setTimeout(() => {
        setShowReward(false);
        
        // Przejdź do następnego pytania, jeśli dostępne
        if (currentQuestionIndex < profileQuestions.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
      }, 2000);
    }
  };
  
  // Obliczenie procentu ukończenia
  const answeredCount = profileQuestions.length > 0 
    ? profileQuestions.filter(q => isQuestionAnswered(q.id)).length 
    : 0;
    
  const completionPercentage = profileQuestions.length > 0
    ? (answeredCount / profileQuestions.length) * 100
    : 0;

  // Pobierz bieżące pytanie
  const currentQuestion = profileQuestions[currentQuestionIndex];
  const isCurrentQuestionAnswered = currentQuestion 
    ? isQuestionAnswered(currentQuestion.id)
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
          Odpowiadaj na pytania, aby lepiej poznać twoją osobowość i zdobyć dodatkowe kredyty
        </p>
      </div>
      
      {/* Progress section */}
      <Card className="bg-indigo-950/40 border-indigo-300/30 mb-8">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-indigo-200">Postęp odpowiedzi</span>
              <span className="text-indigo-100 font-medium">
                {answeredCount} / {profileQuestions.length}
              </span>
            </div>
            <Progress 
              value={completionPercentage} 
              className="h-2 bg-indigo-950"
            />
            <p className="text-indigo-300 text-sm italic">
              {completionPercentage === 100 
                ? "Wszystkie pytania zostały ukończone! Wróć później po więcej." 
                : "Każda odpowiedź przybliża nas do stworzenia jeszcze lepszej przepowiedni dla Ciebie."}
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* Questions area */}
      <AnimatePresence mode="wait">
        {loading.initial || loading.questions ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex justify-center items-center py-20"
          >
            <div className="loader"></div>
          </motion.div>
        ) : profileQuestions.length === 0 ? (
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
                    <Star className="h-4 w-4 text-yellow-300 mr-1" />
                    <span className="text-yellow-200 text-sm">
                      +{currentQuestion?.credits_reward || 0} kredytów
                    </span>
                  </div>
                </div>
                <CardDescription className="text-indigo-200/70">
                  {isCurrentQuestionAnswered 
                    ? "To pytanie zostało już przez Ciebie odpowiedziane"
                    : "Podziel się swoją odpowiedzią, aby otrzymać kredyty"}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-6">
                  <div className="text-lg text-white font-medium">
                    {currentQuestion?.question}
                  </div>
                  
                  <div className="mt-4">
                    <Textarea
                      value={answerText}
                      onChange={(e) => {
                        setAnswerText(e.target.value);
                        setTextareaEmpty(e.target.value.trim() === '');
                      }}
                      placeholder="Wpisz swoją odpowiedź tutaj..."
                      className="bg-indigo-950/50 border-indigo-300/30 text-white min-h-24 placeholder:text-indigo-400/50"
                      disabled={loading.submitting}
                    />
                    
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ 
                        opacity: textareaEmpty ? 1 : 0,
                        height: textareaEmpty ? 'auto' : 0
                      }}
                      className="mt-2 overflow-hidden"
                    >
                      <p className="text-amber-300/80 text-sm">
                        Twoja odpowiedź pomoże nam lepiej dopasować horoskop do Twojej osobowości.
                      </p>
                    </motion.div>
                  </div>
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
                      }
                    }}
                    disabled={currentQuestionIndex === 0 || loading.submitting}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Poprzednie
                  </Button>
                  
                  <div className="flex gap-2">
                    {currentQuestionIndex < profileQuestions.length - 1 && (
                      <Button
                        variant="outline"
                        className="text-indigo-200 border-indigo-300/30"
                        onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                        disabled={loading.submitting}
                      >
                        Następne
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    )}
                    
                    <Button
                      onClick={handleSubmitAnswer}
                      disabled={textareaEmpty || loading.submitting || isCurrentQuestionAnswered}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      {loading.submitting ? (
                        <>Zapisywanie</>
                      ) : isCurrentQuestionAnswered ? (
                        <>Odpowiedziano</>
                      ) : (
                        <>Zapisz odpowiedź</>
                      )}
                    </Button>
                  </div>
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Navigation dots */}
      {profileQuestions.length > 0 && (
        <div className="flex justify-center mt-6 space-x-2">
          {profileQuestions.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentQuestionIndex(idx);
              }}
              className={`w-3 h-3 rounded-full transition-all ${
                idx === currentQuestionIndex
                  ? "bg-indigo-400 scale-125"
                  : isQuestionAnswered(profileQuestions[idx].id)
                  ? "bg-indigo-600"
                  : "bg-indigo-900"
              }`}
              aria-label={`Przejdź do pytania ${idx + 1}`}
            />
          ))}
        </div>
      )}
      
      {/* Reward animation */}
      <AnimatePresence>
        {showReward && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 bg-black/40 backdrop-blur-sm"
          >
            <motion.div
              className="bg-indigo-900/80 backdrop-blur-md border border-indigo-400/40 rounded-xl p-8 text-center shadow-xl"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ 
                scale: 1, 
                opacity: 1,
                y: [0, -10, 0],
              }}
              transition={{ y: { repeat: 3, duration: 0.5 } }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, ease: "linear", repeat: Infinity }}
                className="mx-auto mb-4 bg-indigo-700/50 p-4 rounded-full w-24 h-24 flex items-center justify-center"
              >
                <Award className="h-12 w-12 text-yellow-300" />
              </motion.div>
              <h2 className="text-2xl font-bold text-white mb-2">Dziękujemy!</h2>
              <p className="text-indigo-200 mb-4">Twoja odpowiedź została zapisana</p>
              <div className="text-yellow-300 text-3xl font-bold flex items-center justify-center">
                +{earnedCredits} <Star className="h-5 w-5 ml-2" />
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