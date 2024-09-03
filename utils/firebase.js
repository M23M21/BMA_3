import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getStorage } from 'firebase/storage'; 

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCTf9mIO0t1eqDbIlu6feTHrd4EUjMxJUk",
  authDomain: "bookmyappointmentm.firebaseapp.com",
  projectId: "bookmyappointmentm",
  storageBucket: "bookmyappointmentm.appspot.com",
  messagingSenderId: "284518517306",
  appId: "1:284518517306:web:e516a7f1ed42158c884303"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);  // Initialize Firebase Storage

export { auth, db, storage, createUserWithEmailAndPassword };