const admin = require('firebase-admin');
admin.initializeApp({ projectId: "demo-project" });
const db = admin.firestore();

async function check() {
  const users = await db.collection('users').where('role', '==', 'student').get();
  console.log("Total students:", users.size);
  let missingJoined = 0;
  users.forEach(u => {
     const data = u.data();
     if (!data.joinedDate) {
        missingJoined++;
        console.log(data.fullName, "created:", data.createdAt);
     }
  });
  console.log("Missing joinedDate:", missingJoined);
}
check();
