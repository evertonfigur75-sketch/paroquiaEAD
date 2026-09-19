import express, { Request, Response, NextFunction } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";
import { getAuth } from "firebase-admin/auth";
import { getStorage } from "firebase-admin/storage";
import cron from "node-cron";
import { Resend } from "resend";

// Initialize Firebase Admin
if (!getApps().length) {
  initializeApp({
    storageBucket: `${process.env.FIREBASE_PROJECT_ID}.firebasestorage.app` || `${process.env.FIREBASE_PROJECT_ID}.appspot.com`
  });
}

// Initialize Resend (Email service)
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Helper to send email
async function sendEmail(to: string, subject: string, html: string) {
  if (!resend) {
    console.warn("Resend API Key não configurada. E-mail não enviado:", subject);
    return;
  }
  try {
    await resend.emails.send({
      from: "IELB EAD <noreply@ensino-luterano.com.br>",
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error("Erro ao enviar e-mail:", error);
  }
}

// Function to perform Firestore backup to Storage
async function performDailyBackup() {
  console.log("Iniciando backup diário do Firestore...");
  const db = getFirestore();
  const storage = getStorage();
  const bucket = storage.bucket();

  const collections = [
    "users", "studentProfiles", "congregations", "modules", "activities",
    "grades", "fcmTokens", "catechismAssessments", "worshipRecords",
    "devotions", "events", "announcements", "studyTexts", "settings",
    "notifications", "activityDrafts"
  ];

  const backupData: any = {};

  try {
    for (const collectionName of collections) {
      const snapshot = await db.collection(collectionName).get();
      backupData[collectionName] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    }

    const timestamp = new Date().toISOString();
    const dateStr = timestamp.split('T')[0];
    const fileName = `backups/firestore_snapshot_${dateStr}.json`;
    const file = bucket.file(fileName);

    await file.save(JSON.stringify(backupData, null, 2), {
      contentType: 'application/json',
      metadata: {
        cacheControl: 'no-cache',
        metadata: {
          timestamp: timestamp,
          type: 'full_snapshot'
        }
      }
    });

    console.log(`Backup concluído e salvo em: ${fileName}`);
  } catch (error) {
    console.error("Erro ao realizar backup do Firestore:", error);
  }
}

// Function to check and send reminders
async function checkAndSendReminders() {
  console.log("Iniciando verificação de lembretes automáticos...");
  const db = getFirestore();
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  
  const nowStr = now.toISOString().split('T')[0];
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  try {
    // 1. Check for upcoming activities (Deadlines)
    const activitiesSnapshot = await db.collection("activities")
      .where("published", "==", true)
      .where("deadline", ">=", nowStr)
      .where("deadline", "<=", tomorrowStr)
      .get();

    for (const activityDoc of activitiesSnapshot.docs) {
      const activity = activityDoc.data();
      const studentsSnapshot = await db.collection("studentProfiles")
        .where("status", "==", "approved")
        .where("courseType", "==", activity.courseId)
        .get();

      for (const studentDoc of studentsSnapshot.docs) {
        const student = studentDoc.data();
        
        // Push Notification
        await sendPushToUser(student.id, {
          title: "Prazo de Atividade",
          body: `A atividade "${activity.title}" vence em ${activity.deadline}. Não esqueça de entregar!`,
        });

        // Email
        await sendEmail(student.email, "Lembrete: Prazo de Atividade", `
          <h2>Olá, ${student.name}!</h2>
          <p>Lembramos que o prazo para a atividade <strong>"${activity.title}"</strong> termina em breve (${activity.deadline}).</p>
          <p>Acesse a plataforma para concluir sua tarefa.</p>
          <br/>
          <p>Fraternalmente,<br/>Pastor Everton Figur</p>
        `);
      }
    }

    // 2. Check for upcoming events (Worships/Classes)
    const eventsSnapshot = await db.collection("events")
      .where("date", ">=", nowStr)
      .where("date", "<=", tomorrowStr)
      .get();

    for (const eventDoc of eventsSnapshot.docs) {
      const event = eventDoc.data();
      
      // Notify all approved students for paroquial events
      const studentsSnapshot = await db.collection("studentProfiles")
        .where("status", "==", "approved")
        .get();

      for (const studentDoc of studentsSnapshot.docs) {
        const student = studentDoc.data();
        
        // Push Notification
        await sendPushToUser(student.id, {
          title: `Lembrete: ${event.category === 'culto' ? 'Culto' : 'Aula'} Amanhã`,
          body: `${event.title} às ${event.time} em ${event.location}.`,
        });

        // Email
        await sendEmail(student.email, `Lembrete: ${event.title}`, `
          <h2>Olá, ${student.name}!</h2>
          <p>Gostaríamos de lembrar que teremos: <strong>${event.title}</strong>.</p>
          <p><strong>Data:</strong> ${event.date}<br/>
             <strong>Horário:</strong> ${event.time}<br/>
             <strong>Local:</strong> ${event.location}</p>
          <p>${event.description}</p>
          <br/>
          <p>Esperamos por você!</p>
        `);
      }
    }

  } catch (error) {
    console.error("Erro ao processar lembretes automáticos:", error);
  }
}

// Helper for single user push
async function sendPushToUser(userId: string, payload: { title: string, body: string }) {
  const db = getFirestore();
  const tokenDoc = await db.collection("fcmTokens").doc(`token_${userId}`).get();
  if (tokenDoc.exists) {
    const token = tokenDoc.data()?.token;
    if (token) {
      try {
        await getMessaging().send({
          notification: payload,
          token: token,
        });
      } catch (e) {
        console.warn(`Erro ao enviar push para usuário ${userId}:`, e);
      }
    }
  }
}

// Schedule: Every day at 08:00 AM
cron.schedule("0 8 * * *", () => {
  checkAndSendReminders();
}, {
  timezone: "America/Sao_Paulo"
});

// Schedule: Every day at 03:00 AM (Backup)
cron.schedule("0 3 * * *", () => {
  performDailyBackup();
}, {
  timezone: "America/Sao_Paulo"
});

// Middleware to validate Firebase ID Token and Admin role
async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Não autorizado: Token ausente" });
  }

  const idToken = authHeader.split("Bearer ")[1];
  try {
    const decodedToken = await getAuth().verifyIdToken(idToken);
    
    // Check if user is the known admin email
    const isAdminEmail = decodedToken.email === "evertonfigur75@gmail.com";
    
    // Also check Firestore for the 'admin' role if needed
    const db = getFirestore();
    const userDoc = await db.collection("users").doc(decodedToken.uid).get();
    const isAdminRole = userDoc.exists && userDoc.data()?.role === "admin";

    if (isAdminEmail || isAdminRole) {
      (req as any).user = decodedToken;
      next();
    } else {
      res.status(403).json({ error: "Acesso negado: Requer privilégios de administrador" });
    }
  } catch (error) {
    console.error("Erro ao verificar token:", error);
    res.status(401).json({ error: "Sessão inválida ou expirada" });
  }
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // API Route to send notifications - PROTECTED
  app.post("/api/notify", authMiddleware, async (req, res) => {
    const { title, body } = req.body;

    if (!title || !body) {
      return res.status(400).json({ error: "Título e corpo são obrigatórios" });
    }

    try {
      const db = getFirestore();
      const tokensSnapshot = await db.collection("fcmTokens").get();
      const tokens = tokensSnapshot.docs.map(doc => doc.data().token).filter(t => !!t);

      if (tokens.length === 0) {
        return res.json({ success: true, message: "Nenhum token encontrado para enviar notificações." });
      }

      const message = {
        notification: {
          title,
          body,
        },
        tokens,
      };

      const response = await getMessaging().sendEachForMulticast(message);
      
      res.json({
        success: true,
        successCount: response.successCount,
        failureCount: response.failureCount,
      });
    } catch (error: any) {
      console.error("Erro ao enviar notificações push:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // API to list backups - PROTECTED
  app.get("/api/admin/backups", authMiddleware, async (req, res) => {
    try {
      const storage = getStorage();
      const bucket = storage.bucket();
      const [files] = await bucket.getFiles({ prefix: 'backups/' });
      
      const backups = files
        .filter(file => file.name.endsWith('.json'))
        .map(file => ({
          name: file.name.replace('backups/', ''),
          size: file.metadata.size,
          updated: file.metadata.updated,
          id: file.id
        }))
        .sort((a, b) => new Date(b.updated).getTime() - new Date(a.updated).getTime());

      res.json(backups);
    } catch (error: any) {
      console.error("Erro ao listar backups:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // API to get download URL for a backup - PROTECTED
  app.get("/api/admin/backups/:fileName", authMiddleware, async (req, res) => {
    const { fileName } = req.params;
    try {
      const storage = getStorage();
      const bucket = storage.bucket();
      const file = bucket.file(`backups/${fileName}`);

      const [exists] = await file.exists();
      if (!exists) {
        return res.status(404).json({ error: "Arquivo de backup não encontrado" });
      }

      const [url] = await file.getSignedUrl({
        version: 'v4',
        action: 'read',
        expires: Date.now() + 15 * 60 * 1000, // 15 minutes
      });

      res.json({ url });
    } catch (error: any) {
      console.error("Erro ao gerar URL de download:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // API to trigger a manual backup - PROTECTED
  app.post("/api/admin/backups/trigger", authMiddleware, async (req, res) => {
    try {
      await performDailyBackup();
      res.json({ success: true, message: "Backup manual iniciado e processado com sucesso." });
    } catch (error: any) {
      console.error("Erro ao disparar backup manual:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // API to trigger reminders manually - PROTECTED
  app.post("/api/admin/reminders/trigger", authMiddleware, async (req, res) => {
    try {
      await checkAndSendReminders();
      res.json({ success: true, message: "Envio de lembretes manuais iniciado e processado com sucesso." });
    } catch (error: any) {
      console.error("Erro ao disparar lembretes manuais:", error);
      res.status(500).json({ error: error.message });
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
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
