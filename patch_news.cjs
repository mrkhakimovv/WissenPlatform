const fs = require('fs');

let typesContent = fs.readFileSync('src/types.ts', 'utf8');

if (!typesContent.includes('likes?: string[];')) {
    typesContent = typesContent.replace('active: boolean;', 'active: boolean;\n  likes?: string[];\n  comments?: { id: string, userId: string, userName: string, text: string, createdAt: string }[];');
    fs.writeFileSync('src/types.ts', typesContent);
    console.log("Types updated");
}
