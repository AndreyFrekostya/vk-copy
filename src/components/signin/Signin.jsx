import { Container } from '@mui/system'
import React, {useState, useEffect, useContext} from 'react'
import styles from './signin.module.css'
import phones from './phones.png'
import vkicon from './vk-icon.png'
import Signup from '../signup/Signup'
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, onSnapshot, DocumentReference } from "firebase/firestore";
import { useAuthState } from 'react-firebase-hooks/auth';
import { getStorage, ref, uploadBytes, getDownloadURL, listAll, deleteObject  } from "firebase/storage";
import SmartToyIcon from '@mui/icons-material/SmartToy';
import AppleIcon from '@mui/icons-material/Apple';
import { Box, Button, Checkbox, Grid, TextField, Typography } from '@mui/material'
import {Link, Navigate} from 'react-router-dom'
import {Routers} from './../../constants/routs'
import { getAuth, signInWithPopup,updateProfile ,  GoogleAuthProvider, signInWithEmailAndPassword } from "firebase/auth";
import defaultAva from './defaultAvatar.png'
const Signin = () => {
    const provider = new GoogleAuthProvider();
    const [emailVal, setEmailVal]=useState('')
    const [passVal, setPassVal]=useState('')
    const [redirect, setRedirect] = useState(false )
    const [isRemember, setIsRemember]=useState(false)
    const auth = getAuth();
    const storage=getStorage()
    const [user]=useAuthState(auth)
    const db=getFirestore()
    const [typeInput, setTypeInput]=useState(false)
    const [errors, setErrors]=useState()
    const registerUs=async(e)=>{
        e.preventDefault()
        setTimeout(setRedirect, 1000);
        signInWithPopup(auth, provider)
        .then((result) => {
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;
            const user = result.user;
            setRedirect(true)
        }).catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            const email = error.customData.email;
            const credential = GoogleAuthProvider.credentialFromError(error); 
    });
    }
    const signinWith=()=>{
        signInWithEmailAndPassword(auth, emailVal, passVal)
        .then((userCredential) => { 
        const user = userCredential.user;
        }
      )
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        setErrors(errorCode)
      });
    }
    useEffect(() => {
        const setAndDownload=async()=>{
            if(redirect){
                console.log(auth.currentUser)
                const docRef=await addDoc(collection(db, "users"),{
                    ifPrivatePage: 'open',
                    name: auth.currentUser.displayName, 
                    email: auth.currentUser.email,
                    photo: auth.currentUser.photoURL,
                    lastLoginAt: auth.currentUser.reloadUserInfo.lastLoginAt,
                    userId: user.uid, 
                })
                setRedirect(true)
            }else{
                setRedirect(false)
            }
        }
        setAndDownload()
        
    }, [user])
    
    
  return (
    <div className={styles.wrap}>
        <Container maxWidth="xl">
            <Grid container className={styles.grid}  >
                <Grid item xs={6}  >
                    <Typography mb={1} variant='h4' textAlign='center'>ВКонтакте для мобильных устройств</Typography>
                    <Typography variant='subtitle1' style={{color: '#939393', marginBottom: '30px'}} textAlign='center'>Установите официальное мобилное приложение ВКонтакте и оставайтесь в курсе новостей ваших друзей, где бы вы не находились</Typography>
                    <div className={styles.phone}>
                        <img src={phones} alt="" />
                    </div>
                    <div className={styles.shops} >
                        <div>
                            <SmartToyIcon/>
                            <Typography>Google play</Typography> 
                        </div>
                        <div>
                            <SmartToyIcon/> 
                            <Typography>RuStore</Typography>
                        </div>
                        <div>
                            <AppleIcon/>
                            <Typography>App store</Typography>
                        </div>
                    </div>
                </Grid>
                <Grid item xs={6} className={styles.signwrap}>
                    <Box className={styles.signin} size='small'>
                        <img src={vkicon} width={60} height={60} alt="" />
                        <Typography variant='h4'>Вход ВКонтакте</Typography>
                        <input 
                            value={emailVal}
                            onChange={(e)=>setEmailVal(e.target.value)}
                         className={styles.input} placeholder='Введите почту' 
                         type='text'/>
                         <input 
                            value={passVal}
                            onChange={(e)=>setPassVal(e.target.value)}
                         className={styles.input} placeholder='Введите пароль' 
                         type={typeInput ? 'text' : 'password'}/>
                         {errors && <Typography mt={1} ml={2} textAlign='start' color='#943434d2'>Неправилный логин или пароль</Typography>}
                        <div className={styles.check}>
                            <Checkbox onClick={()=>setTypeInput(!typeInput)} sx={{color: 'pink'}}/>
                            <Typography variant='subtitle1' >Показать пароль</Typography>
                        </div>
                            <Button onClick={signinWith} sx={{backgroundColor: '#fff', width: '93%', color: 'black', mt: '10px', borderRadius: '10px'}} variant="contained">Войти</Button>
                        <Typography variant='subtitle1' style={{color: '#939393', margin: '20px 0px'}} textAlign='center'>Или</Typography>
                        <Button  sx={{backgroundColor: 'transparent', width: '93%', border: '1px solid #343434'}} variant="outlined">QR-код</Button>
                    </Box>
                    <Box size='small' className={styles.signin} mt={5}>
                        <Button  sx={{backgroundColor: '#4bb34b', width: '93%', color: '#FFF', mt: '10px', borderRadius: '10px', padding:'8px 0px'}} variant="contained"><Link to={Routers.signup}>Зарегистрироваться</Link></Button>
                        <Typography variant='subtitle1'style={{color: '#939393', margin: '20px 0px 0px 0px'}} textAlign='center'>После регистрации вы получите доступ ко всем возможностям VK ID </Typography>
                    </Box>
                </Grid>
            </Grid>
        </Container>
        {user  && <Navigate replace to={Routers.main} />}
    </div>
  )
}

export default Signin