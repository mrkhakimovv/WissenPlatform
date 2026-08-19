const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminGroups.tsx', 'utf-8');

const targetDisplay = `                  {(group.days?.length > 0 || group.startTime) && (
                    <span className="inline-flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded text-[10px]">
                      {group.days?.length > 0 && WEEKDAYS.filter(w => group.days.includes(w.id)).map(w => w.label).join(', ')}
                      {group.startTime && \` \${group.startTime}\${group.endTime ? \` - \${group.endTime}\` : ''}\`}
                    </span>
                  )}`;

const newDisplay = `                  {(group.days?.length > 0) && (
                    <span className="inline-flex items-center gap-1 flex-wrap">
                      {WEEKDAYS.filter(w => group.days.includes(w.id)).map(w => {
                        const sched = group.schedule?.[w.id] || { startTime: group.startTime || '', endTime: group.endTime || '' };
                        return (
                          <span key={w.id} className="bg-white/5 px-2 py-0.5 rounded text-[10px]">
                            {w.label} {sched.startTime ? \`\${sched.startTime}\${sched.endTime ? \`-\${sched.endTime}\` : ''}\` : ''}
                          </span>
                        );
                      })}
                    </span>
                  )}`;

code = code.replace(targetDisplay, newDisplay);
fs.writeFileSync('src/pages/admin/AdminGroups.tsx', code);
