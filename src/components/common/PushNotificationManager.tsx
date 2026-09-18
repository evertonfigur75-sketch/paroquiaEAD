import React, { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dbService } from '../../services/db';
import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from '../../lib/firebase';

export const PushNotificationManager: React.FC = () => {
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser || !messaging) return;

    const requestPermission = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
          if (!vapidKey) {
            console.warn('VITE_FIREBASE_VAPID_KEY não configurada em .env');
            return;
          }

          const token = await getToken(messaging, { vapidKey });
          if (token) {
            console.log('FCM Token obtido com sucesso');
            await dbService.saveFCMToken(currentUser.id, token);
          }
        }
      } catch (error) {
        console.error('Erro ao configurar notificações push:', error);
      }
    };

    requestPermission();

    // Listen for foreground messages
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Mensagem recebida em primeiro plano:', payload);
      // The browser will show the notification automatically if we're in background,
      // but in foreground we might want to show a custom toast.
      if (payload.notification) {
        // You could trigger a global toast here if desired
      }
    });

    return () => unsubscribe();
  }, [currentUser]);

  return null;
};
