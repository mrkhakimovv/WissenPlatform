const fs = require('fs');
let code = fs.readFileSync('src/pages/TelegramExam.tsx', 'utf-8');

const replacement = `
  const navigate = useNavigate();
  const { user, loading: authLoading } = require('../contexts/AuthContext').useAuth();

  useEffect(() => {
`;

code = code.replace(`
  const navigate = useNavigate();

  useEffect(() => {
`, replacement);

const returnCondition = `
  if (loading || authLoading || !user) {
    return <div className="h-screen w-full flex items-center justify-center bg-[#0a0a0a] text-white">Yuklanmoqda...</div>;
  }
`;

code = code.replace(`
  if (loading) {
    return <div className="h-screen w-full flex items-center justify-center bg-[#0a0a0a] text-white">Yuklanmoqda...</div>;
  }
`, returnCondition);

fs.writeFileSync('src/pages/TelegramExam.tsx', code);
