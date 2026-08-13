import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MODEL_NAME = "gemini-2.5-flash";

// --- 1. Helper: Normalize Reference ---
export function normalizeReference(taskReference: any) {
  if (!taskReference) return null;
  if (taskReference.solutions) return taskReference.solutions;
  if (taskReference.teacherAnalysis?.solutions) return taskReference.teacherAnalysis.solutions;
  if (taskReference.analysis?.solutions) return taskReference.analysis.solutions;
  return null;
}

// --- 2. Helper: Compact Reference ---
export function compactReference(taskReference: any) {
  const solutions = normalizeReference(taskReference);
  if (!solutions || !Array.isArray(solutions)) return null;
  
  return {
    n: solutions.length,
    q: solutions.map((s: any) => ({
      i: s.problemNumber,
      p: s.problemText,
      a: s.finalAnswer,
      s: s.solutionSteps
    }))
  };
}

// --- 3. Helper: Build Error Steps (Server-side) ---
export function buildErrorSteps(errors: any[], taskReference: any): string[] {
  if (!errors || !Array.isArray(errors)) return [];
  const solutions = normalizeReference(taskReference) || [];
  
  return errors.map(err => {
    const ref = solutions.find((s: any) => s.problemNumber === err.problemNumber);
    if (!ref) {
      return `**${err.problemNumber}-savol:** ${err.mistake}`;
    }
    return `**${err.problemNumber}-savol:** ${err.mistake}\n\n**To'g'ri yechim:**\n${ref.solutionSteps}\n\n**Javob:** ${ref.finalAnswer}`;
  });
}

// --- 4. Helper: Log Usage ---
function logUsage(label: string, response: any) {
  const usage = response.usageMetadata;
  if (usage) {
    console.log(`[${label}] Tokens - Input: ${usage.promptTokenCount}, Output: ${usage.candidatesTokenCount}, Thinking: ${usage.thoughtsTokenCount || 0}, Total: ${usage.totalTokenCount}`);
  }
}

// --- 5. Analyze Teacher Examples (Reference Generation) ---
export async function analyzeTeacherExamples(images: { mimeType: string; data: string }[]) {
  const schema = {
    type: Type.OBJECT,
    properties: {
      questionCount: { type: Type.INTEGER, description: "Jami savollar soni" },
      solutions: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            problemNumber: { type: Type.STRING, description: "Savol raqami (masalan: '1', '2a')" },
            problemText: { type: Type.STRING, description: "Savolning matni yoki sharti" },
            solutionSteps: { type: Type.STRING, description: "Qadam-baqadam yechilish jarayoni (batafsil)" },
            finalAnswer: { type: Type.STRING, description: "Yakuniy javob" }
          },
          required: ["problemNumber", "problemText", "solutionSteps", "finalAnswer"]
        }
      }
    },
    required: ["questionCount", "solutions"]
  };

  const prompt = `
Siz o'qituvchining namunaviy yechimlarini tahlil qiluvchi AI yordamchisiz.
Rasmdagi barcha vazifalarni va ularning yechimlarini juda diqqat bilan o'qib chiqing.
Har bir savol uchun quyidagilarni aniqlang va JSON formatida qaytaring:
- Savol raqami
- Savol sharti
- Qadam-baqadam yechim
- Yakuniy javob
Iltimos, qo'lyozmalarni aniq o'qishga harakat qiling va yechimlarni to'liq saqlab qoling.
Javob faqat o'zbek tilida bo'lsin.
  `.trim();

  const contents = [
    prompt,
    ...images.map(img => ({
      inlineData: {
        data: img.data,
        mimeType: img.mimeType
      }
    }))
  ];

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents,
    config: {
      thinkingConfig: { thinkingBudget: 0 },
      responseMimeType: "application/json",
      responseSchema: schema,
    }
  });

  logUsage('AnalyzeTeacherExamples', response);
  
  if (!response.text) {
    throw new Error("AI tahlil natijasini qaytarmadi.");
  }
  
  return JSON.parse(response.text);
}

// --- 6. Evaluate Homework (Grading) ---
async function _evaluateHomeworkAttempt(images: { mimeType: string; data: string }[], compactRef: any) {
  const schema = {
    type: Type.OBJECT,
    properties: {
      transcription: { type: Type.STRING, description: "Talaba yechimining qadam-baqadam transkripsiyasi (Markdown/LaTeX)" },
      isCorrect: { type: Type.BOOLEAN, description: "Barcha savollar to'liq to'g'rimi?" },
      isPartiallyCorrect: { type: Type.BOOLEAN, description: "Qisman to'g'ri ishlanganmi?" },
      score: { type: Type.INTEGER, description: "100 ballik tizimda baho (0-100)" },
      feedback: { type: Type.STRING, description: "Umumiy rag'batlantiruvchi xulosa (aniq xatolarni takrorlamang, u errors ga yoziladi)" },
      errors: {
        type: Type.ARRAY,
        description: "Faqat xato ishlangan savollar ro'yxati (agar hammasi to'g'ri bo'lsa, bo'sh bo'ladi)",
        items: {
          type: Type.OBJECT,
          properties: {
            problemNumber: { type: Type.STRING, description: "Xato qilingan savol raqami" },
            mistake: { type: Type.STRING, description: "Xato qayerda qilingani haqida juda qisqa (2-4 gap) izoh. To'g'ri yechimni yozmang." }
          },
          required: ["problemNumber", "mistake"]
        }
      }
    },
    required: ["transcription", "isCorrect", "isPartiallyCorrect", "score", "feedback", "errors"]
  };

  const refContext = compactRef 
    ? `\n\nQuyida o'qituvchining to'g'ri yechimlari (siqilgan formatda) berilgan:\n${JSON.stringify(compactRef)}\n\nUshbu yechimlarga qat'iy asoslanib baholang. Agar talaba ba'zi savollarni ishlamagan bo'lsa, ularni xato deb hisoblang. Baho (score) = round(100 * to'g'ri_ishlangan_savollar / jami_savollar) formulasiga yaqin bo'lsin.`
    : `\n\nSizda o'qituvchining tayyor namunasi yo'q. Shuning uchun o'zingiz yechib ko'rib, talabaning ishini tekshiring. Xatolar (mistake) qismida bir oz kengroq tushuntirish berishingiz mumkin, chunki to'g'ri yechimni talaba faqat sizdan eshitadi.`;

  const prompt = `
Siz o'qituvchi yordamchisisiz. Talabaning yozma ishini tekshirib, baholashingiz kerak.
Vazifa quyidagicha:
1. Rasmdagi talaba yozuvlarini diqqat bilan o'qing.
2. Qadam-baqadam transkripsiya qiling.
3. Yechimlarni tekshirib, xatolarni aniqlang. Xatolar faqat 'errors' massivida qisqa izohlansin.
4. 'feedback' qismida umumiy izoh bering (zo'r, yaxshi harakat qilding, qoidalarni takrorla kabi), lekin aniq xatolarni takrorlamang.
5. Har doim o'zbek tilida, do'stona va tushunarli tilda yozing.
${refContext}
  `.trim();

  const contents = [
    prompt,
    ...images.map(img => ({
      inlineData: {
        data: img.data,
        mimeType: img.mimeType
      }
    }))
  ];

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents,
    config: {
      thinkingConfig: { thinkingBudget: 8192 },
      responseMimeType: "application/json",
      responseSchema: schema,
    }
  });

  logUsage('EvaluateHomework', response);
  
  if (!response.text) {
    throw new Error("AI baholash natijasini qaytarmadi.");
  }
  
  let data;
  try {
    data = JSON.parse(response.text);
  } catch(e) {
    throw new Error("AI natijasini o'qib bo'lmadi (JSON xatosi). Yechim juda uzun bo'lishi mumkin.");
  }

  // Token statistikasini qo'shamiz
  const usage = response.usageMetadata;
  if (usage) {
    data.inputTokens = usage.promptTokenCount || 0;
    data.outputTokens = usage.candidatesTokenCount || 0;
    data.thinkingTokens = usage.thoughtsTokenCount || 0;
    data.totalTokens = usage.totalTokenCount || 0;
  }

  return data;
}

export async function evaluateHomework(images: { mimeType: string; data: string }[], taskReference?: any) {
  const compactRef = compactReference(taskReference);
  
  let attempt = 0;
  const maxAttempts = 5;
  let delay = 3000;

  while (attempt < maxAttempts) {
    try {
      const result = await _evaluateHomeworkAttempt(images, compactRef);
      
      // Agar reference bor bo'lsa, xatolarga to'liq to'g'ri yechimni birlashtiramiz
      result.errorSteps = buildErrorSteps(result.errors, taskReference);
      return result;
      
    } catch (error: any) {
      attempt++;
      console.error(`Baholash xatosi (urinish ${attempt}/${maxAttempts}):`, error.message);
      
      const msg = error.message?.toLowerCase() || '';
      
      // Api key xato bo'lsa
      if (msg.includes('api_key') || msg.includes('unauthenticated')) {
        throw new Error("Gemini API kaliti xato yoki kiritilmagan.");
      }
      
      // Token limit yoki JSON kesilishi
      if (msg.includes('json') || msg.includes('max_tokens')) {
        throw new Error("Javob juda uzun bo'lib ketdi va chala qoldi. Iltimos, rasmni qismlarga bo'lib yuklang.");
      }

      if (attempt >= maxAttempts) {
        throw new Error("AI xizmati vaqtincha band yoki javob bermayapti. Iltimos keyinroq qayta urinib ko'ring.");
      }
      
      // Kuting va qayta urinib ko'ring
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; // exponential backoff
    }
  }
}
