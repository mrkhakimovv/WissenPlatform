const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const updateStudentEndpoint = `
  app.post("/api/update-student", apiLimiter, async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: "Auth required" });
      }
      const token = authHeader.split('Bearer ')[1];
      if (!adminAuth || !adminDb) {
        return res.status(500).json({ error: "Firebase admin not initialized" });
      }
      const decoded = await adminAuth.verifyIdToken(token);
      const adminDoc = await adminDb.collection('users').doc(decoded.uid).get();
      if (!adminDoc.exists || (adminDoc.data()?.role !== 'admin' && adminDoc.data()?.role !== 'teacher')) {
         return res.status(403).json({ error: "Faqat admin o'zgartira oladi" });
      }

      const { uid, fullName, username, password, groupId, monthlyFee, joinedDate } = req.body;
      
      const updateAuthPayload = {};
      if (username) updateAuthPayload.email = \`\${username}@wissen.internal\`;
      if (password) updateAuthPayload.password = password;

      if (Object.keys(updateAuthPayload).length > 0) {
        await adminAuth.updateUser(uid, updateAuthPayload);
      }

      const updateDbPayload = {};
      if (fullName !== undefined) updateDbPayload.fullName = fullName;
      if (username !== undefined) updateDbPayload.username = username;
      if (password !== undefined) updateDbPayload.password = password;
      if (groupId !== undefined) updateDbPayload.groupId = groupId;
      if (monthlyFee !== undefined) updateDbPayload.monthlyFee = Number(monthlyFee);
      if (joinedDate !== undefined) updateDbPayload.joinedDate = joinedDate;

      await adminDb.collection('users').doc(uid).update(updateDbPayload);

      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  });
`;

if (!code.includes('/api/update-student')) {
  code = code.replace('app.post("/api/send-notification"', updateStudentEndpoint + '\n  app.post("/api/send-notification"');
  fs.writeFileSync('server.ts', code);
}
