import fs from 'fs';
let code = fs.readFileSync('src/pages/student/StudentTestTake.tsx', 'utf8');

// The error was caused by the global replace `/g` of the closing tags.
// Let's first restore the file to the state before the layout change.
// I have the original file content in my context, but since we don't have it on disk,
// I will just fix the extra divs that were added.

// We need to count the exact number of divs to remove the extra ones at lines 247 and 276.
// Let's use string operations.

// For "hasStarted" portal:
const hasStartedRegex = /<h2 className="text-\[20px\] md:text-\[24px\] font-black text-white mb-4">Imtihonga tayyormisiz\?<\/h2>[\s\S]*?Boshlash\s*<\/button>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>,\s*document\.body/g;

code = code.replace(hasStartedRegex, (match) => {
    return match.replace("</div>\n        </div>\n      </div>\n    </div>,", "</div>\n      </div>,\n"); // Actually it originally had 2 closing divs: button wrapper, then white box, then outer fixed inset. That's 3 closing divs.
});

// Let's just fix it perfectly. 
// I will output the file again.
