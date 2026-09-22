import React from 'react';
import { Save, Lock } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { auth } from '../../lib/auth';
import { useUpdateProfile, useUser } from '../../hooks/useApi';
import { toast } from 'sonner';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  department: z.string().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(6, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export const Settings: React.FC = () => {
  const { data: user, isLoading: userLoading, refetch } = useUser();
  const updateProfile = useUpdateProfile({
    onSuccess: () => {
      toast.success('Profile updated successfully');
      refetch();
    },
    onError: () => toast.error('Failed to update profile'),
  });

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors, isSubmitting: profileSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    values: user ? { name: user.username, email: user.email, department: user.userType || '' } : undefined,
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors, isSubmitting: passwordSubmitting },
    reset: resetPassword,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const onProfileSubmit = (data: ProfileFormData) => {
    updateProfile.mutate(data);
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    try {
      await auth.changePassword({ oldPassword: data.currentPassword, newPassword: data.newPassword });
      toast.success('Password changed successfully');
      resetPassword();
    } catch {
      toast.error('Failed to change password');
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account settings.</p>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Profile Information</h2>
        {userLoading ? (
          <Spinner />
        ) : (
          <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-5">
            <Input label="Name" error={profileErrors.name?.message} {...registerProfile('name')} />
            <Input label="Email" type="email" error={profileErrors.email?.message} {...registerProfile('email')} />
            <Input label="Department" placeholder="e.g. Engineering" error={profileErrors.department?.message} {...registerProfile('department')} />
            <Button type="submit" loading={profileSubmitting} leftIcon={<Save className="h-4 w-4" />}>Save Profile</Button>
          </form>
        )}
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Change Password</h2>
        <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-5">
          <Input label="Current Password" type="password" error={passwordErrors.currentPassword?.message} {...registerPassword('currentPassword')} />
          <Input label="New Password" type="password" error={passwordErrors.newPassword?.message} {...registerPassword('newPassword')} />
          <Input label="Confirm New Password" type="password" error={passwordErrors.confirmPassword?.message} {...registerPassword('confirmPassword')} />
          <Button type="submit" loading={passwordSubmitting} variant="secondary" leftIcon={<Lock className="h-4 w-4" />}>Change Password</Button>
        </form>
      </Card>
    </div>
  );
};
