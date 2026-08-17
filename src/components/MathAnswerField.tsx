// src/components/MathAnswerField.tsx
// MathLive asosidagi matematik javob maydoni (to'g'ri sozlangan).
// Bosilganda popup ochiladi: MathLive maydoni + virtual klaviatura + Saqlash/Yopish.
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import 'mathlive';
import { MathfieldElement } from 'mathlive';

// MUHIM: fontlar va tovushlarni birinchi maydon yaratilishidan OLDIN sozlaymiz.
// Vite/PWA da nisbiy './fonts' yo'li 404 beradi — shuning uchun CDN ishlatamiz.
// (Bu sozlama modul import qilinganda bir marta ishlaydi.)
try {
  if (MathfieldElement.fontsDirectory !== null) {
    MathfieldElement.fontsDirectory =
      'https://cdn.jsdelivr.net/npm/mathlive@0.110.0/fonts';
  }
  MathfieldElement.soundsDirectory = null; // tovush 404 larini o'chiramiz
} catch {
  /* ba'zi muhitlarda static setterlar bo'lmasligi mumkin */
}

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
  value: string; // LaTeX
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
  const [draft, setDraft] = useState('');
  const editRef = useRef<MathfieldElement>(null);
  const displayRef = useRef<MathfieldElement>(null);

  // Chipdagi ko'rinishни sinxronlash
  useEffect(() => {
    const mf = displayRef.current;
    if (mf && mf.value !== value) mf.value = value;
  }, [value, open]);

  const openModal = () => {
    if (readOnly) return;
    setDraft(value || '');
    setOpen(true);
  };

  // Modal ochilganда maydon + klaviaturани tayyorlash
  useEffect(() => {
    if (!open) return;
    const mf = editRef.current;
    if (!mf) return;

    mf.value = draft;
    mf.mathVirtualKeyboardPolicy = 'auto'; // touch qurilmalarda avtomatik ochiladi
    window.mathVirtualKeyboard.layouts = ['numeric', 'symbols'];

    const handleInput = () => setDraft(mf.value);
    mf.addEventListener('input', handleInput);

    // Fokus + klaviaturani majburan ko'rsatish (desktop uchun ham)
    const t = setTimeout(() => {
      mf.focus();
      try {
        window.mathVirtualKeyboard.show();
      } catch {}
    }, 80);

    return () => {
      clearTimeout(t);
      mf.removeEventListener('input', handleInput);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const save = () => {
    onChange(draft);
    try {
      window.mathVirtualKeyboard.hide();
    } catch {}
    setOpen(false);
  };

  const close = () => {
    try {
      window.mathVirtualKeyboard.hide();
    } catch {}
    setOpen(false);
  };

  return (
    <>
      {/* CHIP */}
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

      {/* POPUP */}
      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-[9998] bg-black/70 flex items-start justify-center pt-20 px-4"
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
                    minHeight: '60px',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    border: '2px solid #FEC204',
                    background: '#0d0d0d',
                    color: '#fafafa',
                    fontSize: '24px',
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
                  className="flex-1 py-3 rounded-lg bg-[#FEC204] text-black font-bold"
                >
                  Saqlash
                </button>
                <button
                  type="button"
                  onClick={close}
                  className="flex-1 py-3 rounded-lg bg-white/10 text-white font-bold"
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

/**
 * Javoblarni son sifatida solishtirish.
 * LaTeX (\frac{1}{2}) va oddiy (0.5) — ikkalasini ham tan oladi.
 */
export async function answersEqual(a: string, b: string): Promise<boolean> {
  const na = await toNumber(a);
  const nb = await toNumber(b);
  if (na !== null && nb !== null) return Math.abs(na - nb) < 1e-9;
  return (a ?? '').replace(/\s/g, '').toLowerCase() ===
         (b ?? '').replace(/\s/g, '').toLowerCase();
}

async function toNumber(x: string): Promise<number | null> {
  if (!x) return null;
  // 1) compute-engine orqali LaTeX ni sonига aylantiramiz
  try {
    const { ComputeEngine } = await import('@cortex-js/compute-engine');
    const ce = new ComputeEngine();
    const v = ce.parse(x).N().valueOf();
    if (typeof v === 'number' && isFinite(v)) return v;
  } catch {
    /* fallback */
  }
  return null;
}