import React from 'react';
import styles from './NormalHeader.module.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Cookies from 'universal-cookie';
import { useState } from 'react';
import { useEffect } from 'react';
import { RiLogoutBoxRLine, RiMenuLine } from 'react-icons/ri';
import { MdClose } from 'react-icons/md';

import Menu from './Menu';

const NormalHeader = (props) => {
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [isToken, setIsToken] = useState(false);
  const [hamburger, setHamburger] = useState(false);
  const showMenu = () => setHamburger(!hamburger);

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

  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <div style={{ height: '70px' }}>
        <header className={isOpen ? styles.blackHeader : styles.header}>
          <button onClick={mobaOnClickHandler} className={styles.title}>
            MOBA
          </button>
          {isToken && (
            <div>
              <div onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? <MdClose className={styles.closeBtn} size={40} /> : <RiMenuLine className={styles.menuBtn} size={40} />}
              </div>
            </div>
          )}
        </header>
        <div>{isOpen ? <Menu /> : <></>}</div>
      </div>
    </div>
  );
};

export default NormalHeader;
