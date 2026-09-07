const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminPayments.tsx', 'utf-8');

const target = `  useEffect(() => {
    // Hidden auto-delete for buggy 20000 amounts
    if (payments.length > 0) {
       const badPayments = payments.filter(p => p.amount === 20000 || p.amount === '20000');
       badPayments.forEach(async (bp) => {
          try {
             await deleteDoc(doc(db, 'payments', bp.id));
          } catch(e) {}
       });
    }
  }, [payments.length]);

  useEffect(() => {
    const unsubStudents = onSnapshot(query(collection(db, 'users')), (snap) => {`;
const repl = `  useEffect(() => {
    const unsubStudents = onSnapshot(query(collection(db, 'users')), (snap) => {`;

code = code.replace(target, repl);
fs.writeFileSync('src/pages/admin/AdminPayments.tsx', code);
