const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace("import Login from './pages/Login';", "import Login from './pages/Login';\nimport TelegramExam from './pages/TelegramExam';");

code = code.replace("<Route path=\"/login\" element={<Login />} />", "<Route path=\"/login\" element={<Login />} />\n            <Route path=\"/tg-exam\" element={<TelegramExam />} />");

fs.writeFileSync('src/App.tsx', code);
