'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft, 
  ArrowRight,
  Star,
  Loader2
} from 'lucide-react';

interface QuestionProps {
  question: {
    id: string;
    question: string;
    credits_reward: number;
  };
  index: number;
  totalQuestions: number;
  answerText: string;
  isAnswered: boolean;
  isEditing: boolean;
  isLoading: boolean;
  onTextChange: (text: string) => void;
  onSubmit: () => void;
  onEditToggle: () => void;
  onPrevious: () => void;
  onNext: () => void;
}

export default function Question({
  question,
  index,
  totalQuestions,
  answerText,
  isAnswered,
  isEditing,
  isLoading,
  onTextChange,
  onSubmit,
  onEditToggle,
  onPrevious,
  onNext
}: QuestionProps) {
  const [textareaEmpty, setTextareaEmpty] = useState(answerText.trim() === '');

  useEffect(() => {
    setTextareaEmpty(answerText.trim() === '');
  }, [answerText]);

  return (
    <div className="card-mystical p-6 sm:p-8">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-xl text-foreground">Pytanie {index + 1}</h3>
          {/* Only show credit reward for unanswered questions */}
          {!isAnswered && (
            <div className="flex items-center px-3 py-1.5 rounded-full border bg-amber-50/20 border-amber-200/30 dark:bg-amber-950/40 dark:border-amber-800/30">
              <Star className="h-4 w-4 mr-1.5 text-amber-400" />
              <span className="text-sm font-medium text-amber-600 dark:text-amber-300">
                +{question?.credits_reward || 0} kredytów
              </span>
            </div>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {isAnswered 
            ? "Odpowiedź na to pytanie została już udzielona"
            : "Odpowiedz na pytanie, aby otrzymać kredyty"}
        </p>
      </div>
      
      <div className="space-y-6">
        <div className="text-lg font-medium">
          {question?.question}
        </div>
        
        <div className="pt-2">
          <Textarea
            value={answerText}
            onChange={(e) => {
              onTextChange(e.target.value);
            }}
            placeholder="Wpisz swoją odpowiedź tutaj..."
            className="min-h-[120px] bg-white dark:bg-slate-800 border-input text-foreground"
            disabled={isLoading || (isAnswered && !isEditing)}
          />
        </div>
        
        {/* Removed the "credits already awarded" message */}
      </div>
      
      {/* Przyciski */}
      <div className="mt-6 w-full flex flex-col space-y-4">
        {/* Górna linia - przycisk Edytuj/Zapisz */}
        <div className="flex justify-center">
          {isAnswered && !isEditing ? (
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={onEditToggle}
            >
              Edytuj odpowiedź
            </Button>
          ) : (
            <Button
              onClick={onSubmit}
              disabled={isLoading || textareaEmpty}
              className="w-full sm:w-auto"
            >
              {isLoading ? (
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
    variant="outline"
    onClick={onPrevious}
    disabled={index === 0 || isLoading}
    className="text-white bg-indigo-700/40 border border-indigo-500/50 hover:text-white hover:bg-indigo-700/60 hover:border-indigo-500/70"
  >
    <ArrowLeft className="h-4 w-4 mr-2" />
    Poprzednie
  </Button>
  
  <Button
    variant="outline"
    onClick={onNext}
    disabled={index === totalQuestions - 1 || isLoading}
    className="text-white bg-indigo-700/40 border border-indigo-500/50 hover:text-white hover:bg-indigo-700/60 hover:border-indigo-500/70"
  >
    Następne
    <ArrowRight className="h-4 w-4 ml-2" />
  </Button>
</div>
      </div>
    </div>
  );
}