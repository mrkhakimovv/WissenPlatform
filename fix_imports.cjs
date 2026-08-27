const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminCertificateResults.tsx', 'utf8');

const correctImports = `import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Exam } from '../../types';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { computeRaschReport, dedupeBestAttempts, RaschResult, RaschReport } from '../../lib/rasch';
import { X, Download } from 'lucide-react';
import { createPortal } from 'react-dom';
import RaschStatsPanel from '../../components/RaschStatsPanel';

interface Props {`;

// Find where interface Props { starts
const propsIndex = code.indexOf('interface Props {');
if (propsIndex !== -1) {
    code = correctImports + code.substring(propsIndex + 'interface Props {'.length);
    fs.writeFileSync('src/pages/admin/AdminCertificateResults.tsx', code);
    console.log("Fixed imports");
}
