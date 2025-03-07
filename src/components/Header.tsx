
import React from 'react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className }) => {
  return (
    <header className={cn("py-6", className)}>
      <div className="container flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5 text-primary"
            >
              <path d="M12 22a9 9 0 0 1 0-18C14.08 4 16.5 2 16.5 2c.33 2 .5 4 .5 6 0 8-4 14-8 14Z" />
              <path d="M5 12a4 4 0 0 1 4-4c4.12 0 8.5-3.16 9-3.97.24.96.48 2.43.48 5.6 0 5.53-2 9.4-6.97 9.4-2.23 0-3.64-.78-4.8-2.24" />
              <rect x="7" y="11" width="2" height="2" />
              <rect x="11" y="11" width="2" height="2" />
              <rect x="15" y="11" width="2" height="2" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold">Spec Review Sign Up</h1>
        </div>
      </div>
    </header>
  );
};

export default Header;
