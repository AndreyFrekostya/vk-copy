import { Typography } from '@mui/material'
import PhoneIcon from '@mui/icons-material/Phone';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import { AuthContext } from '../..'
import CloseIcon from '@mui/icons-material/Close';
import React from 'react'
import Diversity3RoundedIcon from '@mui/icons-material/Diversity3Rounded';
import LockIcon from '@mui/icons-material/Lock';
import styles from './smopage.module.css'
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import { useState, useEffect, useContext } from 'react';
import { v4 as uuid } from 'uuid';
import { getStorage, ref, uploadBytes, getDownloadURL, listAll, deleteObject  } from "firebase/storage";
import { updateDoc, getFirestore, collection, addDoc, getDocs, deleteDoc, doc, onSnapshot, DocumentReference, serverTimestamp, getDoc, setDoc } from "firebase/firestore";
const SomePage = (props) => {
  const [dataImg, setDataImg]=useState([])
  const auth=useContext(AuthContext)
  const db=getFirestore()
  const [value, setValue]=useState('')
  const [imgInPost, setImgInPost]=useState('')
  const [posts, setPosts]=useState([])
  const [ifApplication, setIfApplication]=useState(false)
  const [ifAddedThisyou, setIfAddedThisyou]=useState(false)
  const [ifPrivate, setPrivavte]=useState(true)
  const [friends, setFriends]=useState()
  const storage=getStorage()
  const setImgInPostFunc=(fl)=>{
    const imageRef = ref(storage,uuid()+'/'+fl.name)
    uploadBytes(imageRef, fl).then((snapshot) => {
      getDownloadURL(snapshot.ref).then((url) => {
        setImgInPost(url)
      });
    });
  }
  const addPost= async(e)=>{
    if(value){
     var currentdate = new Date(); 
     var datetime = currentdate.getDate() + "/"+ (currentdate.getMonth()+1)  + "/" + currentdate.getFullYear() + ' ' + currentdate.getHours() + ":"   + currentdate.getMinutes() + ":" + currentdate.getSeconds();   
     posts.sort((prev, next) => next.index - prev.index)          
     setValue('')
     if(imgInPost){
       const docRef=await addDoc(collection(db, "posts"),{
         val:value,
         _id: auth.currentUser.uid,
         authorName: auth.currentUser.displayName,
         authorAva: auth.currentUser.photoURL,
         date: datetime,
         index:posts.length,
         img:imgInPost, 
         where: props.user.userID
       });
       const thisDoc=await getDoc(doc(db, "posts", docRef.id));
       setPosts([thisDoc.data(), ...posts])
     }else{
       const docRef=await addDoc(collection(db, "posts"),{
         val:value,
         _id: auth.currentUser.uid,
         authorName: auth.currentUser.displayName,
         authorAva: auth.currentUser.photoURL,
         date: datetime,
         index:posts.length,
         where: props.user.userID
       });
       setPosts([{val: value,authorName: auth.currentUser.displayName, authorAva: auth.currentUser.photoURL, date: datetime, index: posts.length}, ...posts])
     }
     setImgInPost('')
   }
  }
  const deletePost=async(ind)=>{
    let deletedPosts=posts.filter(post=>post.index==ind)
    console.log(deletedPosts)
    let NewListPosts=posts.filter(post=>post.index!==ind)
    setPosts(NewListPosts)
    let gotIdRefDoc=''
    const querySnapshot = await getDocs(collection(db, "posts"));
    querySnapshot.forEach((doc) => {
      if(deletedPosts[0].index==doc.data().index){
        gotIdRefDoc=doc.id
      }
    });
    await deleteDoc(doc(db, "posts", gotIdRefDoc));
  }
  const createChat=()=>{
    props.createChat(props.user)
  }
  const addFriend=async()=>{
    if(ifAddedThisyou){
      const querySnapshot = await getDocs(collection(db, "applicationFriends"));
      querySnapshot.forEach(async(documment) => {
        if(documment.data().toWhom.userID===auth.currentUser.uid  && documment.data().fromWhom.userID===props.user.userID ){
          await deleteDoc(doc(db, "applicationFriends", documment.id));
            }
        })
      let user=[]
      const querySnapshotUs = await getDocs(collection(db, "users"));
      querySnapshotUs.forEach(async(documment) => {
      if(documment.data().userID===props.user.userID || documment.data().userID===auth.currentUser.uid ){
          user.push(documment.data())
        }
      })
      const docRef=await addDoc(collection(db, "friends"),{
        firstPerson:user[0],
        secondPerson:user[1]
      });
      setFriends(true)
    }else{
      setIfApplication('true')
    const docRef=await addDoc(collection(db, "applicationFriends"),{
      fromWhom: {
        name: auth.currentUser.displayName, 
        email: auth.currentUser.email,
        photo: auth.currentUser.photoURL,
        userID: auth.currentUser.uid,
      }, toWhom:{
        name: props.user.name, 
        email: props.user.email,
        photo: props.user.photo,
        userID: props.user.userID,
      }
    });
    }
  }
  const getLoad=async() => {
    if(props.user.ifPrivatePage==='open'){
      setPrivavte(false)
    }else{
      setPrivavte(true)
    }
    let arr=[]
    const querySnapshot = await getDocs(collection(db, "posts"));
    querySnapshot.forEach((doc) => {
      arr.push(doc.data())
      arr=arr.filter(post=>post.where===props.user.userID)
      arr.sort((prev, next) => next.index - prev.index) 
    })
    setPosts(arr)
    const imagesListRef = ref(storage,props.user.userID+'/');
      listAll(imagesListRef).then((response) => {
          response.items.forEach((item) => {
              getDownloadURL(item).then((url) => {
                setDataImg((prev) => [...prev, url]);
              });
          });
      });
    const querySnapshotFriends = await getDocs(collection(db, "friends"));
    console.log(querySnapshotFriends)
    querySnapshotFriends.forEach(async(documment) => {
      if(documment.data().firstPerson.userID===props.user.userID && documment.data().secondPerson.userID===auth.currentUser.uid || documment.data().secondPerson.userID===props.user.userID && documment.data().firstPerson.userID===auth.currentUser.uid){
        setFriends(true)
        setPrivavte(false)  
      }
    })
    const querySnapshotAPL = await getDocs(collection(db, "applicationFriends"));
      let arrAddedUsers=[]
      querySnapshotAPL.forEach((doc) => {
        if(doc.data().toWhom.userID===props.user.userID && doc.data().fromWhom.userID===auth.currentUser.uid ){
            setIfApplication(true)
            
        }
        if(doc.data().fromWhom.userID===props.user.userID && doc.data().toWhom.userID===auth.currentUser.uid){
            setIfAddedThisyou(true)
            setPrivavte(false)
        }
      })
  }  
  useEffect(() => {
    getLoad()
  }, [])
  
  return (
    <div className={styles.wrap}  >
      <div className={styles.firstRow}>
        <div>
          <img src={props.user.photo} alt="" />
        </div>
        <div className={styles.online}>
        </div>
        <div className={styles.name}>
          <Typography variant='h5'>{props.user.name}</Typography>
        </div>
        <div className={styles.options}>
            <button onClick={createChat}>Сообщение</button>
            <div className={styles.forIcon}>
              <PhoneIcon/>
            </div>
            <div className={styles.forIcon}>
              {friends ? (<Typography color='#fff' variant='subtitle1'>Вы друзья</Typography>) :
              ifApplication ? (<Typography color='#fff' variant='subtitle1'>Заявка отправлена</Typography>) :
              ifAddedThisyou ? (<Typography onClick={addFriend} color='#fff' variant='subtitle1'>Вас хотят добавить в друзья</Typography>) : (<GroupAddIcon onClick={addFriend}/>)}
            </div>
          </div>
      </div>
      {ifPrivate ?
      (
        <div className={styles.locked}>
          <LockIcon/>
          <div>
            <Typography color='#fff' variant='h6'>Это закрытый профиль</Typography>
            <Typography color='#858585' variant='subtitle1'>Добавьте {props.user.name} в друзья, чтобы смотреть его(её) записи, фотографии и другие материалы</Typography>
          </div>
        </div>
      )
       :
      (
        <div>
            <div className={styles.images}>
          <img src={props.user.photo} alt="" />
          {dataImg.map((file, index)=>(
              <img key={index} src={file} alt="das" />
            ))}
          <div className={styles.buttons}>
            <div className={styles.inputfile}>
                <button>Показать все</button>
            </div>
          </div>
        </div>
        <div className={styles.addposts}>
            <div className={styles.addPostsfirstRow}>
              <img src={auth.currentUser.photoURL} alt="ava" />
              <input type="text" value={value} placeholder='Напишите что-нибудь'onChange={(e)=>setValue(e.target.value)} />
              <div className={styles.addimgDiv}>
                <input type="file" name="file" onChange={(e)=>setImgInPostFunc(e.target.files[0])}/>
                <AddPhotoAlternateIcon className={styles.addIMG}/>
              </div>
              <button className={styles.setPost} onClick={addPost}>Опубликовать</button>
            </div>
            {imgInPost && 
            <div className={styles.prevImgSmotr}> 
              <img src={imgInPost} alt="" /> 
            </div>}
          </div>
          <div className={styles.posts}>
            {posts.map((post,ind)=>(
                  <div key={ind} className={styles.post}>
                    <div>
                      <div className={styles.maininf}>
                          <img src={post.authorAva}  />
                          <div>
                            <Typography>{post.authorName}</Typography>
                            <Typography>{post.date}</Typography>
                          </div>
                      </div>
                      <Typography variant='h6' className={styles.value}>{post.val}</Typography>
                      {post.img &&
                      <div>
                        <img className={styles.imgPostUnic} src={post.img} alt="" />
                      </div>
                      }
                    </div>
                    {post._id===auth.currentUser.uid ? (
                      <div className={styles.delete} onClick={()=>deletePost(post.index)}>
                      <CloseIcon/>
                      </div>
                    ) :(null)}
                  </div>
                ))}
          </div>
        </div>
      )}
      
    </div>
  )
}

export default SomePage