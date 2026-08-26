import { adminDb } from "./src/server/notifications";

async function run() {
  if (!adminDb) {
    console.log("No adminDb");
    return;
  }
  const snap = await adminDb.collection("users").limit(1).get();
  snap.forEach(doc => console.log(doc.id, doc.data().username, doc.data().password));
  
  const newsSnap = await adminDb.collection("news").limit(1).get();
  newsSnap.forEach(doc => console.log("news", doc.id));
}
run().catch(console.error);
