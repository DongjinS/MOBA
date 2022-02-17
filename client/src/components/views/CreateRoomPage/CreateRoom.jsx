import React, { useState, useEffect } from 'react';
import { v1 as uuid } from 'uuid';
import styles from './CreateRoom.module.css';
import Auth from '../../../hoc/auth';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Header from '../../header/Header';
import Cookies from 'universal-cookie';
import Modal from '../../Modal/Modal';

const CreateRoom = (props) => {
  // useState를 사용하여 open상태를 변경한다. (open일때 true로 만들어 열리는 방식)
  const [modalOpen, setModalOpen] = useState(false);
  const [products, setProducts] = useState([]);

  const openModal = () => {
    const token = getCookie('x_auth');
    console.log(token);

    axios
      .get(`/privatebasket/${token}`)
      .then((Response) => {
        console.log(Response);
        setProducts(Response.data);
      })
      .catch((Error) => {
        console.log(Error);
      })
      .then(setModalOpen(true));
  };
  const closeModal = () => {
    setModalOpen(false);
  };

  // 쿠키 받아옴
  function getCookie(name) {
    const cookies = new Cookies();
    return cookies.get(name);
  }

  if (getCookie('room')) {
    document.location.href = '/invited';
  }

  function create() {
    const id = uuid();
    const shopWidth = window.screen.width * 0.85;
    const userWidth = window.screen.width * 0.15;

    window.open(
      './chooseshop',
      'shops',
      `width=${shopWidth}, left=${userWidth}, top=0, height=10000, scrollbars=yes, resizable, status=yes, menubar=yes, titlebar=yes`
    );

    window.open(
      `/room/${id}`,
      `videochat`,
      `width=${userWidth}, top=0, left=0, height=10000, scrollbars=yes, resizable=no`,
      'target'
    );
    // props.history.push(`/room/${id}`);
  }
  const navigate = useNavigate();
  const logout = () => {
    axios.get('/api/users/logout').then((response) => {
      if (response.data.success) {
        navigate('/');
      }
      navigate('/');
    });
  };

  const deleteAPIWishlistItem = (item) => {
    const token = getCookie('x_auth');
    console.log(token);

    axios
      .delete(`/privatebasket`, { data: { token, product: item } })
      .then(function (response) {
        console.log(response);
        setProducts(
          products?.filter((product) => product.shop_url !== item.shop_url)
        );
      })
      .catch(function (error) {
        console.log(error.response);
      });
  };

  const deleteItem = (product) => {
    console.log('create room delete : ', product);
    deleteAPIWishlistItem(product);
  };

  return (
    <>
      <Header />
      <div className={styles.container}>
        <div className={styles.btnWrapper} id={styles.firstWrapper}>
          <button className={styles.buttons}>친구관리</button>
        </div>
        <div className={styles.btnWrapper}>
          <button className={styles.buttons} onClick={openModal}>
            장바구니
          </button>
        </div>
        <div className={styles.btnWrapper}>
          <button
            id={styles.shoppingStart}
            className={styles.buttons}
            onClick={create}
          >
            쇼핑시작
          </button>
        </div>
        <Modal
          open={modalOpen}
          close={closeModal}
          header="나의 장바구니"
          products={products}
          deleteItem={deleteItem}
        />
        <div className={styles.btnWrapper}>
          <button
            className={styles.buttons}
            id={styles.logoutBtn}
            onClick={logout}
          >
            {' '}
            로그아웃{' '}
          </button>
        </div>
      </div>
    </>
  );
};

export default Auth(CreateRoom, true);
