'use client';

import { useRouter } from 'next/navigation';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  action?: React.ReactNode;
}

export function Header({ title, showBack = false, action }: HeaderProps) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="flex items-center h-14 px-4 max-w-[360px] mx-auto">
        {showBack && (
          <button
            onClick={() => router.back()}
            className="mr-3 p-2 -ml-2 rounded-lg hover:bg-surface-elevated transition-colors"
            aria-label="Go back"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-text-secondary"
            >
              <path d="M19 12H5" />
              <path d="m12 19-7-7 7-7" />
            </svg>
          </button>
        )}
        <h1 className="text-base font-semibold text-text flex-1">{title}</h1>
        {action}
      </div>
    </header>
  );
}
