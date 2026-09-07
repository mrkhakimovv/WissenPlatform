const fs = require('fs');

let code = fs.readFileSync('src/pages/admin/AdminDashboard.tsx', 'utf-8');

// Remove state
code = code.replace(/  const \[recentPayments, setRecentPayments\] = useState<any\[\]>\(\[\]\);\n/g, '');

// Remove fetch logic
const fetchLogic = `    // Only fetch payments that are actually paid, ordered by paidAt
    const qRecentPayments = query(collection(db, 'payments'), where('status', '==', 'paid'), orderBy('paidAt', 'desc'), limit(5));
    const unsubRecentPayments = onSnapshot(qRecentPayments, async (snap) => {
      const data = await Promise.all(snap.docs.map(async (d) => {
        const p = d.data();
        let studentName = 'Noma\\'lum o\\'quvchi';
        if (p.studentId) {
           try {
             const userDoc = await getDoc(doc(db, 'users', p.studentId));
             if (userDoc.exists()) {
               studentName = userDoc.data().fullName || 'Noma\\'lum';
             }
           } catch (e) {
             console.error("AdminDashboard user fetch error:", e);
           }
        }
        return { id: d.id, studentName, ...p };
      }));
      setRecentPayments(data);
    });

`;
code = code.replace(fetchLogic, '');

// Remove unsub
code = code.replace(/       unsubRecentPayments\(\); \n/g, '');

// Remove UI
const uiStart = code.indexOf(`      <div className="h-[1px] bg-white/10 w-full mb-6"></div>`);
const uiEnd = code.lastIndexOf(`    </div>\n  );\n}`);

if (uiStart !== -1 && uiEnd !== -1 && uiEnd > uiStart) {
  const codeBefore = code.substring(0, uiStart);
  const codeAfter = code.substring(uiEnd);
  code = codeBefore + codeAfter;
}

fs.writeFileSync('src/pages/admin/AdminDashboard.tsx', code);
console.log('Removed Recent Payments successfully');
