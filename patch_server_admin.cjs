const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');
code = code.replace(
  'import { adminAuth, adminDb, adminMessaging } from "./src/server/notifications";',
  'import { adminAuth, adminDb, adminMessaging, FieldValue } from "./src/server/notifications";'
);
code = code.replace(
  'fcmTokens: admin.firestore.FieldValue.arrayRemove(fToken)',
  'fcmTokens: FieldValue.arrayRemove(fToken)'
);
fs.writeFileSync('server.ts', code);
