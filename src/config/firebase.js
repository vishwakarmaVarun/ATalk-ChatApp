// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  getAuth,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, getFirestore, setDoc } from "firebase/firestore";
import { toast } from "react-toastify";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "chat-app-9eaf9.firebaseapp.com",
  projectId: "chat-app-9eaf9",
  storageBucket: "chat-app-9eaf9.appspot.com",
  messagingSenderId: "799861948361",
  appId: "1:799861948361:web:7d504e3f4aaac7cf23b218",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// for register to the application
export const signup = async (username, email, password) => {
  try {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const user = res.user;
    await setDoc(doc(db, "Users", user.uid), {
      id: user.uid,
      username: username.toLowerCase(),
      email,
      name: "",
      avatar: "",
      bio: "Hey there, I'm using Chat App",
      lastSeen: Date.now(),
    });

    await setDoc(doc(db, "Chats", user.uid), {
      chatData: [],
    });
  } catch (error) {
    console.error(error.message);
    toast.error(error.code.split("/")[1].split("-").join(" "));
  }
};

// for login to the application
export const login = async (email, password) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error(error.message);
    toast.error(error.code.split("/")[1].split("-").join(" "));
  }
};

// for logout from the application
export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error(error.message);
    toast.error(error.code.split("/")[1].split("-").join(" "));
  }
};

// this code is to setup the forgot password functionality
export const forgotPassword = async (email) => {
  if (!email) {
    toast.info("Please enter the email to send for the reset password");
    return;
  }
  try {
    await sendPasswordResetEmail(auth, email);
    toast.success("Reset password for email has sent! Check you email.");
  } catch (error) {
    toast.error(error.message);
  }
};
