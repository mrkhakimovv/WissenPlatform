import 'mathlive';
import { MathfieldElement, initVirtualKeyboardInCurrentBrowsingContext } from 'mathlive';

declare global {
  interface Window {
    mathVirtualKeyboard: any;
  }
}

let isInitialized = false;

/**
 * Centralized service to configure MathLive globally.
 * Should be called once during app initialization or first use.
 */
export const initMathLive = () => {
  if (isInitialized) return;

  try {
    // Iframe ichida klaviatura ko'rinmay qolishi muammosini hal qilamiz.
    // Bu funksiya orqali klaviatura Parent oynaga (AI Studio) chiqishga urinmasdan,
    // to'g'ridan-to'g'ri joriy Iframe (dasturimiz) ichida render qilinadi.
    initVirtualKeyboardInCurrentBrowsingContext();
  } catch (e) {
    console.warn('Failed to initialize virtual keyboard in iframe:', e);
  }

  try {
    // MUHIM: fontlar va tovushlarni birinchi maydon yaratilishidan OLDIN sozlaymiz.

    // Endi CDN emas, balki /public papkasidagi mahalliy (local) mathlive resurslari ishlatiladi.
    if (MathfieldElement.fontsDirectory !== null) {
      MathfieldElement.fontsDirectory = '/mathlive/fonts';
    }
    if (MathfieldElement.soundsDirectory !== null) {
      MathfieldElement.soundsDirectory = '/mathlive/sounds';
    }
  } catch (e) {
    console.warn('Failed to configure MathLive directories:', e);
  }

  // MUHIM: klaviatura standart z-index'i 105, modal esa 99999.
  // Klaviatura modal ustidan chiqishi uchun z-index'ni :root ga qo'yamiz
  // (document.body kaskadlanmaydi — documentElement ishonchli).
  document.documentElement.style.setProperty('--keyboard-zindex', '100001');

  // Asl holatdagi, to'liq MathLive klaviaturasidan (Barcha funksiyalari, qatlamlari bilan)
  // foydalanish uchun maxsus cheklovlarni olib tashlaymiz.
  if (window.mathVirtualKeyboard) {
    window.mathVirtualKeyboard.layouts = 'default';
  }

  isInitialized = true;
};

export const showVirtualKeyboard = () => {
  if (window.mathVirtualKeyboard) {
    try {
      window.mathVirtualKeyboard.show();
    } catch (e) {
      console.warn('Failed to show virtual keyboard:', e);
    }
  } else {
    console.error('window.mathVirtualKeyboard is undefined! The keyboard cannot be shown.');
  }
};

export const hideVirtualKeyboard = () => {
  if (window.mathVirtualKeyboard) {
    try {
      window.mathVirtualKeyboard.hide();
    } catch (e) {
      console.warn('Failed to hide virtual keyboard:', e);
    }
  }
};

export type KeyboardLayoutPreset = 'default' | 'compact' | 'scientific' | 'geometry';

/**
 * Switch between predefined virtual keyboard layout presets 
 * to optimize the interface for specific subjects or use cases.
 */
export const setKeyboardLayout = (preset: KeyboardLayoutPreset) => {
  if (!window.mathVirtualKeyboard) return;

  switch (preset) {
    case 'compact':
      // Minimal layout, good for simple arithmetic or when screen real estate is critical
      window.mathVirtualKeyboard.layouts = ['numeric'];
      break;
    case 'scientific':
      // The default comprehensive MathLive layout for complex equations
      window.mathVirtualKeyboard.layouts = 'default';
      break;
    case 'geometry':
      // Custom layout focused on Geometry symbols, plus the standard numeric keyboard
      window.mathVirtualKeyboard.layouts = [
        'numeric',
        {
          label: 'Geometriya',
          tooltip: 'Geometriya belgilari',
          rows: [
            [
              { latex: '\\angle' },
              { latex: '\\triangle' },
              { latex: '\\circ' },
              { latex: '\\parallel' },
              { latex: '\\perp' },
              { latex: '\\sim' },
              { latex: '\\cong' },
              { latex: '\\pi' },
              { latex: '\\theta' },
              { latex: '\\alpha' }
            ],
            [
              { latex: '\\vec{#@}' },
              { latex: '\\overline{#@}' },
              { latex: '\\widehat{#@}' },
              { latex: '\\sin' },
              { latex: '\\cos' },
              { latex: '\\tan' },
              { latex: '\\cot' },
              { latex: '\\sqrt{#@}' },
              { latex: 'x^2' },
              { latex: 'x^3' }
            ],
            [
              { latex: '+' },
              { latex: '-' },
              { latex: '\\pm' },
              { latex: '\\cdot' },
              { latex: '=' },
              { latex: '\\neq' },
              { latex: '<' },
              { latex: '>' },
              { class: 'action font-glyph bottom right', label: '&#x232b;', command: ['performWithFeedback', 'deleteBackward'] }
            ]
          ]
        }
      ];
      break;
    case 'default':
    default:
      window.mathVirtualKeyboard.layouts = 'default';
      break;
  }
};
