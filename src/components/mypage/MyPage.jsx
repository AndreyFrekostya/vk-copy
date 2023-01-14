import React,{useContext, useEffect} from 'react'
import styles from './mypage.module.css'
import useGetLoadData  from './useGetLoadData';
import ExpandMore from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close';
import { AuthContext } from '../..'
import { Typography } from '@mui/material'
import { ContentCutOutlined, ExpandLess, South } from '@mui/icons-material'
import { useState } from 'react'
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import {updateProfile } from "firebase/auth";
import EditIcon from '@mui/icons-material/Edit';
import { v4 as uuid } from 'uuid';
import { useAuthState } from 'react-firebase-hooks/auth'
import { getStorage, ref, uploadBytes, getDownloadURL, listAll, deleteObject  } from "firebase/storage";
import { updateDoc, getFirestore, collection, addDoc, getDocs, deleteDoc, doc, onSnapshot, DocumentReference, serverTimestamp, getDoc, setDoc } from "firebase/firestore";
const MyPage = () => {
  const auth=useContext(AuthContext)
  const storage=getStorage()
  const db=getFirestore()
  const [loadPosts, loadImgs, loadRefImg]=useGetLoadData()
  const [value, setValue]=useState('')
  const [namesFiles, setNamesFiles]=useState([])
  const [imgInPost, setImgInPost]=useState('')
  const [posts, setPosts]=useState([])
  const [files, setFiles]=useState([])
  const [urlAv, setUrlAv]=useState('')
  const [checkSetProf, setCheclSetProf]=useState('')
  const [valueOfProfile, setValueOfProfile]=useState(false)
  const addFile=(fl)=>{
    const imageRef = ref(storage,auth.currentUser.uid+'/'+fl.name);
    setNamesFiles((prev)=>[...prev, auth.currentUser.uid+'/'+fl.name])
    uploadBytes(imageRef, fl).then((snapshot) => {
      getDownloadURL(snapshot.ref).then((url) => {
        setFiles((prev) => [...prev, url]);
      });
    });
  }
  const setImgInPostFunc=(fl)=>{
    const imageRef = ref(storage,uuid()+'/'+fl.name)
    uploadBytes(imageRef, fl).then((snapshot) => {
      getDownloadURL(snapshot.ref).then((url) => {
        setImgInPost(url);
        //deleteObject(imageRef).catch((error) => {
          //console.log('Ошибка удаления')
        //});
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
          where: auth.currentUser.uid
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
          where: auth.currentUser.uid
        });
        setPosts([{val: value,authorName: auth.currentUser.displayName, authorAva: auth.currentUser.photoURL, date: datetime, index: posts.length}, ...posts])
      }
      setImgInPost('')
    }
  }
  const deletePost=async(ind)=>{
    let deletedPosts=posts.filter(post=>post.index==ind)
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
  const deleteImg=()=>{
    setFiles([])
    namesFiles.forEach(file=>{
      const imgRef = ref(storage, file);
      deleteObject(imgRef).catch((error) => {
        console.log('Ошибка удаления')
      });
    })
    
  }
  const funcSetAvatar=async(file)=>{
    const avatarRef = ref(storage,auth.currentUser.uid+'/'+'avatar/')
    listAll(avatarRef).then((response) => {
      response.items.forEach((item) => {
        const avatarRef = ref(storage,item._location.path)
        deleteObject(avatarRef).catch((error) => {
          console.log('Ошибка удаления')
        });
      });
    });
    deleteObject(avatarRef).catch((error) => {
      console.log('Ошибка удаления')
    });
    const imageRef = ref(storage,auth.currentUser.uid+'/'+'avatar/'+file.name);
    uploadBytes(imageRef, file).then((snapshot) => {
      getDownloadURL(snapshot.ref).then(async(url) => {
        updateProfile(auth.currentUser, {
          photoURL: url
        })
        const querySnapshotUs = await getDocs(collection(db, "users"));
        querySnapshotUs.forEach(async(document) => {
          if(document.data().name===auth.currentUser.displayName){
            await updateDoc(doc(db, 'users', document.id) , {
              photo: url
            });
          }
        });
        const querySnapshotPs = await getDocs(collection(db, "users"));
        querySnapshotPs.forEach(async(document) => {
          if(document.data().authorName===auth.currentUser.displayName){
            await updateDoc(doc(db, 'posts', document.id) , {
              authorAva: url
            });
          }
        });
      });
    });
  }
  const funcSetPrivatePr=async()=>{
    setValueOfProfile(false)
    if(checkSetProf==='open'){
      setCheclSetProf('private')
    }else{
      setCheclSetProf('open')
    }
  }
   useEffect(() => {
    setPosts((prev)=>loadPosts)
    setFiles((prev)=>loadImgs)
    setNamesFiles((prev)=>loadRefImg)
   }, [loadPosts, loadImgs, loadRefImg])
   useEffect(() => {
    const fetchPrivate=async()=>{
      const querySnapshot = await getDocs(collection(db, "users"));
      querySnapshot.forEach(async(document) => {
        if(auth.currentUser.uid==document.data().userID){
          await updateDoc(doc(db, 'users', document.id) , {
            ifPrivatePage: checkSetProf
          });
        }
      });
    }
    fetchPrivate()
   }, [checkSetProf])
   
  useEffect(() => {
    const fetchPrivate=async()=>{
      const querySnapshot = await getDocs(collection(db, "users"));
      querySnapshot.forEach((doc) => {
        if(auth.currentUser.uid==doc.data().userID){
          setCheclSetProf(doc.data().ifPrivatePage)
        }
      });
    }
    fetchPrivate()
  }, [])
  
  return (
    <div className={styles.wrap}  >
        <div className={styles.firstRow}>
          <div>
            <div className={styles.setAvatar}>
              <input type="file" name="file" onChange={(e)=>funcSetAvatar(e.target.files[0])}/>	
              <div >
                <EditIcon/>
                <Typography variant='subtitle1'>Изменить</Typography>
              </div>
            </div>
            <img  src={auth.currentUser.photoURL} className={styles.ava} alt="" />
          </div>
          <div className={styles.online}>
          </div>
          <div className={styles.name}>
            <Typography variant='h5'>{auth.currentUser.displayName}</Typography>
          </div>
          <div className={styles.setPrivatePr}>
              <Typography variant='h6' color='#fff'>Профиль:</Typography>
              <div style={{display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 0px'}}>
                <Typography onClick={()=>setValueOfProfile(!valueOfProfile)}  className={styles.optionProf} variant='h6' color="#71aaec">{checkSetProf==='open' ?('открытый') : ('закрытый')}</Typography>
                {valueOfProfile ? (<ExpandLess style={{color:'#71aaec'}}/>) : (<ExpandMore style={{color:'#71aaec'}}/>)}
                </div>
              <div onClick={funcSetPrivatePr} style={{display: valueOfProfile ? 'block' : 'none'}} className={styles.setPrivateoption}>
                  <Typography variant='h6' color="#71aaec">{checkSetProf==='open' ?('закрытый') : ('открытый')}</Typography>
              </div>
          </div>
        </div>
        <div className={styles.images}>
          <img src={auth.currentUser.photoURL} alt="" />
          {files.map((file, index)=>(
            <img key={index} src={file} alt="das" />
          ))}
          <div className={styles.buttons}>
            <div className={styles.inputfile}>
                <input type="file" name="file" onChange={(e)=>addFile(e.target.files[0])}/>		
                <button>Загрузить фото</button>
            </div>
            <div>
              <button onClick={deleteImg}>Удалить все</button>
            </div>
          </div>
        </div>
        <div className={styles.addposts}>
          <div className={styles.addPostsfirstRow}>
            <img src={auth.currentUser.photoURL} alt="ava" />
            <input type="text" value={value} placeholder='Что у вас нового?'onChange={(e)=>setValue(e.target.value)} />
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
                  <div className={styles.delete} onClick={()=>deletePost(post.index)}>
                    <CloseIcon/>
                  </div>
                </div>
              ))}
        </div>
    </div>
  )
}

export default MyPage