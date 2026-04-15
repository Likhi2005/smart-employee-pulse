import React from 'react';
import { cn } from '../../utils/cn';

export const Button = React.forwardRef(
    (
        {
            variant = 'primary',
            size = 'md',
            className,
            children,
            disabled,
            ...props
        },
        ref
    ) => {
        const baseStyles =
            'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

        const variants = {
            primary:
                'bg-blue-600 text-white hover:bg-blue-700 active:scale-95 shadow-lg hover:shadow-xl',
            secondary:
                'bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 active:scale-95 shadow-sm hover:shadow-md',
            ghost:
                'text-slate-700 hover:bg-slate-100 active:scale-95',
            outline:
                'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 active:scale-95',
        };

        const sizes = {
            sm: 'px-3 py-1.5 text-sm',
            md: 'px-5 py-2.5 text-base',
            lg: 'px-6 py-3 text-lg',
            xl: 'px-8 py-4 text-lg',
        };

        return (
            <button
                ref={ref}
                disabled={disabled}
                className={cn(
                    baseStyles,
                    variants[variant],
                    sizes[size],
                    className
                )}
                {...props}
            >
                {children}
            </button>
        );
    }
);

Button.displayName = 'Button';