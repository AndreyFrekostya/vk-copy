import React, { useEffect, useState } from "react";
import { getStorage, ref, uploadBytes, getDownloadURL, listAll } from "firebase/storage";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, onSnapshot } from "firebase/firestore";
import { getAuth } from 'firebase/auth';
const useGetLoadData=()=>{
    const auth=getAuth()
    const storage=getStorage()
    const [dataPosts,setDataPosts]=useState([])
    const db=getFirestore()
    const [dataImg, setDataImg]=useState([])
    const [dataFilesNames, setDataFilesNames]=useState([])
    const getLoad=async() => {
      let arr=[]
      const querySnapshot = await getDocs(collection(db, "posts"));
      querySnapshot.forEach((doc) => {
        arr.push(doc.data())
        arr=arr.filter(post=>post.where===auth.currentUser.uid)
        arr.sort((prev, next) => next.index - prev.index) 
      })
      setDataPosts(arr)
      const imagesListRef = ref(storage,auth.currentUser.uid+'/');
        listAll(imagesListRef).then((response) => {
            response.items.forEach((item) => {
                getDownloadURL(item).then((url) => {
                  setDataFilesNames((prev)=>[...prev,auth.currentUser.uid+'/'+item.name])
                  setDataImg((prev) => [...prev, url]);
                });
            });
        });
    }  
    useEffect(() => {
      getLoad()
    }, []) 
    return [dataPosts, dataImg, dataFilesNames]
}
export default useGetLoadData