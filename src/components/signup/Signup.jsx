import { Typography, Checkbox, Button} from '@mui/material'
import { Container, Box } from '@mui/system'
import React from 'react'
import { Navigate} from 'react-router-dom'
import {Routers} from './../../constants/routs'
import styles from './signup.module.css'
import { useAuthState } from 'react-firebase-hooks/auth';
import logo from './vk_icon.png'
import { useForm } from 'react-hook-form'
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, onSnapshot, DocumentReference } from "firebase/firestore";
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import PermIdentityIcon from '@mui/icons-material/PermIdentity';
import LockIcon from '@mui/icons-material/Lock';
import { getStorage, ref, uploadBytes, getDownloadURL, listAll, deleteObject  } from "firebase/storage";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword,onAuthStateChanged, updateProfile } from "firebase/auth";
import { useState, useEffect } from 'react'
const SignPass = () => {
  const [typeInput, setTypeInput]=useState(false) //if false-type password, if true-type text
  const [name, setName]=useState('')
  const {register, formState: {errors, isValid}}=useForm({mode: 'onBlur'})
  const db=getFirestore()
  const storage=getStorage()
  const [secondName, setSecondName]=useState('')
  const [phone, setPhone]=useState('')
  const [birthDay, setBirthDay]=useState('')
  const [email, setEmail]=useState('')
  const [pass, setPass]=useState('')
  const [dataState, setDataState]=useState({})
  const auth = getAuth();
  const [redirect, setRedirect]=useState(false)
  const [user]=useAuthState(auth)
  const [error, setError]=useState()
  const signUpFunc=()=>{
    name[0].toUpperCase()
    secondName[0].toUpperCase()
    setDataState({displayName:name+' '+secondName, phoneNumber: phone, email: email, password: pass, photo: '', birthDay: birthDay})
    const data={displayName:name+' '+secondName, phoneNumber: phone, email: email, password: pass, photo: '', birthDay: birthDay}
    createUserWithEmailAndPassword(auth, email, pass)
      .then((userCredential) => { 
        const user = userCredential.user;
          const fl='defaultAvatar.png'
          const imageRef = ref(storage,'defaultAvatar/'+fl)
            getDownloadURL(imageRef).then((url) => {
              data.photo=url
              setDataState(data)
              updateProfile(auth.currentUser, {
                photoURL: data.photo,
                displayName: data.displayName,
                phoneNumber: data.phoneNumber,
              }) 
            });
        }
      )
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        setError(errorCode)
      });    
  }
  useEffect(() => {
    const addUser=async()=>{
      if(auth.currentUser!==null && dataState.photo!==''){
        const docRef=await addDoc(collection(db, "users"),{
          name: dataState.displayName, 
          email: dataState.email,
          photo: dataState.photo,
          userID:auth.currentUser.uid,
          phone: dataState.phoneNumber,
          birthDay: dataState.birthDay
      })
      setRedirect(true)
      }
    }
    addUser()
  }, [auth.currentUser, dataState.photo])
  
  
  return (
    <div className={styles.wrap}>
        <div className={styles.container}>
            <div className={styles.prevBox}>
              <div className={styles.id}>
                <img width={30} height={30} src={logo} alt="logo" />
                <h3>ID</h3>
              </div>
              <div style={{marginTop: '20px'}}>
                <Typography variant='h5'>ВКонтакте можно войти через VK ID</Typography>
              </div>
              <div className={styles.infWithIcon}>
                <PermIdentityIcon/>
                <Typography variant='subtitle1'>Единный аккаунт для сервисов VK и партнеров</Typography>
              </div>
              <div className={styles.infWithIcon}>
                <MeetingRoomIcon/>
                <Typography variant='subtitle1'>Быстрый вход в одно нажатие</Typography>
              </div>
              <div className={styles.infWithIcon}>
                <LockIcon/>
                <Typography variant='subtitle1'>Надежная защита с привязкой телефона</Typography>
              </div>
            </div>
            <div className={styles.box}>
              <img width={70} height={70} src={logo} alt="logo" />
              <Typography mb={1} variant='h4' textAlign='center' color='#fff'>Регистрация</Typography>
              <Typography style={{color: '#939393'}} variant='subtitle1'>Ваш пароль будет использоваться для входа в аккаунт</Typography>
              <form>
                <div className={styles.forlabel}>
                  <Typography ml={2} variant='subtitle1' textAlign='start' color='#fff'>Имя:</Typography>
                  <input {...register('firstName',{required: 'Поле обязательно к заполнению', minLength: {value:2, message:'Минимум 2 символа'}})} value={name} onChange={e=>setName(e.target.value)} className={styles.input} placeholder='Введите имя' type='text'/>
                  {errors?.firstName && <Typography ml={2} variant='subtitle1' textAlign='start' color='#943434d2'>{errors?.firstName?.message+'!'}</Typography>}
                </div>
                <div className={styles.forlabel}>
                  <Typography ml={2} variant='subtitle1' textAlign='start' color='#fff'>Фамилия:</Typography>
                  <input {...register('lastName',{required: 'Поле обязательно к заполнению', minLength: {value:2, message:'Минимум 2 символ'}})} value={secondName} onChange={e=>setSecondName(e.target.value)} className={styles.input} placeholder='Введите фамилию' type='text' />
                  {errors?.lastName && <Typography ml={2} variant='subtitle1' textAlign='start' color='#943434d2'>{errors?.lastName?.message+'!'}</Typography>}
                </div>
                <div className={styles.forlabel}>
                  <Typography ml={2} variant='subtitle1' textAlign='start' color='#fff'>Номер телефона:</Typography>
                  <input {...register('phone',{required: 'Поле обязательно к заполнению', minLength: {value:11, message:'Неккоректный номер телефона'}})} value={phone} onChange={e=>setPhone(e.target.value)} className={styles.input} type="tel" id="phone" name="phone"pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"placeholder='Введите номер телефона' />
                  {errors?.phone && <Typography ml={2} variant='subtitle1' textAlign='start' color='#943434d2'>{errors?.phone?.message+'!'}</Typography>}
                </div>
                <div className={styles.forlabel}>
                  <Typography ml={2} variant='subtitle1' textAlign='start' color='#fff'>Дата рождения:</Typography>
                  <input {...register('birthday',{required: 'Поле обязательно к заполнению'})} onChange={(e)=>setBirthDay(e.target.value)} value={birthDay} className={styles.input} type='date'/>
                  {errors?.birthday && <Typography ml={2} variant='subtitle1' textAlign='start' color='#943434d2'>{errors?.birthday?.message+'!'}</Typography>}
                </div>
                <div className={styles.forlabel}>
                  <Typography ml={2} variant='subtitle1' textAlign='start' color='#fff'>Почта:</Typography>
                  <input {...register('email',{required: 'Поле обязательно к заполнению', minLength: {value:5, message:'Неккоректная почта'}})}  value={email} onChange={e=>setEmail(e.target.value)} className={styles.input} placeholder='Введите почту' type='text'/>
                  {errors?.email && <Typography ml={2} variant='subtitle1' textAlign='start' color='#943434d2'>{errors?.email?.message+'!'}</Typography>}
                </div>
                <div className={styles.forlabel}>
                  <Typography ml={2} variant='subtitle1' textAlign='start' color='#fff'>Пароль:</Typography>
                  <input {...register('pass',{required: 'Поле обязательно к заполнению', minLength: {value:4, message:'Пароль должен содержать минимум 4 символа'}})} value={pass} onChange={e=>setPass(e.target.value)} className={styles.input} placeholder='Введите пароль' type={typeInput ? 'text' : 'password'}/>
                  {errors?.pass && <Typography ml={2} variant='subtitle1' textAlign='start' color='#943434d2'>{errors?.pass?.message+'!'}</Typography>}
                </div>
              </form>
              {error && <Typography mt={2} ml={2} textAlign='start' color='#943434d2'>Ползователь с таким логином уже зарегистрирован</Typography>}
              <div className={styles.check}>
                <Checkbox onClick={()=>setTypeInput(!typeInput)} sx={{color: 'pink'}}/>
                <Typography variant='subtitle1' >Показать пароль</Typography>
              </div>
              <Button onClick={signUpFunc} disabled={!isValid} sx={{backgroundColor: '#fff', width: '93%', color: 'black', borderRadius: '10px' , marginTop: 2.5}} variant="contained">Продолжить</Button>
              <Typography variant='subtitle1' style={{color: '#939393' , marginTop: '10px'}}>Нажимая "Продолжить", вы принимаете пользовательское соглашение и политику конфиденциальности</Typography>
            </div>
        </div>
        {redirect && <Navigate to={Routers.main}/>}
    </div>
  )
}

export default SignPass