// firebase.ts
import { initializeApp } from 'firebase/app'; // Initialize Firebase
import { getFirestore } from 'firebase/firestore'; // Import Firestore
import { getAuth } from 'firebase/auth'; // Import Firebase Authentication (optional)

// Your Firebase configuration object
const firebaseConfig = {
  apiKey: "AIzaSyA4Al9AG8sFXqK7KhRQr0QyGa6wJ2H8eOU",
  authDomain: "family-gift-lists.firebaseapp.com",
  projectId: "family-gift-lists",
  storageBucket: "family-gift-lists.firebasestorage.app",
  messagingSenderId: "173397207271",
  appId: "1:173397207271:web:0a7e2b94fc670fd19e1a42",
  measurementId: "G-2DWZWTFB2L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig); // Initialize Firebase app

// Initialize services
const db = getFirestore(app); // Firestore instance
const auth = getAuth(app); // Auth instance (if using authentication)

export { app, db, auth }; // Export Firebase app, db, and auth for use in other files
