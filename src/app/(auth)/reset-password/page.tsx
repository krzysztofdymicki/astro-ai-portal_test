'use client';

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { createClient } from '@/utils/supabase/client'
import { EyeIcon, EyeOffIcon } from 'lucide-react'

export default function ResetPassword() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [resetComplete, setResetComplete] = useState(false)
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
    const isResetPasswordFlow = hash.includes('type=recovery');
    
    if (!isResetPasswordFlow) {
      toast.error("Nieprawidłowy link resetowania hasła", {
        description: "Użyj linku otrzymanego w wiadomości email lub poproś o nowy link."
      });
    }
  // No need to add supabase.auth as a dependency since we're not using it in this effect
  // This comment tells ESLint to ignore the missing dependency warning
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
      // Fixed: Don't destructure data if we don't use it
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
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h3 className="text-xl text-light">Hasło zostało zmienione</h3>
          <p className="text-gray-600 text-light">
            Twoje hasło zostało pomyślnie zaktualizowane
          </p>
        </div>
        
        <div className="bg-indigo-50/80 rounded-lg p-4 border border-subtle">
          <p className="text-center mb-2 text-light text-gray-700">
            Możesz teraz zalogować się do swojego konta używając nowego hasła.
          </p>
        </div>
        
        <div className="flex flex-col gap-2">
          <Button 
            className="w-full btn-primary"
            onClick={() => router.push('/login')}
          >
            Przejdź do logowania
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-xl text-light text-center">Ustaw nowe hasło</h3>
        <p className="text-gray-600 text-center text-sm text-light">
          Wprowadź nowe hasło, które chcesz używać do logowania
        </p>
      </div>

      <form 
        onSubmit={handleResetPassword} 
        className="space-y-4"
        data-testid="reset-password-form"
      >
        <div className="space-y-2">
          <Label htmlFor="password" className="form-label">Nowe hasło</Label>
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
              className={`form-input pr-10 ${fieldErrors.password ? "error" : ""}`}
              required
              data-testid="password-input"
            />
            <button 
              type="button"
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1} // Pomijanie podczas nawigacji tabem
              aria-label={showPassword ? "Ukryj hasło" : "Pokaż hasło"}
            >
              {showPassword ? (
                <EyeOffIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 text-light">Hasło musi zawierać co najmniej 6 znaków</p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="form-label">Potwierdź nowe hasło</Label>
          <Input
            id="confirmPassword"
            type={showPassword ? "text" : "password"}
            name="confirmPassword"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setFieldErrors(prev => ({ ...prev, confirmPassword: false }));
            }}
            className={`form-input ${fieldErrors.confirmPassword ? "error" : ""}`}
            required
            data-testid="confirm-password-input"
          />
        </div>
        
        <div className="mt-6">
          <Button 
            className="w-full btn-primary"
            type="submit" 
            disabled={loading}
          >
            {loading ? 'Aktualizowanie hasła...' : 'Ustaw nowe hasło'}
          </Button>
        </div>
        
        <div className="text-center text-sm text-gray-600 mt-4 text-light">
          Pamiętasz swoje hasło?{' '}
          <Link href="/login" className="text-indigo-600 hover:underline">
            Zaloguj się
          </Link>
        </div>
      </form>
    </div>
  )
}