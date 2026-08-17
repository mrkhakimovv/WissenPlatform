// src/components/MathAnswerField.tsx
// Matematik virtual klaviaturaga ega javob kiritish maydoni (MathLive).
// Loyiha temasiga (qora fon + #FEC204) moslangan.
import React, { useEffect, useRef } from 'react';
import 'mathlive';
import { MathfieldElement } from 'mathlive';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'math-field': React.DetailedHTMLProps<
        React.HTMLAttributes<MathfieldElement>,
        MathfieldElement
      >;
    }
  }
  interface Window {
    mathVirtualKeyboard: any;
  }
}

interface Props {
  /** LaTeX ko'rinishidagi joriy qiymat (masalan "\\frac{1}{2}") */
  value: string;
  /** Har o'zgarishda LaTeX qaytaradi */
  onChange: (latex: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  className?: string;
}

export default function MathAnswerField({
  value,
  onChange,
  placeholder = "To'g'ri javobni kiriting",
  readOnly = false,
  className = 'w-full glass-panel p-2 outline-none focus:border-[#FEC204]/50 text-white text-center font-bold min-h-10',
}: Props) {
  const ref = useRef<MathfieldElement>(null);

  useEffect(() => {
    const mf = ref.current;
    if (!mf) return;

    // Klaviatura fokusda ochiladi (desktop + telefon)
    mf.mathVirtualKeyboardPolicy = 'manual';
    if (placeholder) mf.setAttribute('placeholder', placeholder);

    // Faqat son + matematik belgilar qatlamlari (kasr, ildiz, daraja, π ichida bor)
    window.mathVirtualKeyboard.layouts = ['numeric', 'symbols'];

    const showKb = () => window.mathVirtualKeyboard.show();
    const hideKb = () => window.mathVirtualKeyboard.hide();
    const handleInput = () => onChange(mf.value);

    mf.addEventListener('focusin', showKb);
    mf.addEventListener('focusout', hideKb);
    mf.addEventListener('input', handleInput);
    return () => {
      mf.removeEventListener('focusin', showKb);
      mf.removeEventListener('focusout', hideKb);
      mf.removeEventListener('input', handleInput);
    };
  }, [onChange, placeholder]);

  // Tashqaridan value o'zgarsa sinxronlaymiz
  useEffect(() => {
    const mf = ref.current;
    if (mf && mf.value !== value) mf.value = value;
  }, [value]);

  return (
    <math-field
      ref={ref as any}
      // @ts-ignore — web-komponent atributi
      read-only={readOnly ? 'true' : undefined}
      className={className}
      style={
        {
          // MathLive rang o'zgaruvchilari — tema bilan moslash
          '--caret-color': '#FEC204',
          '--selection-background-color': 'rgba(254,194,4,0.25)',
          '--contains-highlight-background-color': 'rgba(254,194,4,0.15)',
          fontSize: '18px',
        } as React.CSSProperties
      }
    >
      {value}
    </math-field>
  );
}

/**
 * Javoblarni matematik jihatdan solishtirish.
 * "1/2", "0.5", "\frac{1}{2}", "2/4" — hammasini teng deb tan oladi.
 */
export async function answersEqual(a: string, b: string): Promise<boolean> {
  const A = (a ?? '').trim();
  const B = (b ?? '').trim();
  if (!A || !B) return false;
  try {
    const { ComputeEngine } = await import('@cortex-js/compute-engine');
    const ce = new ComputeEngine();
    const na = ce.parse(A).N().valueOf();
    const nb = ce.parse(B).N().valueOf();
    if (typeof na === 'number' && typeof nb === 'number') {
      return Math.abs(na - nb) < 1e-9;
    }
  } catch {
    /* compute-engine yo'q — pastdagi matn solishtiruviga o'tamiz */
  }
  // Zaxira: probel/registrni e'tiborsiz qoldirib matn solishtiruvi
  return A.replace(/\s/g, '').toLowerCase() === B.replace(/\s/g, '').toLowerCase();
}
