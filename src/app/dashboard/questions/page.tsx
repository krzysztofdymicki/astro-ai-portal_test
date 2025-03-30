'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useUser } from '@/contexts/UserContext';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  Star, 
  Award, 
  HelpCircle, 
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import Question from '@/components/ui/questions/Question';

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
      
      setIsEditing(false);
    }
  }, [currentQuestionIndex, profileQuestions, getQuestionAnswer]);

  const handleSubmitAnswer = async () => {
    if (loading.submitting || textareaEmpty || profileQuestions.length === 0) return;
    
    const currentQuestion = profileQuestions[currentQuestionIndex];
    const wasAnsweredBefore = isQuestionAnswered(currentQuestion.id);
    
    const success = await submitProfileAnswer(currentQuestion.id, answerText);
    
    if (success && !wasAnsweredBefore) {
      setEarnedCredits(currentQuestion.credits_reward);
      setShowReward(true);
      
      setTimeout(() => {
        setShowReward(false);
        
        if (currentQuestionIndex < profileQuestions.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
      }, 2000);
    }
  };

  const currentQuestion = profileQuestions[currentQuestionIndex];
  const isCurrentQuestionAnswered = currentQuestion 
    ? isQuestionAnswered(currentQuestion.id)
    : false;

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-3xl space-y-6">
        {/* Header section */}
        <div className="flex items-center mb-4">
          <Link href="/dashboard" className="text-indigo-300 hover:text-indigo-200 mr-4">
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Powrót</span>
          </Link>
          <h1 className="text-2xl font-bold text-white" data-testid="questions-title">Pytania Dodatkowe</h1>
        </div>
        
        <div className="space-y-6">
          {/* Main page description */}
          <div className="space-y-2">
            <p className="text-indigo-200" data-testid="questions-subheading">
              Odpowiadaj na pytania, aby lepiej poznać twoją osobowość i zdobyć dodatkowe kredyty
            </p>
          </div>
          
          {/* Progress section */}
          <div className="mt-8 card-mystical p-6 sm:p-8">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-foreground">Postęp odpowiedzi</span>
                <span className="text-foreground font-medium">
                  {questionsStats.answeredQuestions} / {questionsStats.totalQuestions}
                </span>
              </div>
              <Progress 
                value={questionsStats.completionPercentage} 
                className="h-2 bg-indigo-950"
              />
              <p className="text-sm text-muted-foreground italic">
                {questionsStats.completionPercentage === 100 
                  ? "Wszystkie pytania zostały ukończone! Wróć później po więcej." 
                  : "Odpowiedz na wszystkie pytania, aby zdobyć maksymalną liczbę kredytów."}
              </p>
            </div>
          </div>
          
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
                transition={{ 
                  duration: 0.3,
                  ease: "easeInOut"  // Added easing for smoother transitions
                }}
              >
                <Question 
                  question={currentQuestion}
                  index={currentQuestionIndex}
                  totalQuestions={profileQuestions.length}
                  answerText={answerText}
                  isAnswered={isCurrentQuestionAnswered}
                  isEditing={isEditing}
                  isLoading={loading.submitting}
                  onTextChange={(text) => {
                    setAnswerText(text);
                    setTextareaEmpty(text.trim() === '');
                  }}
                  onSubmit={handleSubmitAnswer}
                  onEditToggle={() => setIsEditing(true)}
                  onPrevious={() => {
                    if (currentQuestionIndex > 0) {
                      setCurrentQuestionIndex(currentQuestionIndex - 1);
                    }
                  }}
                  onNext={() => {
                    if (currentQuestionIndex < profileQuestions.length - 1) {
                      setCurrentQuestionIndex(currentQuestionIndex + 1);
                    }
                  }}
                />
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
          
          {/* Credits and zodiac info */}
          <div className="flex flex-wrap justify-center gap-4 mt-6">
            {zodiacSign && (
              <div className="flex items-center bg-indigo-900/60 px-4 py-2 rounded-full">
                <span className="text-xl mr-2">{zodiacSign.symbol}</span>
                <span className="text-white font-medium">{zodiacSign.name}</span>
              </div>
            )}
            
            <div className="flex items-center bg-indigo-900/60 px-4 py-2 rounded-full">
              <Star className="h-5 w-5 text-yellow-300 mr-2" />
              <span className="text-white font-medium">Kredyty: {credits?.balance || 0}</span>
            </div>
          </div>
        </div>
      </div>
      
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
              className="card-mystical p-8 text-center shadow-xl"
              animate={{ y: [0, -10, 0], transition: { repeat: 3, duration: 0.5 } }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, ease: "linear", repeat: Infinity }}
                className="mx-auto mb-4 bg-indigo-700/50 p-4 rounded-full w-24 h-24 flex items-center justify-center"
              >
                <Award className="h-12 w-12 text-yellow-300" />
              </motion.div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Brawo!</h2>
              <p className="text-muted-foreground mb-4">Twoja odpowiedź została zapisana!</p>
              <div className="text-yellow-300 text-3xl font-bold flex items-center justify-center">
                +{earnedCredits} <Star className="h-5 w-5 ml-2" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}