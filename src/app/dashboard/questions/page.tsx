'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  Star, 
  Award, 
  ArrowRight, 
  HelpCircle, 
  CheckCircle2,
  Loader2
} from 'lucide-react';
import Link from 'next/link';

export default function QuestionsPage() {
  const { 
    profileQuestions, 
    credits, 
    loading, 
    questionsStats, 
    submitProfileAnswer, 
    isQuestionAnswered, 
    getQuestionAnswer,
    zodiacSign
  } = useUser();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answerText, setAnswerText] = useState('');
  const [textareaEmpty, setTextareaEmpty] = useState(true);
  const [showReward, setShowReward] = useState(false);
  const [earnedCredits, setEarnedCredits] = useState(0);
  const [isEditing, setIsEditing] = useState(false);

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
      
      // Reset stanu edycji przy zmianie pytania
      setIsEditing(false);
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
        
        <div className="flex items-center gap-4">
          {/* Znak zodiaku użytkownika - używa description z ZodiacInfo */}
          {zodiacSign && (
            <div className="flex items-center bg-indigo-900/60 px-4 py-2 rounded-full">
              <span className="text-xl mr-2">{zodiacSign.symbol}</span>
              <span className="text-white font-medium">{zodiacSign.name}</span>
            </div>
          )}
          
          {/* Kredyty */}
          <div className="flex items-center bg-indigo-900/60 px-4 py-2 rounded-full">
            <Star className="h-5 w-5 text-yellow-300 mr-2" />
            <span className="text-white font-medium">Kredyty: {credits?.balance || 0}</span>
          </div>
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
                {questionsStats.answeredQuestions} / {questionsStats.totalQuestions}
              </span>
            </div>
            <Progress 
              value={questionsStats.completionPercentage} 
              className="h-2 bg-indigo-950"
            />
            <p className="text-indigo-300 text-sm italic">
              {questionsStats.completionPercentage === 100 
                ? "Wszystkie pytania zostały ukończone! Wróć później po więcej." 
                : "Odpowiedz na wszystkie pytania, aby zdobyć maksymalną liczbę kredytów."}
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* Questions area */}
      <AnimatePresence mode="wait">
        {loading.questions ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex justify-center items-center py-20"
          >
            <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
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
                    ? "To pytanie zostało już przez Ciebie rozwiązane"
                    : "Odpowiedz na pytanie, aby otrzymać kredyty"}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-6">
                  <div className="text-lg text-white font-medium">
                    {currentQuestion?.question}
                  </div>
                  
                  <div className="pt-2">
                    <Textarea
                      value={answerText}
                      onChange={(e) => {
                        setAnswerText(e.target.value);
                        setTextareaEmpty(e.target.value.trim() === '');
                      }}
                      placeholder="Wpisz swoją odpowiedź tutaj..."
                      className="min-h-[120px] bg-indigo-950/50 border-indigo-300/30 text-white"
                      disabled={loading.submitting || (isCurrentQuestionAnswered && !isEditing)}
                    />
                  </div>

                  {isCurrentQuestionAnswered && !isEditing && (
                    <div className="flex items-center text-emerald-400 bg-emerald-950/30 p-3 rounded-md">
                      <CheckCircle2 className="h-5 w-5 mr-2" />
                      <span>Dziękujemy za odpowiedź! Twoje kredyty zostały już przyznane.</span>
                    </div>
                  )}
                </div>
              </CardContent>
              
              <CardFooter>
                {/* Układ przycisków z dostosowaniem do małych ekranów - dwie linie */}
                <div className="w-full flex flex-col space-y-3">
                  {/* Górna linia - przycisk Edytuj/Zapisz */}
                  <div className="flex justify-center">
                    {isCurrentQuestionAnswered && !isEditing ? (
                      <Button
                        variant="outline"
                        className="bg-indigo-800/30 text-indigo-100 border-indigo-500/30 w-full sm:w-auto"
                        onClick={() => setIsEditing(true)}
                      >
                        Edytuj odpowiedź
                      </Button>
                    ) : (
                      <Button
                        onClick={handleSubmitAnswer}
                        disabled={loading.submitting || textareaEmpty}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white w-full sm:w-auto"
                      >
                        {loading.submitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Zapisywanie...
                          </>
                        ) : (
                          <>Zapisz odpowiedź</>
                        )}
                      </Button>
                    )}
                  </div>
                  
                  {/* Dolna linia - przyciski nawigacji */}
                  <div className="flex justify-between">
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
                    
                    <Button
                      variant="ghost"
                      className="text-indigo-300 hover:text-indigo-100 hover:bg-indigo-800/50"
                      onClick={() => {
                        if (currentQuestionIndex < profileQuestions.length - 1) {
                          setCurrentQuestionIndex(currentQuestionIndex + 1);
                        }
                      }}
                      disabled={currentQuestionIndex === profileQuestions.length - 1 || loading.submitting}
                    >
                      Następne
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Question navigation dots */}
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
                  ? "bg-emerald-600"
                  : "bg-indigo-900"
              }`}
              aria-label={`Question ${idx + 1}`}
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
              <p className="text-indigo-200 mb-4">Twoja odpowiedź została zapisana!</p>
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
      `}</style>
    </div>
  );
}