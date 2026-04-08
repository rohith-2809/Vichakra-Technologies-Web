import { cn } from './Button';
import { motion } from 'framer-motion';

export function Card({ className, children, hover = true, glow = false, ...props }) {
  return (
    <div
      className={cn(
        'premium-card',
        glow && 'shadow-brand-sm hover:shadow-brand-lg',
        !hover && 'hover:transform-none hover:shadow-premium',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function MotionCard({ className, children, delay = 0, hover = true, glow = false, ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={cn(
        'premium-card',
        glow && 'shadow-brand-sm hover:shadow-brand-lg',
        !hover && 'hover:transform-none',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function StatCard({ value, label, suffix = '', className }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: 'backOut' }}
      className={cn('text-center p-6', className)}
    >
      <div className="text-5xl font-extrabold tracking-tightest gradient-text mb-1">
        {value}{suffix}
      </div>
      <div className="text-sm font-medium text-gray-500 uppercase tracking-widest">{label}</div>
    </motion.div>
  );
}
