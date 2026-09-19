import { doc, getDoc, setDoc, collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { PASTOR_PRIMARY_EMAIL } from '../lib/adminAuth';

export interface FirestoreAdminCheckResult {
  success: boolean;
  existsInFirestore: boolean;
  adminEmail: string;
  adminName?: string;
  docId?: string;
  isCurrentUserAdminAuth?: boolean;
  currentUserAuthEmail?: string | null;
  message: string;
  documentData?: any;
}

export const DEFAULT_ADMIN_CONFIG = {
  id: 'admin-pastor-everton',
  name: 'Pastor Everton Figur',
  email: PASTOR_PRIMARY_EMAIL,
  role: 'admin',
  avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
  city: 'Planalto',
  state: 'PR',
  district: 'Distrito Parque do Iguaçu',
  phone: '(55) 99999-0000',
  status: 'active',
  courseType: 'confirmatorio',
  parishName: 'Paróquia Evangélica Luterana',
  churchBody: 'Igreja Evangélica de Confissão Luterana no Brasil',
  description: 'Pastor Titular e Coordenador do Ensino Confirmatório',
};

/**
 * Verifica se o documento de Administrador do Pastor existe no Cloud Firestore.
 */
export async function checkFirestoreAdminStatus(): Promise<FirestoreAdminCheckResult> {
  const currentAuthUser = auth.currentUser;
  const targetEmail = PASTOR_PRIMARY_EMAIL;

  try {
    // 1. Check document by ID 'admin-pastor-everton'
    const defaultDocRef = doc(db, 'users', 'admin-pastor-everton');
    const defaultDocSnap = await getDoc(defaultDocRef);

    if (defaultDocSnap.exists()) {
      const data = defaultDocSnap.data();
      return {
        success: true,
        existsInFirestore: true,
        adminEmail: data.email || targetEmail,
        adminName: data.name || 'Pastor Everton Figur',
        docId: defaultDocSnap.id,
        isCurrentUserAdminAuth: currentAuthUser?.email?.toLowerCase() === targetEmail.toLowerCase(),
        currentUserAuthEmail: currentAuthUser?.email,
        message: 'Administrador configurado com sucesso na coleção "users" do Firestore (ID: admin-pastor-everton).',
        documentData: data,
      };
    }

    // 2. Check if current Firebase Auth UID has a user document with role == 'admin'
    if (currentAuthUser) {
      const userUidRef = doc(db, 'users', currentAuthUser.uid);
      const userUidSnap = await getDoc(userUidRef);
      if (userUidSnap.exists() && userUidSnap.data().role === 'admin') {
        const data = userUidSnap.data();
        return {
          success: true,
          existsInFirestore: true,
          adminEmail: data.email || currentAuthUser.email || targetEmail,
          adminName: data.name || currentAuthUser.displayName || 'Pastor Everton Figur',
          docId: userUidSnap.id,
          isCurrentUserAdminAuth: true,
          currentUserAuthEmail: currentAuthUser.email,
          message: `Administrador configurado no Firestore com o UID do Firebase Auth (${currentAuthUser.uid}).`,
          documentData: data,
        };
      }
    }

    // 3. Query collection 'users' for email
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', targetEmail));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const firstDoc = querySnapshot.docs[0];
      const data = firstDoc.data();
      return {
        success: true,
        existsInFirestore: true,
        adminEmail: data.email,
        adminName: data.name,
        docId: firstDoc.id,
        isCurrentUserAdminAuth: currentAuthUser?.email?.toLowerCase() === targetEmail.toLowerCase(),
        currentUserAuthEmail: currentAuthUser?.email,
        message: `Administrador localizado na coleção "users" (Doc ID: ${firstDoc.id}).`,
        documentData: data,
      };
    }

    return {
      success: true,
      existsInFirestore: false,
      adminEmail: targetEmail,
      isCurrentUserAdminAuth: currentAuthUser?.email?.toLowerCase() === targetEmail.toLowerCase(),
      currentUserAuthEmail: currentAuthUser?.email,
      message: 'Nenhum documento de administrador encontrado no Firestore para ' + targetEmail + '. Clique no botão abaixo para provisionar.',
    };
  } catch (error: any) {
    console.error('Erro ao verificar status do admin no Firestore:', error);
    return {
      success: false,
      existsInFirestore: false,
      adminEmail: targetEmail,
      currentUserAuthEmail: currentAuthUser?.email,
      message: error?.message || 'Falha ao consultar coleção do Firestore.',
    };
  }
}

/**
 * Cria ou atualiza o documento do Pastor na coleção "users" do Firestore.
 * Provisiona tanto com o ID fixo quanto com o UID do usuário atualmente autenticado no Firebase Auth (se houver).
 */
export async function provisionFirstAdminInFirestore(): Promise<{
  success: boolean;
  message: string;
  docIds: string[];
}> {
  const createdIds: string[] = [];
  const currentAuthUser = auth.currentUser;

  try {
    const payload = {
      ...DEFAULT_ADMIN_CONFIG,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      lastSetupAt: new Date().toISOString(),
    };

    // 1. Always create the reference document 'admin-pastor-everton'
    const adminRef = doc(db, 'users', 'admin-pastor-everton');
    await setDoc(adminRef, payload, { merge: true });
    createdIds.push('admin-pastor-everton');

    // 2. If user is currently signed in via Firebase Auth (e.g. Google or Email), link their UID too
    if (currentAuthUser && currentAuthUser.uid) {
      const uidRef = doc(db, 'users', currentAuthUser.uid);
      await setDoc(
        uidRef,
        {
          ...payload,
          id: currentAuthUser.uid,
          email: currentAuthUser.email || PASTOR_PRIMARY_EMAIL,
          name: currentAuthUser.displayName || payload.name,
          avatarUrl: currentAuthUser.photoURL || payload.avatarUrl,
        },
        { merge: true }
      );
      createdIds.push(currentAuthUser.uid);
    }

    return {
      success: true,
      message: `Administrador pastoral registrado com sucesso no Firestore! Documentos sincronizados: ${createdIds.join(', ')}`,
      docIds: createdIds,
    };
  } catch (error: any) {
    console.error('Erro ao provisionar administrador no Firestore:', error);
    return {
      success: false,
      message: `Falha ao gravar no Firestore: ${error?.message || 'Permissão negada ou erro de rede.'}`,
      docIds: [],
    };
  }
}
