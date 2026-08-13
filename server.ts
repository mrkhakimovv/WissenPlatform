import express from "express";
import path from "path";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import rateLimit from "express-rate-limit";
import { analyzeTeacherExamples, evaluateHomework } from "./src/server/evaluator";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));

  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 requests per `window`
    message: { error: "Juda ko'p so'rov yuborildi. Iltimos 15 daqiqadan keyin qayta urinib ko'ring." },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // API Routes
  app.post("/api/analyze-teacher-examples", apiLimiter, async (req, res) => {
    try {
      const { images } = req.body;
      if (!images || !Array.isArray(images) || images.length === 0) {
        return res.status(400).json({ error: "Rasmlar taqdim etilmadi." });
      }

      const result = await analyzeTeacherExamples(images);
      res.json(result);
    } catch (error: any) {
      console.error("Tahlil xatosi:", error);
      const status = error.message.includes('API kalit') ? 401 : 500;
      res.status(status).json({ error: error.message || "Tahlil jarayonida xatolik yuz berdi" });
    }
  });

  app.post("/api/vazifa-baholash", apiLimiter, async (req, res) => {
    try {
      const { images, taskReference } = req.body;
      if (!images || !Array.isArray(images) || images.length === 0) {
        return res.status(400).json({ error: "Rasmlar taqdim etilmadi." });
      }

      const result = await evaluateHomework(images, taskReference);
      res.json(result);
    } catch (error: any) {
      console.error("Baholash xatosi:", error);
      const status = error.message.includes('API kalit') ? 401 : 500;
      res.status(status).json({ error: error.message || "Baholash jarayonida xatolik yuz berdi" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
