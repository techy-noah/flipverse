import { StatItem } from '@/types';

interface StatCardProps {
  item: StatItem;
  compact?: boolean;
}

const colorMap = {
  primary: { bg: 'bg-primary/15', text: 'text-primary' },
  success: { bg: 'bg-success/15', text: 'text-success' },
  error: { bg: 'bg-error/15', text: 'text-error' },
  warning: { bg: 'bg-warning/15', text: 'text-warning' },
};

export function StatCard({ item, compact = false }: StatCardProps) {
  const colors = colorMap[item.color || 'primary'];

  if (compact) {
    return (
      <div className="bg-surface rounded-xl border border-border p-3 text-center">
        <div className={`text-lg font-bold ${colors.text}`}>{item.value}</div>
        <div className="text-[10px] text-text-secondary mt-0.5">{item.label}</div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-xl border border-border p-4">
      <div className="flex items-center gap-3">
        {item.icon && (
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors.bg}`}>
            <span className={colors.text}>{item.icon}</span>
          </div>
        )}
        <div>
          <div className={`text-2xl font-bold ${colors.text}`}>{item.value}</div>
          <div className="text-xs text-text-secondary">{item.label}</div>
        </div>
      </div>
    </div>
  );
}
