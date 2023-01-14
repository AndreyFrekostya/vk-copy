import { Search } from '@mui/icons-material'
import { Navigate } from 'react-router-dom';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { Box, Typography, Avatar, Collapse,List, ListItemButton, ListItemIcon, ListItemText,  } from '@mui/material'
import React, {useState, useContext, useEffect} from 'react'
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import styles from './header.module.css'
import {Routers} from './../../constants/routs'
import {Link} from 'react-router-dom'
import logo from './vk_icon.png'
import {AuthContext} from './../../index'
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, onSnapshot, DocumentReference, serverTimestamp, getDoc } from "firebase/firestore";
import { useAuthState } from 'react-firebase-hooks/auth';
import { style } from '@mui/system';
const Header = (props) => {
  const auth=useContext(AuthContext)
  const [user]=useAuthState(auth)
  const db=getFirestore()
  const [value, setValue]=useState('')
  const [users, setUsers]=useState([])
  const [filteredUsers, setFilteredUsers]=useState([])
  const [redirect, setRedirect]=useState(false)
  const [open, setOpen]=useState(false)
  const logout=(e)=>{
    e.preventDefault()
    auth.signOut()
    setOpen(false)
    setRedirect(true)
  }
  const linkToSb=(e,user)=>{
    props.linkToSb(user)
  }
  useEffect(() => {
    const fetchUsers=async()=>{
      let arr=[]
      const querySnapshot = await getDocs(collection(db, "users"));
      querySnapshot.forEach((doc) => {
        
          arr.push(doc.data())
        
      })
      setUsers(arr)
      setFilteredUsers(arr)
    }
    fetchUsers()
  }, [])
  useEffect(() => {
    let howLetters=value.length
    let allConvenientUsers=[]
    users.map(user=>{
      let sliceName=user.name.toLowerCase().substr(0,howLetters)
      let sliceInpVal=value.toLowerCase().substr(0, howLetters)
      if(sliceName==sliceInpVal){
        allConvenientUsers.push(user)
      }
    })
    setFilteredUsers(allConvenientUsers)
  }, [value])
  
  return (
    <div className={styles.wrap}>
          <img width={40} height={40} src={logo} />
          <Typography className={styles.name} variant={'h6'} style={{paddingLeft: 5}}>ВКОНТАКТЕ</Typography>
          <div className={styles.inputBox}>
            <input type='text' value={value} className={styles.searchInp}  onFocus={()=>props.setIsActiveTabl(true)} placeholder='Поиск' onChange={(e)=>setValue(e.target.value)}/>
            <Search className={styles.search}/>
          </div>
          <div className={props.isActiveTabl ? styles.tabOfPeopleActive : styles.tabOfPeopleClose}>
            {filteredUsers.map((user, index)=>(
                <div key={user.userID} className={styles.human} onClick={e=>linkToSb(e,user)}>
                  <img width={40} height={40} src={user.photo} alt="" />
                  <Typography variant='subtitle1'>{user.name}</Typography>
                </div>
              ))}
            {filteredUsers.length===0 ? (<Typography variant='h5'>Ничего не найдено!</Typography>) : (null)}  
          </div>
          {user ?
        (
          <div className={styles.photoProfile} onClick={()=>setOpen(!open)}>
            <Avatar alt="Your av" src={auth.currentUser.photoURL} />
            {open ?<ExpandLess /> : <ExpandMore/>}
          </div>
        )
        :
        (null)}
        {open ? 
            (
              <div className={styles.collapse} onClick={logout}>
                <ExitToAppIcon/>
               <ListItemText primary='Выйти'/>
              </div>
            )  
            : 
            (null)
          }
          {redirect && <Navigate replace to={Routers.signin} />}
    </div>
  )
}
export default Header