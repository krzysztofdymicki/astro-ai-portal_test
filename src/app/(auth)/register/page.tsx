'use client';

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { createClient } from '@/utils/supabase/client'
import { EyeIcon, EyeOffIcon } from 'lucide-react'

export default function Register() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [registered, setRegistered] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{
    email?: boolean;
    password?: boolean;
    confirmPassword?: boolean;
  }>({})
  
  const supabase = createClient()

  const validateForm = () => {
    const errors: {
      email?: boolean;
      password?: boolean;
      confirmPassword?: boolean;
    } = {};
    let isValid = true;
    
    // Walidacja email
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      errors.email = true;
      isValid = false;
      toast.error("Nieprawidłowy adres email");
    }
    
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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true)

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`
        }
      })

      if (error) {
        // Przechwytywanie i tłumaczenie konkretnych komunikatów błędów
        if (error.message.includes('email')) {
          setFieldErrors(prev => ({ ...prev, email: true }));
        } else if (error.message.includes('password')) {
          setFieldErrors(prev => ({ ...prev, password: true }));
        }
        
        toast.error("Błąd rejestracji", {
          description: error.message
        });
        return;
      }

      // Rejestracja udana
      setRegistered(true)
      toast.success("Rejestracja pomyślna", {
        description: "Link aktywacyjny został wysłany na Twój adres email. Sprawdź swoją skrzynkę i kliknij link, aby aktywować konto."
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Wystąpił błąd podczas rejestracji'
      toast.error("Błąd rejestracji", {
        description: errorMessage
      })
    } finally {
      setLoading(false)
    }
  };

  // Funkcja do ponownego wysłania emaila aktywacyjnego
  const handleResendEmail = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });
      
      if (error) {
        // Przechwytywanie i tłumaczenie konkretnych komunikatów błędów
        const securityTimeoutMatch = error.message.match(/for security purposes, you can only request this after (\d+) seconds/i);
        
        if (securityTimeoutMatch && securityTimeoutMatch[1]) {
          const seconds = securityTimeoutMatch[1];
          toast.error("Zbyt częste żądanie", { 
            description: `Ze względów bezpieczeństwa możesz wysłać kolejny link dopiero za ${seconds} sekund.` 
          });
        } else {
          toast.error("Błąd", { description: error.message });
        }
      } else {
        toast.success("Email wysłany ponownie", { 
          description: "Link aktywacyjny został ponownie wysłany na Twój adres email." 
        });
      }
    } catch (err) {
      console.log(err)
      toast.error("Błąd", { description: "Nie udało się ponownie wysłać emaila" });
    } finally {
      setLoading(false);
    }
  };

  if (registered) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h3 className="text-xl text-light">Rejestracja zakończona</h3>
          <p className="text-gray-600 text-light">
            Wysłaliśmy link aktywacyjny na Twój adres email
          </p>
        </div>
        
        <div className="bg-indigo-50/80 rounded-lg p-4 border border-subtle">
          <p className="text-center mb-2 text-light text-gray-700">
            Sprawdź swoją skrzynkę email i kliknij link aktywacyjny, aby aktywować konto.
          </p>
          <p className="text-center text-sm text-gray-500 text-light">
            Jeśli email nie dotarł, sprawdź folder spam lub wyślij go ponownie.
          </p>
        </div>
        
        <div className="flex flex-col gap-2">
          <Button 
            variant="outline" 
            className="w-full btn-secondary"
            onClick={handleResendEmail}
            disabled={loading}
          >
            {loading ? 'Wysyłanie...' : 'Wyślij ponownie link aktywacyjny'}
          </Button>
          
          <Button 
            variant="secondary" 
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
        <h3 className="text-xl text-light text-center">Zarejestruj się</h3>
        <p className="text-gray-600 text-center text-sm text-light">
          Utwórz nowe konto, aby korzystać z pełni możliwości Twojej Przepowiedni
        </p>
      </div>

      <form onSubmit={handleSignUp} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="form-label">Email</Label>
          <Input
            id="email"
            type="email"
            name="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setFieldErrors(prev => ({ ...prev, email: false }));
            }}
            className={`form-input ${fieldErrors.email ? "error" : ""}`}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password" className="form-label">Hasło</Label>
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
          <Label htmlFor="confirmPassword" className="form-label">Potwierdź hasło</Label>
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
          />
        </div>
        
        <div className="mt-6">
          <Button 
            className="w-full btn-primary"
            type="submit" 
            disabled={loading}
          >
            {loading ? 'Tworzenie konta...' : 'Zarejestruj się'}
          </Button>
        </div>
        
        <p className="text-xs text-gray-500 mt-4 text-center text-light">
          Rejestrując się, akceptujesz 
          <span className="pointer-events-none"> 
            <Link href="/regulamin" className="text-indigo-600 hover:underline pointer-events-auto" tabIndex={-1}> regulamin 
            </Link> i <Link href="/polityka-prywatnosci" className="text-indigo-600 hover:underline pointer-events-auto" tabIndex={-1}>
              politykę prywatności
            </Link>
          </span> serwisu Twoja Przepowiednia.
        </p>
        
        <div className="text-center text-sm text-gray-600 mt-4 text-light">
          Masz już konto?{' '}
          <Link href="/login" className="text-indigo-600 hover:underline">
            Zaloguj się
          </Link>
        </div>
      </form>
    </div>
  )
}