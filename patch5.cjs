const fs = require('fs');
let content = fs.readFileSync('src/pages/student/StudentProfile.tsx', 'utf8');

if (!content.includes("import { BarChart")) {
    content = content.replace(
        "import { format } from 'date-fns';",
        "import { format } from 'date-fns';\nimport { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';"
    );
}

const targetStart = '{/* Stats Row */}';
const targetEnd = '{/* Info Sections */}';

const startIndex = content.indexOf(targetStart);
const endIndex = content.indexOf(targetEnd);

if (startIndex !== -1 && endIndex !== -1) {
    const toReplace = content.substring(startIndex, endIndex);

    const replacement = `{/* Stats Row */}
      <div>
        <h2 className="text-[10px] uppercase tracking-[2px] font-bold text-white/40 mt-6 mb-2 px-2">Kunlik faollik vaqti (Daqiqa)</h2>
        <div className="glass-panel p-4 h-48 flex items-center justify-center">
          {user?.dailyUsage ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={Object.entries(user.dailyUsage || {}).slice(-7).map(([date, mins]) => ({ date: date.slice(-5).replace('-', '.'), mins }))}>
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
      
      `;
    
    content = content.replace(toReplace, replacement);
    fs.writeFileSync('src/pages/student/StudentProfile.tsx', content);
    console.log("Success");
} else {
    console.log("Not found boundaries");
}
