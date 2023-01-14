import { Box } from '@mui/system'
import { Search } from '@mui/icons-material'
import CloseIcon from '@mui/icons-material/Close';
import React,{useEffect,useContext, useLayoutEffect} from 'react'
import { AuthContext } from '../..'
import styles from './messages.module.css'
import { updateDoc, getFirestore, collection, addDoc, getDocs, deleteDoc, doc, onSnapshot, DocumentReference, serverTimestamp, getDoc, setDoc } from "firebase/firestore";
import Message from './../../components/ui/message/Message'
import { useState } from 'react'
import { Typography } from '@mui/material'
const Messages = (props) => {
  const auth=useContext(AuthContext)
  const [userChats, setUserChats]=useState([])
  const [users, setUsers]=useState([])
  const [filteredUser, setFilteredUsers]=useState([])
  const [choosedUsers, setChoosedUsers]=useState([])
  const [allLastMess, setAllLastMess]=useState([])
  const [valueRead, setValueRead]=useState('all')
  const [value, setValue]=useState('')
  const db=getFirestore()
  const getAllLastMess=(mess)=>{
    setAllLastMess([...allLastMess, mess])
  }
  const funcAddNowOpen=async(id)=>{
    let userCl=users.filter(user=>user.userID===id)
    let userIndent=props.choosedUsersInMess.filter(user=>user.userID===userCl[0].userID)
    if(props.choosedUsersInMess.length>0){
      if(userCl[0].userID==userIndent[0]?.userID){
      }else{
        props.setChoosedUsersInMess(prev=>[userCl[0], ...prev])
      }
    }else{
      props.setChoosedUsersInMess(prev=>[userCl[0], ...prev])
    }
  }
  const deleteChoosedUser=(id)=>{
    let newArr=props.choosedUsersInMess.filter(user=>user.userID!=id)
    props.setChoosedUsersInMess(newArr)
  }
  useEffect(() => {
    const getLoad=async()=>{
        let arr=[]
        const querySnapshot = await getDocs(collection(db, "messages"));
        querySnapshot.forEach((doc) => {
          if(doc.data().fromWhom.id===auth.currentUser.uid || doc.data().toWhom.id===auth.currentUser.uid){
            arr.push(doc.data())
          }
        })
        let arrm=[]
        arr.map(mess=>{
          if(mess.fromWhom.id!==auth.currentUser.uid){
            setUserChats([...userChats, mess.fromWhom.id])
            arrm.push(mess.fromWhom.id)
          }
          if(mess.toWhom.id!==auth.currentUser.uid){
            setUserChats([...userChats, mess.toWhom.id])
            arrm.push(mess.toWhom.id)
          }
        })
        let setMess=new Set(arrm);
        setUserChats(Array.from(setMess))
        const querySnapshotAddedUser = await getDocs(collection(db, "addedUserChat"));
        let arrAddedUsers=[]
        querySnapshotAddedUser.forEach((doc) => {
          if(doc.data().fromWhom===auth.currentUser.uid){
            arrAddedUsers.push(doc.data())
          }
        })
        setChoosedUsers(arrAddedUsers)
    }
    getLoad()
}, [])
  useEffect(() => {
    let howLetters=value.length
    let allConvenientUsers=[]
    if(howLetters>0){
      users.map(user=>{
        let sliceName=user.name.toLowerCase().substr(0,howLetters)
        let sliceInpVal=value.toLowerCase().substr(0, howLetters)
        if(sliceName==sliceInpVal){
          allConvenientUsers.push(user)
        }
      })
    }
    setFilteredUsers(allConvenientUsers)
  }, [value])
  return (
    <div className={styles.wrap}>
      <div className={styles.allMess}>
        <div className={styles.inputWrap}>
          <Search/>
          <input placeholder='Поиск' value={value} onChange={e=>setValue(e.target.value)} className={styles.input}></input>
        </div>
        <Box>
          {filteredUser.length>0 ? filteredUser.map(user=>(
            <div key={user.userID} className={styles.filterUser} onClick={()=> props.createChat(user)}>
            <img src={user.photo} alt="" />
            <Typography variant='h6' color='#fff'>{user.name}</Typography>
          </div>
          )) : filteredUser.length==0 && value.length!==0 ? 
          (<Typography color='#fff' mt={1} variant='h6' textAlign='center'>По запросу ничего не найдено!</Typography>)
          : userChats.length>0  ? userChats.map(id=>(
            <div onClick={()=>funcAddNowOpen(id)}  key={id}>
                <Message setChoosedUsers={setChoosedUsers} createChat={props.createChat} users={users} setUsers={setUsers} id={id}/>
            </div>            
          )) : (<Typography color='#fff' mt={1} variant='h6' textAlign='center'>Сообщений нет!</Typography>)}
        </Box>
      </div>
      <div className={styles.whichOpen}>
        <div className={styles.optionsOpen}>
          <div className={styles.optionOpen} style={{backgroundColor: valueRead==='all' ? '#333' : 'transparent' }} onClick={()=>setValueRead('all')}>
            <Typography variant='subtitle1' color='#fff'>Все чаты</Typography>
          </div>
          <div className={styles.optionOpen} style={{backgroundColor: valueRead==='unreaded' ? '#333' : 'transparent' }}  onClick={()=>setValueRead('unreaded')}>
            <Typography variant='subtitle1' color='#fff'>Непрочитанные</Typography>
          </div>
        </div>
        <div className={styles.openChat}>
            {props.choosedUsersInMess ? props.choosedUsersInMess.map(user=>(
              <div key={user.userID} className={styles.openUsers}>
                <div style={{display: 'flex', alignItems:'center', gap: '10px'}} onClick={()=> props.createChat(user)}>
                  <img width={40} height={40} variant='h5' style={{borderRadius: '50%'}} src={user.photo} alt="" />
                  <Typography color='#fff'>{user.name}</Typography>
                </div>
                <div>
                  <CloseIcon className={styles.close} onClick={()=>deleteChoosedUser(user.userID)}/>
                </div>
              </div>
            )) : (null)}
        </div>
      </div>
    </div>
  )
}

export default Messages