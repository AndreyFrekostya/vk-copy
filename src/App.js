import React, { useState, useEffect } from "react";
import SignInPage from './pages/SignInPage'
import Signup from './components/signup/Signup'
import {Routers} from './constants/routs'
import {Routes, Route} from 'react-router-dom'
import MainPage from './components/main/Main'
import { Navigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { getAuth } from "firebase/auth";
function App() {
  const auth=getAuth()
  const [user]=useAuthState(auth)
  const [redirect, setRedirect]=useState(false)
  useEffect(() => {
    if(user){
      setRedirect(true)
    }else{
      setRedirect(false)
    }
  }, [])
  
  return (
    <>
      <Routes>
        <Route path={Routers.signin} element={<SignInPage/>}/>
        <Route path={Routers.signup} element={<Signup/>}/>
        <Route path={Routers.main} element={<MainPage/>}/>
      </Routes>
      
    </>
  );
}

export default App;
