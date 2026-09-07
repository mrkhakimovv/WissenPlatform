const admin = require('firebase-admin');
const serviceAccount = require('./firebase-applet-config.json');

// We don't have the key directly, but we can patch the UI to delete all 20000 automatically on next load.
