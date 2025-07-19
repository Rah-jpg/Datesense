// Initialize Firebase only once
if (typeof firebase === 'undefined') {
  console.error('Firebase SDK not loaded');
} else if (!firebase.apps.length) {
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCkC8LkT-O43VhMefLS5ccFDFcCoAg2O2Y",
  authDomain: "datesense-ea1af.firebaseapp.com",
  projectId: "datesense-ea1af",
  storageBucket: "datesense-ea1af.firebasestorage.app",
  messagingSenderId: "626408741492",
  appId: "1:626408741492:web:4d9f51bfcef42068d60f21",
  measurementId: "G-YWC6V748S7"
};
  firebase.initializeApp(firebaseConfig);
}

// Export services
const auth = firebase.auth();
const db = firebase.firestore();

// Make available globally if needed
window.auth = auth;
window.db = db;