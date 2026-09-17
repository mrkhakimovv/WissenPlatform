import React, { useEffect, useRef } from 'react';
import { MathfieldElement } from 'mathlive';
import { initMathLive, showVirtualKeyboard, hideVirtualKeyboard } from '../services/MathLiveConfig';

// MUHIM: fontlar va tovushlarni birinchi maydon yaratilishidan OLDIN sozlaymiz.
initMathLive();

interface Props {
  value: string; // LaTeX
  onChange: (latex: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  className?: string;
}

export default function MathAnswerField({
  value,
  onChange,
  placeholder = 'Javob',
  readOnly = false,
  className = ''
}: Props) {
  const mfRef = useRef<MathfieldElement>(null);

  // Sync value from props to MathLive
  useEffect(() => {
    const mf = mfRef.current;
    if (mf && mf.value !== value) {
      mf.value = value;
    }
  }, [value]);

  useEffect(() => {
    const mf = mfRef.current;
    if (!mf) return;

    if (!readOnly) {
       mf.mathVirtualKeyboardPolicy = 'manual';
    }

    const handleInput = () => {
      onChange(mf.value);
    };
    
    const handleFocus = () => {
      if (!readOnly) {
         showVirtualKeyboard();
      }
    };

    const handleFocusOut = (e: FocusEvent) => {
      if (!readOnly) {
         const related = (e.relatedTarget || (e as any).explicitOriginalTarget) as HTMLElement;
         if (related && related.tagName && related.tagName.toUpperCase().includes('MATH-VIRTUAL-KEYBOARD')) {
            return;
         }
         hideVirtualKeyboard();
      }
    };

    mf.addEventListener('input', handleInput);
    mf.addEventListener('focusin', handleFocus);
    mf.addEventListener('click', handleFocus);
    mf.addEventListener('focusout', handleFocusOut);
    
    return () => {
      mf.removeEventListener('input', handleInput);
      mf.removeEventListener('focusin', handleFocus);
      mf.removeEventListener('click', handleFocus);
      mf.removeEventListener('focusout', handleFocusOut);
    };
  }, [onChange, readOnly]);

  return (
    <div className={`w-full glass-panel rounded-xl overflow-hidden focus-within:border-[#FEC204] border border-white/10 ${className}`}>
      <math-field
        ref={mfRef as any}
        // @ts-ignore
        read-only={readOnly ? "true" : undefined}
        style={{
          width: '100%',
          minHeight: '44px',
          padding: '8px 12px',
          background: 'transparent',
          color: '#fafafa',
          fontSize: '18px',
          border: 'none',
          outline: 'none',
          '--caret-color': '#FEC204',
          '--selection-background-color': 'rgba(254,194,4,0.25)',
        } as React.CSSProperties}
      >
        {value}
      </math-field>
    </div>
  );
}

let ce: any = null;

export async function answersEqual(a: string, b: string): Promise<boolean> {
  if (!a || !b) return false;
  
  const strA = String(a).replace(/\s/g, '').toLowerCase();
  const strB = String(b).replace(/\s/g, '').toLowerCase();

  if (strA === strB) return true;
  
  try {
    if (!ce) {
      const { ComputeEngine } = await import('@cortex-js/compute-engine');
      ce = new ComputeEngine();
    }

    const exprA = ce.parse(strA);
    const exprB = ce.parse(strB);

    // 1. Numerik qiymat orqali solishtirish (faqat sonlar bo'lsa)
    const numA = exprA.N().valueOf();
    const numB = exprB.N().valueOf();
    
    if (typeof numA === 'number' && typeof numB === 'number' && !isNaN(numA) && !isNaN(numB)) {
      if (Math.abs(numA - numB) < 1e-10) return true;
    }

    // 2. Algebraik soddalashtirish orqali solishtirish
    const simA = exprA.simplify();
    const simB = exprB.simplify();
    if (simA.isSame(simB)) return true;

  } catch(e) {
    console.error("Math parsing error:", e);
  }

  return false;
}
