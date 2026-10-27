import React from 'react';
import { ShieldCheck } from 'lucide-react';
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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#101318] px-5 py-10 text-[#d7dae0]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_18%_14%,rgba(67,112,190,0.16),transparent_38%),radial-gradient(ellipse_at_85%_86%,rgba(47,141,151,0.10),transparent_34%)]" />
      <div className="relative grid w-full max-w-4xl overflow-hidden rounded-2xl border border-[#2b3039] bg-[#171a20] shadow-[0_28px_100px_rgba(0,0,0,0.42)] lg:grid-cols-[0.86fr_1fr]">
        <section className="hidden flex-col justify-between border-r border-[#2b3039] bg-[#15181e] p-10 lg:flex xl:p-12">
          <div>
            <img src="/kora-cambodia-wordmark.png" alt="KORA Cambodia" className="h-auto w-[176px] rounded-md object-contain" />
            <div className="mt-20 max-w-sm">
              <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.03em] text-[#edf0f5] xl:text-4xl">ប្រព័ន្ធគ្រប់គ្រងសំបុត្រ</h1>
              <p className="mt-4 text-sm leading-7 text-[#9aa2ad]">គ្រប់គ្រងកម្មវិធី សំបុត្រ ការកម្មង់ និងការទូទាត់នៅកន្លែងតែមួយ។</p>
            </div>
          </div>
          <div className="rounded-xl border border-[#292f39] bg-[#191d24] p-4">
            <div className="flex items-center gap-2 text-xs font-medium text-[#c4cad3]"><ShieldCheck className="h-4 w-4 text-[#68a5ff]" />ចូលដោយសុវត្ថិភាព</div>
            <p className="mt-2 pl-6 text-xs leading-5 text-[#818a97]">ប្រើគណនី Google របស់អ្នក ដើម្បីចូលប្រើប្រព័ន្ធ។</p>
          </div>
        </section>

        <main className="flex items-center justify-center p-6 sm:p-10 xl:p-12">
          <div className="w-full max-w-md">
            <div className="mb-7 lg:hidden">
              <img src="/kora-cambodia-wordmark.png" alt="KORA Cambodia" className="h-auto w-[148px] rounded-md object-contain" />
            </div>

            <div className="mb-7">
              <h2 className="text-2xl font-semibold tracking-[-0.02em] text-[#eef0f3]">ចូលប្រើប្រព័ន្ធ</h2>
              <p className="mt-2 text-sm leading-6 text-[#9299a4]">សូមប្រើគណនី Google ដើម្បីចូល។</p>
            </div>

            <Card className="border border-[#2b3039] bg-[#1c2027] p-5 shadow-none sm:p-7">
              {error && (
                <div role="alert" className="mb-4 rounded-lg border border-[#633c43] bg-[#3a252b] px-3.5 py-3">
                  <p className="text-sm leading-5 text-[#f4a2a8]">{error}</p>
                </div>
              )}
              <button
                type="button"
                onClick={() => auth.startGoogleSignIn()}
                className="flex min-h-11 w-full items-center justify-center gap-3 rounded-lg border border-[#414752] bg-[#f7f8fa] px-4 py-2.5 text-sm font-semibold text-[#24272d] transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#6fa6ff] focus:ring-offset-2 focus:ring-offset-[#1c2027]"
              >
                <GoogleMark />
                ចូលតាម Google
              </button>
            </Card>

            <p className="mt-5 text-center text-xs leading-5 text-[#777f8b]">ប្រសិនបើគណនីរបស់អ្នកមាន MFA ប្រព័ន្ធអាចស្នើលេខកូដបន្ថែម។</p>
          </div>
        </main>
      </div>
    </div>
  );
};
