const fs = require('fs');
let code = fs.readFileSync('src/pages/student/StudentSchedule.tsx', 'utf-8');

const targetLogic = `  const scheduleData = DAYS.map(dayInfo => {
    const daySchedules = schedules
      .filter(s => Number(s.dayOfWeek) === dayInfo.id)
      .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
    
    return {
      day: dayInfo.name,
      short: dayInfo.short,
      lessons: daySchedules
    };
  });`;

const replaceLogic = `  const today = new Date();
  const currentDayOfWeek = today.getDay() || 7;
  
  const scheduleData = DAYS.map(dayInfo => {
    const diff = dayInfo.id - currentDayOfWeek;
    const dateForDay = new Date(today);
    dateForDay.setDate(today.getDate() + diff);
    const dateStr = dateForDay.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long' });
    const isToday = diff === 0;

    const daySchedules = schedules
      .filter(s => Number(s.dayOfWeek) === dayInfo.id)
      .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
      
    return {
      day: dayInfo.name,
      short: dayInfo.short,
      date: dateStr,
      isToday,
      lessons: daySchedules
    };
  });`;

code = code.replace(targetLogic, replaceLogic);

const targetRenderHeader = `<div className="mb-3 flex items-center justify-between">
                        <h3 className={\`text-[16px] font-black \${item.lessons.length > 0 ? 'text-white' : 'text-white/40'}\`}>{item.day}</h3>
                        {item.lessons.length > 0 && <span className="text-[10px] font-bold text-white/40 bg-white/5 px-2 py-0.5 rounded-full">{item.lessons.length} dars</span>}
                     </div>`;

const replaceRenderHeader = `<div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <h3 className={\`text-[16px] font-black \${item.lessons.length > 0 ? 'text-white' : 'text-white/40'}\`}>{item.day}</h3>
                           <span className={\`text-[10px] font-bold px-2 py-0.5 rounded-md \${item.isToday ? 'bg-[#FEC204] text-black' : 'bg-white/10 text-white/60'}\`}>{item.date}</span>
                        </div>
                        {item.lessons.length > 0 && <span className="text-[10px] font-bold text-white/40 bg-white/5 px-2 py-0.5 rounded-full">{item.lessons.length} dars</span>}
                     </div>`;

code = code.replace(targetRenderHeader, replaceRenderHeader);

const targetPanel = `<div className={\`glass-panel p-4 flex flex-col relative transition-all hover:scale-[1.02] \${item.lessons.length > 0 ? 'border-t-2 border-t-[#FEC204] shadow-md' : 'opacity-60 border-t-2 border-t-white/10'}\`}>`;

const replacePanel = `<div className={\`glass-panel p-4 flex flex-col relative transition-all hover:scale-[1.02] \${item.lessons.length > 0 ? 'border-t-2 border-t-[#FEC204] shadow-md' : 'opacity-60 border-t-2 border-t-white/10'} \${item.isToday ? 'ring-2 ring-[#FEC204] shadow-[0_0_20px_rgba(254,194,4,0.1)] !opacity-100' : ''}\`}>`;

code = code.replace(targetPanel, replacePanel);

fs.writeFileSync('src/pages/student/StudentSchedule.tsx', code);
