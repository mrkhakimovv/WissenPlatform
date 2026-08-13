# Wissen CRM

Wissen CRM is a comprehensive Customer Relationship Management system designed for educational centers. It features a dual-interface layout for Admins and Students, real-time data sync using Firebase, and a clean, glassmorphic UI built with React and Tailwind CSS.

## 🚀 Texnologiyalar

- **Frontend:** React 19, TypeScript, Vite, React Router, Tailwind CSS, motion/react (framer-motion), lucide-react.
- **Backend (BaaS):** Firebase (Firestore, Authentication).
- **Styling:** Custom glassmorphism, responsive design, dark mode aesthetics.

## 📦 O'rnatish (Local Development)

### 1. Repozitoriyni klonlash yoki yuklab olish

```bash
git clone <repo-url>
cd wissen-crm
```

### 2. .env sozlash
Loyiha root papkasida `.env` faylini yarating va quyidagi o'zgaruvchilarni Firebase ma'lumotlaringiz bilan to'ldiring (namuna `.env.example` da bor):

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 3. Paketlarni o'rnatish
```bash
npm install
```

### 4. Dasturni ishga tushirish
```bash
npm run dev
```

Server odatda `http://localhost:3000` da ishga tushadi.

## 🌐 Render.com orqali Deploy Qilish

Bu loyiha Render platformasida Static Site sifatida deploy qilish uchun tayyor.

1. **Render'da yangi Web Service yoki Static Site oching**
2. **Repository**ni ulang.
3. **Build Command:** `npm install && npm run build`
4. **Publish Directory:** `dist`
5. **Environment Variables:** `.env` faylidagi barcha `VITE_FIREBASE_*` o'zgaruvchilarni kiritib chiqing.
6. **Routing/Redirects:** Agar siz "Static Site" tanlagan bo'lsangiz va qo'lda sozlashni talab qilsa, "Rewrite rules" da `/*` ni `/index.html` ga yo'naltiring. Render.yaml buni avtomatlashtiradi.

## 🔒 Firestore Security Rules

Ma'lumotlar xavfsizligini ta'minlash uchun quyidagi xavfsizlik qoidalarini (Security Rules) Firebase Console > Firestore Database > Rules bo'limiga kiritishingiz kerak. Yoki CLI orqali deploy qiling.

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function getUserRole() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role;
    }
    
    function isAdmin() {
      return isAuthenticated() && getUserRole() == 'admin';
    }
    
    function isTeacher() {
      return isAuthenticated() && getUserRole() == 'teacher';
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    match /users/{userId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin() || isTeacher() || isOwner(userId);
    }

    match /groups/{groupId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin() || isTeacher();
    }

    match /schedules/{scheduleId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin() || isTeacher();
    }

    match /payments/{paymentId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }

    match /attendance/{attendanceId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin() || isTeacher();
    }

    match /news/{newsId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    
    match /subjects/{subjectId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    
    match /exams/{examId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin() || isTeacher();
    }
  }
}
```

Ushbu qoidalar ma'lumotlar bazasini adminlar, o'qituvchilar va o'quvchilar uchun xavfsiz ajratishni ta'minlaydi.
