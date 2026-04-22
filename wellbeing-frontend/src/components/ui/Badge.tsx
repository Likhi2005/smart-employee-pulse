import * as React from 'react';
import { cn } from '../../utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'secondary';
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variants = {
      default:
        'bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100',
      primary:
        'bg-blue-100 text-blue-900 dark:bg-blue-950/40 dark:text-blue-300',
      success:
        'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300',
      warning:
        'bg-yellow-100 text-yellow-900 dark:bg-yellow-950/40 dark:text-yellow-300',
      danger:
        'bg-red-100 text-red-900 dark:bg-red-950/40 dark:text-red-300',
      secondary:
        'bg-purple-100 text-purple-900 dark:bg-purple-950/40 dark:text-purple-300',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold',
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = 'Badge';

export { Badge };