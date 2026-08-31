const fs = require('fs');
let code = fs.readFileSync('src/components/MathAnswerField.tsx', 'utf-8');

const declareCode = `
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'math-field': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        virtualKeyboardMode?: string;
        'math-virtual-keyboard-policy'?: string;
      };
    }
  }
}
`;

code = code.replace("interface Props {", declareCode + "\ninterface Props {");
fs.writeFileSync('src/components/MathAnswerField.tsx', code);
