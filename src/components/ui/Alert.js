import { clsx } from 'clsx';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';

const alertVariants = {
  default: 'bg-blue-50 border-blue-200 text-blue-800',
  destructive: 'bg-red-50 border-red-200 text-red-800',
  success: 'bg-green-50 border-green-200 text-green-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800'
};

const iconMap = {
  default: Info,
  destructive: XCircle,
  success: CheckCircle,
  warning: AlertCircle
};

export function Alert({
  className,
  variant = 'default',
  children,
  ...props
}) {
  const Icon = iconMap[variant];

  return (
    <div
      className={clsx(
        'relative w-full rounded-xs border p-4',
        alertVariants[variant],
        className
      )}
      {...props}
    >
      <div className="flex">
        <Icon className="h-5 w-5 flex-shrink-0" />
        <div className="ml-3 flex-1">{children}</div>
      </div>
    </div>
  );
}

export function AlertTitle({ className, children, ...props }) {
  return (
    <h5
      className={clsx('mb-1 font-medium leading-none tracking-tight', className)}
      {...props}
    >
      {children}
    </h5>
  );
}

export function AlertDescription({ className, children, ...props }) {
  return (
    <div
      className={clsx('text-sm [&_p]:leading-relaxed', className)}
      {...props}
    >
      {children}
    </div>
  );
}