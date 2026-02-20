// 1. Importamos initializeApp y getFirestore (SDK de base de datos)
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Tu configuración de Firebase (Mantenemos tus datos actuales)
const firebaseConfig = {
  apiKey: "AIzaSyBhrGbbOhZDziir3Wdd9zXHUaMo3fOAxo0",
  authDomain: "musiccityexplorer-88992.firebaseapp.com",
  projectId: "musiccityexplorer-88992",
  storageBucket: "musiccityexplorer-88992.firebasestorage.app",
  messagingSenderId: "765462788345",
  appId: "1:765462788345:web:4b9e6dc919250d4600ca28",
  measurementId: "G-NE6XJ1Q8DC"
};

// 2. Inicializamos la App de Firebase
const app = initializeApp(firebaseConfig);

// 3. EXPORTAMOS 'db' para que App.js pueda usar Firestore
// Esto soluciona el error "export 'db' not found"
export const db = getFirestore(app);