const { google } = require('googleapis');
const localFirebaseConfig = require("./firebase-applet-config.json");

async function check() {
  const auth = new google.auth.GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/cloud-platform']
  });
  const client = await auth.getClient();
  const projectId = localFirebaseConfig.projectId;
  const databaseId = localFirebaseConfig.databaseId;
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${databaseId}/securityRules`;
  
  const res = await client.request({ url });
  console.log("Rules response:", JSON.stringify(res.data, null, 2));
}
check().catch(console.error);
