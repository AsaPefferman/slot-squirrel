
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedTransitionProps {
  children: React.ReactNode;
  show: boolean;
  animateIn?: string;
  animateOut?: string;
  duration?: number;
  className?: string;
}

const AnimatedTransition: React.FC<AnimatedTransitionProps> = ({
  children,
  show,
  animateIn = 'animate-fade-in',
  animateOut = 'animate-fade-out',
  duration = 300,
  className = '',
}) => {
  const [shouldRender, setShouldRender] = useState(show);
  const [animation, setAnimation] = useState(show ? animateIn : '');

  useEffect(() => {
    if (show) {
      setShouldRender(true);
      setAnimation(animateIn);
    } else {
      setAnimation(animateOut);
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, animateIn, animateOut, duration]);

  return shouldRender ? (
    <div className={cn(animation, className)} style={{ animationDuration: `${duration}ms` }}>
      {children}
    </div>
  ) : null;
};

export default AnimatedTransition;
