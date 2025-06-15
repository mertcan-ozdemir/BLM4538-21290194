// Firebase konfigürasyonu
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase yapılandırma bilgileri
const firebaseConfig = {
  apiKey: "AIzaSyDTYkgiC24LhmXeE8-aSwoMV6Db1Ivnfzc",
  authDomain: "movieapp-projem.firebaseapp.com",
  projectId: "movieapp-projem",
  storageBucket: "movieapp-projem.appspot.com",
  messagingSenderId: "340868431729",
  appId: "1:340868431729:web:e22d8c1b3b373ec3b19caa"
};

// Firebase uygulamasını başlat
const app = initializeApp(firebaseConfig);

// Firebase servisleri
export const auth = getAuth(app);
export const firestore = getFirestore(app);

export default app; 