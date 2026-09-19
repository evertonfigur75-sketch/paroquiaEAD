var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_app = require("firebase-admin/app");
var import_firestore = require("firebase-admin/firestore");
var import_messaging = require("firebase-admin/messaging");
var import_auth = require("firebase-admin/auth");
var import_storage = require("firebase-admin/storage");
var import_node_cron = __toESM(require("node-cron"), 1);
var import_resend = require("resend");
if (!(0, import_app.getApps)().length) {
  (0, import_app.initializeApp)({
    storageBucket: `${process.env.FIREBASE_PROJECT_ID}.firebasestorage.app` || `${process.env.FIREBASE_PROJECT_ID}.appspot.com`
  });
}
var resend = process.env.RESEND_API_KEY ? new import_resend.Resend(process.env.RESEND_API_KEY) : null;
async function sendEmail(to, subject, html) {
  if (!resend) {
    console.warn("Resend API Key n\xE3o configurada. E-mail n\xE3o enviado:", subject);
    return;
  }
  try {
    await resend.emails.send({
      from: "IELB EAD <noreply@ensino-luterano.com.br>",
      to,
      subject,
      html
    });
  } catch (error) {
    console.error("Erro ao enviar e-mail:", error);
  }
}
async function performDailyBackup() {
  console.log("Iniciando backup di\xE1rio do Firestore...");
  const db = (0, import_firestore.getFirestore)();
  const storage = (0, import_storage.getStorage)();
  const bucket = storage.bucket();
  const collections = [
    "users",
    "studentProfiles",
    "congregations",
    "modules",
    "activities",
    "grades",
    "fcmTokens",
    "catechismAssessments",
    "worshipRecords",
    "devotions",
    "events",
    "announcements",
    "studyTexts",
    "settings",
    "notifications",
    "activityDrafts"
  ];
  const backupData = {};
  try {
    for (const collectionName of collections) {
      const snapshot = await db.collection(collectionName).get();
      backupData[collectionName] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
    }
    const timestamp = (/* @__PURE__ */ new Date()).toISOString();
    const dateStr = timestamp.split("T")[0];
    const fileName = `backups/firestore_snapshot_${dateStr}.json`;
    const file = bucket.file(fileName);
    await file.save(JSON.stringify(backupData, null, 2), {
      contentType: "application/json",
      metadata: {
        cacheControl: "no-cache",
        metadata: {
          timestamp,
          type: "full_snapshot"
        }
      }
    });
    console.log(`Backup conclu\xEDdo e salvo em: ${fileName}`);
  } catch (error) {
    console.error("Erro ao realizar backup do Firestore:", error);
  }
}
async function checkAndSendReminders() {
  console.log("Iniciando verifica\xE7\xE3o de lembretes autom\xE1ticos...");
  const db = (0, import_firestore.getFirestore)();
  const now = /* @__PURE__ */ new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1e3);
  const nowStr = now.toISOString().split("T")[0];
  const tomorrowStr = tomorrow.toISOString().split("T")[0];
  try {
    const activitiesSnapshot = await db.collection("activities").where("published", "==", true).where("deadline", ">=", nowStr).where("deadline", "<=", tomorrowStr).get();
    for (const activityDoc of activitiesSnapshot.docs) {
      const activity = activityDoc.data();
      const studentsSnapshot = await db.collection("studentProfiles").where("status", "==", "approved").where("courseType", "==", activity.courseId).get();
      for (const studentDoc of studentsSnapshot.docs) {
        const student = studentDoc.data();
        await sendPushToUser(student.id, {
          title: "Prazo de Atividade",
          body: `A atividade "${activity.title}" vence em ${activity.deadline}. N\xE3o esque\xE7a de entregar!`
        });
        await sendEmail(student.email, "Lembrete: Prazo de Atividade", `
          <h2>Ol\xE1, ${student.name}!</h2>
          <p>Lembramos que o prazo para a atividade <strong>"${activity.title}"</strong> termina em breve (${activity.deadline}).</p>
          <p>Acesse a plataforma para concluir sua tarefa.</p>
          <br/>
          <p>Fraternalmente,<br/>Pastor Everton Figur</p>
        `);
      }
    }
    const eventsSnapshot = await db.collection("events").where("date", ">=", nowStr).where("date", "<=", tomorrowStr).get();
    for (const eventDoc of eventsSnapshot.docs) {
      const event = eventDoc.data();
      const studentsSnapshot = await db.collection("studentProfiles").where("status", "==", "approved").get();
      for (const studentDoc of studentsSnapshot.docs) {
        const student = studentDoc.data();
        await sendPushToUser(student.id, {
          title: `Lembrete: ${event.category === "culto" ? "Culto" : "Aula"} Amanh\xE3`,
          body: `${event.title} \xE0s ${event.time} em ${event.location}.`
        });
        await sendEmail(student.email, `Lembrete: ${event.title}`, `
          <h2>Ol\xE1, ${student.name}!</h2>
          <p>Gostar\xEDamos de lembrar que teremos: <strong>${event.title}</strong>.</p>
          <p><strong>Data:</strong> ${event.date}<br/>
             <strong>Hor\xE1rio:</strong> ${event.time}<br/>
             <strong>Local:</strong> ${event.location}</p>
          <p>${event.description}</p>
          <br/>
          <p>Esperamos por voc\xEA!</p>
        `);
      }
    }
  } catch (error) {
    console.error("Erro ao processar lembretes autom\xE1ticos:", error);
  }
}
async function sendPushToUser(userId, payload) {
  const db = (0, import_firestore.getFirestore)();
  const tokenDoc = await db.collection("fcmTokens").doc(`token_${userId}`).get();
  if (tokenDoc.exists) {
    const token = tokenDoc.data()?.token;
    if (token) {
      try {
        await (0, import_messaging.getMessaging)().send({
          notification: payload,
          token
        });
      } catch (e) {
        console.warn(`Erro ao enviar push para usu\xE1rio ${userId}:`, e);
      }
    }
  }
}
import_node_cron.default.schedule("0 8 * * *", () => {
  checkAndSendReminders();
}, {
  timezone: "America/Sao_Paulo"
});
import_node_cron.default.schedule("0 3 * * *", () => {
  performDailyBackup();
}, {
  timezone: "America/Sao_Paulo"
});
async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "N\xE3o autorizado: Token ausente" });
  }
  const idToken = authHeader.split("Bearer ")[1];
  try {
    const decodedToken = await (0, import_auth.getAuth)().verifyIdToken(idToken);
    const isAdminEmail = decodedToken.email === "evertonfigur75@gmail.com";
    const db = (0, import_firestore.getFirestore)();
    const userDoc = await db.collection("users").doc(decodedToken.uid).get();
    const isAdminRole = userDoc.exists && userDoc.data()?.role === "admin";
    if (isAdminEmail || isAdminRole) {
      req.user = decodedToken;
      next();
    } else {
      res.status(403).json({ error: "Acesso negado: Requer privil\xE9gios de administrador" });
    }
  } catch (error) {
    console.error("Erro ao verificar token:", error);
    res.status(401).json({ error: "Sess\xE3o inv\xE1lida ou expirada" });
  }
}
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = Number(process.env.PORT) || 3e3;
  app.use(import_express.default.json());
  app.post("/api/notify", authMiddleware, async (req, res) => {
    const { title, body } = req.body;
    if (!title || !body) {
      return res.status(400).json({ error: "T\xEDtulo e corpo s\xE3o obrigat\xF3rios" });
    }
    try {
      const db = (0, import_firestore.getFirestore)();
      const tokensSnapshot = await db.collection("fcmTokens").get();
      const tokens = tokensSnapshot.docs.map((doc) => doc.data().token).filter((t) => !!t);
      if (tokens.length === 0) {
        return res.json({ success: true, message: "Nenhum token encontrado para enviar notifica\xE7\xF5es." });
      }
      const message = {
        notification: {
          title,
          body
        },
        tokens
      };
      const response = await (0, import_messaging.getMessaging)().sendEachForMulticast(message);
      res.json({
        success: true,
        successCount: response.successCount,
        failureCount: response.failureCount
      });
    } catch (error) {
      console.error("Erro ao enviar notifica\xE7\xF5es push:", error);
      res.status(500).json({ error: error.message });
    }
  });
  app.get("/api/admin/backups", authMiddleware, async (req, res) => {
    try {
      const storage = (0, import_storage.getStorage)();
      const bucket = storage.bucket();
      const [files] = await bucket.getFiles({ prefix: "backups/" });
      const backups = files.filter((file) => file.name.endsWith(".json")).map((file) => ({
        name: file.name.replace("backups/", ""),
        size: file.metadata.size,
        updated: file.metadata.updated,
        id: file.id
      })).sort((a, b) => new Date(b.updated).getTime() - new Date(a.updated).getTime());
      res.json(backups);
    } catch (error) {
      console.error("Erro ao listar backups:", error);
      res.status(500).json({ error: error.message });
    }
  });
  app.get("/api/admin/backups/:fileName", authMiddleware, async (req, res) => {
    const { fileName } = req.params;
    try {
      const storage = (0, import_storage.getStorage)();
      const bucket = storage.bucket();
      const file = bucket.file(`backups/${fileName}`);
      const [exists] = await file.exists();
      if (!exists) {
        return res.status(404).json({ error: "Arquivo de backup n\xE3o encontrado" });
      }
      const [url] = await file.getSignedUrl({
        version: "v4",
        action: "read",
        expires: Date.now() + 15 * 60 * 1e3
        // 15 minutes
      });
      res.json({ url });
    } catch (error) {
      console.error("Erro ao gerar URL de download:", error);
      res.status(500).json({ error: error.message });
    }
  });
  app.post("/api/admin/backups/trigger", authMiddleware, async (req, res) => {
    try {
      await performDailyBackup();
      res.json({ success: true, message: "Backup manual iniciado e processado com sucesso." });
    } catch (error) {
      console.error("Erro ao disparar backup manual:", error);
      res.status(500).json({ error: error.message });
    }
  });
  app.post("/api/admin/reminders/trigger", authMiddleware, async (req, res) => {
    try {
      await checkAndSendReminders();
      res.json({ success: true, message: "Envio de lembretes manuais iniciado e processado com sucesso." });
    } catch (error) {
      console.error("Erro ao disparar lembretes manuais:", error);
      res.status(500).json({ error: error.message });
    }
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
