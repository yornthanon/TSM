import React from 'react';
import { Card } from '../components/ui/Card';
import { auth } from '../lib/auth';
import { useSearchParams } from 'react-router-dom';

const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  account_not_linked: 'មិនអាចភ្ជាប់គណនី Google បានទេ។ សូមព្យាយាមម្ដងទៀត។',
  google_signin_failed: 'ការចូលតាម Google មិនបានជោគជ័យទេ។ សូមព្យាយាមម្ដងទៀត។',
  missing_code: 'តំណចូលមិនពេញលេញទេ។ សូមចាប់ផ្ដើមម្ដងទៀត។',
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
  const [searchParams] = useSearchParams();
  const providerError = searchParams.get('oauth_error');
  const error = providerError
    ? OAUTH_ERROR_MESSAGES[providerError] || 'ការចូលតាម Google មិនបានជោគជ័យទេ។ សូមព្យាយាមម្ដងទៀត។'
    : null;

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0f141b] px-4 py-8 text-[#d7dae0] sm:px-6">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(53,116,240,0.16),transparent_42%),radial-gradient(circle_at_100%_100%,rgba(78,201,176,0.08),transparent_32%)]" />
      <main className="relative w-full max-w-[460px]">
        <Card className="border border-[#2b3039] bg-[#181b21] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.34)] sm:p-9">
          <div className="text-center">
            <img src="/kora-cambodia-wordmark.png" alt="KORA Cambodia" className="mx-auto h-auto w-[156px] rounded-md object-contain" />
            <h1 className="mt-8 text-[26px] font-semibold tracking-[-0.025em] text-[#eef0f3]">ចូលប្រើប្រព័ន្ធ</h1>
            <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-[#9299a4]">សូមប្រើគណនី Google ដើម្បីចូល។</p>
          </div>

          <div className="mt-8">
            {error && (
              <div role="alert" className="mb-4 rounded-lg border border-[#633c43] bg-[#3a252b] px-3.5 py-3">
                <p className="text-sm leading-5 text-[#f4a2a8]">{error}</p>
              </div>
            )}
            <button
              type="button"
              onClick={() => auth.startGoogleSignIn()}
              className="flex min-h-12 w-full items-center justify-center gap-3 rounded-lg border border-[#414752] bg-[#f7f8fa] px-4 py-2.5 text-sm font-semibold text-[#24272d] transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#6fa6ff] focus:ring-offset-2 focus:ring-offset-[#181b21]"
            >
              <GoogleMark />
              ចូលតាម Google
            </button>
          </div>

          <div className="mt-7 border-t border-[#2b3039] pt-5 text-center">
            <p className="text-xs leading-5 text-[#777f8b]">គណនីដែលមាន MFA អាចត្រូវបញ្ចូលលេខកូដបន្ថែម។</p>
          </div>
        </Card>
        <p className="mt-5 text-center text-[11px] text-[#68717e]">ការចូលប្រើមានសុវត្ថិភាពតាម Google</p>
      </main>
    </div>
  );
};
