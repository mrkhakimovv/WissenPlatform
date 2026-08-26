import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import fs from "fs";

async function run() {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || "null");
  const app = initializeApp({ credential: cert(serviceAccount) });
  const db = getFirestore(app, "ai-studio-41d7d5e5-6008-47c8-ae27-1ade7e269b79");
  
  const snap = await db.collection("news").doc("v8ZiMuP33gH9PIUk8xA6").get();
  console.log("News exists?", snap.exists);
}
run().catch(console.error);
