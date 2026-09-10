const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminSATDatabase.tsx', 'utf-8');

const regex = /onSave=\{\(\) => \{\s*\/\/\s*Saved\s*\}\}/;
code = code.replace(regex, `onSave={async (savedTest) => { 
            if (savedTest && savedTest.id && editingLessonId) {
              try {
                await updateDoc(doc(db, 'sat_lessons', editingLessonId), {
                  homeworkTestId: savedTest.id
                });
                toast.success("Uyga vazifa darsga biriktirildi!");
              } catch(e) {
                console.error(e);
                toast.error("Darsni yangilashda xatolik");
              }
            }
          }}`);

fs.writeFileSync('src/pages/admin/AdminSATDatabase.tsx', code);
