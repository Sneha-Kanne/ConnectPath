import React from 'react';
import { motion } from 'motion/react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'coral' | 'glass' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  glow?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  glow = false,
  className = '',
  disabled,
  style,
  ...props
}) => {
  const baseStyle =
    'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer';

  const sizeStyles: Record<string, string> = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-5 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3.5 text-base gap-2.5',
  };

  const getVariantStyle = (): React.CSSProperties => {
    switch (variant) {
      case 'primary':
        return {
          background: 'var(--accent)',
          color: '#ffffff',
          fontWeight: 600,
          border: '1px solid transparent',
          boxShadow: glow ? '0 0 16px var(--accent-subtle)' : 'none',
        };
      case 'secondary':
        return {
          background: 'var(--bg-input)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border)',
        };
      case 'coral':
        return {
          background: 'var(--red)',
          color: '#fff',
          border: '1px solid transparent',
          boxShadow: glow ? '0 0 12px var(--red-subtle)' : 'none',
        };
      case 'glass':
        return {
          background: 'var(--bg-input)',
          color: 'var(--text-secondary)',
          border: '1px solid var(--border)',
          backdropFilter: 'blur(12px)',
        };
      case 'ghost':
        return {
          background: 'transparent',
          color: 'var(--text-muted)',
          border: '1px solid transparent',
        };
      default:
        return {};
    }
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={`
        ${baseStyle}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      style={{ ...getVariantStyle(), ...style }}
      disabled={disabled}
      {...props}
    >
      {children}
    </motion.button>
  );
};
