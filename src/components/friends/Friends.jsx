import { Typography } from '@mui/material'
import { Search } from '@mui/icons-material'
import React, { useState, useEffect, useContext } from 'react'
import { AuthContext } from '../..'
import styles from './friends.module.css'
import { updateDoc, getFirestore, collection, addDoc, getDocs, deleteDoc, doc, onSnapshot, DocumentReference, serverTimestamp, getDoc, setDoc } from "firebase/firestore";
const Friends = (props) => {
  const db=getFirestore()
  const auth=useContext(AuthContext)
  const [optins, setOption]=useState('all')
  const [friends, setFriends]=useState([])
  const [filteredFriends, setFilteredFriends]=useState([])
  const [apll, setApll]=useState([])
  const [value, setValue]=useState('')
  const [apllToSm, setApllToSm]=useState([])
  const [ifIn, setIfIn]=useState(true)
  const deleteAplltosm=async(apl)=>{
    let newApllToSm=apllToSm.filter(aply=>aply.toWhom.userID!==apl.toWhom.userID)
    setApllToSm(newApllToSm)
    const querySnapshot = await getDocs(collection(db, "applicationFriends"));
      querySnapshot.forEach(async(documment) => {
        if(documment.data().toWhom.userID===apl.toWhom.userID && documment.data().fromWhom.userID===auth.currentUser.uid){
          await deleteDoc(doc(db, "applicationFriends", documment.id));
          }
      })
  }
  const createFriends=async(apl)=>{
    let newApll=apllToSm.filter(aply=>aply.fromWhom.userID!==apl.fromWhom.userID)
    setApll(newApll)
    const querySnapshot = await getDocs(collection(db, "applicationFriends"));
      querySnapshot.forEach(async(documment) => {
        if(documment.data().toWhom.userID===auth.currentUser.uid  && documment.data().fromWhom.userID===apl.fromWhom.userID ){
          await deleteDoc(doc(db, "applicationFriends", documment.id));
          }
      })
      let user=[]
      const querySnapshotUs = await getDocs(collection(db, "users"));
      querySnapshotUs.forEach(async(documment) => {
        if(documment.data().userID===apl.fromWhom.userID || documment.data().userID===apl.toWhom.userID){
          user.push(documment.data())
        }
      })
    const docRef=await addDoc(collection(db, "friends"),{
      firstPerson:user[0],
      secondPerson:user[1]
    });
  }
  useEffect(() => {
    const getLoad=async()=>{
      let friendsarr=[]
      const querySnapshotFriends = await getDocs(collection(db, "friends"));
      querySnapshotFriends.forEach(async(documment) => {
        if(documment.data().firstPerson.userID===auth.currentUser.uid || documment.data().secondPerson.userID===auth.currentUser.uid){
          friendsarr.push(documment.data())
        }
      })
      setFriends(friendsarr)
      setFilteredFriends(friendsarr)
      const querySnapshot = await getDocs(collection(db, "applicationFriends"));
      let arrAddedUsers=[]
      querySnapshot.forEach((doc) => {
        if(doc.data().toWhom.userID===auth.currentUser.uid){
          arrAddedUsers.push(doc.data())
        }
      })
      setApll(arrAddedUsers)
      const querySnapshotTwo = await getDocs(collection(db, "applicationFriends"));
      let arrInvitedUsers=[]
      querySnapshotTwo.forEach((doc) => {
        if(doc.data().fromWhom.userID===auth.currentUser.uid){
          arrInvitedUsers.push(doc.data())
        }
      })
      setApllToSm(arrInvitedUsers)
    }
    getLoad()
  }, [])
  useEffect(() => {
    let howLetters=value.length
    let allConvenientUsers=[]
      friends.map(user=>{
        let neededUser
        if(user.firstPerson.userID!==auth.currentUser.uid){
          neededUser=user.firstPerson.name
          let sliceName=neededUser.toLowerCase().substr(0,howLetters)
          let sliceInpVal=value.toLowerCase().substr(0, howLetters)
          if(sliceName==sliceInpVal){
            allConvenientUsers.push(user)
          }
        }
        if(user.secondPerson.userID!==auth.currentUser.uid){
          neededUser=user.secondPerson.name
          let sliceName=neededUser.toLowerCase().substr(0,howLetters)
          let sliceInpVal=neededUser.toLowerCase().substr(0, howLetters)
          if(sliceName==sliceInpVal){
            allConvenientUsers.push(user)
          }
        }
      })
    setFilteredFriends(allConvenientUsers)
  }, [value])
  return (
    <div className={styles.wrap}>
      <div className={styles.main}>
      {optins=='all' ?(
        <>
          <div className={styles.firstRow}>
            <Typography color='#fff' variant='h6' >Все друзья {friends.length==0 ? '' : friends.length}</Typography>
          </div>
          <div className={styles.input}>
            <input value={value} onChange={(e)=>setValue(e.target.value)} type="text" placeholder='Поиск друзей' />
            <div className={styles.search}>
              <Search/>
            </div>
          </div>
        </>
      ) : (
        <div className={styles.forAppl}>
          <div onClick={()=>setIfIn(true)} className={styles.firstRow} style={{backgroundColor: ifIn ? '#333' : 'transparent'}}>
            <Typography color='#fff' variant='h6' >Входящие <b>{apll.length==0 ? '' : apll.length}</b></Typography>
          </div>
          <div onClick={()=>setIfIn(false)} className={styles.firstRow} style={{backgroundColor: ifIn ? 'transparent' : '#333'}}>
            <Typography  color='#fff' variant='h6' >Исходящие <b>{apllToSm.length==0 ? '' : apllToSm.length}</b></Typography>
            </div>
        </div>
      )}
        <div className={styles.friends}>
          {optins=='all' ? filteredFriends?.map(friend=>(
              <div key={friend.secondPerson.userID+friend.firstPerson.userID} className={styles.user}>
                <div className={styles.userInf}>
                  <div>
                    <img style={{cursor: 'pointer'}} onClick={()=>props.linkToSb(friend.secondPerson.userID===auth.currentUser.uid ? friend.firstPerson : friend.secondPerson )} src={friend.secondPerson.userID===auth.currentUser.uid ? friend.firstPerson.photo : friend.secondPerson.photo} alt="" />
                  </div>
                  <div style={{display:'flex', flexDirection : 'column', gap: '15px', marginTop: '5px'}}>
                    <Typography color='#fff' variant='subtitle!'>{friend.secondPerson.userID===auth.currentUser.uid ? friend.firstPerson.name : friend.secondPerson.name }</Typography>
                    <Typography  variant='subtitle!' style={{cursor: 'pointer'}} color="#71aaec" onClick={()=>props.createChat(friend.secondPerson.userID===auth.currentUser.uid ? friend.firstPerson : friend.secondPerson )}>Написать сообщение</Typography>
                  </div>
                </div>
              </div>
          )) 
           :ifIn ? apll.length>0 ? apll.map(apl=>(
            <div key={apl.userID} className={styles.user}>
              <div className={styles.userInf}>
                <div>
                  <img  src={apl.fromWhom.photo} alt="" />
                </div>
                <div style={{display:'flex', flexDirection : 'column', gap: '15px', marginTop: '5px'}}>
                  <Typography color='#fff' variant='subtitle!'>{apl.fromWhom.name}</Typography>
                  <Typography  variant='subtitle!' style={{cursor: 'pointer'}} color="#71aaec">Открыть профиль</Typography>
                  <div className={styles.delete}>
                    <button onClick={()=>createFriends(apl)}>Принять заявку</button>
                  </div>
                </div>
              </div>
            </div>
           )) : (<Typography textAlign='center' color='#fff' variant='h5' mt={2}>Нет заявок!</Typography>) :
           apllToSm.length>0 ? apllToSm.map(apl=>(
            <div key={apl.userID} className={styles.user}>
              <div className={styles.userInf}>
                <div>
                  <img  src={apl.toWhom.photo} alt="" />
                </div>
                <div style={{display:'flex', flexDirection : 'column', gap: '15px', marginTop: '5px'}}>
                  <Typography color='#fff' variant='subtitle!'>{apl.toWhom.name}</Typography>
                  <Typography  variant='subtitle!' style={{cursor: 'pointer'}} color="#71aaec">Открыть профиль</Typography>
                  <div className={styles.delete}>
                    <button onClick={()=>deleteAplltosm(apl)}>Удалить заявку</button>
                  </div>
                </div>
              </div>
            </div>
           )) : (
            <Typography textAlign='center' color='#fff' variant='h5' mt={2}>Вы никого не добавляли!</Typography>
           )
           }
        </div>
      </div>
      <div className={styles.options}>
        <div className={styles.option} onClick={()=>setOption('all')} style={{backgroundColor: optins=='all' ? '#333' : 'transparent'}}>
          <Typography  color="#fff" variant='subtitle1'>Мои друзья</Typography>
        </div>
        <div className={styles.option}onClick={()=>setOption('aplication')} style={{backgroundColor: optins=='aplication' ? '#333' : 'transparent'}} >
          <Typography color="#fff" variant='subtitle1'>Заявки в друзья</Typography>
        </div>
        <div className={styles.option}>
          <Typography  style={{backgroundColor:'transparent'}} color="#fff" variant='subtitle1'>Поиск друзей</Typography>
        </div>
      </div>
    </div>
  )
}

export default Friends