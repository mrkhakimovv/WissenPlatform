const fs = require('fs');
let code = fs.readFileSync('src/pages/student/StudentHomeworks.tsx', 'utf-8');

// Add import Group
code = code.replace(/import \{ FileText/g, "import { Group } from '../../types';\nimport { FileText");

// Add groups state
code = code.replace(/const \[isEvaluating, setIsEvaluating\] = useState\(false\);/, "const [isEvaluating, setIsEvaluating] = useState(false);\n  const [groups, setGroups] = useState<Group[]>([]);");

// Add fetchGroups in useEffect
code = code.replace(/const unsubHW = onSnapshot/, `
    const fetchGroups = async () => {
      try {
        const groupDocs = await Promise.all(userGroups.map(id => getDoc(doc(db, 'groups', id))));
        const fetchedGroups = groupDocs.filter(d => d.exists()).map(d => ({ id: d.id, ...d.data() } as Group));
        setGroups(fetchedGroups);
      } catch (err) {
        console.error("Error fetching groups", err);
      }
    };
    fetchGroups();

    const unsubHW = onSnapshot`);

// Add getGroupName
code = code.replace(/const handleFileChange =/, `
  const getGroupName = (groupId: string) => {
    const g = groups.find(x => x.id === groupId);
    return g ? g.name : '';
  };

  const handleFileChange =`);

// Show group name in homework list
code = code.replace(/<h3 className="text-\[15px\] font-bold text-white mb-1">\{hw.title\}<\/h3>/, `<div className="flex items-center gap-2 mb-1">
                  <h3 className="text-[15px] font-bold text-white">{hw.title}</h3>
                  <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-[#FEC204] font-bold">{getGroupName(hw.groupId)}</span>
                </div>`);

fs.writeFileSync('src/pages/student/StudentHomeworks.tsx', code);
