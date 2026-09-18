import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ticket, Lock, User, ArrowRight, Sparkles } from 'lucide-react';
import { useLanguage } from '../i18n';
import { useAuth } from '../lib/auth';
import { Button, Field, Input, Badge } from '../components/ui';

const schema = z.object({
  username: z.string().min(2, 'Username is required'),
  password: z.string().min(4, 'Password must be at least 4 characters'),
});
type FormValues = z.infer<typeof schema>;

export const AuthShell: React.FC<{ children: React.ReactNode; title: string; subtitle: string }> = ({ children, title, subtitle }) => {
  const { isKhmer } = useLanguage();
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-hero-grid">
      <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_20%_80%,rgba(255,255,255,0.8),transparent_45%)]" />
      <div className="relative w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center text-white shadow-glow">
            <Ticket className="w-5 h-5" />
          </div>
          <div className="text-white font-display font-bold text-lg tracking-tight">TicketPlatform</div>
        </Link>
        <div className="bg-white rounded-3xl border border-line shadow-soft p-8">
          <div className="flex items-center gap-2 mb-1.5">
            <Badge tone="violet">{isKhmer ? 'គណនី' : 'ACCOUNT'}</Badge>
            <Sparkles className="w-4 h-4 text-brand-500" />
          </div>
          <h1 className="font-display text-2xl font-bold text-ink">{title}</h1>
          <p className="text-sm text-ink-soft mt-1 mb-6">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
};

export const LoginPage: React.FC = () => {
  const { isKhmer } = useLanguage();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { username: 'admin', password: 'admin123' },
  });

  const submit = handleSubmit(async (values) => {
    setLoading(true);
    setError(null);
    try {
      const user = await login(values.username, values.password);
      navigate(user.role === 'ROLE_ADMIN' ? '/admin-dashboard' : '/tickets');
    } catch (e: any) {
      setError(e.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  });

  return (
    <AuthShell
      title={isKhmer ? 'ចូលប្រើគណនី' : 'Sign in to your account'}
      subtitle={isKhmer ? 'ត្រលប់មកកាន់សំបុត្រ និងកម្មវិធីដែលអ្នកទិញ' : 'Welcome back to your tickets & events'}
    >
      <form onSubmit={submit} className="space-y-4">
        <Field label={isKhmer ? 'ឈ្មោះអ្នកប្រើ' : 'Username'} hint={errors.username?.message}>
          <div className="relative">
            <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" />
            <Input className="pl-10" placeholder="admin" {...register('username')} />
          </div>
        </Field>
        <Field label={isKhmer ? 'ពាក្យសម្ងាត់' : 'Password'} hint={errors.password?.message}>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" />
            <Input type="password" className="pl-10" placeholder="••••••••" {...register('password')} />
          </div>
        </Field>
        {error && <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">{error}</div>}
        <Button type="submit" size="lg" loading={loading} className="w-full">
          {isKhmer ? 'ចូលប្រើ' : 'Sign in'} <ArrowRight className="w-4 h-4" />
        </Button>
        <p className="text-center text-xs text-ink-soft">
          {isKhmer ? 'មិនទាន់មានគណនី?' : "Don't have an account?"}{' '}
          <Link to="/register" className="font-semibold text-brand-700 hover:underline">
            {isKhmer ? 'ចុះឈ្មោះ' : 'Register'}
          </Link>
        </p>
      </form>
    </AuthShell>
  );
};

export default LoginPage;