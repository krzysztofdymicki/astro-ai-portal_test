'use client';

import Link from 'next/link';
import { 
  User, 
  BarChart, 
  HelpCircle, 
  File, 
  Moon, 
  Star,
  CheckCircle,
  Award
} from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { Badge } from '@/components/ui/badge';
import { DashboardCard } from '@/components/ui/dashboard/DashboardCard';
import { getElementDescription } from '@/data/zodiac';

export default function Dashboard() {
  const { profile, questionsStats, credits, zodiacSign } = useUser();

  // Sprawdź, czy wszystkie pytania zostały odpowiedziane
  const allQuestionsAnswered = questionsStats.answeredQuestions === questionsStats.totalQuestions && questionsStats.totalQuestions > 0;

  return (
    <div className="space-y-6" data-testid="dashboard-container">
      {/* Główna zawartość - zamieniony nagłówek z personalizacją */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-white mystical-glow" data-testid="welcome-heading">
          Witaj, {profile?.first_name || 'Wędrowcze Gwiazd'}!
        </h1>
        <p className="text-indigo-200 text-light mt-2" data-testid="welcome-subheading">
          Twoja osobista przepowiednia czeka na odkrycie
        </p>
      </div>

      {/* Kafelki z funkcjami - zastosowanie grid z równymi wysokościami */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" data-testid="dashboard-cards-grid">
        {/* Kafelek profilu - z dodatkowymi informacjami o znaku zodiaku */}
        <DashboardCard
          title="Twój Profil Astralny"
          description="Uzupełnij informacje o sobie, aby otrzymać spersonalizowane horoskopy"
          icon={<User className="h-5 w-5 text-indigo-600" />}
          linkHref="/dashboard/profile"
          linkText={profile?.profile_completion_percentage === 100 ? "Edytuj profil" : "Uzupełnij profil"}
          testId="profile-card"
        >
          <div className="space-y-4">
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block py-1 px-2 rounded-full bg-indigo-100 text-indigo-700">
                    Status profilu
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block text-gray-600" data-testid="profile-completion-percentage">
                    {profile?.profile_completion_percentage || 0}%
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-1 text-xs flex rounded bg-indigo-100">
                <div 
                  style={{ width: `${profile?.profile_completion_percentage || 0}%` }} 
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-600"
                  data-testid="profile-progress-bar"
                ></div>
              </div>
            </div>

            {/* Informacje o znaku zodiaku */}
            {zodiacSign && (
              <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-2">{zodiacSign.symbol}</span>
                  <div>
                    <h4 className="font-medium text-gray-800">{zodiacSign.name}</h4>
                    <div className="flex items-center mt-1">
                      <Badge className="bg-indigo-100 text-indigo-700 text-xs">
                        {zodiacSign.element}
                      </Badge>
                      <span className="text-xs text-gray-600 ml-2">
                        {getElementDescription(zodiacSign.element)}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-600 italic">
                  {zodiacSign.description}
                </p>
              </div>
            )}
            
            {!zodiacSign && (
              <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                <div className="flex items-center justify-center">
                  <Moon className="h-5 w-5 text-indigo-600 mr-2" />
                  <p className="text-sm text-gray-600">
                    Uzupełnij datę urodzenia, aby odkryć swój znak zodiaku
                  </p>
                </div>
              </div>
            )}
          </div>
        </DashboardCard>

        {/* Kafelek dodatkowych pytań */}
        <DashboardCard
          title={allQuestionsAnswered ? "Pytania Ukończone" : "Pytania Dodatkowe"}
          description={allQuestionsAnswered 
            ? "Dziękujemy za odpowiedzi! Pomogły nam stworzyć lepszy horoskop dla Ciebie" 
            : "Odpowiedz na dodatkowe pytania i zdobądź bonusowe kredyty"}
          icon={allQuestionsAnswered 
            ? <CheckCircle className="h-5 w-5 text-green-600" /> 
            : <HelpCircle className="h-5 w-5 text-indigo-600" />}
          linkHref="/dashboard/questions"
          linkText={allQuestionsAnswered ? "Przeglądaj odpowiedzi" : "Odpowiedz na pytania"}
          variant={allQuestionsAnswered ? "success" : "default"}
          buttonVariant={allQuestionsAnswered ? "success" : "primary"}
          testId="questions-card"
        >
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Pytania, na które udzielono odpowiedź:</span>
              <span className="text-sm font-semibold text-gray-700">
                {questionsStats.answeredQuestions} / {questionsStats.totalQuestions}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Zdobyte kredyty:</span>
              <div className="flex items-center">
                <span className="text-sm font-semibold text-gray-700 mr-1">{questionsStats.earnedCredits}</span>
                <Star className="h-3 w-3 text-amber-500" />
              </div>
            </div>
            {!allQuestionsAnswered && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Pozostałe do zdobycia:</span>
                <div className="flex items-center">
                  <span className="text-sm font-semibold text-gray-700 mr-1">{questionsStats.remainingCredits}</span>
                  <Star className="h-3 w-3 text-amber-500" />
                </div>
              </div>
            )}
            
            <div className={`p-3 rounded text-xs italic ${
              allQuestionsAnswered 
                ? 'bg-green-50 text-green-700 border border-green-100' 
                : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
            }`}>
              {allQuestionsAnswered 
                ? "Osiągnąłeś maksimum kredytów z pytań! Twój horoskop będzie bardzo dokładny."
                : "Im więcej wiemy o Tobie, tym dokładniejsze są nasze przepowiednie."}
            </div>
          </div>
        </DashboardCard>

        {/* Kafelek horoskopów */}
        <DashboardCard
          title="Twoje Horoskopy"
          description="Zobacz swoje horoskopy i spersonalizowane przepowiednie"
          icon={<Moon className="h-5 w-5 text-indigo-600" />}
          linkHref="/dashboard/horoscopes"
          linkText="Przeglądaj horoskopy"
          testId="horoscopes-card"
        >
          <div className="space-y-3">
            <div className="flex justify-between items-center p-2 bg-indigo-50 rounded border border-indigo-100">
              <span className="flex items-center text-sm text-gray-700">
                <Star className="h-4 w-4 mr-2 text-amber-500" />
                Dzienny
              </span>
              <span className="text-xs text-green-600 font-medium">Dostępny</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-indigo-50 rounded border border-indigo-100">
              <span className="flex items-center text-sm text-gray-700">
                <BarChart className="h-4 w-4 mr-2 text-blue-500" />
                Miesięczny
              </span>
              <div className="flex items-center">
                <span className="text-xs text-gray-600 mr-1">5</span>
                <Star className="h-3 w-3 text-amber-500" />
              </div>
            </div>
            <div className="flex justify-between items-center p-2 bg-indigo-50 rounded border border-indigo-100">
              <span className="flex items-center text-sm text-gray-700">
                <File className="h-4 w-4 mr-2 text-purple-500" />
                Życiowy
              </span>
              <div className="flex items-center">
                <span className="text-xs text-gray-600 mr-1">20</span>
                <Star className="h-3 w-3 text-amber-500" />
              </div>
            </div>
            <div className="p-2 rounded text-xs text-gray-600">
              <div className="flex items-center mb-1">
                <Award className="h-4 w-4 text-amber-500 mr-1" />
                <span className="font-medium text-gray-700">Twoje kredyty: {credits?.balance || 0}</span>
              </div>
              <p className="text-xs text-gray-500 pl-5">
                Użyj kredytów, aby odblokować specjalne horoskopy
              </p>
            </div>
          </div>
        </DashboardCard>
      </div>

      {/* Cytat motywacyjny - fixed quotes - REVERTED TO ORIGINAL STYLE */}
      <div className="mt-10 text-center py-4" data-testid="quote-container">
        <p className="text-indigo-200 italic text-light" data-testid="quote-text">
          &ldquo;Gwiazdy nie determinują Twojego przeznaczenia. One jedynie oświetlają ścieżkę, którą możesz podążać.&rdquo;
        </p>
        <p className="text-indigo-300 text-sm mt-1" data-testid="quote-author">― Starożytna mądrość astrologiczna</p>
      </div>
    </div>
  );
}