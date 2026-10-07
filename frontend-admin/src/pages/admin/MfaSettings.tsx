import React from 'react';
import { useEffect, useState } from 'react';
import { Check, Clipboard, KeyRound, LoaderCircle, ShieldCheck, ShieldOff } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';
import { api } from 'frontend-shared/lib/api';
import { Badge, Button, Card, Input } from 'frontend-shared/components/ui';

interface MfaStatus {
  enabled: boolean;
}

interface MfaSetup {
  secret: string;
  provisioningUri: string;
}

export const MfaSettings: React.FC = () => {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [setup, setSetup] = useState<MfaSetup | null>(null);
  const [code, setCode] = useState('');
  const [showDisable, setShowDisable] = useState(false);

  useEffect(() => {
    let alive = true;
    void api.get<MfaStatus>('/users/me/mfa')
      .then((status) => { if (alive) setEnabled(status.enabled); })
      .catch((error: Error) => { if (alive) toast.error(`Could not load security settings: ${error.message}`); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  const beginSetup = async () => {
    setWorking(true);
    try {
      const result = await api.post<MfaSetup>('/users/me/mfa/setup');
      setSetup(result);
      setCode('');
      toast.success('Scan the QR code in your authenticator app, then verify it.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not start two-factor setup.');
    } finally {
      setWorking(false);
    }
  };

  const enable = async () => {
    if (!/^\d{6}$/.test(code)) {
      toast.error('Enter the current 6-digit authenticator code.');
      return;
    }
    setWorking(true);
    try {
      await api.post('/users/me/mfa/enable', { code });
      setEnabled(true);
      setSetup(null);
      setCode('');
      toast.success('Two-factor authentication is now enabled.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not verify the authenticator code.');
    } finally {
      setWorking(false);
    }
  };

  const disable = async () => {
    if (!/^\d{6}$/.test(code)) {
      toast.error('Enter the current 6-digit authenticator code.');
      return;
    }
    setWorking(true);
    try {
      await api.post('/users/me/mfa/disable', { code });
      setEnabled(false);
      setShowDisable(false);
      setCode('');
      toast.success('Two-factor authentication has been disabled.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not disable two-factor authentication.');
    } finally {
      setWorking(false);
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className="flex items-start justify-between gap-3 border-b border-[#3c3f41] px-4 py-4 sm:px-5">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#eaf1ff] text-[#3574f0] dark:bg-[#23365c] dark:text-[#78a9ff]">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-[13px] font-semibold text-[#d7dae0]">Two-factor authentication</h2>
            <p className="mt-1 max-w-2xl text-[12px] leading-5 text-[#9da0a8]">
              Add a time-based code from Google Authenticator, Microsoft Authenticator, 1Password, or another TOTP app.
            </p>
          </div>
        </div>
        {!loading && <Badge status={enabled ? 'ENABLED' : 'DISABLED'} />}
      </div>

      <div className="p-4 sm:p-5">
        {loading ? (
          <div className="flex items-center gap-2 py-2 text-sm text-[#9da0a8]"><LoaderCircle className="h-4 w-4 animate-spin" />Loading security settings…</div>
        ) : enabled ? (
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-[13px] font-medium text-[#d7dae0]">Your account is protected with an authenticator code.</p>
              <p className="mt-1 text-[12px] text-[#9da0a8]">Your Google account and a current 6-digit code are required to sign in.</p>
            </div>
            {!showDisable ? (
              <Button variant="secondary" leftIcon={<ShieldOff className="h-3.5 w-3.5" />} onClick={() => setShowDisable(true)}>
                Turn off 2FA
              </Button>
            ) : (
              <div className="w-full max-w-sm space-y-3">
                <Input label="Authenticator code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))} />
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => { setShowDisable(false); setCode(''); }}>Cancel</Button>
                  <Button variant="danger" loading={working} onClick={() => void disable()}>Confirm disable</Button>
                </div>
              </div>
            )}
          </div>
        ) : setup ? (
          <div className="grid gap-5 md:grid-cols-[auto_1fr] md:items-start">
            <div className="rounded-xl border border-[#3c3f41] bg-white p-3 dark:border-[#3c3f41] dark:bg-[#1e1f22]">
              <QRCodeSVG value={setup.provisioningUri} size={176} level="M" includeMargin aria-label="Authenticator app setup QR code" />
            </div>
            <div className="min-w-0 space-y-4">
              <ol className="list-decimal space-y-1.5 pl-5 text-[12px] leading-5 text-[#9da0a8]">
                <li>Open your authenticator app and scan this QR code.</li>
                <li>Enter the 6-digit code currently shown in the app to verify setup.</li>
              </ol>
              <div className="rounded-lg border border-[#3c3f41] bg-[#1e1f22] p-3 dark:border-[#3c3f41] dark:bg-[#313335]">
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-[#9da0a8]"><KeyRound className="h-3.5 w-3.5" />Manual setup key</div>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                  <code className="break-all font-mono text-[12px] font-semibold tracking-[0.12em] text-[#d7dae0]">{setup.secret}</code>
                  <button type="button" className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-[#3574f0] hover:bg-[#eaf1ff] dark:hover:bg-[#23365c]" onClick={() => void navigator.clipboard.writeText(setup.secret).then(() => toast.success('Setup key copied')).catch(() => toast.error('Clipboard unavailable'))}>
                    <Clipboard className="h-3 w-3" />Copy
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                <Input label="6-digit verification code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" />
                <Button loading={working} disabled={code.length !== 6} leftIcon={<Check className="h-3.5 w-3.5" />} onClick={() => void enable()}>Verify and enable</Button>
              </div>
              <button type="button" className="text-[12px] text-[#9da0a8] underline-offset-2 hover:underline" onClick={() => { setSetup(null); setCode(''); }}>Cancel setup</button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-[13px] font-medium text-[#d7dae0]">Add a second check at sign-in.</p>
              <p className="mt-1 text-[12px] text-[#9da0a8]">Setup is optional until enabled. Your secret is encrypted before it is saved.</p>
            </div>
            <Button loading={working} leftIcon={<KeyRound className="h-3.5 w-3.5" />} onClick={() => void beginSetup()}>Set up authenticator</Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default MfaSettings;
