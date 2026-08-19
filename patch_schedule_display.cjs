const fs = require('fs');
let code = fs.readFileSync('src/pages/student/StudentSchedule.tsx', 'utf-8');

const targetStr = `                                 <div>
                                   <h4 className="text-[14px] font-[800] text-white">{lesson.subject}</h4>
                                   <p className="text-[11px] font-bold text-white/40 mt-0.5">{lesson.teacherName ? \`O'qituvchi: \${lesson.teacherName}\` : ''}</p>
                                   <div className="flex items-center gap-1.5 mt-1.5">
                                      <Users size={10} className="text-[#FEC204]" />
                                      <span className="text-[10px] font-bold text-[#FEC204]/80 uppercase tracking-wide">{getGroupName(lesson.groupId)}</span>
                                   </div>
                                 </div>`;

const replaceStr = `                                 <div>
                                   <h4 className="text-[15px] font-[900] text-white uppercase tracking-wider">{getGroupName(lesson.groupId)}</h4>
                                   <p className="text-[11px] font-bold text-white/40 mt-0.5">{lesson.teacherName ? \`O'qituvchi: \${lesson.teacherName}\` : ''}</p>
                                   <div className="flex items-center gap-1.5 mt-1.5">
                                      <span className="text-[11px] font-bold text-[#FEC204] lowercase">{lesson.subject}</span>
                                   </div>
                                 </div>`;

code = code.replace(targetStr, replaceStr);
fs.writeFileSync('src/pages/student/StudentSchedule.tsx', code);
