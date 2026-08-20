const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminTestsDatabase.tsx', 'utf-8');

// Add state for filter
const stateImportTarget = `export default function AdminTestsDatabase() {
  const { user } = useAuth();
  const { confirm } = useConfirm();
  const [tests, setTests] = useState<TestData[]>([]);`;

const newState = `export default function AdminTestsDatabase() {
  const { user } = useAuth();
  const { confirm } = useConfirm();
  const [tests, setTests] = useState<TestData[]>([]);
  const [filterType, setFilterType] = useState<string>('Barchasi');`;

code = code.replace(stateImportTarget, newState);

// Compute unique types and filtered tests right before return
const returnTarget = `  const handleEdit = (t: TestData) => {
    setTestConfig(t);
    setIsTestBuilderOpen(true);
  };

  return (`;

const newReturn = `  const handleEdit = (t: TestData) => {
    setTestConfig(t);
    setIsTestBuilderOpen(true);
  };

  const uniqueTypes = ['Barchasi', ...Array.from(new Set(tests.map(t => t.testType || 'Noma\\'lum').filter(Boolean)))];
  const filteredTests = filterType === 'Barchasi' ? tests : tests.filter(t => (t.testType || 'Noma\\'lum') === filterType);

  return (`;

code = code.replace(returnTarget, newReturn);

// Add the filter pills UI and use filteredTests
const uiTarget = `          <p className="text-[12px] font-bold text-white/40 uppercase tracking-widest">Barcha yaratilgan testlar to'plami ({tests.length})</p>
        </div>`;

const newUI = `          <p className="text-[12px] font-bold text-white/40 uppercase tracking-widest">Barcha yaratilgan testlar to'plami ({testTypeFiltersCount})</p>
        </div>`;

// Wait, the original code is:
//          <p className="text-[12px] font-bold text-white/40 uppercase tracking-widest">Barcha yaratilgan testlar to'plami ({tests.length})</p>
//        </div>

// Let's replace the whole header block and grid mapping.
