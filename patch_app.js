import fs from 'fs';

let code = fs.readFileSync('src/App.tsx', 'utf-8');

// Replace the profile route with a redirect
code = code.replace(/<Route path="profile" element={<StudentProfile \/>} \/>/, '<Route path="profile" element={<Navigate to="/student" replace />} />');

if (!code.includes('Navigate')) {
  code = code.replace(/import { Routes, Route } from 'react-router-dom';/, "import { Routes, Route, Navigate } from 'react-router-dom';");
}

fs.writeFileSync('src/App.tsx', code);
