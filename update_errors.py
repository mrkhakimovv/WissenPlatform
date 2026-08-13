import os
import re

files_to_update = [
    "src/pages/Login.tsx",
    "src/pages/admin/AdminPayments.tsx",
    "src/pages/admin/AdminMore.tsx",
    "src/pages/admin/AdminAttendance.tsx",
    "src/pages/admin/AdminNews.tsx",
    "src/pages/admin/AdminGroups.tsx",
    "src/pages/admin/AdminExams.tsx",
    "src/pages/admin/AdminStudents.tsx",
    "src/pages/student/StudentProfile.tsx",
    "src/contexts/AuthContext.tsx"
]

replacement = """catch (err) {
      console.error('Kontekst:', err);
      const msg = err instanceof Error ? err.message : "Noma'lum xatolik";
      toast.error(msg);
    }"""

def update_file(filepath):
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return
        
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # We want to replace catch(err) { toast.error(...) } 
    # Because formatting may differ, we can use regex
    # Pattern to match: catch\s*\([^)]*\)\s*\{[^}]*toast\.error[^}]*\}
    
    # Actually, a more resilient way is to replace blocks that look like standard catches
    # Let's try matching `catch(err: any) { ... toast.error(...) }` or similar.
    # Note: there might be nested braces, but usually in our files it's a simple toast.
    
    pattern = re.compile(r'catch\s*\([^)]+\)\s*\{\s*toast\.error\([^)]+\);\s*\}', re.DOTALL)
    
    new_content = pattern.sub(replacement, content)
    
    # Also handle cases where there are multiple statements in catch or it's named 'err: any'
    pattern2 = re.compile(r'catch\s*\(\s*err\s*(?::\s*any)?\s*\)\s*\{\s*toast\.error\([^)]+\);\s*\}', re.DOTALL)
    new_content = pattern2.sub(replacement, new_content)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f"Updated {filepath}")

for f in files_to_update:
    update_file(f)
