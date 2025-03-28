'use client';

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { createClient } from '@/utils/supabase/client'
import { FormInput } from '@/components/ui/FormInput'
import { validateLoginForm, LoginFormErrors } from '@/utils/validation'
import { BasicForm } from '@/components/ui/BasicForm'

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<LoginFormErrors>({})
  
  const supabase = createClient()

  const validateForm = () => {
    const { isValid, errors } = validateLoginForm(email, password);
    setFieldErrors(errors);
    return isValid;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        // Dostosowanie komunikatu błędu
        if (error.message.includes('Invalid login credentials')) {
          toast.error("Błąd logowania", {
            description: "Nieprawidłowy email lub hasło. Spróbuj ponownie."
          });
        } else {
          toast.error("Błąd logowania", {
            description: error.message
          });
        }
        return;
      }

      // Logowanie pomyślne - przekierowanie do panelu
      toast.success("Zalogowano pomyślnie", {
        description: "Witamy z powrotem!"
      })
      router.push('/dashboard')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Wystąpił błąd podczas logowania'
      toast.error("Błąd logowania", {
        description: errorMessage
      })
    } finally {
      setLoading(false)
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      toast.error("Wprowadź adres email", {
        description: "Aby zresetować hasło, wprowadź swój adres email w polu powyżej."
      });
      setFieldErrors(prev => ({ ...prev, email: true }));
      return;
    }
    
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login/reset-password`,
      });
      
      if (error) {
        toast.error("Błąd", { description: error.message });
      } else {
        toast.success("Link do resetowania hasła wysłany", { 
          description: "Sprawdź swoją skrzynkę email, aby zresetować hasło." 
        });
      }
    } catch (err) {
      console.log(err)
      toast.error("Błąd", { description: "Nie udało się wysłać linku do resetowania hasła" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-xl text-light text-center">Zaloguj się</h3>
        <p className="text-gray-600 text-center text-sm text-light">
          Wprowadź swoje dane, aby zalogować się do portalu Twoja Przepowiednia
        </p>
      </div>

      <BasicForm 
        onSubmit={handleSignIn}
        ariaLabel="login-form"
        submitText="Zaloguj się"
        isLoading={loading}
        footerContent={
          <>
            Nie masz jeszcze konta?{' '}
            <Link href="/register" className="text-indigo-600 hover:underline">
              Zarejestruj się
            </Link>
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
            <button 
              type="button" 
              onClick={handleResetPassword}
              className="text-xs text-indigo-600 hover:text-indigo-800 text-light"
              disabled={loading}
              data-testid="forgot-password-button"
            >
              Zapomniałeś hasła?
            </button>
          }
        />
      </BasicForm>
    </div>
  )
}