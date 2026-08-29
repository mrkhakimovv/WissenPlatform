const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminMilliySertifikat.tsx', 'utf8');

const target1 = `        report = computeRaschWithReference(matrix, synthetic);`;
const replacement1 = `        report = computeRaschWithReference(matrix, synthetic, true); // True = sintetiklarni ham qaytarish`;

if(code.includes(target1)) {
    code = code.replace(target1, replacement1);
    fs.writeFileSync('src/pages/admin/AdminMilliySertifikat.tsx', code);
    console.log("Updated AdminMilliySertifikat.tsx");
} else {
    console.log("Could not find target1 in AdminMilliySertifikat.tsx");
}

let resultsCode = fs.readFileSync('src/pages/admin/AdminCertificateResults.tsx', 'utf8');
const targetRow = `<tr key={r.studentId} className="hover:bg-white/5 transition-colors">`;
const replacementRow = `<tr key={r.studentId} className={\`hover:bg-white/5 transition-colors \${r.synthetic ? 'opacity-50 bg-blue-500/5' : ''}\`}>`;

if(resultsCode.includes(targetRow)) {
    resultsCode = resultsCode.replace(targetRow, replacementRow);
    
    // Also update the index to use rank
    const targetIndex = `<td className="p-4 font-bold text-white/50">{i + 1}</td>`;
    const replacementIndex = `<td className="p-4 font-bold text-white/50">{r.rank ?? (i + 1)}</td>`;
    resultsCode = resultsCode.replace(targetIndex, replacementIndex);
    
    // Also update the name to indicate synthetic
    const targetName = `<td className="p-4 font-bold text-white">{r.studentName}</td>`;
    const replacementName = `<td className="p-4 font-bold text-white">
                          {r.studentName}
                          {r.synthetic && <span className="ml-2 text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Tayanch</span>}
                        </td>`;
    resultsCode = resultsCode.replace(targetName, replacementName);

    fs.writeFileSync('src/pages/admin/AdminCertificateResults.tsx', resultsCode);
    console.log("Updated AdminCertificateResults.tsx");
} else {
    console.log("Could not find targetRow in AdminCertificateResults.tsx");
}
