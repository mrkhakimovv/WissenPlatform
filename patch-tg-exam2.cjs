const fs = require('fs');
let code = fs.readFileSync('src/pages/TelegramExam.tsx', 'utf-8');

code = code.replace("import StudentCertificateTake from './student/StudentCertificateTake';", "import StudentCertificateTake from './student/StudentCertificateTake';\nimport { useAuth } from '../contexts/AuthContext';");

code = code.replace("const { user, loading: authLoading } = require('../contexts/AuthContext').useAuth();", "const { user, loading: authLoading } = useAuth();");

fs.writeFileSync('src/pages/TelegramExam.tsx', code);
