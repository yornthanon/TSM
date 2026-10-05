import React from 'react';
import { ArrowLeft, KeyRound, Loader2 } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { auth } from '../lib/auth';

export const OAuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [oauthCode, setOauthCode] = React.useState<string | null>(() => searchParams.get('code'));
  const [needsMfa, setNeedsMfa] = React.useState(false);
  const [totpCode, setTotpCode] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const exchangeStarted = React.useRef(false);

  const exchange = React.useCallback(async (code: string, oneTimeCode?: string) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await auth.completeGoogleSignIn(code, oneTimeCode);
      navigate('/admin', { replace: true });
    } catch (cause) {
      const failure = cause as Error & { code?: string };
      if (failure.code === 'MFA_REQUIRED' || failure.code === 'MFA_INVALID') {
        setNeedsMfa(true);
        setError(failure.code === 'MFA_INVALID' ? failure.message : null);
      } else {
        setOauthCode(null);
        setError(failure.message || 'Google sign-in could not be completed. Start again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [navigate]);

  React.useEffect(() => {
    if (exchangeStarted.current) return;

    const providerError = searchParams.get('oauth_error');
    if (providerError) {
      exchangeStarted.current = true;
      navigate(`/login?oauth_error=${encodeURIComponent(providerError)}`, { replace: true });
      return;
    }

    const code = searchParams.get('code');
    if (!code) {
      exchangeStarted.current = true;
      navigate('/login?oauth_error=missing_code', { replace: true });
      return;
    }

    exchangeStarted.current = true;
    // Replace the fragment immediately: the one-time code stays in memory and is
    // never persisted to localStorage or included in subsequent page requests.
    navigate('/oauth/callback', { replace: true });
    queueMicrotask(() => { void exchange(code); });
  }, [exchange, navigate, searchParams]);

  const handleMfaSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (oauthCode) void exchange(oauthCode, totpCode);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#101318] p-5 text-[#d7dae0]">
      <Card className="w-full max-w-md border border-[#2b3039] bg-[#1b1f26] p-7 shadow-[0_24px_80px_rgba(0,0,0,0.36)] sm:p-9">
        <div className="mb-7 flex items-center justify-between gap-3">
          <img src="/kora-cambodia-wordmark.png" alt="KORA Cambodia" className="h-auto w-[152px] rounded-md object-contain" />
          <p className="text-right text-xs text-[#9298a3]">Secure account sign-in</p>
        </div>

        {needsMfa ? (
          <>
            <h1 className="text-xl font-semibold text-[#eef0f3]">Verify it’s you</h1>
            <p className="mt-2 text-sm leading-6 text-[#9ba2ad]">Google verified your account. Enter the current authenticator code to finish signing in.</p>
            <form onSubmit={handleMfaSubmit} className="mt-6 space-y-5">
              {error && <p role="alert" className="rounded-lg border border-[#633c43] bg-[#3a252b] px-3 py-2.5 text-sm text-[#f4a2a8]">{error}</p>}
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
              <Button type="submit" loading={isSubmitting} disabled={!oauthCode || totpCode.length !== 6} className="w-full">
                Verify and continue
              </Button>
            </form>
          </>
        ) : error ? (
          <>
            <h1 className="text-xl font-semibold text-[#eef0f3]">Sign-in didn’t finish</h1>
            <p role="alert" className="mt-3 rounded-lg border border-[#633c43] bg-[#3a252b] px-3 py-2.5 text-sm leading-6 text-[#f4a2a8]">{error}</p>
            <Button type="button" variant="secondary" className="mt-6 w-full" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/login', { replace: true })}>
              Return to sign in
            </Button>
          </>
        ) : (
          <div className="py-6 text-center">
            <Loader2 className="mx-auto h-7 w-7 animate-spin text-[#72a7ff]" aria-hidden="true" />
            <h1 className="mt-4 text-base font-semibold text-[#eef0f3]">Securing your session</h1>
            <p className="mt-2 text-sm text-[#9298a3]">Verifying your KORA Cambodia account…</p>
          </div>
        )}
      </Card>
    </div>
  );
};
