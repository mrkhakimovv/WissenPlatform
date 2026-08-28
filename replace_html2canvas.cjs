const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminCertificateResults.tsx', 'utf8');

code = code.replace("import html2canvas from 'html2canvas';", "import { toPng } from 'html-to-image';");

const targetTry = `      try {
        const canvas = await html2canvas(statsPanel, {
          scale: 2,
          backgroundColor: '#111111',
        });
        const imgData = canvas.toDataURL('image/png');`;

const newTry = `      try {
        const imgData = await toPng(statsPanel, {
          backgroundColor: '#111111',
          pixelRatio: 2,
        });
        
        // We need dimensions. html-to-image doesn't give us a canvas directly, 
        // so we can use the element's clientWidth and clientHeight.
        const elWidth = statsPanel.clientWidth;
        const elHeight = statsPanel.clientHeight;
        const canvasHeight = elHeight;
        const canvasWidth = elWidth;
`;

if (code.includes(targetTry)) {
    code = code.replace(targetTry, newTry);
    fs.writeFileSync('src/pages/admin/AdminCertificateResults.tsx', code);
    console.log("Replaced html2canvas with html-to-image");
} else {
    console.log("Could not find target block");
}
