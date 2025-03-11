'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  User, 
  CreditCard, 
  Settings, 
  HelpCircle, 
  LogOut
} from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserProvider, useUser } from '@/contexts/UserContext';
import LoadingScreen from '@/components/ui/loading-screen';
import DebugContextPanel from '@/components/debug/DebugContextPanel';

// DashboardHeader - komponent zawierający header z menu użytkownika
function DashboardHeader() {
  const router = useRouter();
  const supabase = createClient();
  const { loading, userName, userInitials, userEmail, credits } = useUser();

  // Obsługa wylogowania
  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error("Błąd wylogowania", {
          description: error.message
        });
      } else {
        toast.success("Wylogowano pomyślnie");
        router.push('/');
      }
    } catch (error) {
      console.error(error);
      toast.error("Wystąpił nieoczekiwany błąd");
    }
  };

  return (
    <header className="bg-indigo-900/70 backdrop-blur-sm shadow-md z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-2xl text-white text-light mystical-glow">Twoja Przepowiednia</span>
          </div>
          <div className="flex items-center gap-4">
            {/* Dropdown menu użytkownika */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="relative h-10 w-10 rounded-full border border-indigo-300/50 bg-indigo-800/40 hover:bg-indigo-800/60"
                  data-testid="user-avatar-button"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="/api/avatar" alt={userName} />
                    <AvatarFallback className="bg-indigo-600 text-white">{userInitials}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 mt-1 border-indigo-300/50 bg-indigo-900/95 text-white backdrop-blur-sm" align="end">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{userName}</p>
                    <p className="text-xs leading-none text-indigo-300">{userEmail}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-indigo-700/50" />
                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer hover:bg-indigo-800/80">
                  <CreditCard className="h-4 w-4 text-indigo-300" />
                  <span>Kredyty:</span>
                  <span className="ml-auto font-bold">{credits?.balance || 0}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-indigo-700/50" />
                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer hover:bg-indigo-800/80" asChild>
                  <Link href="/dashboard/profile">
                    <User className="h-4 w-4 text-indigo-300" />
                    <span>Mój profil</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer hover:bg-indigo-800/80">
                  <Settings className="h-4 w-4 text-indigo-300" />
                  <span>Ustawienia</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer hover:bg-indigo-800/80">
                  <HelpCircle className="h-4 w-4 text-indigo-300" />
                  <span>Pomoc</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-indigo-700/50" />
                <DropdownMenuItem 
                  className="flex items-center gap-2 cursor-pointer text-red-300 hover:bg-red-900/30 hover:text-red-200"
                  onClick={handleSignOut}
                  disabled={loading.initial}
                  data-testid="logout-button"
                >
                  <LogOut className="h-4 w-4" />
                  <span>{loading.initial ? "Wylogowywanie..." : "Wyloguj się"}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}

// Layout dashboardu, który opakowuje wszystkie podstrony w sekcji dashboard
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <UserProvider>
      <DashboardContent>{children}</DashboardContent>
    </UserProvider>
  );
}

// Komponent wewnętrzny, który będzie miał dostęp do UserProvider
function DashboardContent({ children }: { children: React.ReactNode }) {
  const { loading } = useUser();
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Ekran ładowania - pokazywany tylko przy początkowym ładowaniu danych */}
      <LoadingScreen show={loading.initial} minDuration={1500} />
      
      <DashboardHeader />
      
      <main className="flex-grow p-4 sm:p-6 bg-gradient-to-b from-indigo-950/20 to-indigo-900/10">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      <footer className="relative z-10 mt-auto">
        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(10,5,25,0.3)] to-[rgba(10,5,25,0.6)] backdrop-blur-[2px]"></div>
        
        <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-indigo-200/70 text-light">
            &copy; {new Date().getFullYear()} Twoja Przepowiednia. Wszystkie prawa zastrzeżone.
          </p>
        </div>
      </footer>
      
      {/* Panel debugowania kontekstu */}
      <DebugContextPanel />
    </div>
  );
}