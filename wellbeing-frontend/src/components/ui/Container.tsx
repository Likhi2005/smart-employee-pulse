import React from 'react';
import { cn } from '../../utils/cn';

export const Container = ({ children, className }) => {
    return (
        <div className={cn('mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl', className)}>
            {children}
        </div>
    );
};