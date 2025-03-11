'use client';

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { createClient } from '@/utils/supabase/client'
import { EyeIcon, EyeOffIcon, KeyIcon, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [resetComplete, setResetComplete] = useState(false)
  const [tokenValid, setTokenValid] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{
    password?: boolean;
    confirmPassword?: boolean;
  }>({})
  
  const supabase = createClient()

  // Sprawdzamy obecność fragmentu hash (#) w URL, który zawiera token
  useEffect(() => {
    // Gdy używamy domyślnego flow Supabase, token pojawia się w URL jako fragment hash
    // np. #access_token=123&type=recovery
    const hash = window.location.hash;
    const isResetPasswordFlow = hash.includes('type=recovery') && hash.includes('access_token');
    
    if (!isResetPasswordFlow) {
      toast.error("Nieprawidłowy link resetowania hasła", {
        description: "Użyj linku otrzymanego w wiadomości email lub poproś o nowy link."
      });
    } else {
      setTokenValid(true);
      
      // Nasłuchiwanie na zdarzenie PASSWORD_RECOVERY z Supabase
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
        if (event === 'PASSWORD_RECOVERY') {
          // Token jest prawidłowy i został zweryfikowany przez Supabase
          setTokenValid(true);
        }
      });
      
      // Czyszczenie subskrypcji przy odmontowaniu
      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  const validateForm = () => {
    const errors: {
      password?: boolean;
      confirmPassword?: boolean;
    } = {};
    let isValid = true;
    
    // Walidacja hasła
    if (!password || password.length < 6) {
      errors.password = true;
      isValid = false;
      toast.error("Hasło musi zawierać co najmniej 6 znaków");
    }
    
    // Sprawdzenie czy hasła są identyczne
    if (password !== confirmPassword) {
      errors.confirmPassword = true;
      isValid = false;
      toast.error("Hasła nie są identyczne");
    }
    
    setFieldErrors(errors);
    return isValid;
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true)

    try {
      // Supabase automatycznie wyciągnie token z URL i zweryfikuje go
      const { error } = await supabase.auth.updateUser({ password })

      if (error) {
        toast.error("Błąd resetowania hasła", {
          description: error.message
        });
        return;
      }

      // Hasło zostało pomyślnie zmienione
      setResetComplete(true)
      toast.success("Hasło zostało zmienione", {
        description: "Możesz teraz zalogować się używając nowego hasła."
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Wystąpił błąd podczas resetowania hasła'
      toast.error("Błąd resetowania hasła", {
        description: errorMessage
      })
    } finally {
      setLoading(false)
    }
  };

  if (resetComplete) {
    return (
      <Card className="w-full max-w-md mx-auto mt-8 bg-indigo-900/40 border-indigo-300/30 text-white">
        <CardHeader className="text-center">
          <div className="mx-auto bg-green-500/20 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-400" />
          </div>
          <CardTitle className="text-xl text-light">Hasło zostało zmienione</CardTitle>
          <CardDescription className="text-indigo-200/70">
            Twoje hasło zostało pomyślnie zaktualizowane
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="bg-indigo-800/30 rounded-lg p-4 border border-indigo-300/20">
            <p className="text-center mb-2 text-light text-indigo-100">
              Możesz teraz zalogować się do swojego konta używając nowego hasła.
            </p>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-center pb-6">
          <Button 
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white"
            onClick={() => router.push('/login')}
          >
            Przejdź do logowania
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto mt-8 bg-indigo-900/40 border-indigo-300/30 text-white">
      <CardHeader className="text-center">
        <div className="mx-auto bg-indigo-600/20 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
          <KeyIcon className="h-8 w-8 text-indigo-400" />
        </div>
        <CardTitle className="text-xl text-light">Ustaw nowe hasło</CardTitle>
        <CardDescription className="text-indigo-200/70">
          Wprowadź nowe hasło, które chcesz używać do logowania
        </CardDescription>
      </CardHeader>

      <CardContent>
        {!tokenValid ? (
          <div className="bg-red-900/20 p-4 rounded-md border border-red-500/30 text-center">
            <p className="text-red-200">
              Nieprawidłowy lub wygasły link resetowania hasła. Użyj linku z emaila lub poproś o nowy.
            </p>
            <Button 
              variant="outline" 
              className="mt-4 bg-transparent border-red-500/30 text-red-200 hover:bg-red-800/20"
              onClick={() => router.push('/login')}
            >
              Wróć do logowania
            </Button>
          </div>
        ) : (
          <form 
            onSubmit={handleResetPassword} 
            className="space-y-4"
            data-testid="reset-password-form"
          >
            <div className="space-y-2">
              <Label htmlFor="password" className="text-indigo-100">Nowe hasło</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setFieldErrors(prev => ({ ...prev, password: false }));
                  }}
                  className={`bg-indigo-950/50 border-indigo-300/30 text-white ${fieldErrors.password ? "border-red-500" : ""}`}
                  required
                  data-testid="password-input"
                />
                <button 
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-indigo-400 hover:text-indigo-300"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  aria-label={showPassword ? "Ukryj hasło" : "Pokaż hasło"}
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              <p className="text-xs text-indigo-300">Hasło musi zawierać co najmniej 6 znaków</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-indigo-100">Potwierdź nowe hasło</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setFieldErrors(prev => ({ ...prev, confirmPassword: false }));
                }}
                className={`bg-indigo-950/50 border-indigo-300/30 text-white ${fieldErrors.confirmPassword ? "border-red-500" : ""}`}
                required
                data-testid="confirm-password-input"
              />
            </div>
            
            <Button 
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white mt-6"
              type="submit" 
              disabled={loading}
            >
              {loading ? 'Aktualizowanie hasła...' : 'Ustaw nowe hasło'}
            </Button>
          </form>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-center text-center">
        <div className="text-sm text-indigo-200">
          Pamiętasz swoje hasło?{' '}
          <Link href="/login" className="text-indigo-400 hover:underline">
            Zaloguj się
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}