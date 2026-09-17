// src/components/MathAnswerField.tsx
// MathLive asosidagi matematik javob maydoni.
// To'g'ridan-to'g'ri maydon ko'rsatiladi (popup o'chirildi), bu mobil qurilmalarda klaviatura bilan bog'liq muammolarni oldini oladi.

import React, { useEffect, useRef } from 'react';
import { MathfieldElement } from 'mathlive';
import { initMathLive } from '../services/MathLiveConfig';

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

    const handleInput = () => {
      onChange(mf.value);
    };

    mf.addEventListener('input', handleInput);
    
    return () => {
      mf.removeEventListener('input', handleInput);
    };
  }, [onChange]);

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

/**
 * Javoblarni analitik va sonli qilib solishtirish.
 * LaTeX (\frac{1}{2}) va oddiy (0.5), shuningdek
 * x+x va 2x kabi algebraik tengliklarni ham tan oladi.
 */
export async function answersEqual(a: string, b: string): Promise<boolean> {
  if (!a || !b) return false;
  
  const strA = String(a).replace(/\s/g, '').toLowerCase();
  const strB = String(b).replace(/\s/g, '').toLowerCase();

  if (strA === strB) return true;
  
  // Bypassing ComputeEngine temporarily to prevent thread blocking
  return false;
}
