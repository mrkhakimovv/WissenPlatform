const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminSATDatabase.tsx', 'utf-8');

// Add useRef import if not there, wait, React is already imported.
// Actually it's `import React, { useState, useEffect } from 'react';`
code = code.replace(
  `import React, { useState, useEffect } from 'react';`,
  `import React, { useState, useEffect, useRef } from 'react';`
);

// Add the ref
code = code.replace(
  `  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);`,
  `  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const vocabContainerRef = useRef<HTMLDivElement>(null);`
);

// Add scroll logic in handleAddVocabPair
const oldAdd = `  const handleAddVocabPair = () => {
    setVocabForm({ ...vocabForm, pairs: [...vocabForm.pairs, { eng: '', uz: '' }] });
  };`;
const newAdd = `  const handleAddVocabPair = () => {
    setVocabForm({ ...vocabForm, pairs: [...vocabForm.pairs, { eng: '', uz: '' }] });
    setTimeout(() => {
      if (vocabContainerRef.current) {
        vocabContainerRef.current.scrollTop = vocabContainerRef.current.scrollHeight;
      }
    }, 50);
  };`;
code = code.replace(oldAdd, newAdd);

// Add ref to the container
code = code.replace(
  `              <div className="max-h-[300px] overflow-y-auto custom-scrollbar space-y-2 pr-1">
                {vocabForm.pairs.map((pair, idx) => (`,
  `              <div ref={vocabContainerRef} className="max-h-[300px] overflow-y-auto custom-scrollbar space-y-2 pr-1 pb-2">
                {vocabForm.pairs.map((pair, idx) => (`
);

fs.writeFileSync('src/pages/admin/AdminSATDatabase.tsx', code);
