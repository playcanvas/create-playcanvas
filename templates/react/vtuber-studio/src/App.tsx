import { useEffect, useRef } from 'react';

import { createStudio } from './studio.js';

import './starter.css';

function App() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        let dispose: (() => void) | undefined;
        let cancelled = false;
        void createStudio(canvas)
            .then((cleanup) => {
                if (cancelled) cleanup();
                else dispose = cleanup;
            })
            .catch((error: unknown) => {
                if (cancelled) return;
                const message = document.createElement('p');
                message.setAttribute('role', 'alert');
                message.textContent = `VTuber Studioを起動できませんでした: ${
                    error instanceof Error ? error.message : String(error)
                }`;
                message.style.cssText =
                    'position:fixed;z-index:20;inset:1rem auto auto 1rem;max-width:32rem;padding:1rem;background:#3b202a;color:white;border-radius:12px';
                document.body.append(message);
            });

        return () => {
            cancelled = true;
            dispose?.();
        };
    }, []);

    return <canvas ref={canvasRef} aria-label="PlayCanvas VTuber Studio scene" />;
}

export default App;
