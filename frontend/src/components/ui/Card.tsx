import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export default function Card({ children, className = '', hover = false, onClick }: CardProps) {
  const baseStyles = 'bg-white rounded-xl border border-gray-200 shadow-sm';
  const hoverStyles = hover ? 'cursor-pointer' : '';
  
  return (
    <motion.div
      className={`${baseStyles} ${hoverStyles} ${className}`}
      onClick={onClick}
      whileHover={hover ? { y: -6, boxShadow: "0 20px 35px -10px rgba(0, 0, 0, 0.08), 0 15px 20px -8px rgba(0, 0, 0, 0.04)" } : {}}
      transition={{ type: "tween", ease: [0.16, 1, 0.3, 1], duration: 0.5 }}
    >
      {children}
    </motion.div>
  );
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return <div className={`p-6 border-b border-gray-100 ${className}`}>{children}</div>;
}

interface CardBodyProps {
  children: ReactNode;
  className?: string;
}

export function CardBody({ children, className = '' }: CardBodyProps) {
  return <div className={`p-6 ${className}`}>{children}</div>;
}

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
  return <div className={`p-6 border-t border-gray-100 ${className}`}>{children}</div>;
}
