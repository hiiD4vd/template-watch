'use client';

import { useEffect, useRef, useState } from 'react';
import WatchContent from './WatchContent';

export default function WatchExperience() {
  const root = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let dispose: (() => void) | undefined;
    async function initialize() {
      try {
        const { startWatch } = await import('../runtime/start');
        if (controller.signal.aborted || !root.current) return;
        dispose = await startWatch(root.current, controller.signal);
      } catch (cause) {
        console.error('Watch initialization failed', cause);
        if (!controller.signal.aborted)
          setError('The watch could not load. Please refresh to try again.');
      }
    }
    initialize();
    return () => {
      controller.abort();
      dispose?.();
    };
  }, []);

  return (
    <div id="app" ref={root}>
      <div id="loader" role="status" aria-live="polite">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 700 700"
          aria-hidden="true"
        >
          <path
            strokeOpacity="1"
            stroke="#DCDCDC"
            d="M350 695c190.538 0 345-154.462 345-345S540.538 5 350 5 5 159.462 5 350s154.462 345 345 345Z"
          />
          <path
            className="progress-arc"
            strokeOpacity="1"
            strokeWidth="3"
            stroke="#D3D3D3"
            d="M350 695c190.538 0 345-154.462 345-345S540.538 5 350 5 5 159.462 5 350s154.462 345 345 345Z"
          />
        </svg>
        <div>
          {error || (
            <>
              <span>Now</span> loading
            </>
          )}
        </div>
      </div>
      <div id="canvas-wrapper" aria-hidden="true" />
      <div id="root">
        <WatchContent />
      </div>
    </div>
  );
}
