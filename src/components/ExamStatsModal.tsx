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
        
        // Group by studentId and keep the best score, but also save all attempts info
        const groupedResults = new Map();
        rData.forEach(r => {
          if (!groupedResults.has(r.studentId)) {
            groupedResults.set(r.studentId, { ...r, allAttemptsDetails: [r] });
          } else {
            const existing = groupedResults.get(r.studentId);
            const currentPercent = existing.total > 0 ? existing.score / existing.total : 0;
            const newPercent = r.total > 0 ? r.score / r.total : 0;
            
            existing.allAttemptsDetails.push(r);
            
            if (newPercent > currentPercent || (newPercent === currentPercent && new Date(r.submittedAt).getTime() > new Date(existing.submittedAt).getTime())) {
              r.attempts = Math.max(r.attempts || 1, existing.attempts || 1);
              r.allAttemptsDetails = existing.allAttemptsDetails;
              groupedResults.set(r.studentId, r);
            } else {
              existing.attempts = Math.max(r.attempts || 1, existing.attempts || 1);
            }
          }
        });
        
        setResults(Array.from(groupedResults.values()).sort((a, b) => b.score - a.score));

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
    // Agar resultda to'g'ridan-to'g'ri wrongAnswers saqlangan bo'lsa (yangi versiya)
    if (result.wrongAnswers && Array.isArray(result.wrongAnswers)) {
      return result.wrongAnswers.map((w: any) => w.questionIndex);
    }
    // Eski versiya
    if (!testData || !result.answers) return [];
    const wrong: number[] = [];
    testData.questions.forEach((q: any, idx: number) => {
      const ans = result.answers[idx];
      
      // We also need to check if the student missed the question entirely
      if (ans === undefined || ans === null) {
        wrong.push(idx + 1);
        return;
      }
      
      if (q.isOpenEnded) {
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
                        <div key={r.id} className={`p-4 rounded-xl border flex flex-col md:flex-row gap-4 md:items-center ${wrongAnswers.length > 0 ? 'bg-red-500/5 border-red-500/10' : 'bg-white/5 border-white/5'}`}>
                          <div className="flex-1">
                            <div className="font-bold text-white text-[15px]">{r.studentName}</div>
                            <div className="text-xs text-white/40 mt-1 flex flex-wrap items-center gap-3">
                              <span className="flex items-center gap-1"><Clock size={12}/> {new Date(r.submittedAt).toLocaleString('uz-UZ')}</span>
                              <span>Vaqt: {formatTime(r.timeSpent)}</span>
                              {r.attempts > 1 ? (
                                <span>Eng yuqori natija ({r.attempts} ta urinishdan)</span>
                              ) : (
                                <span>1 ta urinish</span>
                              )}
                            </div>
                            
                            {r.allAttemptsDetails && r.allAttemptsDetails.length > 1 && (
                               <div className="mt-2 flex flex-col gap-1">
                                 <div className="text-[10px] uppercase font-bold text-white/30">Barcha urinishlar tarixi:</div>
                                 <div className="flex flex-col gap-1 max-h-[80px] overflow-y-auto custom-scrollbar">
                                   {r.allAttemptsDetails
                                     .sort((a: any, b: any) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
                                     .map((att: any, idx: number) => (
                                     <div key={idx} className="flex items-center gap-3 text-[11px] text-white/40 bg-[#0d0d0d] p-1.5 rounded">
                                       <span className="font-bold text-white/60">{att.score}/{att.total}</span>
                                       <span className="flex items-center gap-1"><Clock size={10}/> {new Date(att.submittedAt).toLocaleString('uz-UZ')}</span>
                                       <span>Vaqt: {formatTime(att.timeSpent)}</span>
                                     </div>
                                   ))}
                                 </div>
                               </div>
                            )}
                          </div>
                          
                          {wrongAnswers.length > 0 ? (
                            <div className="w-full md:w-auto flex-1 md:max-w-[250px]">
                              <div className="text-[10px] text-red-400 mb-1 font-bold">Xato qilingan savollar:</div>
                              <div className="flex flex-wrap gap-1 max-h-[60px] overflow-y-auto custom-scrollbar">
                                {wrongAnswers.map((w: any) => (
                                  <span key={w} className="px-1.5 py-0.5 bg-red-500/10 text-red-400 text-[10px] rounded border border-red-500/20">{w}</span>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="w-full md:w-auto flex-1 md:max-w-[250px]"></div>
                          )}

                          <div className="text-right flex-shrink-0">
                            <div className="text-[20px] font-black text-[#FEC204]">{r.score}/{r.total}</div>
                            <div className="text-[10px] text-white/40 uppercase tracking-wider">To'g'ri javoblar</div>
                          </div>
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
