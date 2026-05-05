'use client';

interface ActionButtonsProps {
  onKnew: () => void;
  onDidntKnow: () => void;
}

export function ActionButtons({ onKnew, onDidntKnow }: ActionButtonsProps) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDidntKnow();
        }}
        className="flex-1 h-11 bg-error/15 hover:bg-error/25 active:bg-error/35 active:scale-[0.96] text-error rounded-xl font-medium text-sm transition-all duration-150 will-change-transform"
        aria-label="Mark as didn't know"
      >
        Still Learning
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onKnew();
        }}
        className="flex-1 h-11 bg-success/15 hover:bg-success/25 active:bg-success/35 active:scale-[0.96] text-success rounded-xl font-medium text-sm transition-all duration-150 will-change-transform"
        aria-label="Mark as knew it"
      >
        Got It
      </button>
    </div>
  );
}
