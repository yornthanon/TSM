import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, KeyRound, Lock, Mail, ShieldCheck } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { auth } from '../lib/auth';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import type { LoginCredentials } from '../types/api';

const loginSchema = z.object({
  username: z.string().min(1, 'Email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  account_not_linked: 'Google sign-in is not enabled for this account. Contact your TicketDesk administrator.',
  google_signin_failed: 'Google sign-in could not be completed. Please try again.',
  missing_code: 'The Google sign-in link was incomplete. Please try again.',
};

const GoogleMark: React.FC = () => (
  <svg aria-hidden="true" viewBox="0 0 48 48" className="h-[18px] w-[18px] shrink-0">
    <path fill="#4285F4" d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11c-.5 2.5-2 4.6-4.2 6l6.8 5.3c4-3.7 6-9.1 6-15Z" />
    <path fill="#34A853" d="M24 44c5.4 0 10-1.8 13.3-4.8l-6.8-5.3c-1.9 1.3-4 2-6.5 2-5.1 0-9.4-3.5-11-8.2l-7 5.4C9.4 39.6 16.2 44 24 44Z" />
    <path fill="#FBBC05" d="M13 27.7a12 12 0 0 1 0-7.4l-7-5.4a20 20 0 0 0 0 18.2l7-5.4Z" />
    <path fill="#EA4335" d="M24 12.1c3 0 5.8 1 7.9 3.1l5.9-5.9C34.2 5.8 29.4 4 24 4 16.2 4 9.4 8.4 6 14.9l7 5.4c1.6-4.7 5.9-8.2 11-8.2Z" />
  </svg>
);

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = React.useState<string | null>(() => {
    const providerError = searchParams.get('oauth_error');
    return providerError ? OAUTH_ERROR_MESSAGES[providerError] || 'Google sign-in could not be completed. Please try again.' : null;
  });
  const [needsMfa, setNeedsMfa] = React.useState(false);
  const [totpCode, setTotpCode] = React.useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginCredentials>({
    resolver: zodResolver(loginSchema),
  });

  React.useEffect(() => {
    const providerError = searchParams.get('oauth_error');
    if (!providerError) return;
    navigate('/login', { replace: true });
  }, [navigate, searchParams]);

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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#101318] px-5 py-10 text-[#d7dae0]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_18%_14%,rgba(67,112,190,0.16),transparent_38%),radial-gradient(ellipse_at_85%_86%,rgba(47,141,151,0.10),transparent_34%)]" />
      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-2xl border border-[#2b3039] bg-[#171a20] shadow-[0_28px_100px_rgba(0,0,0,0.42)] lg:grid-cols-[1fr_1.02fr]">
        <section className="hidden flex-col justify-between border-r border-[#2b3039] bg-[#15181e] p-10 lg:flex xl:p-12">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#355486] bg-[#20314b] text-sm font-bold tracking-tight text-[#86b6ff]">TD</div>
              <div>
                <p className="font-semibold tracking-wide text-[#e7e9ed]">TicketDesk</p>
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#7e8795]">Operations workspace</p>
              </div>
            </div>
            <div className="mt-20 max-w-sm">
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#6fa6ff]">// secure access</p>
              <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.03em] text-[#edf0f5] xl:text-4xl">Your ticket operations, in one place.</h1>
              <p className="mt-4 text-sm leading-7 text-[#9aa2ad]">Sign in to manage events, ticket inventory, orders, and your team from a focused workspace.</p>
            </div>
          </div>
          <div className="rounded-xl border border-[#292f39] bg-[#191d24] p-4">
            <div className="flex items-center gap-2 text-xs font-medium text-[#c4cad3]"><ShieldCheck className="h-4 w-4 text-[#68a5ff]" />Protected team access</div>
            <p className="mt-2 pl-6 text-xs leading-5 text-[#818a97]">Only approved active accounts can access this workspace. Authenticator verification remains enabled where required.</p>
          </div>
        </section>

        <main className="flex items-center justify-center p-6 sm:p-10 xl:p-12">
          <div className="w-full max-w-md">
            <div className="mb-7 flex items-center gap-3 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#355486] bg-[#20314b] text-sm font-bold text-[#86b6ff]">TD</div>
              <div>
                <p className="font-semibold text-[#e7e9ed]">TicketDesk</p>
                <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#7e8795]">Operations workspace</p>
              </div>
            </div>

            <div className="mb-7">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#6fa6ff]">Workspace authentication</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-[#eef0f3]">{needsMfa ? 'Verify it’s you' : 'Welcome back'}</h2>
              <p className="mt-2 text-sm leading-6 text-[#9299a4]">{needsMfa ? 'Enter the current 6-digit code from your authenticator app.' : 'Sign in to access your ticket management workspace.'}</p>
            </div>

            <Card className="border border-[#2b3039] bg-[#1c2027] p-5 shadow-none sm:p-7">
              {!needsMfa && (
                <>
                  <button
                    type="button"
                    onClick={() => auth.startGoogleSignIn()}
                    className="flex min-h-11 w-full items-center justify-center gap-3 rounded-lg border border-[#414752] bg-[#f7f8fa] px-4 py-2.5 text-sm font-semibold text-[#24272d] transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#6fa6ff] focus:ring-offset-2 focus:ring-offset-[#1c2027]"
                  >
                    <GoogleMark />
                    Continue with Google
                  </button>
                  <div className="my-5 flex items-center gap-3" aria-hidden="true">
                    <div className="h-px flex-1 bg-[#303640]" />
                    <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#747d89]">or use your account</span>
                    <div className="h-px flex-1 bg-[#303640]" />
                  </div>
                </>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {error && (
                  <div role="alert" className="rounded-lg border border-[#633c43] bg-[#3a252b] px-3.5 py-3">
                    <p className="text-sm leading-5 text-[#f4a2a8]">{error}</p>
                  </div>
                )}
                {!needsMfa && (
                  <>
                    <Input label="Work email" placeholder="you@company.com" autoComplete="username" error={errors.username?.message} leftIcon={Mail} {...register('username')} />
                    <Input label="Password" type="password" placeholder="Enter your password" autoComplete="current-password" error={errors.password?.message} leftIcon={Lock} {...register('password')} />
                  </>
                )}
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
                <Button type="submit" loading={isSubmitting} disabled={needsMfa && totpCode.length !== 6} className="w-full !rounded-lg !py-3 !font-semibold">
                  {needsMfa ? 'Verify and sign in' : 'Sign in with password'}
                </Button>
                {needsMfa && (
                  <button type="button" className="flex w-full items-center justify-center gap-2 py-1 text-xs text-[#969eaa] transition hover:text-[#8bb8ff]" onClick={() => { setNeedsMfa(false); setTotpCode(''); setError(null); }}>
                    <ArrowLeft className="h-3.5 w-3.5" />Back to password sign in
                  </button>
                )}
              </form>
            </Card>

            <p className="mt-5 text-center text-xs leading-5 text-[#777f8b]">Google sign-in is available to existing, approved TicketDesk accounts.</p>
          </div>
        </main>
      </div>
    </div>
  );
};
