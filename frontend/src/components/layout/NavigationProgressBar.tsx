import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export function NavigationProgressBar() {
  const location = useLocation();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // When location changes, start progress animation
    setVisible(true);
    setProgress(20);

    const timer1 = setTimeout(() => {
      setProgress(65);
    }, 80);

    const timer2 = setTimeout(() => {
      setProgress(100);
    }, 220);

    const timer3 = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 450);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [location.pathname, location.search]);

  if (!visible && progress === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: 3,
        zIndex: 99999,
        pointerEvents: 'none',
        background: 'transparent',
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${progress}%`,
          background: 'linear-gradient(90deg, #d4781a 0%, #f4a83a 60%, #c8a84b 100%)',
          boxShadow: '0 0 8px rgba(212, 120, 26, 0.7), 0 0 4px rgba(200, 168, 75, 0.5)',
          transition: 'width 200ms cubic-bezier(0.4, 0, 0.2, 1), opacity 180ms ease-out',
          opacity: visible ? 1 : 0,
        }}
      />
    </div>
  );
}

export default NavigationProgressBar;
