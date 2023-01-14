import React from 'react'
import { Box, Typography} from '@mui/material'
import styles from './navbar.module.css'
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ArticleIcon from '@mui/icons-material/Article';
import ForumIcon from '@mui/icons-material/Forum';
import GroupIcon from '@mui/icons-material/Group';
const Navbar = (props) => {
  const chooseOut=(state)=>{
    props.setChooseOut(state)
  }
  return (
    <Box className={styles.wrap}>
      <div className={styles.icons_wrap} onClick={()=>chooseOut('mypage')}>
        <AccountCircleIcon/>
        <Typography variant='subtitle1'>Моя страница</Typography>
      </div>
      <div className={styles.icons_wrap} onClick={()=>chooseOut('news')}>
        <ArticleIcon/>
        <Typography>Новости</Typography>
      </div>
      <div className={styles.icons_wrap} onClick={()=>chooseOut('messages')}>
        <ForumIcon/>
        <Typography>Сообщения</Typography>
      </div>
      <div className={styles.icons_wrap} onClick={()=>chooseOut('friends')}>
        <GroupIcon/>
        <Typography>Друзья</Typography>
      </div>
    </Box>
  )
}

export default Navbar