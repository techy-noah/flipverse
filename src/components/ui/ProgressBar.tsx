interface ProgressBarProps {
  value: number;
  max: number;
  className?: string;
}

export function ProgressBar({ value, max, className = '' }: ProgressBarProps) {
  const percentage = max > 0 ? (value / max) * 100 : 0;

  return (
    <div className={`w-full bg-surface-elevated rounded-full h-2 overflow-hidden ${className}`}>
      <div
        className="h-full bg-primary transition-all duration-300 ease-out rounded-full"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
