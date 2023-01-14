import { Card, Typography } from '@mui/material'
import React, { useContext, useEffect, useState } from 'react'
import styles from './message.module.css'
import { updateDoc, getFirestore, collection, addDoc, getDocs, deleteDoc, doc, onSnapshot, DocumentReference, serverTimestamp, getDoc, setDoc } from "firebase/firestore";
import { useAuthState } from 'react-firebase-hooks/auth'
import {AuthContext} from './../../../index'
const Message = (props) => {
  const auth=useContext(AuthContext)
  const [userChat, setUserChat]=useState({})
  const [lastMess, setLastMess]=useState({})
  //const funcSetUser=useContext(funcChooseUsContext)
  const db=getFirestore()
  const [user]=useAuthState(auth)
  const createChatAndChoosedUser=()=>{
    props.createChat(userChat)
    props.setChoosedUsers(prev=>[...prev,userChat])
  }
  useEffect(() => {
    const downloadUsers=async()=>{
      if(props.id){
        const querySnapshotUsers = await getDocs(collection(db, "users"));
        querySnapshotUsers.forEach((doc) => {
          if(doc.data().userID===props.id){
            setUserChat(doc.data())
            if(props.users.length==0){
              props.setUsers(prev=>[...prev, doc.data()])
            }
          }
        });
      }
    }
    downloadUsers()
  }, [props.id])
  useEffect(() => {
    const getLastMess=async()=>{
      if(userChat){
        const querySnapshotMess = await getDocs(collection(db, "messages"));
        let arr=[]
        querySnapshotMess.forEach((doc) => {
            if(doc.data().fromWhom.id===auth.currentUser.uid || doc.data().toWhom.id===auth.currentUser.uid){
              if(doc.data().fromWhom.id===userChat.userID|| doc.data().toWhom.id===userChat.userID){
                arr.push(doc.data())
              }
            }
        });
        //arr.filter(mess=>mess.fromWhom.id===userChat.userID|| mess.toWhom.id===userChat.userID)
        arr.sort((prev, next) => next.ind - prev.ind) 
        setLastMess(arr[0])
      }
    }
    getLastMess()
  }, [userChat])
  
  return (
    <div className={styles.wrap} onClick={createChatAndChoosedUser}>
        <img src={userChat.photo} className={styles.avatarPerson}></img>
        <div className={styles.nameAndMess}>
          <div className={styles.nameAndtime}>
            <Typography variant='h6'>{userChat.name}</Typography>
            <Typography variant='subtitle1' color='#888'>{lastMess?.time}</Typography>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginTop: '7px'}}>
            {lastMess?.fromWhom?.id==auth.currentUser.uid && <img width={30} height={30} style={{borderRadius: '50%'}} src={auth.currentUser.photoURL} alt='your photo'/>}
            {lastMess?.messageVal?.length!=0 ?(
              <Typography variant='subtitle1'>{lastMess?.messageVal}</Typography>
            ) : lastMess?.img?.length>1 ?(
              <Typography variant='subtitle1' color="#71aaec">Фотографии</Typography>
            ) :(
              <Typography variant='subtitle1' color="#71aaec">Фотография</Typography>
            )}
          </div>
        </div>
    </div>
  )
}

export default Message