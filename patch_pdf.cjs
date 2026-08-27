const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminCertificateResults.tsx', 'utf8');

if (!code.includes("import jsPDF from 'jspdf';")) {
  code = code.replace(
    "import * as XLSX from 'xlsx-js-style';",
    "import * as XLSX from 'xlsx-js-style';\nimport jsPDF from 'jspdf';\nimport autoTable from 'jspdf-autotable';"
  );
}

const targetExport = `  const exportExcel = () => {`;
const newExport = `  const exportPDF = () => {
    const numItems = report?.stats?.numItems || 45;
    
    const doc = new jsPDF();
    
    // Attempt to set Times New Roman if available, fallback to times
    doc.setFont("times", "normal");
    
    doc.setFontSize(16);
    doc.text(\`\${exam.title} - Rasch Natijalari\`, 14, 20);
    doc.setFontSize(12);
    doc.text(\`\${exam.subject} • \${exam.date}\`, 14, 28);
    
    const tableData = results.map((r, i) => {
      const xato = numItems - r.correct;
      const foiz = ((r.correct / numItems) * 100).toFixed(1);
      return [
        i + 1,
        r.studentName,
        numItems,
        r.correct,
        xato,
        foiz,
        parseFloat(r.theta.toFixed(3)),
        r.ball,
        r.grade
      ];
    });

    autoTable(doc, {
      startY: 35,
      head: [["O'rin", "F.I.SH.", "Umumiy", "To'g'ri", "Noto'g'ri", "Foiz (%)", "Qobiliyat (θ)", "Ball", "Daraja"]],
      body: tableData,
      theme: 'grid',
      styles: {
        font: 'times',
        fontSize: 10,
        halign: 'center',
        valign: 'middle',
        lineColor: [0, 0, 0],
        lineWidth: 0.1,
        textColor: [0, 0, 0]
      },
      headStyles: {
        fillColor: [234, 234, 234],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        halign: 'center'
      },
      columnStyles: {
        1: { halign: 'left' }
      }
    });

    doc.save(\`sertifikat_\${exam.title.replace(/\\s+/g, '_')}_natijalar.pdf\`);
  };

  const exportExcel = () => {`;

if (code.includes(targetExport) && !code.includes('const exportPDF')) {
    code = code.replace(targetExport, newExport);
}

const buttonsTarget = `<button onClick={exportExcel} disabled={results.length === 0} className="px-4 py-2 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors disabled:opacity-50">
              <Download size={16} /> Excel Export
            </button>`;

const newButtons = `<button onClick={exportPDF} disabled={results.length === 0} className="px-4 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors disabled:opacity-50">
              <Download size={16} /> PDF Export
            </button>
            <button onClick={exportExcel} disabled={results.length === 0} className="px-4 py-2 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors disabled:opacity-50">
              <Download size={16} /> Excel Export
            </button>`;

if (code.includes(buttonsTarget) && !code.includes('PDF Export')) {
    code = code.replace(buttonsTarget, newButtons);
}

fs.writeFileSync('src/pages/admin/AdminCertificateResults.tsx', code);
console.log("Patched PDF export");
