const fs = require('fs');
let code = fs.readFileSync('src/pages/student/StudentExams.tsx', 'utf-8');

const targetSplit = `  // We can separate upcoming vs past exams
  const upcomingExams = exams.filter(e => new Date(e.date) >= new Date(now.getFullYear(), now.getMonth(), now.getDate()));
  const pastExams = exams.filter(e => new Date(e.date) < new Date(now.getFullYear(), now.getMonth(), now.getDate())).reverse();`;

const newSplit = `  // Separate by explicit status instead of passing date
  const upcomingExams = exams.filter(e => e.status !== 'ended');
  const pastExams = exams.filter(e => e.status === 'ended').reverse();`;

code = code.replace(targetSplit, newSplit);

const targetTitle = `<h2 className="text-[13px] font-bold text-white/60 uppercase tracking-wider">Kelgusi Imtihonlar</h2>`;
const newTitle = `<h2 className="text-[13px] font-bold text-white/60 uppercase tracking-wider">Faol Imtihonlar</h2>`;

code = code.replace(targetTitle, newTitle);

// Change `&& !isPast` on button rendering so they still see the button if it's past but not ended? 
// Wait, if pastExams is now ONLY `e.status === 'ended'`, then isPast MEANS ended.
// If isPast is true, we could still render the button so it says "Yakunlangan".
// Let's remove `&& !isPast` entirely so the button handles the ended state.

const targetButtonCondition = `{(isOnlineTest && !isPast) && (
          <button `;
const newButtonCondition = `{isOnlineTest && (
          <button `;

code = code.replace(targetButtonCondition, newButtonCondition);

fs.writeFileSync('src/pages/student/StudentExams.tsx', code);
