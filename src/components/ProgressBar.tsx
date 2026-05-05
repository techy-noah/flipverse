interface ProgressBarProps {
  value: number;
  max: number;
  className?: string;
  color?: 'primary' | 'success' | 'error' | 'warning';
}

const colorMap = {
  primary: 'bg-primary',
  success: 'bg-success',
  error: 'bg-error',
  warning: 'bg-warning',
};

export function ProgressBar({ value, max, className = '', color = 'primary' }: ProgressBarProps) {
  const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;

  return (
    <div className={`w-full bg-surface-elevated rounded-full h-2 overflow-hidden ${className}`}>
      <div
        className={`h-full ${colorMap[color]} transition-all duration-300 ease-out rounded-full`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
