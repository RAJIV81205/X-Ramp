import { clsx } from 'clsx';

export function Input({
  className,
  type = 'text',
  error,
  label,
  ...props
}) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-zinc-900">
          {label}
        </label>
      )}
      <input
        type={type}
        className={clsx(
          'flex h-10 w-full rounded-xs border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900',
          'placeholder:text-zinc-500',
          'focus:outline-none focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950',
          'disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-red-500 focus:ring-red-500 focus:border-red-500',
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}