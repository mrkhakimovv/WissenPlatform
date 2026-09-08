const fs = require('fs');
let code = fs.readFileSync('src/pages/student/StudentSAT.tsx', 'utf-8');

const oldLessonFetch = `    const unsubLessons = onSnapshot(collection(db, 'sat_lessons'), snap => {
      setLessons(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });`;

const newLessonFetch = `    const unsubLessons = onSnapshot(collection(db, 'sat_lessons'), snap => {
      let fetchedLessons = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const userGroups = user?.groups?.length ? user.groups : (user?.groupId ? [user.groupId] : []);
      
      // Filter so it only shows if assignedGroups includes one of the user's groups
      // If there are no groups, maybe we shouldn't show any, but let's be safe.
      fetchedLessons = fetchedLessons.filter(lesson => 
         lesson.assignedGroups && lesson.assignedGroups.some((gId: string) => userGroups.includes(gId))
      );
      
      setLessons(fetchedLessons);
    });`;

code = code.replace(oldLessonFetch, newLessonFetch);
fs.writeFileSync('src/pages/student/StudentSAT.tsx', code);
