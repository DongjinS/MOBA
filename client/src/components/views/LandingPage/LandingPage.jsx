import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Auth from '../../../hoc/auth';
import Header from '../../header/Header';
import styles from './LandingPage.module.css';
import Cookies from 'universal-cookie';
function LandingPage() {
  const navigate = useNavigate();
  const [token, setToken] = useState('');

  useEffect(async () => {
    function getCookie(name) {
      const cookies = new Cookies();
      return cookies.get(name);
    }
    setToken(getCookie('x_auth'));
    if (token) {
      navigate('/mainpage');
    }
    await axios.get('/').then((response) => {
      console.log('시작 페이지입니다.');
    });
  }, [token]);

  const signin = () => {
    navigate('/register');
  };

  const login = () => {
    navigate('/login');
  };

  return (
    <>
      <Header />
      <div className={styles.container}>
        <div className={styles.description}>
          <p>모바</p>
          <span>함께 쇼핑하는 즐거움</span>
        </div>
        <button className={styles.buttons} onClick={signin}>
          <span>시작하기</span>
        </button>
        <button className={styles.buttons} id={styles.loginBtn} onClick={login}>
          {' '}
          이미 계정을 가지고 있어요{' '}
        </button>
      </div>
    </>
  );
}

export default Auth(LandingPage, false);
