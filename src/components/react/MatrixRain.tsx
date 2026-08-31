import { useEffect, useRef } from 'react';

const CHARS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789@#$%&*+-/<>{}[]';

/** Full-screen glyph rain. Escape, click, or 15 seconds ends it. */
export default function MatrixRain({ onExit }: { onExit: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const font = 14;
    let columns = 0;
    let drops: number[] = [];

    const resize = () => {
      canvas.width = innerWidth;
      canvas.height = innerHeight;
      columns = Math.ceil(innerWidth / font);
      drops = Array.from({ length: columns }, () => Math.random() * -50);
    };
    resize();

    const timer = setInterval(() => {
      // Translucent wipe instead of a clear — this is what makes the trails.
      ctx.fillStyle = 'rgba(0, 0, 0, 0.06)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#00ff9c';
      ctx.font = `${font}px monospace`;
      for (let i = 0; i < columns; i++) {
        const char = CHARS[Math.floor(Math.random() * CHARS.length)];
        ctx.fillText(char, i * font, drops[i] * font);
        if (drops[i] * font > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
    }, 38);

    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onExit();
    const stop = setTimeout(onExit, 15_000);
    addEventListener('resize', resize);
    addEventListener('keydown', onKey);

    return () => {
      clearInterval(timer);
      clearTimeout(stop);
      removeEventListener('resize', resize);
      removeEventListener('keydown', onKey);
    };
  }, [onExit]);

  return (
    <div className="fixed inset-0 z-[9999] bg-black" onClick={onExit} role="presentation">
      <canvas ref={ref} className="h-full w-full" />
      <p className="absolute bottom-6 left-1/2 -translate-x-1/2 font-mono text-xs uppercase tracking-[0.2em] text-[#00ff9c]">
        ESC
      </p>
    </div>
  );
}
