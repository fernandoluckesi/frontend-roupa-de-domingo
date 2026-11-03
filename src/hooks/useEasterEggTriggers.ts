import { useEffect, useRef, useState } from "react";

const KONAMI = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

/** Easter egg #1: sequência do Konami Code em qualquer tela. */
export function useKonamiCode(onComplete: () => void): void {
  const progress = useRef(0);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const expected = KONAMI[progress.current];
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;

      if (key === expected) {
        progress.current += 1;
        if (progress.current === KONAMI.length) {
          progress.current = 0;
          onComplete();
        }
      } else {
        progress.current = key === KONAMI[0] ? 1 : 0;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onComplete]);
}

/** Easter egg #3: digitar uma palavra específica fora de campos de texto. */
export function useTypedPhrase(phrase: string, onMatch: () => void): void {
  const buffer = useRef("");

  useEffect(() => {
    const target = phrase.toLowerCase();

    const handler = (event: KeyboardEvent) => {
      const el = event.target as HTMLElement | null;
      const typingInField =
        el &&
        (el.tagName === "INPUT" ||
          el.tagName === "TEXTAREA" ||
          el.isContentEditable);
      if (typingInField) return;
      if (event.key.length !== 1) return;

      buffer.current = (buffer.current + event.key.toLowerCase()).slice(
        -target.length,
      );

      if (buffer.current === target) {
        buffer.current = "";
        onMatch();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [phrase, onMatch]);
}

/** Easter egg #2: N cliques no mesmo elemento dentro de uma janela de tempo. */
export function useClickStreak(
  target: number,
  onComplete: () => void,
  windowMs = 2500,
): () => void {
  const count = useRef(0);
  const timer = useRef<number | null>(null);

  return () => {
    count.current += 1;
    if (timer.current) window.clearTimeout(timer.current);

    if (count.current >= target) {
      count.current = 0;
      onComplete();
      return;
    }

    timer.current = window.setTimeout(() => {
      count.current = 0;
    }, windowMs);
  };
}

/** Easter egg #6: permanecer com o mouse sobre um elemento por X ms. */
export function useLongHover(
  durationMs: number,
  onComplete: () => void,
): { onMouseEnter: () => void; onMouseLeave: () => void } {
  const timer = useRef<number | null>(null);

  const clear = () => {
    if (timer.current) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
  };

  useEffect(() => clear, []);

  return {
    onMouseEnter: () => {
      clear();
      timer.current = window.setTimeout(onComplete, durationMs);
    },
    onMouseLeave: clear,
  };
}

export function useDebouncedValue<T>(value: T, delayMs = 400): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(id);
  }, [value, delayMs]);

  return debounced;
}
