import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, KeyRound, Lock, Mail } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { auth } from '../lib/auth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import type { LoginCredentials } from '../types/api';

const loginSchema = z.object({
  username: z.string().min(1, 'Email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = React.useState<string | null>(null);
  const [needsMfa, setNeedsMfa] = React.useState(false);
  const [totpCode, setTotpCode] = React.useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginCredentials>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginCredentials) => {
    setError(null);
    try {
      await auth.login({ ...data, ...(needsMfa ? { totpCode } : {}) });
      toast.success('Welcome back!');
      navigate('/admin');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Invalid credentials';
      const code = (err as Error & { code?: string }).code;
      if (code === 'MFA_REQUIRED') {
        setNeedsMfa(true);
        setTotpCode('');
        setError(null);
        toast.info('Password accepted. Enter your authenticator code to continue.');
        return;
      }
      if (code === 'MFA_INVALID') {
        setNeedsMfa(true);
        setError(message);
        toast.error(message);
        return;
      }
      setError(message);
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="h-12 w-12 rounded-12 bg-primary flex items-center justify-center text-white font-bold text-lg mx-auto mb-4">
            TM
          </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{needsMfa ? 'Verify it’s you' : 'Admin Login'}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">{needsMfa ? 'Enter the current 6-digit code from your authenticator app.' : 'Sign in to access the ticket manager'}</p>
        </div>
        <Card className="card-padded">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {error && (
              <div className="p-3 rounded-10 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}
            <Input label="Email" placeholder="admin@example.com" error={errors.username?.message} leftIcon={Mail} {...register('username')} />
            <Input label="Password" type="password" placeholder="••••••••" error={errors.password?.message} leftIcon={Lock} {...register('password')} />
            {needsMfa && (
              <Input
                label="Authenticator code"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="000000"
                leftIcon={KeyRound}
                value={totpCode}
                onChange={(event) => setTotpCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
              />
            )}
            <Button type="submit" loading={isSubmitting} className="w-full">
              {needsMfa ? 'Verify and sign in' : 'Sign In'}
            </Button>
            {needsMfa && (
              <button type="button" className="flex w-full items-center justify-center gap-2 text-xs text-[#9da0a8] hover:text-[#3574f0]" onClick={() => { setNeedsMfa(false); setTotpCode(''); setError(null); }}>
                <ArrowLeft className="h-3.5 w-3.5" />Back to password
              </button>
            )}
          </form>
        </Card>
      </div>
    </div>
  );
};
