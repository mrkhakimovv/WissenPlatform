const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf-8');
code = code.replace("</head>", "  <script src=\"https://telegram.org/js/telegram-web-app.js\"></script>\n  </head>");
fs.writeFileSync('index.html', code);
