import { forwardRef, ButtonHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';
import Spinner from './Spinner';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  outline: 'btn-outline',
  ghost: 'bg-transparent text-textPrimary hover:bg-border/50 rounded-button px-4 py-2.5 font-medium transition-colors',
  danger:
    'bg-danger text-white rounded-button px-4 py-2.5 font-medium transition-all duration-200 ease-smooth hover:bg-danger/90 active:scale-[0.98]',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'text-sm px-3 py-1.5',
  md: '', // default sizing already lives in the variant classes above
  lg: 'text-base px-6 py-3',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', isLoading = false, disabled, className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(VARIANTS[variant], SIZES[size], 'inline-flex items-center justify-center gap-2', className)}
        {...props}
      >
        {isLoading && <Spinner size="sm" className="text-current" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
