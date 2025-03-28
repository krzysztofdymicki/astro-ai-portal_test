'use client';

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { createClient } from '@/utils/supabase/client'
import { KeyIcon, CheckCircle } from 'lucide-react'
import { FormInput } from '@/components/ui/FormInput'
import { BasicForm } from '@/components/ui/BasicForm'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [resetComplete, setResetComplete] = useState(false)
  const [tokenValid, setTokenValid] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{
    password?: boolean;
    confirmPassword?: boolean;
  }>({})
  
  const supabase = createClient()

  useEffect(() => {
    const hash = window.location.hash;
    const isResetPasswordFlow = hash.includes('type=recovery') && hash.includes('access_token');
    
    if (!isResetPasswordFlow) {
      toast.error("Nieprawidłowy link resetowania hasła", {
        description: "Użyj linku otrzymanego w wiadomości email lub poproś o nowy link."
      });
    } else {
      setTokenValid(true);
      
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
        if (event === 'PASSWORD_RECOVERY') {
          setTokenValid(true);
        }
      });
      
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
    
    if (!password || password.length < 6) {
      errors.password = true;
      isValid = false;
      toast.error("Hasło musi zawierać co najmniej 6 znaków");
    }
    
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
      const { error } = await supabase.auth.updateUser({ password })

      if (error) {
        toast.error("Błąd resetowania hasła", {
          description: error.message
        });
        return;
      }

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
          <div className="mx-auto bg-green-500/20 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-400" />
          </div>
          <h3 className="text-xl text-light">Hasło zostało zmienione</h3>
          <p className="text-gray-600 text-light">
            Twoje hasło zostało pomyślnie zaktualizowane
          </p>
        </div>
        
        <div className="bg-indigo-800/30 rounded-lg p-4 border border-indigo-300/20">
          <p className="text-center mb-2 text-light text-indigo-100">
            Możesz teraz zalogować się do swojego konta używając nowego hasła.
          </p>
        </div>
        
        <div className="mt-6">
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
        <div className="mx-auto bg-indigo-600/20 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
          <KeyIcon className="h-8 w-8 text-indigo-400" />
        </div>
        <h3 className="text-xl text-light text-center">Ustaw nowe hasło</h3>
        <p className="text-gray-600 text-center text-sm text-light">
          Wprowadź nowe hasło, które chcesz używać do logowania
        </p>
      </div>

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
        <>
          <BasicForm 
            onSubmit={handleResetPassword}
            ariaLabel="reset-password-form"
            submitText="Ustaw nowe hasło"
            isLoading={loading}
            footerContent={null}
          >
            <FormInput
              id="password"
              label="Nowe hasło"
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
              className="bg-indigo-950/50 border-indigo-300/30 text-white"
              actionElement={
                <p className="text-xs text-indigo-300">Minimum 6 znaków</p>
              }
            />
            
            <FormInput
              id="confirmPassword"
              label="Potwierdź nowe hasło"
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
              className="bg-indigo-950/50 border-indigo-300/30 text-white"
            />
          </BasicForm>
          
          <div className="text-center text-sm text-indigo-200">
            Pamiętasz swoje hasło?{' '}
            <Link href="/login" className="text-indigo-400 hover:underline">
              Zaloguj się
            </Link>
          </div>
        </>
      )}
    </div>
  )
}