import { initializeApp, getApp, getApps } from 'firebase/app';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getMessaging, getToken } from 'firebase/messaging';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Enable offline persistence with fallback
let firestoreDb;
try {
  firestoreDb = initializeFirestore(app, {
    localCache: persistentLocalCache({ 
      tabManager: persistentMultipleTabManager() 
    })
  });
} catch (e) {
  try {
    firestoreDb = getFirestore(app);
  } catch (err) {
    console.error('Erro ao inicializar Firestore:', err);
  }
}
export const db = firestoreDb!;

export const auth = getAuth(app);
export const storage = getStorage(app);

// Safe messaging initialization (prevents crash on HTTP or browsers without Push support)
let messagingInstance: any = null;
if (typeof window !== 'undefined') {
  try {
    if (window.isSecureContext && 'Notification' in window && 'serviceWorker' in navigator) {
      messagingInstance = getMessaging(app);
    }
  } catch (err) {
    console.warn('Firebase Messaging desativado neste ambiente:', err);
  }
}
export const messaging = messagingInstance;

export const requestNotificationPermission = async () => {
  if (!messaging) return null;
  
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
      });
      return token;
    }
  } catch (error) {
    console.warn('Erro ao obter token FCM:', error);
  }
  return null;
};
