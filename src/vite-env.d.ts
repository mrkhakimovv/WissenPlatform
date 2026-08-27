/// <reference types="vite-plugin-pwa/client" />
/// <reference types="vite/client" />

declare namespace JSX {
  interface IntrinsicElements {
    'math-field': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
      'virtual-keyboard-mode'?: string;
      onInput?: (e: Event) => void;
      value?: string;
      readonly?: boolean;
    };
  }
}
