'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  User, 
  BarChart, 
  HelpCircle, 
  File, 
  Moon, 
  Star
} from 'lucide-react'; // Zmiana importu na lucide-react
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser } from '@/contexts/UserContext';

export default function Dashboard() {
  const router = useRouter();
  const { profile } = useUser();

  return (
    <div className="space-y-6">
      {/* Główna zawartość - zamieniony nagłówek z personalizacją */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-white mystical-glow">
          Witaj, {profile?.first_name || 'Wędrowcze Gwiazd'}!
        </h1>
        <p className="text-indigo-200 text-light mt-2">
          Twoja osobista przepowiednia czeka na odkrycie
        </p>
      </div>

      {/* Kafelki z funkcjami */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Kafelek profilu */}
        <Card className="bg-indigo-900/40 border-indigo-300/30 text-white shadow-lg hover:shadow-indigo-500/20 transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-indigo-300" /> {/* Zmiana nazwy z UserIcon na User */}
              Twój Profil Astralny
            </CardTitle>
            <CardDescription className="text-indigo-200/70">
              Uzupełnij informacje o sobie, aby otrzymać spersonalizowane horoskopy
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block py-1 px-2 rounded-full bg-indigo-800 text-indigo-200">
                    Status profilu
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block text-indigo-200">
                    {profile?.profile_completion_percentage || 0}%
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-indigo-800/50">
                <div style={{ width: `${profile?.profile_completion_percentage || 0}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500"></div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/dashboard/profile" className="w-full">
              <button className="w-full py-2 px-4 bg-indigo-700 hover:bg-indigo-600 text-white rounded-md transition-colors shadow-lg">
                {profile?.profile_completion_percentage === 100 ? "Edytuj profil" : "Uzupełnij profil"}
              </button>
            </Link>
          </CardFooter>
        </Card>

        {/* Kafelek dodatkowych pytań */}
        <Card className="bg-indigo-900/40 border-indigo-300/30 text-white shadow-lg hover:shadow-indigo-500/20 transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-indigo-300" /> {/* Zmieniono na HelpCircle */}
              Pytania Dodatkowe
            </CardTitle>
            <CardDescription className="text-indigo-200/70">
              Odpowiedz na dodatkowe pytania i zdobądź bonusowe kredyty
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-indigo-200">Dostępne pytania:</span>
                <span className="text-sm font-semibold">5</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-indigo-200">Możliwe do zdobycia kredyty:</span>
                <span className="text-sm font-semibold">25</span>
              </div>
              <div className="p-2 bg-indigo-800/30 rounded text-xs text-indigo-100 italic">
                "Im więcej wiemy o Tobie, tym dokładniejsze są nasze przepowiednie."
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/dashboard/questions" className="w-full">
              <button className="w-full py-2 px-4 bg-indigo-700 hover:bg-indigo-600 text-white rounded-md transition-colors shadow-lg">
                Odpowiedz na pytania
              </button>
            </Link>
          </CardFooter>
        </Card>

        {/* Kafelek horoskopów */}
        <Card className="bg-indigo-900/40 border-indigo-300/30 text-white shadow-lg hover:shadow-indigo-500/20 transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Moon className="h-5 w-5 text-indigo-300" /> {/* Zmieniono na Moon */}
              Twoje Horoskopy
            </CardTitle>
            <CardDescription className="text-indigo-200/70">
              Zobacz swoje horoskopy i spersonalizowane przepowiednie
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-2 bg-indigo-800/30 rounded">
                <span className="flex items-center text-sm">
                  <Star className="h-4 w-4 mr-2 text-yellow-300" /> {/* Zmieniono na Star */}
                  Dzienny
                </span>
                <span className="text-xs text-green-300">Dostępny</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-indigo-800/30 rounded">
                <span className="flex items-center text-sm">
                  <BarChart className="h-4 w-4 mr-2 text-blue-300" /> {/* Zmieniono na BarChart */}
                  Miesięczny
                </span>
                <span className="text-xs text-indigo-200">5 kredytów</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-indigo-800/30 rounded">
                <span className="flex items-center text-sm">
                  <File className="h-4 w-4 mr-2 text-purple-300" /> {/* Zmieniono na File */}
                  Życiowy
                </span>
                <span className="text-xs text-indigo-200">20 kredytów</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/dashboard/horoscopes" className="w-full">
              <button className="w-full py-2 px-4 bg-indigo-700 hover:bg-indigo-600 text-white rounded-md transition-colors shadow-lg">
                Przeglądaj horoskopy
              </button>
            </Link>
          </CardFooter>
        </Card>
      </div>

      {/* Cytat motywacyjny */}
      <div className="mt-10 text-center py-4">
        <p className="text-indigo-200 italic text-light">
          "Gwiazdy nie determinują Twojego przeznaczenia. One jedynie oświetlają ścieżkę, którą możesz podążać."
        </p>
        <p className="text-indigo-300 text-sm mt-1">― Starożytna mądrość astrologiczna</p>
      </div>
    </div>
  );
}