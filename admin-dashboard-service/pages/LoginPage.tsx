'use client';

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ticket, Lock, User, ArrowRight, Sparkles } from 'lucide-react';
import { useLanguage } from '../i18n';
import { useAuth } from '../../lib/auth';
import { Button, Field, Input, Badge, Card, CardHeader, CardContent } from '../ui';

const schema = z.object({
  username: z.string().min(2, 'Username is required'),
  password: z.string().min(4, 'Password must be at least 4 characters'),
});
type FormValues = z.infer<typeof schema>;

export const LoginPage: React.FC = () => {
  const { isKhmer } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/tickets';

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { username: 'admin', password: 'admin123' },
  });

  const submit = handleSubmit(async (values) => {
    setLoading(true);
    setError(null);
    try {
      const user = await login(values.username, values.password);
      navigate(user.role === 'ROLE_ADMIN' ? '/admin-dashboard' : from, { replace: true });
    } catch (e: any) {
      setError(e.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  });

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-slate-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_20%_80%,rgba(249,115,22,0.3),transparent_50%)]" />
      <div className="relative w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-6">
          <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-white shadow-lg">
            <Ticket className="w-5 h-5" />
          </div>
          <div className="text-white font-bold text-lg tracking-tight">TicketPlatform</div>
        </Link>
        <Card className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden">
          <CardHeader className="p-6 pb-4">
            <div className="flex items-center gap-2 mb-1.5">
              <Badge variant="default" className="text-xs">{isKhmer ? 'គណនី' : 'ACCOUNT'}</Badge>
              <Sparkles className="w-4 h-4 text-orange-500" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{isKhmer ? 'ចូលប្រើគណនី' : 'Sign in to your account'}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{isKhmer ? 'ត្រលប់មកកាន់សំបុត្រ និងកម្មវិធីដែលអ្នកទិញ' : 'Welcome back to your tickets & events'}</p>
          </CardHeader>
          <CardContent className="px-6 pb-6 pt-0">
            <form onSubmit={submit} className="space-y-4">
              <Field label={isKhmer ? 'ឈ្មោះអ្នកប្រើ' : 'Username'} hint={errors.username?.message}>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input className="pl-10" placeholder="admin" {...register('username')} />
                </div>
              </Field>
              <Field label={isKhmer ? 'ពាក្យសម្ងាត់' : 'Password'} hint={errors.password?.message}>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input type="password" className="pl-10" placeholder="••••••••" {...register('password')} />
                </div>
              </Field>
              {error && <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-sm">{error}</div>}
              <Button type="submit" size="lg" loading={loading} className="w-full">
                {isKhmer ? 'ចូលប្រើ' : 'Sign in'} <ArrowRight className="w-4 h-4" />
              </Button>
              <p className="text-center text-xs text-slate-500 dark:text-slate-400">
                {isKhmer ? 'មិនទាន់មានគណនី?' : "Don't have an account?"}{' '}
                <Link to="/register" className="font-semibold text-orange-600 dark:text-orange-400 hover:underline">
                  {isKhmer ? 'ចុះឈ្មោះ' : 'Register'}
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;