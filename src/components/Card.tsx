import React from 'react';
import { motion } from 'motion/react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'glass' | 'cyan' | 'coral' | 'clean';
  hoverEffect?: boolean;
  animateEntrance?: boolean;
  delay?: number;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'glass',
  hoverEffect = false,
  animateEntrance = false,
  delay = 0,
  className = '',
  style,
  ...props
}) => {
  const variantStyles: Record<string, React.CSSProperties> = {
    glass: {
      background: 'var(--bg-surface)',
      borderColor: 'var(--border)',
      color: 'var(--text-primary)',
      boxShadow: 'var(--shadow-lg)',
    },
    cyan: {
      background: 'var(--bg-surface)',
      borderColor: 'var(--accent-border)',
      color: 'var(--text-primary)',
      boxShadow: '0 0 18px var(--accent-subtle)',
    },
    coral: {
      background: 'var(--bg-surface)',
      borderColor: 'var(--red-border)',
      color: 'var(--text-primary)',
      boxShadow: '0 0 18px var(--red-subtle)',
    },
    clean: {
      background: 'var(--bg-surface)',
      borderColor: 'var(--border)',
      color: 'var(--text-primary)',
      boxShadow: 'var(--shadow-md)',
    },
  };

  const interactiveClasses = hoverEffect 
    ? 'hover:border-[var(--border-strong)] transition-colors duration-300' 
    : '';

  const motionProps = animateEntrance
    ? {
        initial: { opacity: 0, y: 15 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.4, delay, ease: 'easeOut' },
      }
    : {};

  const Component = animateEntrance ? motion.div : 'div';

  return (
    <Component
      className={`rounded-2xl p-5 border backdrop-blur-md ${interactiveClasses} ${className}`}
      style={{
        ...variantStyles[variant],
        ...style,
      }}
      {...props}
      {...(motionProps as any)}
    >
      {children}
    </Component>
  );
};
