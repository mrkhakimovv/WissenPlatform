// src/components/MathAnswerField.tsx
// Bosilganda POPUP (modal) ochiladi: katta matematik maydon + virtual klaviatura
// + Saqlash/Yopish tugmalari. Telefon uchun qulay (skrinshotdagi kabi).
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
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
  value: string;
  onChange: (latex: string) => void;
  placeholder?: string;
  readOnly?: boolean;
}

export default function MathAnswerField({
  value,
  onChange,
  placeholder = 'Javob',
  readOnly = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);
  const editRef = useRef<MathfieldElement>(null);
  const displayRef = useRef<MathfieldElement>(null);

  useEffect(() => {
    const mf = displayRef.current;
    if (mf && mf.value !== value) mf.value = value;
  }, [value]);

  const openModal = () => {
    if (readOnly) return;
    setDraft(value);
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const mf = editRef.current;
    if (!mf) return;

    mf.value = draft;
    mf.mathVirtualKeyboardPolicy = 'auto';
    window.mathVirtualKeyboard.layouts = ['numeric', 'symbols'];

    const handleInput = () => setDraft(mf.value);
    mf.addEventListener('input', handleInput);

    const t = setTimeout(() => {
      mf.focus();
      window.mathVirtualKeyboard.show();
    }, 60);

    return () => {
      clearTimeout(t);
      mf.removeEventListener('input', handleInput);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const save = () => {
    onChange(draft);
    window.mathVirtualKeyboard.hide();
    setOpen(false);
  };

  const close = () => {
    window.mathVirtualKeyboard.hide();
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="w-full glass-panel p-2 min-h-10 flex items-center justify-between gap-2 text-left hover:border-[#FEC204]/50"
      >
        {value ? (
          <math-field
            ref={displayRef as any}
            // @ts-ignore
            read-only="true"
            style={{
              pointerEvents: 'none',
              background: 'transparent',
              color: '#fafafa',
              fontSize: '16px',
              border: 'none',
            }}
          >
            {value}
          </math-field>
        ) : (
          <span className="text-white/30 text-sm">{placeholder}</span>
        )}
        <span
          className="shrink-0 w-8 h-8 rounded-md bg-[#FEC204] text-black flex items-center justify-center text-lg"
          aria-hidden
        >
          ⌨
        </span>
      </button>

      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-[9998] bg-black/60 flex items-start justify-center pt-24 px-4"
            onClick={close}
          >
            <div
              className="w-full max-w-md bg-[#1a1a1a] rounded-2xl p-4 border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <math-field
                ref={editRef as any}
                style={
                  {
                    width: '100%',
                    minHeight: '56px',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    border: '2px solid #FEC204',
                    background: '#0d0d0d',
                    color: '#fafafa',
                    fontSize: '22px',
                    '--caret-color': '#FEC204',
                    '--selection-background-color': 'rgba(254,194,4,0.25)',
                  } as React.CSSProperties
                }
              >
                {draft}
              </math-field>

              <div className="flex items-center justify-center gap-3 mt-4">
                <button
                  type="button"
                  onClick={save}
                  className="px-6 py-2 rounded-lg bg-[#FEC204] text-black font-bold"
                >
                  Saqlash
                </button>
                <button
                  type="button"
                  onClick={close}
                  className="px-6 py-2 rounded-lg bg-white/10 text-white font-bold"
                >
                  Yopish
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

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
    /* compute-engine yo'q — matn solishtiruviga o'tamiz */
  }
  return A.replace(/\s/g, '').toLowerCase() === B.replace(/\s/g, '').toLowerCase();
}