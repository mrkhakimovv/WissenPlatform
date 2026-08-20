const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminTestsDatabase.tsx', 'utf-8');

const stateTarget = `export default function AdminTestsDatabase() {
  const { user } = useAuth();
  const { confirm } = useConfirm();
  const [tests, setTests] = useState<TestData[]>([]);`;

const newState = `export default function AdminTestsDatabase() {
  const { user } = useAuth();
  const { confirm } = useConfirm();
  const [tests, setTests] = useState<TestData[]>([]);
  const [filterType, setFilterType] = useState<string>('Barchasi');`;

code = code.replace(stateTarget, newState);

fs.writeFileSync('src/pages/admin/AdminTestsDatabase.tsx', code);
