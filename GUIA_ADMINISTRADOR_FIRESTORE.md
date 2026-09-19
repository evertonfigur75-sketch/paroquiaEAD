# Guia de Configuração: Primeiro Administrador (Pastor Everton Figur) no Firebase Firestore

Este documento descreve como o sistema de permissões foi implementado e como provisionar ou auditar o primeiro administrador pastoral no **Google Firebase Firestore** e **Firebase Authentication**.

---

## 1. Regra de Ouro da Autorização Pastoral

O acesso ao **`AdminDashboard`** é restrito ao e-mail oficial do Pastor:
* **E-mail Oficial:** `evertonfigur75@gmail.com`
* **Identificador de Papel (Role):** `admin`

### Onde a verificação ocorre:
1. **No `AuthContext`:**
   - A propriedade `isAdmin` é computada exclusivamente através de:
     ```typescript
     const isPastorAuthorized = isAuthorizedAdminEmail(currentUser?.email);
     const isAdmin = Boolean(currentUser && currentUser.role === 'admin' && isPastorAuthorized);
     ```
   - Nenhuma conta com outro e-mail consegue ativar o `isAdmin`, mesmo que force atributos no armazenamento local.

2. **Na função `login(email, pass)`:**
   - Se o usuário tentar efetuar login como `admin`, o sistema valida estritamente `validateAdminAccess(user.email)`.
   - Se o e-mail não corresponder ao do Pastor, o acesso é negado imediatamente e um log de auditoria é registrado.

3. **No `googleSignIn()`:**
   - Se o e-mail autenticado pelo Google for `evertonfigur75@gmail.com`, o sistema sincroniza a conta com o Firestore e concede o papel de administrador.
   - Se o e-mail for diferente, o sistema impede a elevação de privilégios e só permite entrada se for um aluno já matriculado.

4. **Nas regras de segurança do Firestore (`firestore.rules`):**
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // O Pastor possui permissão irrestrita de leitura e escrita
       match /{document=**} {
         allow read, write: if request.auth != null && (
           get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin' ||
           request.auth.token.email == 'evertonfigur75@gmail.com'
         );
       }
     }
   }
   ```

---

## 2. Como Configurar o Administrador no Console do Firebase

Caso deseje criar ou auditar manualmente o registro no Firestore:

### Passo 1: Domínios Autorizados no Authentication
1. Abra o [Console do Firebase](https://console.firebase.google.com/).
2. Vá em **Authentication** > aba **Settings** > seção **Authorized domains**.
3. Clique em **Add domain** e adicione:
   ```text
   catecismoead.kinghost.net
   ```
   *(Isso permite autenticar usando o botão "Conectar com Google" direto no domínio da KingHost).*

### Passo 2: Criar o Documento no Firestore Database
1. No menu lateral, acesse **Firestore Database**.
2. Clique em **Start collection** (ou Iniciar coleção).
3. **Collection ID:** `users`
4. **Document ID:** `admin-pastor-everton` (ou o UID do usuário no Firebase Auth).
5. Adicione os campos:

| Campo | Tipo | Valor |
| :--- | :--- | :--- |
| `id` | `string` | `admin-pastor-everton` |
| `name` | `string` | `Pastor Everton Figur` |
| `email` | `string` | `evertonfigur75@gmail.com` |
| `role` | `string` | `admin` |
| `city` | `string` | `Planalto` |
| `state` | `string` | `PR` |
| `district` | `string` | `Distrito Parque do Iguaçu` |
| `phone` | `string` | `(46) 99971-0792` |
| `status` | `string` | `active` |
| `createdAt` | `timestamp` | *(Data e hora atual)* |

### Estrutura em JSON:
```json
{
  "id": "admin-pastor-everton",
  "name": "Pastor Everton Figur",
  "email": "evertonfigur75@gmail.com",
  "role": "admin",
  "avatarUrl": "https://drive.google.com/file/d/1qpNzrvjmC8qaI5VpYcm3nKoRi7uDzRpy/view?usp=sharing",
  "city": "Planalto",
  "state": "PR",
  "district": "Distrito Parque do Iguaçu",
  "phone": "(46) 99971-0792",
  "status": "active",
  "courseType": "confirmatorio",
  "parishName": "Paróquia Evangélica Luterana São Paulo",
  "churchBody": "Igreja Evangélica Luterana do Brasil"
}
```

---

## 3. Provisionamento em 1 Clique pelo Aplicativo

A plataforma possui um assistente visual embutido:
1. No portal, abra o modal de **Acesso Pastoral / Coordenação**.
2. Clique no link **"Configurar Administrador no Firestore"**.
3. O painel consultará a coleção `users` em tempo real e permitirá clicar no botão **"Gravar / Sincronizar Admin Agora"**.
4. O documento será imediatamente persistido no Cloud Firestore.
