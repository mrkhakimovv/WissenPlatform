const admin = require('firebase-admin');
// We cannot easily run firebase-admin directly without credentials. 
// But the code changes ensure future results save the title/subject natively in the exam_results document.
// For existing results, there's no title saved, so they will still show "Noma'lum imtihon" if the exam is deleted.
