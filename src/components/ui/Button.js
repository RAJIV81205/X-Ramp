import { clsx } from 'clsx';

const buttonVariants = {
  variant: {
    default: 'bg-zinc-950 text-white hover:bg-zinc-800 focus:ring-zinc-950 shadow-sm',
    destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    outline: 'border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 focus:ring-zinc-950',
    secondary: 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200 focus:ring-zinc-500',
    ghost: 'text-zinc-700 hover:bg-zinc-100 focus:ring-zinc-500',
    link: 'text-blue-600 underline-offset-4 hover:underline focus:ring-blue-500'
  },
  size: {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 rounded-xs px-3',
    lg: 'h-11 rounded-xs px-8',
    icon: 'h-10 w-10'
  }
};

export function Button({
  className,
  variant = 'default',
  size = 'default',
  disabled = false,
  loading = false,
  children,
  ...props
}) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center rounded-xs text-sm font-medium transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        buttonVariants.variant[variant],
        buttonVariants.size[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="mr-2 h-4 w-4 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}