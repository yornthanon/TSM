import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Lock, Mail, Phone, ArrowRight } from 'lucide-react';
import { useLanguage } from '../i18n';
import { useAuth } from '../lib/auth';
import { Button, Field, Input } from '../components/ui';
import { AuthShell } from './LoginPage';

const schema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Valid email required'),
  phone: z.string().min(8, 'Valid phone required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
type FormValues = z.infer<typeof schema>;

export const RegisterPage: React.FC = () => {
  const { isKhmer } = useLanguage();
  const navigate = useNavigate();
  const { register: doRegister } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const submit = handleSubmit(async (values) => {
    setLoading(true);
    setError(null);
    try {
      await doRegister({ ...values, phoneNumber: values.phone });
      navigate('/tickets');
    } catch (e: any) {
      setError(e.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  });

  return (
    <AuthShell
      title={isKhmer ? 'បង្កើតគណនីថ្មី' : 'Create your account'}
      subtitle={isKhmer ? 'ចុះឈ្មោះដើម្បីកក់សំបុត្រ និងទទួលបានការជូនដំណឹង' : 'Sign up to book tickets and get notified'}
    >
      <form onSubmit={submit} className="space-y-4">
        <Field label={isKhmer ? 'ឈ្មោះអ្នកប្រើ' : 'Username'} hint={errors.username?.message}>
          <div className="relative">
            <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" />
            <Input className="pl-10" placeholder="sopheap" {...register('username')} />
          </div>
        </Field>
        <Field label="Email" hint={errors.email?.message}>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" />
            <Input className="pl-10" placeholder="you@example.com" {...register('email')} />
          </div>
        </Field>
        <Field label={isKhmer ? 'ទូរស័ព្ទ' : 'Phone'} hint={errors.phone?.message}>
          <div className="relative">
            <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" />
            <Input className="pl-10" placeholder="+855..." {...register('phone')} />
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
          {isKhmer ? 'បង្កើតគណនី' : 'Create account'} <ArrowRight className="w-4 h-4" />
        </Button>
        <p className="text-center text-xs text-ink-soft">
          {isKhmer ? 'មានគណនីរួចហើយ?' : 'Already have an account?'}{' '}
          <Link to="/login" className="font-semibold text-brand-700 hover:underline">
            {isKhmer ? 'ចូលប្រើ' : 'Sign in'}
          </Link>
        </p>
      </form>
    </AuthShell>
  );
};

export default RegisterPage;