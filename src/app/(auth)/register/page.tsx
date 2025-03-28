'use client';

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { createClient } from '@/utils/supabase/client'
import { FormInput } from '@/components/ui/FormInput'
import { BasicForm } from '@/components/ui/BasicForm'

export default function Register() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [registered, setRegistered] = useState(false)
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
            className="w-full text-indigo-700 border-indigo-300 hover:bg-indigo-100/50 mb-2"
            onClick={handleResendEmail}
            disabled={loading}
          >
            {loading ? 'Wysyłanie...' : 'Wyślij ponownie link aktywacyjny'}
          </Button>
            
          <Button 
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white"
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

      <BasicForm 
        onSubmit={handleSignUp}
        ariaLabel="register-form"
        submitText="Zarejestruj się"
        isLoading={loading}
        footerContent={
          <>
            <p className="text-xs text-gray-500 mb-4 text-light">
              Rejestrując się, akceptujesz 
              <span className="pointer-events-none"> 
                <Link href="/regulamin" className="text-indigo-600 hover:underline pointer-events-auto" tabIndex={-1}> regulamin 
                </Link> i <Link href="/polityka-prywatnosci" className="text-indigo-600 hover:underline pointer-events-auto" tabIndex={-1}>
                  politykę prywatności
                </Link>
              </span> serwisu Twoja Przepowiednia.
            </p>
            <div>
              Masz już konto?{' '}
              <Link href="/login" className="text-indigo-600 hover:underline">
                Zaloguj się
              </Link>
            </div>
          </>
        }
      >
        <FormInput
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setFieldErrors(prev => ({ ...prev, email: false }));
          }}
          error={fieldErrors.email}
          required
          testId="email-input"
        />
        
        <FormInput
          id="password"
          label="Hasło"
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setFieldErrors(prev => ({ ...prev, password: false }));
          }}
          error={fieldErrors.password}
          required
          testId="password-input"
          showPasswordToggle
          actionElement={
            <p className="text-xs text-gray-500 text-light">Minimum 6 znaków</p>
          }
        />
        
        <FormInput
          id="confirmPassword"
          label="Potwierdź hasło"
          type="password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            setFieldErrors(prev => ({ ...prev, confirmPassword: false }));
          }}
          error={fieldErrors.confirmPassword}
          required
          testId="confirm-password-input"
          showPasswordToggle
        />
      </BasicForm>
    </div>
  )
}