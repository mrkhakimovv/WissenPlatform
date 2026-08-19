const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminTestBuilder.tsx', 'utf-8');

// Also update AdminTestBuilder if needed ? Wait, the issue is that in the admin panel exams page, 
// when you delete an exam, the results table still holds the ID.
// No, the issue is on the student page where it says "Noma'lum imtihon". We just fixed it so new exams save their own title in exam_results.
