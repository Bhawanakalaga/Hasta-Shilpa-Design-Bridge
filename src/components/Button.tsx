import React from 'react';
import { cn } from '../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export default function Button({ 
  className, 
  variant = 'primary', 
  size = 'md', 
  leftIcon,
  rightIcon,
  children,
  ...props 
}: ButtonProps) {
  const variants = {
    primary: 'bg-bamboo-rich text-white hover:brightness-110 shadow-lg shadow-bamboo-rich/20',
    secondary: 'bg-bamboo-gold text-white hover:brightness-110 shadow-lg shadow-bamboo-gold/20',
    outline: 'border border-bamboo-gold text-bamboo-gold hover:bg-bamboo-gold/5',
    ghost: 'hover:bg-bamboo-dark/5 text-bamboo-dark/70',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-3',
    lg: 'px-8 py-4 text-lg tracking-wide',
    icon: 'p-2',
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-xl font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none gap-2',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {leftIcon}
      {children}
      {rightIcon}
    </button>
  );
}
