import React, { useEffect, useRef } from 'react';
import { MathfieldElement } from 'mathlive';
import { initMathLive, showVirtualKeyboard } from '../services/MathLiveConfig';

// Ensure MathLive configuration is initialized
initMathLive();

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
}

export interface MathEditorProps {
  value: string;
  onChange: (latex: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  className?: string;
}

/**
 * A simplified MathLive editor component that explicitly manages
 * the virtual keyboard visibility on focus using the centralized config.
 */
export default function MathEditor({
  value,
  onChange,
  readOnly = false,
  className = '',
}: MathEditorProps) {
  const mfRef = useRef<MathfieldElement>(null);

  // Sync value from props to the editor without causing infinite loops
  useEffect(() => {
    const mf = mfRef.current;
    if (mf && mf.value !== value) {
      mf.value = value;
    }
  }, [value]);

  // Set up event listeners and configure the keyboard policy
  useEffect(() => {
    const mf = mfRef.current;
    if (!mf) return;

    // Explicitly set policy to manual to reliably trigger the keyboard ourselves
    mf.mathVirtualKeyboardPolicy = 'manual';

    const handleInput = () => {
      onChange(mf.value);
    };

    const handleFocus = () => {
      if (!readOnly) {
        showVirtualKeyboard();
      }
    };

    // Attach listeners
    mf.addEventListener('input', handleInput);
    mf.addEventListener('focusin', handleFocus);
    mf.addEventListener('click', handleFocus);

    return () => {
      mf.removeEventListener('input', handleInput);
      mf.removeEventListener('focusin', handleFocus);
      mf.removeEventListener('click', handleFocus);
    };
  }, [onChange, readOnly]);

  return (
    <math-field
      ref={mfRef as any}
      class={className}
      // @ts-ignore
      read-only={readOnly ? 'true' : undefined}
      style={{
        width: '100%',
        padding: '12px',
        borderRadius: '8px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        background: 'rgba(0, 0, 0, 0.2)',
        color: 'white',
        outline: 'none',
        fontSize: '18px',
      }}
    />
  );
}
