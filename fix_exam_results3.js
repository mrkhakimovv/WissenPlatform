import fs from 'fs';
let code = fs.readFileSync('src/pages/student/StudentTestTake.tsx', 'utf8');

if (code.includes("import { doc, getDoc, addDoc, collection } from 'firebase/firestore';")) {
  code = code.replace(
    "import { doc, getDoc, addDoc, collection } from 'firebase/firestore';",
    "import { doc, getDoc, setDoc, addDoc, collection } from 'firebase/firestore';"
  );
} else if (!code.includes('setDoc')) {
  code = code.replace(
    "import { doc, getDoc, addDoc, collection }",
    "import { doc, getDoc, setDoc, addDoc, collection }"
  );
}

code = code.replace(
  /await addDoc\(collection\(db, 'exam_results'\), \{/g,
  "await setDoc(doc(db, 'exam_results', `${exam.id}_${user?.id}`), {"
);

fs.writeFileSync('src/pages/student/StudentTestTake.tsx', code);
