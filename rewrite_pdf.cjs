const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminCertificateResults.tsx', 'utf8');

// Add import
if (!code.includes('import html2canvas from')) {
    code = code.replace("import jsPDF from 'jspdf';", "import jsPDF from 'jspdf';\nimport html2canvas from 'html2canvas';");
}

// Modify exportPDF
const targetExport = `  const exportPDF = () => {
    const numItems = report?.stats?.numItems || 45;
    
    const doc = new jsPDF();
    
    // Attempt to set Times New Roman if available, fallback to times
    doc.setFont("times", "normal");
    
    doc.setFontSize(16);
    doc.text(\`\${exam.title} - Rasch Natijalari (@wissen_edu telegram kanaliga obuna bo'ling!)\`, 14, 20);
    doc.setFontSize(12);
    doc.text(\`\${exam.subject} • \${exam.date}\`, 14, 28);`;

const newExport = `  const exportPDF = async () => {
    const numItems = report?.stats?.numItems || 45;
    
    const doc = new jsPDF();
    
    // Try to capture the Rasch stats panel
    const statsPanel = document.getElementById('rasch-stats-panel-pdf');
    if (statsPanel) {
      try {
        const canvas = await html2canvas(statsPanel, {
          scale: 2,
          backgroundColor: '#111111',
        });
        const imgData = canvas.toDataURL('image/png');
        
        // Add header to first page as well
        doc.setFont("times", "normal");
        doc.setFontSize(16);
        doc.text(\`\${exam.title} - Rasch Natijalari (@wissen_edu telegram kanaliga obuna bo'ling!)\`, 14, 20);
        
        const pdfWidth = doc.internal.pageSize.getWidth() - 28; // Add 14mm padding on each side
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        
        doc.addImage(imgData, 'PNG', 14, 30, pdfWidth, pdfHeight);
        doc.addPage();
      } catch (err) {
        console.error("Error generating stats image", err);
      }
    }
    
    // Attempt to set Times New Roman if available, fallback to times
    doc.setFont("times", "normal");
    
    doc.setFontSize(16);
    doc.text(\`\${exam.title} - Rasch Natijalari (@wissen_edu telegram kanaliga obuna bo'ling!)\`, 14, 20);
    doc.setFontSize(12);
    doc.text(\`\${exam.subject} • \${exam.date}\`, 14, 28);`;

if (code.includes(targetExport)) {
    code = code.replace(targetExport, newExport);
    console.log("Updated exportPDF function");
} else {
    console.log("Could not find targetExport");
}

// Modify RaschStatsPanel wrapping
const targetWrap = `{report && <RaschStatsPanel report={report} />}`;
const newWrap = `{report && <div id="rasch-stats-panel-pdf" className="p-4 bg-[#111111] rounded-xl"><RaschStatsPanel report={report} /></div>}`;

if (code.includes(targetWrap)) {
    code = code.replace(targetWrap, newWrap);
    console.log("Updated RaschStatsPanel wrapping");
} else {
    console.log("Could not find targetWrap");
}

fs.writeFileSync('src/pages/admin/AdminCertificateResults.tsx', code);
