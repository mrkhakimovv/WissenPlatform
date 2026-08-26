const fs = require('fs');

function fixAdmin() {
    let content = fs.readFileSync('src/pages/admin/AdminStudents.tsx', 'utf8');
    const targetStart = '{selectedStudent.dailyUsage ? (';
    const targetEnd = ')}';
    
    // Using regex to find the block robustly
    const regex = /\{selectedStudent\.dailyUsage \? \([\s\S]*?<\/[pP]>[\s\S]*?\)\}/;
    
    const replacement = `<ResponsiveContainer width="100%" height="100%">
                        <BarChart data={Array.from({length: 7}).map((_, i) => {
                          const d = new Date();
                          d.setDate(d.getDate() - 6 + i);
                          const ds = [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
                          return { date: ds.slice(-5).replace('-', '.'), mins: selectedStudent?.dailyUsage?.[ds] || 0 };
                        })}>
                          <XAxis dataKey="date" stroke="#ffffff40" fontSize={10} tickLine={false} axisLine={false} />
                          <Tooltip cursor={{fill: '#ffffff10'}} contentStyle={{backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff'}} itemStyle={{color: '#FEC204'}} labelStyle={{color: '#888'}} />
                          <Bar dataKey="mins" name="Daqiqa" fill="#FEC204" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>`;
                      
    if (regex.test(content)) {
        content = content.replace(regex, replacement);
        fs.writeFileSync('src/pages/admin/AdminStudents.tsx', content);
        console.log("Fixed AdminStudents");
    } else {
        console.log("Admin regex not found");
    }
}

function fixStudent() {
    let content = fs.readFileSync('src/pages/student/StudentProfile.tsx', 'utf8');
    
    const regex = /\{user\?\.dailyUsage \? \([\s\S]*?<\/[pP]>[\s\S]*?\)\}/;
    
    const replacement = `<ResponsiveContainer width="100%" height="100%">
              <BarChart data={Array.from({length: 7}).map((_, i) => {
                const d = new Date();
                d.setDate(d.getDate() - 6 + i);
                const ds = [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
                return { date: ds.slice(-5).replace('-', '.'), mins: user?.dailyUsage?.[ds] || 0 };
              })}>
                <XAxis dataKey="date" stroke="#ffffff40" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip cursor={{fill: '#ffffff10'}} contentStyle={{backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff'}} itemStyle={{color: '#FEC204'}} labelStyle={{color: '#888'}} />
                <Bar dataKey="mins" name="Daqiqa" fill="#FEC204" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>`;
            
    if (regex.test(content)) {
        content = content.replace(regex, replacement);
        fs.writeFileSync('src/pages/student/StudentProfile.tsx', content);
        console.log("Fixed StudentProfile");
    } else {
        console.log("Student regex not found");
    }
}

fixAdmin();
fixStudent();
