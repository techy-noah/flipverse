export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="bg-surface rounded-xl border border-border p-4 animate-pulse">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-border/50" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-border/50 rounded w-2/3" />
          <div className="h-3 bg-border/30 rounded w-1/2" />
        </div>
      </div>
      <div className="h-2 bg-border/30 rounded w-full mb-2" />
      <div className="h-10 bg-border/40 rounded w-full" />
    </div>
  );
}

export function SkeletonText({ width = 'full', height = 'sm' }: { width?: 'full' | '2/3' | '1/2' | '1/3'; height?: 'xs' | 'sm' | 'md' | 'lg' }) {
  const widthClasses = { full: 'w-full', '2/3': 'w-2/3', '1/2': 'w-1/2', '1/3': 'w-1/3' };
  const heightClasses = { xs: 'h-2', sm: 'h-3', md: 'h-4', lg: 'h-5' };

  return (
    <div className={`${widthClasses[width]} ${heightClasses[height]} bg-border/40 rounded animate-pulse`} />
  );
}

export function SkeletonDeckList() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-surface rounded-xl border border-border p-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-border/50 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-border/50 rounded w-2/3" />
              <div className="h-3 bg-border/30 rounded w-1/2" />
            </div>
            <div className="w-6 h-6 bg-border/30 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonCardLarge() {
  return (
    <div className="bg-surface rounded-2xl border border-border animate-pulse" style={{ height: '420px' }}>
      <div className="p-4 h-full flex flex-col">
        <div className="flex justify-between mb-8">
          <div className="h-3 w-16 bg-border/40 rounded" />
          <div className="h-5 w-12 bg-border/30 rounded-full" />
        </div>
        <div className="flex-1 flex flex-col items-center justify-center space-y-3 px-6">
          <div className="h-5 w-full bg-border/40 rounded" />
          <div className="h-5 w-4/5 bg-border/40 rounded" />
          <div className="h-5 w-2/3 bg-border/30 rounded" />
        </div>
        <div className="flex justify-center gap-1.5 mt-auto pb-2">
          <div className="h-3 w-24 bg-border/30 rounded" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonProfile() {
  return (
    <div className="space-y-4">
      <div className="bg-surface rounded-xl border border-border p-4 text-center animate-pulse">
        <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-border/50" />
        <div className="h-4 w-24 mx-auto bg-border/40 rounded" />
        <div className="h-3 w-40 mx-auto mt-2 bg-border/30 rounded" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-surface rounded-xl border border-border p-3 text-center animate-pulse">
            <div className="h-6 w-8 mx-auto bg-border/40 rounded mb-1" />
            <div className="h-2 w-12 mx-auto bg-border/30 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );
}
