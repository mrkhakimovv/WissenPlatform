const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminSATDatabase.tsx', 'utf-8');

code = code.replace(
  `  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const vocabContainerRef = useRef<HTMLDivElement>(null);
  const vocabContainerRef = useRef<HTMLDivElement>(null);`,
  `  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const vocabContainerRef = useRef<HTMLDivElement>(null);`
);

fs.writeFileSync('src/pages/admin/AdminSATDatabase.tsx', code);
