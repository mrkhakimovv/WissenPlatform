import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, getDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Exam, Group, User, TestData } from '../types';
import { X, Clock, CheckCircle2, XCircle, AlertCircle, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

interface Props {
  exam: Exam;
  groupName: string;
  onClose: () => void;
}

export default function ExamStatsModal({ exam, groupName, onClose }: Props) {
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<any[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [testData, setTestData] = useState<TestData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch test data to know question correctness
        if (exam.testId) {
          const testSnap = await getDoc(doc(db, 'tests', exam.testId));
          if (testSnap.exists()) {
            setTestData(testSnap.data() as TestData);
          }
        }

        // Fetch students
        let studentsQ;
        if (exam.groupId) {
          studentsQ = query(collection(db, 'users'), where('role', '==', 'student'), where('groupId', '==', exam.groupId));
        } else {
          studentsQ = query(collection(db, 'users'), where('role', '==', 'student'));
        }
        const studentDocs = await getDocs(studentsQ);
        const stData: User[] = [];
        studentDocs.forEach(d => stData.push({ id: d.id, ...d.data() } as User));
        setStudents(stData);

        // Fetch results
        const resultsQ = query(collection(db, 'exam_results'), where('examId', '==', exam.id));
        const resDocs = await getDocs(resultsQ);
        const rData: any[] = [];
        resDocs.forEach(d => rData.push({ id: d.id, ...d.data() }));
        setResults(rData);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [exam]);

  const formatTime = (seconds: number) => {
    if (!seconds) return '-';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m} daq ${s} soniya`;
  };

  const getWrongAnswers = (result: any) => {
    if (!testData || !result.answers) return [];
    const wrong: number[] = [];
    testData.questions.forEach((q, idx) => {
      const ans = result.answers[idx];
      if (q.isOpenEnded) {
        // A bit tricky without answersEqual, just string matching for basic UI
        if (String(ans).trim() !== String(q.correctAnswerText).trim()) {
          wrong.push(idx + 1);
        }
      } else {
        if (ans !== q.correctOptionIndex) {
          wrong.push(idx + 1);
        }
      }
    });
    return wrong;
  };

  const exportToExcel = () => {
    // Topshirganlar
    const submittedData = results.map(r => {
      const wrongAnswers = getWrongAnswers(r);
      return {
        'Ism-sharifi': r.studentName,
        'Natija (To\'g\'ri javoblar)': `${r.score}/${r.total}`,
        'Foiz': `${Math.round((r.score / r.total) * 100)}%`,
        'Vaqt': formatTime(r.timeSpent),
        'Urinishlar soni': r.attempts || 1,
        'Xato qilingan savollar': wrongAnswers.join(', '),
        'Topshirilgan vaqt': new Date(r.submittedAt).toLocaleString('uz-UZ')
      };
    });

    // Topshirmaganlar
    const unsubmittedStudents = students.filter(s => !results.some(r => r.studentId === s.id));
    const unsubmittedData = unsubmittedStudents.map(s => ({
      'Ism-sharifi': s.fullName,
      'Holat': 'Topshirmagan'
    }));

    const wb = XLSX.utils.book_new();
    
    if (submittedData.length > 0) {
      const wsSubmitted = XLSX.utils.json_to_sheet(submittedData);
      XLSX.utils.book_append_sheet(wb, wsSubmitted, "Topshirganlar");
    }

    if (unsubmittedData.length > 0) {
      const wsUnsubmitted = XLSX.utils.json_to_sheet(unsubmittedData);
      XLSX.utils.book_append_sheet(wb, wsUnsubmitted, "Topshirmaganlar");
    }

    if (submittedData.length === 0 && unsubmittedData.length === 0) {
       const wsEmpty = XLSX.utils.json_to_sheet([{'Xabar': "Ma'lumot topilmadi"}]);
       XLSX.utils.book_append_sheet(wb, wsEmpty, "Natijalar");
    }

    XLSX.writeFile(wb, `${exam.title} - Natijalar.xlsx`);
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-[#1a1a1a] rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-white/10">
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#1a1a1a]">
          <div>
            <h2 className="text-xl font-bold text-white">{exam.title} - Statistikalar</h2>
            <p className="text-sm text-white/50 mt-1">Guruh: {groupName || 'Barcha guruhlar'}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={exportToExcel} className="flex items-center gap-2 px-3 py-1.5 bg-[#FEC204]/10 hover:bg-[#FEC204]/20 text-[#FEC204] rounded-lg transition-colors text-sm font-bold">
              <Download size={16} />
              Excel (.xlsx)
            </button>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/50 hover:text-white">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-[#FEC204] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              {/* Natijalar */}
              <div>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <CheckCircle2 className="text-green-500" size={20} />
                  Topshirgan o'quvchilar ({results.length})
                </h3>
                {results.length === 0 ? (
                  <p className="text-white/40 text-sm">Hali hech kim imtihonni topshirmagan.</p>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {results.map(r => {
                      const wrongAnswers = getWrongAnswers(r);
                      return (
                        <div key={r.id} className="bg-white/5 p-4 rounded-xl border border-white/5 flex flex-col md:flex-row gap-4 justify-between">
                          <div>
                            <div className="font-bold text-white text-[15px]">{r.studentName}</div>
                            <div className="text-xs text-white/40 mt-1 flex items-center gap-3">
                              <span className="flex items-center gap-1"><Clock size={12}/> {new Date(r.submittedAt).toLocaleString('uz-UZ')}</span>
                              <span>Vaqt: {formatTime(r.timeSpent)}</span>
                              <span>Urinishlar: {r.attempts || 1} marta</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-right">
                              <div className="text-[20px] font-black text-[#FEC204]">{r.score}/{r.total}</div>
                              <div className="text-[10px] text-white/40 uppercase tracking-wider">To'g'ri javoblar</div>
                            </div>
                          </div>
                          {wrongAnswers.length > 0 && (
                            <div className="w-full md:w-auto flex-shrink-0 md:max-w-[200px]">
                              <div className="text-[10px] text-red-400 mb-1 font-bold">Xato qilingan savollar:</div>
                              <div className="flex flex-wrap gap-1">
                                {wrongAnswers.map(w => (
                                  <span key={w} className="px-1.5 py-0.5 bg-red-500/10 text-red-400 text-[10px] rounded">{w}-savol</span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Topshirmaganlar */}
              <div>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <AlertCircle className="text-red-500" size={20} />
                  Topshirmagan o'quvchilar ({students.filter(s => !results.some(r => r.studentId === s.id)).length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {students.filter(s => !results.some(r => r.studentId === s.id)).map(s => (
                    <div key={s.id} className="px-3 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm font-medium">
                      {s.fullName}
                    </div>
                  ))}
                  {students.filter(s => !results.some(r => r.studentId === s.id)).length === 0 && (
                    <p className="text-white/40 text-sm">Barcha o'quvchilar topshirgan.</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
