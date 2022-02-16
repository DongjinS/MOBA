import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { loginUser } from '../../../_actions/user_action';
import { useNavigate } from 'react-router-dom';
import Auth from '../../../hoc/auth';
import Header from '../../header/Header';
import styles from './InvitedPage.module.css';
import Cookies from 'universal-cookie';

function InvitedPage(props) {
  function getCookie(name) {
    const cookies = new Cookies();
    return cookies.get(name);
  }

  const navigate = useNavigate();
  const handleClick = () => {
    const room = getCookie('room');
    const shopWidth = window.screen.width * 0.85;
    const userWidth = window.screen.width * 0.15;

    window.open(
      './chooseshop',
      'shops',
      `width=${shopWidth}, left=${userWidth}, top=0, height=10000, scrollbars=yes, resizable, status=yes, menubar=yes, titlebar=yes`
    );

    window.open(
      `/room/${room}`,
      `videochat`,
      `width=${userWidth}, top=0, left=-10000, height=10000, scrollbars=yes, resizable=no`,
      'target'
    );
  };
  return (
    <>
      <Header />
      <div className={styles.container}>
        <div className={styles.invitedBox}>
          <div className={styles.invitedContents}>
            <div className={styles.invitedText}>
              <span>초대장</span>
              <p>내일 소개팅인데 도와줘!</p>
            </div>
            <button className={styles.buttons} onClick={handleClick}>
              접속하기
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Auth(InvitedPage, 'login');
