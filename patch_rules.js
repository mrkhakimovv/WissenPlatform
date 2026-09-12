const fs = require('fs');
let rules = fs.readFileSync('firestore.rules', 'utf8');
rules = rules.replace(/data\.role == 'admin'/g, "data.get('role', '') == 'admin'");
rules = rules.replace(/data\.role == 'teacher'/g, "data.get('role', '') == 'teacher'");
fs.writeFileSync('firestore.rules', rules);
