import { HTMLAttributes, forwardRef, useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  shape?: 'circle' | 'square';
}

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt, name, size = 'md', shape = 'circle', ...props }, ref) => {
    const [imageError, setImageError] = useState(false);

    const sizes = {
      xs: 'w-6 h-6 text-xs',
      sm: 'w-8 h-8 text-sm',
      md: 'w-10 h-10 text-base',
      lg: 'w-12 h-12 text-lg',
      xl: 'w-16 h-16 text-xl',
    };

    const shapes = {
      circle: 'rounded-full',
      square: 'rounded-lg',
    };

    const getInitials = (name: string) => {
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    };

    const getColorFromName = (name: string) => {
      const colors = [
        'bg-primary-500',
        'bg-green-500',
        'bg-blue-500',
        'bg-amber-500',
        'bg-purple-500',
        'bg-pink-500',
        'bg-indigo-500',
        'bg-teal-500',
      ];
      let hash = 0;
      for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
      }
      return colors[Math.abs(hash) % colors.length];
    };

    if (src && !imageError) {
      return (
        <div
          ref={ref}
          className={twMerge(clsx(sizes[size], shapes[shape], 'overflow-hidden bg-dark-100 dark:bg-dark-700'), className)}
          {...props}
        >
          <img
            src={src}
            alt={alt || name || 'Avatar'}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        </div>
      );
    }

    const backgroundColor = name ? getColorFromName(name) : 'bg-dark-300 dark:bg-dark-600';
    const initials = name ? getInitials(name) : '?';

    return (
      <div
        ref={ref}
        className={twMerge(clsx(sizes[size], shapes[shape], backgroundColor, 'flex items-center justify-center text-white font-medium'), className)}
        {...props}
      >
        {initials}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

interface AvatarGroupProps extends HTMLAttributes<HTMLDivElement> {
  avatars: Array<{ src?: string; name?: string; alt?: string }>;
  max?: number;
  size?: AvatarProps['size'];
}

export function AvatarGroup({ avatars, max = 5, size = 'md', className, ...props }: AvatarGroupProps) {
  const visibleAvatars = avatars.slice(0, max);
  const remainingCount = avatars.length - max;

  return (
    <div className={twMerge(clsx('flex -space-x-2'), className)} {...props}>
      {visibleAvatars.map((avatar, index) => (
        <Avatar key={index} size={size} {...avatar} className="border-2 border-white dark:border-dark-900" />
      ))}
      {remainingCount > 0 && (
        <Avatar
          size={size}
          name={`+${remainingCount}`}
          className="border-2 border-white dark:border-dark-900 bg-dark-200 dark:bg-dark-700 text-dark-600 dark:text-dark-400"
        />
      )}
    </div>
  );
}