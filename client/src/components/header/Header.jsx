import React from 'react';
import styles from './Header.module.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Cookies from 'universal-cookie';
import { useState } from 'react';
import { useEffect } from 'react';
import { RiLogoutBoxRLine } from 'react-icons/ri';

const Header = (props) => {
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [isToken, setIsToken] = useState(false);
  useEffect(() => {
    function getCookie(name) {
      const cookies = new Cookies();
      return cookies.get(name);
    }
    setToken(getCookie('x_auth'));
    if (token) {
      setIsToken(true);
    }
  }, [token]);
  function mobaOnClickHandler() {
    if (token) {
      navigate('/mainpage');
    } else {
      navigate('/');
    }
  }
  async function logout() {
    await axios.get('/api/users/logout').then((response) => {
      if (response.data.success) {
        const cookies = new Cookies();
        cookies.remove('x_auth', { path: '/' });
        navigate('/');
      } else {
        alert('로그아웃을 실패했습니다.');
      }
    });
  }

  return (
    <header className={styles.header}>
      <button onClick={mobaOnClickHandler} className={styles.title}>
        MOBA
      </button>

      {isToken ? (
        <button id='checkout' className={styles.buttons} onClick={logout}>
          <RiLogoutBoxRLine size={40} />
        </button>
      ) : (
        <></>
      )}
    </header>
  );
};

export default Header;
