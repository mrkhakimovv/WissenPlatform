const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const injectionPoint = `  // Vite middleware for development`;
const logic = `
  // Payment deadline checking loop
  const checkPaymentDeadlines = async () => {
    if (!adminDb || !adminMessaging) return;
    try {
      const usersSnap = await adminDb.collection('users').where('role', '==', 'student').get();
      const today = new Date();
      const currentMonth = today.getMonth() + 1;
      const currentYear = today.getFullYear();
      const todayStr = today.toISOString().split('T')[0];

      for (const userDoc of usersSnap.docs) {
        const student = { id: userDoc.id, ...userDoc.data() };
        if (!student.joinedDate) continue;
        
        const fee = Number(student.monthlyFee) || 0;
        if (fee === 0) continue;

        const jd = new Date(student.joinedDate);
        const dayOfDeadline = jd.getDate();

        // Calculate days until deadline this month
        const deadlineDate = new Date(currentYear, currentMonth - 1, dayOfDeadline);
        
        // Difference in days (ignoring hours)
        const diffTime = deadlineDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays >= 0 && diffDays <= 3) {
           const paymentsSnap = await adminDb.collection('payments')
               .where('studentId', '==', student.id)
               .where('month', '==', currentMonth)
               .where('year', '==', currentYear)
               .get();
           
           let paidAmount = 0;
           let forgiven = false;
           paymentsSnap.forEach(p => {
               if (p.data().status === 'forgiven') forgiven = true;
               paidAmount += Number(p.data().amount) || 0;
           });

           if (!forgiven && paidAmount < fee) {
              const lastWarning = student.lastPaymentWarning;
              if (lastWarning !== todayStr) {
                  let bodyText = diffDays === 0 
                     ? \`Hurmatli \${student.fullName || 'o\\'quvchi'}, bugun to'lovning oxirgi kuni. Iltimos to'lovni amalga oshiring.\` 
                     : \`Hurmatli \${student.fullName || 'o\\'quvchi'}, o'quv markazi uchun to'lov muddati tugashiga \${diffDays} kun qoldi. Iltimos to'lovni o'z vaqtida amalga oshiring.\`;

                  const newNotif = {
                    title: "To'lov muddati yaqinlashmoqda",
                    body: bodyText,
                    link: '/student/payments',
                    target: 'user',
                    targetId: student.id,
                    createdBy: 'system',
                    createdAt: new Date().toISOString(),
                    readBy: []
                  };
                  const notifRef = await adminDb.collection('notifications').add(newNotif);

                  const tokens = Array.isArray(student.fcmTokens) ? student.fcmTokens.filter(Boolean) : [];
                  if (tokens.length > 0) {
                     const dataPayload = {
                        title: String(newNotif.title),
                        body: String(newNotif.body),
                        link: String(newNotif.link),
                        notifId: notifRef.id,
                     };
                     
                     // We ignore failures here so it doesn't block other users
                     try {
                       await adminMessaging.sendEachForMulticast({
                          tokens: tokens,
                          data: dataPayload,
                          webpush: { fcmOptions: { link: newNotif.link } }
                       });
                     } catch(e) {}
                  }
                  
                  await adminDb.collection('users').doc(student.id).update({
                     lastPaymentWarning: todayStr
                  });
              }
           }
        }
      }
    } catch (err) {
      console.error("Error in checkPaymentDeadlines:", err);
    }
  };

  checkPaymentDeadlines();
  setInterval(checkPaymentDeadlines, 6 * 60 * 60 * 1000); // Check every 6 hours

`;

code = code.replace(injectionPoint, logic + injectionPoint);
fs.writeFileSync('server.ts', code);
