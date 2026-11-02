// วางค่าจาก Firebase Console > Project settings > Your apps > Web app (</>)
// ค่าเหล่านี้ไม่ใช่ความลับ ความปลอดภัยอยู่ที่ firestore.rules
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "000000000000",
  appId: "YOUR_APP_ID"
};
