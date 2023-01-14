import React, {useState, useContext, useEffect, createContext} from 'react'
import { AtmSharp, Search } from '@mui/icons-material'
import { Box, Typography, TextField, OutlinedInput, Input} from '@mui/material'
import styles from './main.module.css'
import { AuthContext } from '../..'
import logo from './vk_icon.png'
import Header from './../header/Header'
import Navbar from './../navbar/Navbar'
import OutletBox from './../outlet/OutletBox'
import Chat from './../chat/Chat'
import Messages from '../messageOut/Messages'
import SomePage from '../smoPage/SomePage'
import MyPage from '../mypage/MyPage'
import Friends from '../friends/Friends'
const Main = () => {
  const [chooseOut, setChooseOut]=useState('')
  const auth=useContext(AuthContext)
  const [routePage, setRoutePage]=useState('')
  const [choosedUser, setChooseUser]=useState({})
  const [choosedUsersInMess, setChoosedUsersInMess]=useState([])
  const [isActiveTabl, setIsActiveTabl]=useState(false)
  const funcChooseUsContext = createContext(null)
  const linkToSb=(user)=>{
    if(user.userID===auth.currentUser.uid){
      setChooseOut('mypage')
    }else{
      setChooseOut('sbpage')
      setChooseUser(user)
    }
  }
  const createChat=(user)=>{
    if(user){
      setChooseOut('privateChat')
      setChooseUser(user)
    }
  }
  // useEffect(() => {
  //   if(chooseOut){
  //     localStorage.setItem('choose', chooseOut);
  //   }
  // }, [chooseOut])
  // useEffect(() => {
  //   if(auth.currentUser){
  //     setChooseOut(localStorage.getItem('choose'))
  //     if(chooseOut==='sbpage'){
  //       setChooseUser(localStorage.getItem('choosedUser'))
  //     }
  //   }
  // }, [auth.currentUser])
  
  return (
    <div>
      <Header linkToSb={linkToSb} isActiveTabl={isActiveTabl} setIsActiveTabl={setIsActiveTabl} />
      <div className={styles.allwrap} onClick={()=>setIsActiveTabl(false)}>
        <div  className={styles.wrap}>
          <Navbar setChooseOut={setChooseOut}/>
          <div className={styles.outlet}>
            {chooseOut==='mypage' ? (<MyPage/>) :(null)}
            {chooseOut==='sbpage' ? (<SomePage user={choosedUser} createChat={createChat}/>) :(null)}
            {chooseOut==='messages' ? (<funcChooseUsContext.Provider value={createChat}><Messages setChoosedUsersInMess={setChoosedUsersInMess} choosedUsersInMess={choosedUsersInMess} createChat={createChat}/></funcChooseUsContext.Provider>) :(null)}
            {chooseOut==='privateChat' ? (<Chat user={choosedUser} linkToSb={linkToSb} setChooseOut={setChooseOut}/>) :(null)}
            {chooseOut==='friends' ? (<Friends createChat={createChat} linkToSb={linkToSb}/>) :(null)}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Main