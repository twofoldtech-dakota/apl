import { clsx } from 'clsx';

interface BadgeProps {
  variant?: 'default' | 'pending' | 'in_progress' | 'completed' | 'failed' | 'info' | 'warning';
  children: React.ReactNode;
  className?: string;
}

const variantClasses = {
  default: 'bg-gray-700 text-gray-300',
  pending: 'bg-gray-700 text-gray-300',
  in_progress: 'bg-blue-900 text-blue-300',
  completed: 'bg-green-900 text-green-300',
  failed: 'bg-red-900 text-red-300',
  info: 'bg-apl-900 text-apl-300',
  warning: 'bg-yellow-900 text-yellow-300',
};

export default function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
