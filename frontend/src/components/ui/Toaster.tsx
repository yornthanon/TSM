import { Toaster as SonnerToaster, toast } from 'sonner';

export { toast };

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      theme="system"
      toastOptions={{
        classNames: {
          toast: 'bg-white dark:bg-dark-800 border border-border-light dark:border-border-dark shadow-xl rounded-xl',
          description: 'text-dark-600 dark:text-dark-400',
          actionButton: 'bg-primary-500 hover:bg-primary-600 text-white',
          cancelButton: 'bg-dark-100 hover:bg-dark-200 dark:bg-dark-700 dark:hover:bg-dark-600 text-dark-900 dark:text-dark-100',
        },
      }}
    />
  );
}