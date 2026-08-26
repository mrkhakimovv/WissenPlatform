const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/AdminStudents.tsx', 'utf8');

// I will find the exact string to replace
const targetStart = '<div className="space-y-6">';
const targetEnd = '<div className="mt-auto pt-6 pb-4">';

const startIndex = content.indexOf(targetStart);
const endIndex = content.indexOf(targetEnd);

if (startIndex !== -1 && endIndex !== -1) {
    const toReplace = content.substring(startIndex, endIndex);

    const replacement = `
              <div className="space-y-6">
                <div>
                  <h4 className="text-[11px] uppercase tracking-widest font-bold text-white/40 mb-3">Tizimda O'tkazgan Vaqti (Daqiqa)</h4>
                  <div className="glass-panel p-4 h-48 flex items-center justify-center">
                    {selectedStudent.dailyUsage ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={Object.entries(selectedStudent.dailyUsage || {}).slice(-7).map(([date, mins]) => ({ date: date.slice(-5).replace('-', '.'), mins }))}>
                          <XAxis dataKey="date" stroke="#ffffff40" fontSize={10} tickLine={false} axisLine={false} />
                          <Tooltip cursor={{fill: '#ffffff10'}} contentStyle={{backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff'}} itemStyle={{color: '#FEC204'}} labelStyle={{color: '#888'}} />
                          <Bar dataKey="mins" name="Daqiqa" fill="#FEC204" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-[12px] text-white/40 text-center">Ma'lumot topilmadi</p>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-[11px] uppercase tracking-widest font-bold text-white/40 mb-3">Oxirgi Faollik</h4>
                  <div className="glass-panel p-4">
                    <p className="text-[14px] text-white">
                      {selectedStudent.lastActive 
                        ? new Date(selectedStudent.lastActive).toLocaleString('uz-UZ', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) 
                        : "Tizimga kirmagan"}
                    </p>
                  </div>
                </div>
              </div>

              `;
    
    content = content.replace(toReplace, replacement);
    fs.writeFileSync('src/pages/admin/AdminStudents.tsx', content);
    console.log("Success");
} else {
    console.log("Not found boundaries");
}
