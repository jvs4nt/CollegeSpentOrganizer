// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA5enMdZJSD1YFLaF8PGX26y38s82T_mcA",
  authDomain: "collegespentorganizer.firebaseapp.com",
  projectId: "collegespentorganizer",
  storageBucket: "collegespentorganizer.firebasestorage.app",
  messagingSenderId: "1093100445329",
  appId: "1:1093100445329:web:d514306ad55cefee822930",
  measurementId: "G-LNN567396F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);