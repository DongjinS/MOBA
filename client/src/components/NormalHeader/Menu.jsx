import React from 'react';
import { v1 as uuid } from 'uuid';
import styles from './Menu.module.css';
import Auth from '../../hoc/auth';
import { useNavigate } from 'react-router-dom';

const Menu = (props) => {
  const navigate = useNavigate();
  const isMobile = () => {
    const user = navigator.userAgent;
    let is_mobile = false;
    if (user.indexOf('iPhone') > -1 || user.indexOf('Android') > -1) {
      is_mobile = true;
    }
    return is_mobile;
  };

  const navigateDressroom = () => {
    if (isMobile()) {
      alert('모바일 기기에서는 접속할 수 없습니다.');
      return;
    }
    const id = uuid();
    navigate(`/dressroom/${id}`);
  };

  const navigatePrivateBascket = () => {
    navigate('/privateBasket');
  };

  const navigateVoteResult = () => {
    navigate(`/voteresult`);
  };

  const navigateCollection = () => {
    navigate('/collection');
  };

  const navigateShopTogether = () => {
    const id = uuid();
    const shopWidth = window.screen.width * 0.85;
    const userWidth = window.screen.width * 0.15;

    window.open(
      './chooseshop',
      'shops',
      `width=${shopWidth}, left=${userWidth}, top=0, height=10000, scrollbars=yes, resizable, status=yes, menubar=yes, titlebar=yes`
    );
    window.open(`/room/${id}`, `videochat`, `width=${userWidth}, top=0, left=0, height=10000, scrollbars=yes, resizable=no`, 'target');
  };

  return (
    <>
      {/* <Header /> */}
      <div className={styles.mainPage}>
        {/* <img src='./images/mainpage.jpg' className={styles.img}></img> */}
        <div className={styles.background}></div>
        <div className={styles.titles}>
          <div className={styles.title}>
            <div className={styles.main}>
              <p onClick={navigateDressroom}>코디룸</p>
            </div>
            <div className={styles.main}>
              <p onClick={navigatePrivateBascket}>장바구니/투표</p>
            </div>
            <div className={styles.main}>
              <p onClick={navigateVoteResult}>투표결과</p>
            </div>
            <div className={styles.main}>
              <p onClick={navigateCollection}>컬렉션북</p>
            </div>
            <div style={{ display: 'none' }} className={styles.main}>
              <p onClick={navigateShopTogether}>쇼핑시작</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Auth(Menu, true);
