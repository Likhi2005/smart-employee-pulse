import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    closeOnBackdropClick?: boolean;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

export const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
    (
        {
            isOpen,
            onClose,
            children,
            closeOnBackdropClick = true,
            size = 'md',
            className,
        },
        ref
    ) => {
        // Lock body scroll when modal is open
        useEffect(() => {
            if (isOpen) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = 'unset';
            }

            return () => {
                document.body.style.overflow = 'unset';
            };
        }, [isOpen]);

        const sizeClasses = {
            sm: 'max-w-sm',
            md: 'max-w-md',
            lg: 'max-w-lg',
            xl: 'max-w-xl',
        };

        return (
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={closeOnBackdropClick ? onClose : undefined}
                            className="fixed inset-0 bg-black/50 dark:bg-black/70 z-40"
                        />

                        {/* Modal Container */}
                        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
                            <motion.div
                                ref={ref}
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                transition={{ duration: 0.2 }}
                                onClick={(e) => e.stopPropagation()}
                                className={cn(
                                    'bg-white dark:bg-neutral-900 rounded-lg shadow-2xl pointer-events-auto',
                                    sizeClasses[size],
                                    'w-full',
                                    className
                                )}
                            >
                                {children}
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>
        );
    }
);

Modal.displayName = 'Modal';