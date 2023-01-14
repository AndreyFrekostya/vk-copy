import React, { createContext } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/style.css'
import {BrowserRouter, Route} from 'react-router-dom'
import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
  apiKey: "AIzaSyB9Jw5b4Lj0b-cHuoQGeQ4T60hAESjDR-w",
  authDomain: "vkvv-b76a9.firebaseapp.com",
  projectId: "vkvv-b76a9",
  storageBucket: "vkvv-b76a9.appspot.com",
  messagingSenderId: "83066475024",
  appId: "1:83066475024:web:c55a2b53e783742f68f095",
  storageBucket: 'gs://vkvv-b76a9.appspot.com'
};
const app = initializeApp(firebaseConfig);
const auth=getAuth()
export const AuthContext=createContext(null)
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <AuthContext.Provider value={auth}>
      <App />
    </AuthContext.Provider>
  </BrowserRouter>
  
);


