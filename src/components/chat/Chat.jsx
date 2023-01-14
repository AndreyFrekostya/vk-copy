import React, {useRef, useState, useContext, useEffect} from 'react'
import styles from './chat.module.css'
import { AuthContext } from '../..'
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import PhoneIcon from '@mui/icons-material/Phone';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import { getStorage, ref, uploadBytes, getDownloadURL, listAll, deleteObject  } from "firebase/storage";
import { v4 as uuid } from 'uuid';
import SendIcon from '@mui/icons-material/Send';
import { updateDoc, getFirestore, collection, addDoc, getDocs, deleteDoc, doc, onSnapshot, DocumentReference, serverTimestamp, getDoc, setDoc } from "firebase/firestore";
import { Typography } from '@mui/material';
import { ContactPageSharp } from '@mui/icons-material';
const Chat = (props) => {
    const refText=useRef(null)
    const storage=getStorage()
    const [messages, setMessages]=useState([])
    const [imgInPost,setImgInPost]=useState([])
    const [tip, setTip]=useState(false)
    const [popUpDeleteMess, setPopUpDeleteMess]=useState(false)
    const db=getFirestore()
    const auth=useContext(AuthContext)
    const [messageVal, seMessageVal]=useState('')
    const resize=()=>{
        let el=refText.current
        el.style.cssText = 'height:auto; padding:0; margin-botto:20px';
        el.style.cssText = 'height:' + el.scrollHeight + 'px';
    }
    const setImgInMessFunc=(fl)=>{
        const imageRef = ref(storage,uuid()+'/'+fl.name)
        uploadBytes(imageRef, fl).then((snapshot) => {
          getDownloadURL(snapshot.ref).then((url) => {
            setImgInPost([url,...imgInPost]);
            //deleteObject(imageRef).catch((error) => {
              //console.log('Ошибка удаления')
            //});
          });
        });
      }
    async function uploadMessage(){
        if(messageVal || imgInPost){
            let currentdate = new Date();
            let datetime = currentdate.getDate() + "/"+ (currentdate.getMonth()+1)  + "/" + currentdate.getFullYear()
            let dataMess={fromWhom: {
                name: auth.currentUser.displayName,
                photo:  auth.currentUser.photoURL,
                id: auth.currentUser.uid}, 
            toWhom:{
                name: props.user.name,
                photo:  props.user.photo,
                id: props.user.userID
            }, messageVal: messageVal,date: datetime,ind:messages.length, time: currentdate.getHours() + ":"   + currentdate.getMinutes()}
            if(imgInPost){
                dataMess.img=imgInPost
                setMessages([...messages,dataMess])
                const docRef=await addDoc(collection(db, "messages"),dataMess);
                const thisDoc=await getDoc(doc(db, "messages", docRef.id));
            }else{
                setMessages([...messages,dataMess])
                const docRef=await addDoc(collection(db, "messages"),dataMess);
                const thisDoc=await getDoc(doc(db, "messages", docRef.id));
            }
            seMessageVal('')  
            setImgInPost([]) 
        }
    }
    const deleteChoosedImg=(url)=>{
        console.log(url)
        let newImgs=imgInPost.filter(img=>img!==url)
        setImgInPost(newImgs)
    }
    const deleteMessage=async(mess)=>{
        let deletedMess=messages.filter(message=>message.ind===mess.ind)
        let newMess=messages.filter(message=>message.ind!==mess.ind)
        setMessages(newMess)
        let gotIdRefDoc=''
        const querySnapshot = await getDocs(collection(db, "messages"));
        querySnapshot.forEach((doc) => {
        if(deletedMess[0].ind==doc.data().ind){
            gotIdRefDoc=doc.id
        }
        });
        await deleteDoc(doc(db, "messages", gotIdRefDoc));
    }
    const setChoosed=()=>{
        props.setChooseOut('messages')
    }
    const deleteAllMess=async()=>{
        setPopUpDeleteMess(false)
        setMessages([])
        const querySnapshot = await getDocs(collection(db, "messages"));
        querySnapshot.forEach(async(documment) => {
            if(documment.data().fromWhom.id===auth.currentUser.uid && documment.data().toWhom.id===props.user.userID || documment.data().toWhom.id===auth.currentUser.uid && documment.data().fromWhom.id===props.user.userID){
                await deleteDoc(doc(db, "messages", documment.id));
            }
        })
    }
    useEffect(() => {
        const getLoad=async()=>{
            let arr=[]
            const querySnapshot = await getDocs(collection(db, "messages"));
            querySnapshot.forEach((doc) => {
              if(doc.data().fromWhom.id===auth.currentUser.uid && doc.data().toWhom.id===props.user.userID){
                arr.push(doc.data())
              }
              if(doc.data().toWhom.id===auth.currentUser.uid && doc.data().fromWhom.id===props.user.userID){
                arr.push(doc.data())
              }
            })
            arr.sort((prev, next) => prev.ind - next.ind) 
            setMessages(arr)
        }
        getLoad()
    }, [])
    
  return (
    <div>
        <div className={styles.blurPop} style={{display: popUpDeleteMess ? 'block' : 'none'}}>

        </div>
        <div className={styles.popUpDel} style={{display: popUpDeleteMess ? 'block' : 'none'}}>
            <div style={{borderBottom: '1px solid #3b3b3b', padding: '15px 30px 15px 30px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                <Typography variant='h5'>Удалить все сообщения</Typography>
                <CloseIcon onClick={()=>setPopUpDeleteMess(false)} color='#505050'/>
            </div>
            <div style={{padding: '15px 30px 15px 30px',borderBottom: '1px solid #3b3b3b'}}>
                <Typography variant='subtitle1'>Вы действительно хотите <b>удалить всю переписку</b> с этим пользователем?</Typography>
                <Typography marginTop='30px' variant='subtitle1'>Отменить это действие будет <b>невозможно.</b></Typography>
            </div>
            <div className={styles.deletDiv}>
                <div>
                    <Typography color="#fff"  variant='subtitle1' onClick={()=>setPopUpDeleteMess(false)}>Отмена</Typography>
                </div>
                <button onClick={deleteAllMess}>Удалить</button>
            </div>
        </div>
        <div className={styles.box}>
            <div className={styles.options}>
                <div className={styles.optionExit} onClick={setChoosed}>
                    <ArrowBackIosIcon/>
                    <Typography>Назад</Typography>
                </div>
                <div className={styles.optionsName}>
                    <Typography color='#fff'>{props.user.name}</Typography>
                    <Typography>Заходил(а) недавно</Typography>
                </div>
                <div className={styles.optionsPhoto}>
                    <DeleteIcon onClick={()=>setPopUpDeleteMess(true)} onMouseOver={()=>setTip(true)} onMouseOut={()=>setTip(false)}/>
                    <div className={styles.tipForDelete} style={{display: tip ? 'inline' : 'none'}}>
                    <Typography сolor='#fff' variant='subtitle1'>Очистить историю сообщений</Typography>
                    </div>
                    <PhoneIcon/>
                    <img src={props.user.photo} style={{cursor: 'pointer'}} onClick={()=>props.linkToSb(props.user)} alt='фото собоседника'/>
                </div>
            </div>
            <div className={styles.messages}>
            {messages.map((message,ind)=>(
                <div key={ind} className={styles.messageWrap}>
                    <div>
                        <div className={styles.message}>
                            <img src={message.fromWhom.photo} alt="" />
                            <div>
                                <div className={styles.nameAndTime}>
                                    <Typography color="#71aaec">{message.fromWhom.name}</Typography>
                                    <Typography color='#888'>{message.time}</Typography>
                                </div>
                                <Typography color='#fff' className={styles.messageVal}>{message.messageVal}</Typography>
                            </div>
                        </div>
                        <div className={styles.messageImg}>
                            {message.img.map((img, ind)=>(
                                <img key={ind}  src={img} alt='photo'/>                 
                            ))}
                        </div>
                    </div>
                    {message.fromWhom.id===auth.currentUser.uid ?(<DeleteIcon onClick={()=>deleteMessage(message)} className={styles.closeIcon}/>):(null)}
                </div>
            ))}
            </div>
            <div className={styles.enterMessage}>
                <div onKeyDown={resize} className={styles.enterMessageInside} > 
                    <textarea value={messageVal} onChange={(e)=>seMessageVal(e.target.value)} ref={refText}  className={styles.enterMessageInput} placeholder='Напишите сообщение'/>
                    <div className={styles.iconInInput}>
                        <div  className={styles.forInputFile}>
                            <AddPhotoAlternateIcon/>
                            <input type="file" onChange={(e)=>setImgInMessFunc(e.target.files[0])}/>
                        </div>
                        <SentimentSatisfiedAltIcon/>
                    </div>
                </div>
                <SendIcon onClick={uploadMessage} className={styles.enterMessageSend} />
            </div>
            <div className={styles.divImg}>
                {imgInPost.map((img, ind)=>(
                    <div  key={ind}  className={styles.forDelete}>
                        <div className={styles.delete} onClick={()=>deleteChoosedImg(img)} >
                            <CloseIcon/>
                        </div>
                        <img src={imgInPost} alt='Ваше фото'/> 
                    </div>   
                ))}
            </div>
        </div>
    </div>
  )
}

export default Chat